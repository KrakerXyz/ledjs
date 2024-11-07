
export default netled.postProcessor.definePostProcessor({
    construct(ledArray) {
        return {
            exec() {
                ledArray.reverse();
                return ledArray.send();
            }
        };
    }
});