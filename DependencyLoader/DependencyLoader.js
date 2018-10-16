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
        parameterNames.forEach((parameter, index) => {
            let possiblyCachedDependency = dependencyCache.get(parameter);
            if (possiblyCachedDependency) {
                dependencies[parameter] = possiblyCachedDependency;
                parameterNames.splice(index, 1);
            }
        });
        let foundDependencies = dependencyFinder.findFromArray(parameterNames);
        Object.keys(foundDependencies).forEach(dependencyName => {
            dependencies[dependencyName] = newInstanceWithName(dependencyName, foundDependencies[dependencyName]);
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