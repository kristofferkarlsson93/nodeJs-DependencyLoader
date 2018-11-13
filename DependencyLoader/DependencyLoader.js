module.exports = function ({ dependencyCache, dependencyFinder, functionReflector }) {
    const dependencyLoader = { load, feed };
    return dependencyLoader;

    function load(moduleName, module) {
        let instance = null;
        const cachedInstance = dependencyCache.get(moduleName);
        if (cachedInstance) {
            return cachedInstance;
        } else if (moduleHasDependencies(module)) {
            const instantiatedDependencies = instantiateDependenciesForModule(module);
            instance = module(instantiatedDependencies);
        } else {
            instance = module();
        }
        dependencyCache.add(moduleName, instance);
        return instance;
    }

    function feed(modules) {
        modules.forEach(module => {
            dependencyCache.add(module.moduleName, module.module);
        })
    }

    function instantiateDependenciesForModule(module) {
        const parameterNames = listParametersForModule(module);
        const dependencies = { ...getKnownDependencies(parameterNames) };

        const foundDependencies = dependencyFinder.findFromArray(parameterNames);
        Object.keys(foundDependencies).forEach(dependencyName => {
            dependencies[dependencyName] = load(dependencyName, foundDependencies[dependencyName]);
        });

        return dependencies;
    }

    function getKnownDependencies(parameterNames) {
        const knownDependencies = {};
        parameterNames.forEach((parameter, index) => {
            const possiblyCachedDependency = dependencyCache.get(parameter);
            if (possiblyCachedDependency) {
                knownDependencies[parameter] = possiblyCachedDependency;
                parameterNames.splice(index, 1);
            } else if (parameterIsDependencyLoader(parameter)) {
                knownDependencies[parameter] = dependencyLoader;
                parameterNames.splice(index, 1);
            }
        });
        return knownDependencies;
    }

    function listParametersForModule(module) {
        const reflector = functionReflector(module);
        guardAgainstMalformedParameters(reflector);
        return reflector.params[0].value.keys.map(param => param.name.trim());
    }

    function parameterIsDependencyLoader(parameter) {
        return parameter.toLowerCase() === 'dependencyloader';
    }

    function moduleHasDependencies(module) {
        return module.length > 0;
    }

    function guardAgainstMalformedParameters(reflector) {
        if (reflector.params.length > 1) {
            throw Error('DependencyLoader do not support parameters outside the destructed object')
        }
        if (reflector.params[0].type !== 'DESTRUCTURING') {
            throw Error('Module should specify parameters in an destructed object')
        }
    }
};