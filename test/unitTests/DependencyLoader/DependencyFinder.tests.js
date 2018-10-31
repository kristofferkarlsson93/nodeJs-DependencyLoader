const bocha = require('bocha');
const sinon = bocha.sinon;
const testCase = bocha.testCase;
const assert = bocha.assert;
const refute = bocha.refute;
const defaultsDeep = bocha.defaultsDeep;

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
            this.fakeModule = function () {};
            this.thatFakedOne = function () {};
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
    'when given an array with two dependency names on different levels should load both': function () {
        const fakePath = 'Project/app/src';
        const fakeModuleNames = ['fakeModule', 'thatFakedOne'];
        let readdirCalledTimes = 0;
        const fs = fakeFs([], {
            readdirSync: function (path) {
                if (readdirCalledTimes === 0) {
                    readdirCalledTimes++;
                    assert.equals(path, 'Project/app/src');
                    return ['fakeModule.js', 'app.js', 'thatFakedOnesDir'];
                }
                else if (readdirCalledTimes === 1) {
                    assert.equals(path.replace(/\\/g, '/'), 'Project/app/src/thatFakedOnesDir');
                    readdirCalledTimes++;
                    return ['thatFakedOne.js'];
                }
            }
        });
        this.fakeModule = function () {};
        this.thatFakedOne = function () {};
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

        assert.calledTwice(this.moduleLoader.load);
        assert.calledWith(this.moduleLoader.load, 'Project\\app\\src\\fakeModule.js');
        assert.calledWith(this.moduleLoader.load, 'Project\\app\\src\\thatFakedOnesDir\\thatFakedOne.js');
    },
    'when searching for dependencies should ignore test folders': function () {
        const fakePath = 'Project/app/src';
        const fakeModuleNames = ['fakeModule'];
        const fs = fakeFs([], {
            readdirSync: function (path) {
                refute.equals(path.replace(/\\/g, '/'), 'Project/app/src/test');
                refute.equals(path.replace(/\\/g, '/'), 'Project/app/src/tests');
                return ['fakeModule.js', 'test', 'tests'];
            }
        });
        const fakeModule = function () {};
        const moduleLoader = {
            load: () => fakeModule
        };
        const dependencyFinder = createDependencyFinder({
            basePath: fakePath,
            fs,
            moduleLoader
        });
        const dependencies = dependencyFinder.findFromArray(fakeModuleNames);
        assert.equals(dependencies, { fakeModule });
    },
    'when searching for dependencies should ignore node_modules folder': function () {
        const fakePath = 'Project/app/src';
        const fakeModuleNames = ['fakeModule'];
        const fs = fakeFs([], {
            readdirSync: function (path) {
                refute.equals(path.replace(/\\/g, '/'), 'Project/app/src/node_modules');
                refute.equals(path.replace(/\\/g, '/'), 'Project/app/src/tests');
                return ['fakeModule.js', 'node_modules'];
            }
        });
        const fakeModule = function () {};
        const moduleLoader = {
            load: () => fakeModule
        };
        const dependencyFinder = createDependencyFinder({
            basePath: fakePath,
            fs,
            moduleLoader
        });
        const dependencies = dependencyFinder.findFromArray(fakeModuleNames);
        assert.equals(dependencies, { fakeModule });
    },
    'when all dependencies found should stop traversing file tree': function () {
        const fakePath = 'Project/app/src';
        const fakeModuleNames = ['fakeModule', 'thatFakedOne'];
        let readdirCalledTimes = 0;
        const fs = fakeFs([], {
            readdirSync: function (path) {
                refute.equals(path.replace(/\\/g, '/'), 'Project/app/src/thatFakedOnesDir/notWantedDir');
                if (readdirCalledTimes === 0) {
                    readdirCalledTimes++;
                    assert.equals(path, 'Project/app/src');
                    return ['fakeModule.js', 'app.js', 'thatFakedOnesDir'];
                }
                else if (readdirCalledTimes === 1) {
                    assert.equals(path.replace(/\\/g, '/'), 'Project/app/src/thatFakedOnesDir');
                    readdirCalledTimes++;
                    return ['thatFakedOne.js', 'notWantedDir'];
                }
            }
        });
        const fakeModule = function () {};
        const thatFakedOne = function () {};
        const moduleLoader = {
            load: sinon.stub()
                .onCall(0).returns(fakeModule)
                .onCall(1).returns(thatFakedOne)
        };
        const dependencyFinder = createDependencyFinder({
            basePath: fakePath,
            fs,
            moduleLoader
        });
        const dependencies = dependencyFinder.findFromArray(fakeModuleNames);

        assert.calledTwice(moduleLoader.load);
        assert.calledWith(moduleLoader.load, 'Project\\app\\src\\fakeModule.js');
        assert.calledWith(moduleLoader.load, 'Project\\app\\src\\thatFakedOnesDir\\thatFakedOne.js');
        assert.equals(dependencies, { fakeModule, thatFakedOne });
    }
});

function createDependencyFinder(dependencies) {
    const DependencyFinder = require('../../../DependencyLoader/DependencyFinder.js');
    return DependencyFinder(dependencies);
}

function fakeFs(readdirFileNames, object) {
    return defaultsDeep(object, {
        lstatSync: function (path) {
            return {
                isDirectory: () => !path.includes('.js')
            }
        },
        readdirSync: function (path) {
            return readdirFileNames;
        }
    });
}