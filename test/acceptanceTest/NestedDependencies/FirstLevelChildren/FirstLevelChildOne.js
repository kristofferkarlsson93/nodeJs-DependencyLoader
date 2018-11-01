module.exports = function ({ secondLevelChildOne }) {
    return {
        validate
    };

    function validate() {
        return ['firstLevelChildOne', secondLevelChildOne.validate()];
    }
};