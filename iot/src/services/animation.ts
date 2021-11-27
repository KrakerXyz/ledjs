import { AnimationRestClient, Animator, AnimatorType, Id, netLedGlobal } from '@krakerxyz/netled-core';
import { useRestClient } from '.';
import { NodeVM, VMScript } from 'vm2';

let theVm: NodeVM | undefined;

export async function useAnimation(id: Id, version: number, trusted: boolean): Promise<Animator> {

    const restClient = useRestClient();
    const animationClient = new AnimationRestClient(restClient);
    const script = await animationClient.script(id, version);

    const cjsScript = script.replace('export default', 'const cls =') + 'module.exports = { default: cls }';

    if (!trusted) {
        const animation = useSandboxAnimation(cjsScript);
        return animation;
    }

    if (!(globalThis as any).netled) {
        (globalThis as any).netled = netLedGlobal;
    }

    //https://stackoverflow.com/questions/17581830/load-node-js-module-from-string-in-memory
    const Module: any = module.constructor;
    const m = new Module();
    m._compile(cjsScript, 'animation.js');
    const animator: AnimatorType = m.exports.default;
    const animation = new animator();
    return animation;

}

function useSandboxAnimation(script: string): Animator {
    const vmScript = new VMScript(script, 'animation.js');
    vmScript.compile();

    const vm = theVm ?? (theVm = new NodeVM({
        sandbox: {
            netled: netLedGlobal
        }
    }));

    const runResult = vm.run(vmScript);
    const animatorType: AnimatorType = runResult.default;

    const animator = new animatorType();

    return animator;
}