const bocha = require('bocha');
const sinon = bocha.sinon;
const testCase = bocha.testCase;
const assert = bocha.assert;
const refute = bocha.refute;

module.exports = testCase('DependencyFinder', {
    '=>when given an array with one requested dependency which is on the base level should return that dependency': function () {
        const fakePath = 'Project/app/src';
        const fakeModuleName = 'fakeModule';
        const fakeFs = {
            lstat: function (path, callback) {
                callback(null, {
                    isDirectory: sinon.stub()
                        .onCall(0).returns(true)
                        .returns(false)
                });
            },
            readdir: function (path, callback) {
                callback(null, ['fakeModule.js', 'app.js']);
            }
        };
        const moduleLoader = function () {
            return {
                load: sinon.stub()
                    .withArgs('Project/app/src/fakeModule.js').returns({ test: 'test' })
                    .returns()
            }
        }();
        const DependencyFinder = require('../../DependencyLoader/DependencyFinder.js');
        const dependencyFinder = DependencyFinder({ basePath: fakePath, fs: fakeFs, moduleLoader });

        const dependencies = dependencyFinder.findFromArray([fakeModuleName]);
        console.log('deps', dependencies);
        assert.equals(dependencies, { 'fakeModule': { test: 'test' } });
        assert.calledOnce(moduleLoader.load);
        assert.calledWith(moduleLoader.load, "Project/app/src/fakeModule.js")
    }
});

// TODO: implementera module loader.