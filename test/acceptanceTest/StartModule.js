module.exports = function ({ feedDependenciesRunner, functionTypesRunner }) {
    return {
        validate
    };

    function validate() {
        return [...feedDependenciesRunner.validate(), ...functionTypesRunner.validate()];
    }
};