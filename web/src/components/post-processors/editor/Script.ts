
export default netled.postProcessor.definePostProcessor({
    construct(ledSegment) {
        return {
            exec() {
                return ledSegment.send();
            }
        };
    }
});