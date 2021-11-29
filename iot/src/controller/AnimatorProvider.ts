import { Animator, AnimationConfig, DeviceWsClient } from '@krakerxyz/netled-core';
import { deepEquals, getLogger, useAnimation } from '../services';

export type Callback = (animation: Animator | null) => void;

export class AnimatorProvider {

    private readonly _listeners: Callback[] = [];
    private readonly _log = getLogger('controller.AnimationProvider');

    public constructor(readonly deviceWs: DeviceWsClient) {

        let lastSetup: AnimationConfig | null = null;
        let currentAnimator: Animator | null = null;
        deviceWs.on('animationSetup', async setup => {

            if (!setup) {
                this._log.info('Clearing animator');
                lastSetup = null;
                currentAnimator = null;
                this._listeners.forEach(l => l(null));
                return;
            }

            let dirty = false;
            if (setup.id !== lastSetup?.id || setup.version !== lastSetup.version) {

                this._log.info(`Loading animator ${setup.id}:${setup.version}`);
                currentAnimator = await useAnimation(setup.id, setup.version, true);
                if (lastNumLeds > 0) { currentAnimator.setNumLeds(lastNumLeds); }
                if (setup.config && currentAnimator.setConfig) { currentAnimator.setConfig(setup.config); }

                dirty = true;
            } else if (currentAnimator?.setConfig && setup.config && !deepEquals(lastSetup.config, setup.config)) {
                this._log.info('Updating animator config');
                currentAnimator.setConfig(setup.config);
            }

            lastSetup = setup;
            if (dirty) {
                this._listeners.forEach(l => l(currentAnimator));
            }

        });

        let lastNumLeds = 0;
        deviceWs.on('deviceSetup', setup => {
            if (lastNumLeds === setup.numLeds) { return; }
            this._log.info(`Updating number of leds to ${setup.numLeds}`);
            lastNumLeds = setup.numLeds;
            currentAnimator?.setNumLeds(setup.numLeds);
        });

    }

    public onAnimation(cb: Callback) {
        this._listeners.push(cb);
    }



}