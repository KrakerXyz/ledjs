import { Animator, DeviceAnimationSetup, DeviceWsClient } from 'netled';
import { deepEquals, useAnimation } from '../services';

export type Callback = (animation: Animator) => void;

export class AnimatorProvider {

    private readonly _listeners: Callback[] = [];

    public constructor(readonly deviceWs: DeviceWsClient) {

        let lastSetup: DeviceAnimationSetup | null = null;
        let currentAnimator: Animator | null = null;
        deviceWs.onAnimationSetup(async setup => {

            let dirty = false;
            if (setup.id !== lastSetup?.id || setup.version !== lastSetup.version) {

                console.log(`Loading animator ${setup.id}:${setup.version}`);
                currentAnimator = await useAnimation(setup.id, setup.version, true);
                if (lastNumLeds > 0) { currentAnimator.setNumLeds(lastNumLeds); }
                if (setup.config && currentAnimator.setConfig) { currentAnimator.setConfig(setup.config); }

                dirty = true;
            } else if (currentAnimator?.setConfig && setup.config && !deepEquals(lastSetup.config, setup.config)) {
                console.log('Updating animator config');
                currentAnimator.setConfig(setup.config);
            }

            lastSetup = setup;
            if (dirty) {
                this._listeners.forEach(l => l(currentAnimator!));
            }

        });

        let lastNumLeds = 0;
        deviceWs.onDeviceSetup(setup => {
            if (lastNumLeds === setup.numLeds) { return; }
            console.log(`Updating number of leds to ${setup.numLeds}`);
            lastNumLeds = setup.numLeds;
            currentAnimator?.setNumLeds(setup.numLeds);
        });

    }

    public onAnimation(cb: Callback) {
        this._listeners.push(cb);
    }



}