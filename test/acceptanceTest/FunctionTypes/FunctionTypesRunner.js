module.exports = function ({ arrowFunction, standardFunction, namedFunction }) {
    return {
        validate
    };

    function validate() {
        return [arrowFunction.validate(), standardFunction.validate(), namedFunction.validate()];
    }
};