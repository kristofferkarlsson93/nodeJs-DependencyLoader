module.exports = function ({ firstCached }) {
    return {
        validate
    };

    function validate() {
        return [firstCached.validate(), 'otherThatUsesCached'];
    }
}