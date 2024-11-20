
import { LedSegment } from '../../core/src/LedSegment.js';
import { netledGlobal } from '../../core/src/netledGlobal.js';
import { Id } from '../../core/src/rest/model/Id.js';
import { SegmentInputType } from '../../core/src/rest/model/Strand.js';
import { EnvKey, getRequiredConfig } from './services/getRequiredConfig.js';
import { getLogger } from './services/logger.js';
import { restApi } from './services/restApi.js';

const logger = getLogger('index');
logger.info('Starting up');

const deviceId = atob(getRequiredConfig(EnvKey.LEDJS_AUTH)).split(':')[0];
logger.info(`Device ID: ${deviceId}`);

logger.debug('Loading device');
const device = await restApi.devices.byId(deviceId);

if(!device) { throw new Error('Device not found'); }

logger.info(`Got device '${device.name}'`);

if (!(globalThis as any).netled) {
    (globalThis as any).netled = netledGlobal;
}

const segments: SegmentVm[] = [];
if (device.strandId) {
    logger.debug('Loading strand');
    const strand = await restApi.strands.byId(device.strandId);

    logger.info(`Got strand '${strand.name}' consisting of ${strand.segments.length} segments`);

    const sab = new SharedArrayBuffer(strand.numLeds * 4);

    for (const segment of strand.segments) {
        let js = '';
        let name = '';
        let ledSegment: netled.common.ILedSegment;
        if (segment.type === SegmentInputType.Animation) {
            logger.debug(`Loading animation ${segment.script.id} for segment ${segment.id}`);
            const animation = await restApi.animations.byId(segment.script.id, segment.script.version);
            if (!animation) {
                logger.error(`Failed to load animation ${segment.script.id}`);
                segments.length = 0;
                break;
            }
            logger.info(`Loaded animation ${animation.id}: ${animation.name}`);
            name = animation.name;
            js = animation.js;
            ledSegment = new LedSegment(sab, segment.leds.num, segment.leds.offset, segment.leds.dead);
        } else if (segment.type === SegmentInputType.PostProcess) {
            logger.debug(`Loading post-process ${segment.script.id} for segment ${segment.id}`);
            const postProcess = await restApi.postProcessors.byId(segment.script.id, segment.script.version);
            if (!postProcess) {
                logger.error(`Failed to load post-process ${segment.script.id}`);
                segments.length = 0;
                break;
            }
            logger.info(`Loaded post-process ${postProcess.id}: ${postProcess.name}`);
            name = postProcess.name
            js = postProcess.js;
            ledSegment = new LedSegment(sab, segment.leds.num, segment.leds.offset);
        } else {
            const _: never = segment;
            logger.error(`Unknown segment type ${(_ as any).type}`);
            segments.length = 0;
            break;
        }

        const script: netled.animation.IAnimation | netled.postProcessor.IPostProcessor = (await import('data:text/javascript;base64,' + btoa(js))).default;

        const segmentVm = {
            id: segment.id,
            name,
            type: segment.type,
            script,
            ledSegment,
        } as SegmentVm;

        segments.push(segmentVm);
    }

    if (segments.length > 0) {
        logger.info(`Finished loaded scripts for ${segments.length} segments`);
    }

}


interface SegmentVmBase {
    id: Id,
    name: string,
    ledSegment: netled.common.ILedSegment,
}

interface AnimationSegmentVm extends SegmentVmBase {
        type: SegmentInputType.Animation,
        script: netled.animation.IAnimation
}

interface PostProcessSegmentVm extends SegmentVmBase {
    type: SegmentInputType.PostProcess,
    script: netled.postProcessor.IPostProcessor
}

type SegmentVm = AnimationSegmentVm | PostProcessSegmentVm;