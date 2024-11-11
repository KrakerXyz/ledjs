
export default netled.postProcessor.definePostProcessor({
    construct(ledSegment) {
        return {
            exec() {
                ledSegment.reverse();
                return ledSegment.send();
            }
        };
    }
});