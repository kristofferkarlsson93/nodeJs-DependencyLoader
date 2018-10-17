const bocha = require('bocha');
const sinon = bocha.sinon;
const testCase = bocha.testCase;
const assert = bocha.assert;
const refute = bocha.refute;

module.exports = testCase('DependencyFinder', {
    'when given an array with one requested dependency which is on the base level should return that dependency': function () {
        const fakePath = 'Project/app/src';
        const fakeModuleName = 'fakeModule';
        const fakeFs = {
            lstat: function (path, callback) {
                callback(null, {
                    isDirectory: () => !path.includes('.js')
                });
            },
            readdir: function (path, callback) {
                callback(null, ['fakeModule.js', 'app.js']);
            }
        };
        const moduleLoader = function () {
            return {
                load: sinon.stub().returns({ test: 'test' })
            }
        }();
        const DependencyFinder = require('../../DependencyLoader/DependencyFinder.js');
        const dependencyFinder = DependencyFinder({ basePath: fakePath, fs: fakeFs, moduleLoader });

        const dependencies = dependencyFinder.findFromArray([fakeModuleName]);

        assert.equals(dependencies, { 'fakeModule': { test: 'test' } });
        assert.calledOnce(moduleLoader.load);
        assert.calledWith(moduleLoader.load, "Project\\app\\src\\fakeModule.js")
    },
    '//when given an array with one dependency name should NOT care about casing': function () {},
    '//when given an array with one dependency name but wanted file is called index.js should use the dir name as key': function () {},
    '//when given an array with two dependency names on same level should load both': function () {},
    '//when given an array with two dependency names on different levels should load both': function () {},
    '//when searching for dependencies should ignore test files': function () {}
});

// TODO: implementera module loader.