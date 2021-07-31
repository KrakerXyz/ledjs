import { AnimationRestClient, Animator, AnimatorType, netLedGlobal } from 'netled';
import { useRestClient } from '.';
import { NodeVM, VMScript } from 'vm2';

let theVm: NodeVM | undefined;

export async function useAnimation(id: string, version: number): Promise<Animator<any>> {

    const restClient = useRestClient();
    const animationClient = new AnimationRestClient(restClient);
    const script = await animationClient.script(id, version);
    const cjsScript = script.replace('export default', 'const cls =') + 'module.exports = { default: cls }';
    const vmScript = new VMScript(cjsScript, `${id}.${version}.js`);
    vmScript.compile();

    const vm = theVm ?? (theVm = new NodeVM({
        sandbox: {
            netled: netLedGlobal
        }
    }));

    const runResult = vm.run(vmScript);
    const animatorType: AnimatorType<any> = runResult.default;

    const animator = new animatorType();

    return animator;
}