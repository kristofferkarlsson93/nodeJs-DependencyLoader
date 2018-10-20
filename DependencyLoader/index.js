const DependencyLoader = require('./DependencyLoader.js');
const DependencyCache = require('./DependencyCache.js');
const DependencyFinder = require('./DependencyFinder.js');
const ModuleLoader = require('./ModuleLoader');
const functionReflector = require('js-function-reflector');
const fs = require('fs');

module.exports = function (path) {
    const moduleLoader = ModuleLoader();
    const dependencyFinder = DependencyFinder({fs, basePath: path, moduleLoader});
    const dependencyCache = DependencyCache();
    return DependencyLoader({ dependencyCache, dependencyFinder, functionReflector });
};
