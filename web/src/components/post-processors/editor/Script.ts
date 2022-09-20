
export default netled.postProcessor.definePostProcessor({
    construct() {
        return {
            process(ledArray) {
                ledArray.reverse();
            }
        };
    }
});