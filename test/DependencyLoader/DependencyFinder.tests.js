const bocha = require('bocha');
const sinon = bocha.sinon;
const testCase = bocha.testCase;
const assert = bocha.assert;
const refute = bocha.refute;

module.exports = testCase('DependencyFinder', {
    'when given an array with one requested dependency which is on the base level': {
        setUp() {
            const fakePath = 'Project/app/src';
            const fakeModuleName = 'fakeModule';
            const fs = fakeFs(['fakeModule.js', 'app.js']);
            this.moduleLoader = function () {
                return {
                    load: sinon.stub().returns({ test: 'test' })
                }
            }();
            const dependencyFinder = createDependencyFinder({
                basePath: fakePath,
                fs,
                moduleLoader: this.moduleLoader
            });
            this.dependencies = dependencyFinder.findFromArray([fakeModuleName]);
        },
        'should load the module': function () {
            assert.calledOnce(this.moduleLoader.load);
            assert.calledWith(this.moduleLoader.load, "Project\\app\\src\\fakeModule.js")
        },
        'should return the module': function () {
            assert.equals(this.dependencies, { 'fakeModule': { test: 'test' } });
        }
    },
    'when given an array with one dependency name': {
        setUp() {
            const fakePath = 'Project/app/src';
            const fakeModuleName = 'MyFakeModule';
            const fs = fakeFs(['myfakemodule.js', 'app.js']);
            this.assertFunction = function () {};
            this.moduleLoader = {
                load: sinon.stub().returns(this.assertFunction)
            };
            const dependencyFinder = createDependencyFinder({
                basePath: fakePath,
                fs,
                moduleLoader: this.moduleLoader
            });
            this.dependencies = dependencyFinder.findFromArray([fakeModuleName]);
        },
        'should find files with same name regardless of file casing': function () {
            assert.calledOnce(this.moduleLoader.load);
            assert.calledWith(this.moduleLoader.load, "Project\\app\\src\\myfakemodule.js");
        },
        'should return the found module': function () {
            assert.equals(this.dependencies, { MyFakeModule: this.assertFunction });
        }
    },
    'when given an array with one dependency name but the file containing the module is called index.js should compare with its dir': function () {
        const fakePath = 'Project/app/src/myModule';
        const fakeModuleName = 'myModule';
        const fs = fakeFs(['index.js']);
        const assertFunction = () => {};
        const moduleLoader = function () {
            return {
                load: sinon.stub().returns(assertFunction)
            }
        }();
        const dependencyFinder = createDependencyFinder({
            basePath: fakePath,
            fs,
            moduleLoader
        });
        const dependencies = dependencyFinder.findFromArray([fakeModuleName]);

        assert.calledOnce(moduleLoader.load);
        assert.calledWith(moduleLoader.load, "Project\\app\\src\\myModule\\index.js");
        assert.equals(dependencies, { myModule: assertFunction });
    },
    'when given an array with two dependency names found on same level': {
        setUp() {
            const fakePath = 'Project/app/src';
            const fakeModuleNames = ['fakeModule', 'thatFakedOne'];
            const fs = fakeFs(['fakeModule.js', 'app.js', 'thatFakedOne.js']);
            this.fakeModule = function () {return'fakemodule';};
            this.thatFakedOne = function () {return'thatFakedone';};
            this.moduleLoader = {
                load: sinon.stub()
                    .onCall(0).returns(this.fakeModule)
                    .onCall(1).returns(this.thatFakedOne)
            };
            const dependencyFinder = createDependencyFinder({
                basePath: fakePath,
                fs,
                moduleLoader: this.moduleLoader
            });
            this.dependencies = dependencyFinder.findFromArray(fakeModuleNames);
        },
        'should load both modules': function () {
            assert.calledTwice(this.moduleLoader.load);
            assert.calledWith(this.moduleLoader.load, 'Project\\app\\src\\fakeModule.js');
            assert.calledWith(this.moduleLoader.load, 'Project\\app\\src\\thatFakedOne.js');
        },
        'should return both modules': function () {
            assert.equals(this.dependencies, { fakeModule: this.fakeModule, thatFakedOne: this.thatFakedOne });
        }
    },
    '//when given an array with two dependency names on different levels should load both': function () {},
    '//when searching for dependencies should ignore test files': function () {}
});

function createDependencyFinder(dependencies) {
    const DependencyFinder = require('../../DependencyLoader/DependencyFinder.js');
    return DependencyFinder(dependencies);
}

function fakeFs(readdirFileNames) {
    return {
        lstat: function (path, callback) {
            callback(null, {
                isDirectory: () => !path.includes('.js')
            });
        },
        readdir: function (path, callback) {
            callback(null, readdirFileNames);
        }
    };
}

// TODO: implementera module loader.