module.exports = function () {
    return {
        runFunctionAndGetErrorData
    };

    function runFunctionAndGetErrorData(func, arguments) {
        let result = { didThrow: false, errorMessage: '' };
        try {
            func(...arguments);
        } catch (error) {
            result.didThrow = true;
            result.errorMessagge = error.message;
        } finally {
            return result;
        }
    }
};