const DependencyLoader = require('./DependencyLoader.js');
const DependencyFinder = require('./DependencyFinder.js');
const functionReflector = require('js-function-reflector');

module.exports = function () {
    const dependencyFinder = DependencyFinder();
    return DependencyLoader({ path: '', dependencyFinder, functionReflector });
};
