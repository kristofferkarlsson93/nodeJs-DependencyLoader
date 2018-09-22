module.exports = function () {
    const cache = {};
    return {
        newInstanceWithName,
    };

    function newInstanceWithName(functionName, instance) {
        if (moduleHasDependencies(instance)) {
            instanciateDependenciesForModule(instance);
        }
        const cachedInstance = cache[functionName];
        if (cachedInstance) {
            return cachedInstance;
        }
        else {
            cache[functionName] = instance;
            return instance();
        }
    }

    function instanciateDependenciesForModule(module) {
        const dependency = module
            .toString()
            .match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1]
            .replace(/ /g, '')
            .split(',')[0];
        console.log(dependency);
        // newInstanceWithName(dependency, funktionen på nått vis)
    }

    function moduleHasDependencies(module) {
        return module.length > 0;
    }
};
