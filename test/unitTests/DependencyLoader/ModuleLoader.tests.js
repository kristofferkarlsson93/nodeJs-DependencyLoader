const bocha = require('bocha');
const sinon = bocha.sinon;
const testCase = bocha.testCase;
const assert = bocha.assert;
const refute = bocha.refute;
const _module = require('module');
const load = _module._load;

module.exports = testCase('ModuleLoader', {
    tearDown() {
        _module._load = load;
    },
    'when given a file path should require it': function () {
        const ModuleLoader = require('../../../DependencyLoader/ModuleLoader.js');
        const stubbedRequire = sinon.stub(_module, '_load');
        const moduleLoader = ModuleLoader();

        moduleLoader.load('path/to/module/module.js');

        assert.calledOnce(stubbedRequire);
        assert.calledWith(stubbedRequire, 'path/to/module/module.js');
    }
});