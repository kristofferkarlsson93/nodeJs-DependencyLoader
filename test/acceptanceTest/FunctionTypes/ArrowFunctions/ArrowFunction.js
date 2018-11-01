module.exports = ({ secondArrowFunction }) => {
    return {
        validate
    };
    function validate() {
        return ['arrowFunction', secondArrowFunction.validate()];
    }
};