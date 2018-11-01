module.exports = function ({ secondLevelChildTwo }) {
    return {
        validate
    };

    function validate() {
        return ['firstLevelChildTwo', secondLevelChildTwo.validate()];
    }
};