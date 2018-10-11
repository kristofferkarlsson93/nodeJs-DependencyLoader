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
        const parameterNames = listParametersForModule(module);

        // refactor so that dependencyFinder can take a list and simultaneously search parameters
        parameterNames.forEach(parameter => {
            const foundDependency = dependencyFinder.findByName(parameter);
            dependencies[parameter] = newInstanceWithName(parameter, foundDependency[parameter]);
        });

        return dependencies;
    }

    function listParametersForModule(module) {
        const reflector = functionReflector(module);
        return reflector.params[0].value.keys.map(param => param.name);
    }

    function moduleHasDependencies(module) {
        return module.length > 0;
    }
};