module.exports = function ({ dependencyCache, dependencyFinder, functionReflector }) {
    return {
        load,
    };

    function load(moduleName, module) {
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
        parameterNames.forEach((parameter, index) => {
            const possiblyCachedDependency = dependencyCache.get(parameter);
            if (possiblyCachedDependency) {
                dependencies[parameter] = possiblyCachedDependency;
                parameterNames.splice(index, 1);
            }
        });
        const foundDependencies = dependencyFinder.findFromArray(parameterNames);
        Object.keys(foundDependencies).forEach(dependencyName => {
            dependencies[dependencyName] = load(dependencyName, foundDependencies[dependencyName]);
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