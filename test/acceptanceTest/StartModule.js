module.exports = function ({
    feedDependenciesRunner,
    functionTypesRunner,
    firstIndexFunction,
    nestedDependenciesRunner,
    cachedDependenciesRunner,
    takesDependencyLoaderAsADependency
}) {
    return {
        validate
    };

    function validate() {
        return [
            ...feedDependenciesRunner.validate(),
            ...functionTypesRunner.validate(),
            ...nestedDependenciesRunner.validate(),
            ...cachedDependenciesRunner.validate(),
            firstIndexFunction.validate(),
            takesDependencyLoaderAsADependency.validate()
       ];
    }
};