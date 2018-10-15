let bocha = require('bocha');
let sinon = bocha.sinon;
let testCase = bocha.testCase;
let assert = bocha.assert;
let refute = bocha.refute;

module.exports = testCase('DependencyCache', {
    'when trying to get an uncached value should return null': function () {
        const dependencyCache = createDependnecyCache();

        assert.equals(dependencyCache.get('unknown'), null);
    },
    '// when adding a dependency should throw if no key is provided': function () {
        const dependencyCache = createDependnecyCache();
        assert.exception(dependencyCache.add('', () => {}));
    },
    'when adding a correct key and value to cache should be able to get it': function () {
        const dependencyCache = createDependnecyCache();
        const exampleFunction = function (verificationString) { return { test: () => verificationString } };
        dependencyCache.add('example', exampleFunction('works'));

        const cached = dependencyCache.get('example');
        assert.equals(cached.test(), 'works')
    },
    'when adding the same key twice should overwrite first value': function () {
        const dependencyCache = createDependnecyCache();
        const firstFunction = function (verificationString) { return { test: () => verificationString } };
        const secondFunction =  function () { return { test: () => 'number 2' } };
        dependencyCache.add('example', firstFunction());
        dependencyCache.add('example', secondFunction());

        const cached = dependencyCache.get('example');
        assert.equals(cached.test(), 'number 2');
    }

});

function createDependnecyCache() {
    const DependencyCache = require('../../DependencyLoader/DependencyCache.js');
    return DependencyCache();
}