module.exports = function ({ firstCached, otherThatUsesCached }) {
    return {
        validate
    };

    function validate() {
        return [
            firstCached.validate(),
            ...otherThatUsesCached.validate(),
            'cachedDependenciesRunner'
        ];
    }
}