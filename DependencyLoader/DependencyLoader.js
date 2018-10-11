module.exports = function ({ dependencyCache, dependencyFinder, functionReflector }) {
    return {
        newInstanceWithName,
    };

    function newInstanceWithName(moduleName, module) {
        let instance = null;
        const cachedInstance = dependencyCache.get(moduleName);
        if (cachedInstance) {
            return cachedInstance;
        }
        else if (moduleHasDependencies(module)) {
            const instantiatedDependencies = instantiateDependenciesForModule(module);
            instance = module(instantiatedDependencies);
        }
        else {
            instance = module();
        }
        dependencyCache.add(moduleName, instance);
        return instance;
    }

    function instantiateDependenciesForModule(module) {
        const dependencies = {};
        const reflector = functionReflector(module);
        const parameter = reflector.params[0].value.keys[0].name;

        const foundDependency = dependencyFinder.findByName(parameter);
        dependencies[parameter] = newInstanceWithName(parameter, foundDependency[parameter]);

        return dependencies;
    }

    function moduleHasDependencies(module) {
        return module.length > 0;
    }
};