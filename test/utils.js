module.exports = function () {
    return {
        runFunctionAndGetErrorData
    };

    function runFunctionAndGetErrorData(func, arguments) {
        const result = { didThrow: false, message: '' };
        try {
            func(...arguments);
        } catch (error) {
            result.didThrow = true;
            result.message = error.message;
        } finally {
            return result;
        }
    }
};