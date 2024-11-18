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

const segments: SegmentVm[] = [];
if (device.strandId) {
    logger.debug('Loading strand');
    const strand = await restApi.strands.byId(device.strandId);
    if(strand) {
        logger.info(`Got strand '${strand.name}' consisting of ${strand.segments.length} segments`);

        for (const segment of strand.segments) {
            let js = '';
            if (segment.type === SegmentInputType.Animation) {
                logger.debug(`Loading animation ${segment.script.id} for segment ${segment.id}`);
                const animation = await restApi.animations.byId(segment.script.id, segment.script.version);
                if (!animation) {
                    logger.error(`Failed to load animation ${segment.script.id}`);
                    segments.length = 0;
                    break;
                }
                logger.info(`Loaded animation ${animation.id}: ${animation.name}`);
                js = animation.js;
            } else if (segment.type === SegmentInputType.PostProcess) {
                logger.debug(`Loading post-process ${segment.script.id} for segment ${segment.id}`);
                const postProcess = await restApi.postProcessors.byId(segment.script.id, segment.script.version);
                if (!postProcess) {
                    logger.error(`Failed to load post-process ${segment.script.id}`);
                    segments.length = 0;
                    break;
                }
                logger.info(`Loaded post-process ${postProcess.id}: ${postProcess.name}`);
                js = postProcess.js;   
            } else {
                const _: never = segment;
                logger.error(`Unknown segment type ${(_ as any).type}`);
                segments.length = 0;
                break;
            }


            const segmentVm: SegmentVm = {
                id: segment.id,
                type: segment.type,
                numLeds: segment.leds.num,
                offset: segment.leds.offset,
                js
            };
            segments.push(segmentVm);
        }
    }
}


interface SegmentVm {
    id: Id,
    type: SegmentInputType,
    numLeds: number,
    offset: number,
    js: string
}