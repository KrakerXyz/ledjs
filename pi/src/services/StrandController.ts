import { LedSegment } from '../../../core/src/LedSegment.js';
import { Id } from '../../../core/src/rest/model/Id.js';
import { SegmentInputType } from '../../../core/src/rest/model/Strand.js';
import { Timer } from '../../../core/src/Timer.js';
import { getLogger } from './logger.js';
import { restApi } from './restApi.js';
import rpio from 'rpio';

export class StrandController {

    private readonly _logger = getLogger('StrandController');
    private readonly _segments: SegmentVm[] = [];
    private _numLeds: number = 0;
    private _running = false;
    
    public async loadStrand(strandId: Id): Promise<void> {

        if (this._segments.length) {
            this._logger.debug('Disposing of previous strand segments');
            for (const s of this._segments) {
                if (s.type === SegmentInputType.Animation) {
                    s.controller.pause();
                    Object.values(s.services).forEach((s: any) => s[Symbol.dispose]?.());
                    s.ledSegment[Symbol.dispose]();
                }
            }
            this._segments.length = 0;
        }

        this._logger.debug(`Loading strand ${strandId}`);
        const strand = await restApi.strands.byId(strandId);

        this._logger.info(`Got strand '${strand.name}' consisting of ${strand.segments.length} segments`);

        this._numLeds = strand.numLeds;
        const sab = new SharedArrayBuffer(strand.numLeds * 4);

        try {
            for (const segment of strand.segments) {
            
                if (segment.type === SegmentInputType.Animation) {
                    this._logger.debug(`Loading animation ${segment.script.id} for segment ${segment.id}`);
                    const animation = await restApi.animations.byId(segment.script.id, segment.script.version);
                    if (!animation) {
                        throw new Error(`Failed to load animation ${segment.script.id}`);
                    }

                    const script: netled.animation.IAnimation = (await import('data:text/javascript;base64,' + btoa(animation.js))).default;

                    this._logger.info(`Loaded animation ${animation.id}: ${animation.name}`);

                    let settings: netled.common.ISettings | null = {};
                    if (segment.script.configId) {
                        this._logger.debug(`Loading animation config ${segment.script.configId} for animation ${animation.id}`);
                        const animationConfig = await restApi.scriptConfigs.byId(segment.script.configId);
                        if (!animationConfig) {
                            throw new Error(`Failed to load animation config ${segment.script.configId}`);
                        }
                        settings = animationConfig.config;
                    } else {
                        const config = script.config;
                        if (config) {
                            settings = {};
                            for (const key of Object.keys(config)) {
                                settings[key] = config[key].default;
                            }
                            this._logger.debug('No animation config specified. Using default settings');
                        }
                    }

                    const ledSegment = new LedSegment(sab, segment.leds.num, segment.leds.offset, segment.leds.dead);

                    const services: Partial<netled.services.IServices> = {};
                    for (const service of script.services ?? []) {
                        if (service === 'timer') {
                            const timer = new Timer();
                            services['timer'] = timer;
                        }
                    }

                    const controller = script.construct(ledSegment, services as netled.services.IServices);

                    this._segments.push({
                        id: segment.id,
                        name: animation.name,
                        type: segment.type,
                        script,
                        settings,
                        services,
                        controller,
                        ledSegment,
                    });

                } else if (segment.type === SegmentInputType.PostProcess) {
                    this._logger.debug(`Loading post-process ${segment.script.id} for segment ${segment.id}`);
                    const postProcess = await restApi.postProcessors.byId(segment.script.id, segment.script.version);
                    if (!postProcess) {
                        throw new Error(`Failed to load post-process ${segment.script.id}`);
                    }
                    this._logger.info(`Loaded post-process ${postProcess.id}: ${postProcess.name}`);

                    const ledSegment = new LedSegment(sab, segment.leds.num, segment.leds.offset);
                
                    const script: netled.postProcessor.IPostProcessor = (await import('data:text/javascript;base64,' + btoa(postProcess.js))).default;

                    const settings: netled.common.ISettings = {};
                    if (script.config) {
                        for (const key of Object.keys(script.config)) {
                            settings[key] = script.config[key].default
                        }
                    }

                    const controller = script.construct(ledSegment, settings);

                    this._segments.push({
                        id: segment.id,
                        name: postProcess.name,
                        type: segment.type,
                        script,
                        controller,
                        ledSegment,
                    });
                } else {
                    const _: never = segment;
                    this._logger.error(`Unknown segment type ${(_ as any).type}`);
                    this._segments.length = 0;
                    break;
                }
            }
        } catch (e) {
            this._logger.error(`Error loading segments: ${e}`);
            this._segments.length = 0;
            return;
        }

        if (!this._segments.length) {
            return;
        }
        this._logger.info(`Finished loaded scripts for ${this._segments.length} segments. Assembling`);

        if (this._segments[0].type !== SegmentInputType.Animation) {
            throw new Error('First segment must be an animation');
        }

        const animations: AnimationSegmentVm[] = [];
        for (let i = 0; i < this._segments.length; i++) {
            const segment = this._segments[i];
            if(segment.type === SegmentInputType.Animation) {
                animations.push(segment);
                continue;
            }

        
            const prevSegment = this._segments[i - 1];
            prevSegment.ledSegment.addSendCallback(segment.controller.exec);
            let prevCount = 2;
            while (prevSegment.type === SegmentInputType.Animation && this._segments[i - prevCount]?.type === SegmentInputType.Animation) {
                this._segments[i-prevCount].ledSegment.addSendCallback(segment.controller.exec);
                prevCount++;
            } 
        }

        const lastSegment = this._segments[this._segments.length - 1];
        const renderSegment = lastSegment.ledSegment.rawSegment;

        this._logger.info(`Initializing buffer for ${renderSegment.length} leds`);
        const startFrameBytes = 4;
        const numEndFrameBytes = Math.max(4, Math.ceil(renderSegment.length / 16));
        const buffer = Buffer.alloc((renderSegment.length * 4) + startFrameBytes + numEndFrameBytes);

        //APA 102 brightness frame is 11100000 (=224) + 5 (11111=31) bits for brightness.
        const brightness = 224 + Math.round(31 * .2 /* device.brightness */);

        lastSegment.ledSegment.addSendCallback(() => {
            if (!this._running) { return Promise.resolve(); }
            
            for (let i = 0; i < renderSegment.length; i++) {
                const buffPos = (i * 4) + 4; //We add in 4 to account for the leading reset bytes

                const led = renderSegment.getLed(i);

                buffer[buffPos] = brightness;
                buffer[buffPos + 1] = led[3]; //B
                buffer[buffPos + 2] = led[2]; //G
                buffer[buffPos + 3] = led[1]; //R
            }
            
            rpio.spiWrite(buffer, buffer.length);
            return Promise.resolve();
        });   
    }

    public run(): void {
        this._running = true;
        for (const segment of this._segments) {
            if (segment.type === SegmentInputType.Animation) {
                segment.controller.run(segment.settings);
            }
        }
    }

    public pause(): void {
        this._running = false;
        for (const segment of this._segments) {
            if (segment.type === SegmentInputType.Animation) {
                segment.controller.pause();
            }
        }
        const startFrameBytes = 4;
        const numEndFrameBytes = Math.max(4, Math.ceil(this._numLeds / 16));
        const buffer = Buffer.alloc((this._numLeds * 4) + startFrameBytes + numEndFrameBytes);
        const brightness = 224 + Math.round(31 * 0 /* device.brightness */);
        for (let i = 0; i < this._numLeds; i++) {
            const buffPos = (i * 4) + 4; //We add in 4 to account for the leading reset bytes
            buffer[buffPos] = brightness;
            buffer[buffPos + 1] = 0;
            buffer[buffPos + 2] = 0;
            buffer[buffPos + 3] = 0;
        }
        rpio.spiWrite(buffer, buffer.length);
    }
}

interface SegmentVmBase {
    id: Id,
    name: string,
    ledSegment: LedSegment,
}

interface AnimationSegmentVm extends SegmentVmBase {
    type: SegmentInputType.Animation,
    settings: netled.common.ISettings,
    script: netled.animation.IAnimation,
    services: Partial<netled.services.IServices>,
    controller: netled.animation.IAnimationController
}

interface PostProcessSegmentVm extends SegmentVmBase {
    type: SegmentInputType.PostProcess,
    script: netled.postProcessor.IPostProcessor,
    controller: netled.postProcessor.IPostProcessorController
}

type SegmentVm = AnimationSegmentVm | PostProcessSegmentVm;