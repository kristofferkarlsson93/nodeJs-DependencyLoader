const bocha = require('bocha');
const sinon = bocha.sinon;
const testCase = bocha.testCase;
const assert = bocha.assert;
const realFunctionReflector = require('js-function-reflector');

module.exports = testCase('DependencyLoader', {
    'load()': {
        'When given a function with NO dependencies': {
            setUp() {
                this.dependencyCache = {
                    add: sinon.stub(),
                    get: () => null
                };
                const DependencyLoader = require('../../../DependencyLoader/DependencyLoader.js');
                const dependencyLoader = DependencyLoader({ dependencyCache: this.dependencyCache });
                this.exampleFunction = sinon.stub().returns({});

                dependencyLoader.load('exampleFunction', this.exampleFunction);
            },
            'should run function': function () {
                assert.calledOnce(this.exampleFunction);
            },
            'should cache the instance': function () {
                assert.calledOnce(this.dependencyCache.add);
                assert.calledWith(this.dependencyCache.add, "exampleFunction", {});
            },
        },
        'when given the same function twice': {
            setUp() {
                const DependencyLoader = require('../../../DependencyLoader/DependencyLoader.js');
                this.exampleFunction = sinon.stub();
                this.dependencyCache = {
                    add: sinon.stub(),
                    get: sinon.stub()
                        .onCall(0).returns(null)
                        .onCall(1).returns(this.exampleFunction)
                };
                this.dependencyLoader = DependencyLoader({
                    dependencyCache: this.dependencyCache,
                    dependencyFinder: () => {},
                    functionReflector: realFunctionReflector
                });

                this.dependencyLoader.load('exampleFunction', this.exampleFunction);
                this.dependencyLoader.load('exampleFunction', this.exampleFunction);
            },
            'should get cached instance for second call': function () {
                assert.calledWith(this.dependencyCache.get, 'exampleFunction');
            },
            'should instantiate the function only once': function () {
                assert.calledOnce(this.exampleFunction);
            },
        },
        'when given a function with 1 dependency': {
            setUp() {
                const DependencyLoader = require('../../../DependencyLoader/DependencyLoader.js');
                this.exampleDependency = sinon.stub().returns(function () {return {};});
                const dependencyFinder = {
                    findFromArray: () => ({ exampleDependency: this.exampleDependency })
                };
                this.dependencyCache = {
                    add: sinon.stub(),
                    get: () => null
                };
                this.exampleModule = function ({ exampleDependency }) {
                    return {
                        verification: function () {return 'works';}
                    };
                };

                const dependencyLoader = DependencyLoader({
                    dependencyCache: this.dependencyCache,
                    dependencyFinder,
                    functionReflector: realFunctionReflector
                });
                this.instance = dependencyLoader.load('exampleModule', this.exampleModule);
            },
            'should run dependency': function () {
                assert.calledOnce(this.exampleDependency);
            },
            'should cache dependency': function () {
                assert.calledWith(this.dependencyCache.add, sinon.match("exampleDependency", {}));
            },
            'should cache function': function () {
                assert.calledWith(this.dependencyCache.add, sinon.match("exampleModule", {}));
            },
            'should return correct instance': function () {
                assert.equals(this.instance.verification(), 'works');
            }
        },
        'when given a function with 1 dependency that it self has 1 dependency': {
            setUp() {
                const DependencyLoader = require('../../../DependencyLoader/DependencyLoader.js');
                this.dependencyCache = {
                    add: sinon.stub(),
                    get: () => null
                };
                this.secondLevelDependency = sinon.stub().returns({ verification: function () {return 'works'} });
                const firstLevelDependency = function ({ secondLevelDependency }) {return { verification: function () {return secondLevelDependency.verification()} }};
                const dependencyFinder = {
                    findFromArray: sinon.stub()
                        .onCall(0).returns({ firstLevelDependency })
                        .onCall(1).returns({ secondLevelDependency: this.secondLevelDependency }),
                };
                const dependencyLoader = DependencyLoader({
                    dependencyCache: this.dependencyCache,
                    dependencyFinder,
                    functionReflector: realFunctionReflector
                });
                const module = function ({ firstLevelDependency }) {return { verification: function () {return firstLevelDependency.verification();} };};
                this.instance = dependencyLoader.load('module', module);
            },
            'should run the second level dependency': function () {
                assert.calledOnce(this.secondLevelDependency);
            },
            'should run the requested function with its dependencies': function () {
                assert.equals(this.instance.verification(), 'works');
            },
            'should cache the nested dependency': function () {
                assert.calledThrice(this.dependencyCache.add);
                const args = this.dependencyCache.add.getCall(0).args;
                assert.equals(args[0], 'secondLevelDependency');
                assert.equals(Object.keys(args[1])[0], 'verification');
            }
        },
        'when given a function with 2 dependencies': {
            setUp() {
                const DependencyLoader = require('../../../DependencyLoader/DependencyLoader.js');
                const dependencyCache = { add: () => {}, get: () => null };
                this.secondDependency = sinon.stub().returns({
                    verification: function () {return 2}
                });
                this.firstDependency = sinon.stub().returns({
                    verification: function () {return 1}
                });
                const dependencyFinder = {
                    findFromArray: sinon.stub().returns({
                        firstDependency: this.firstDependency,
                        secondDependency: this.secondDependency
                    })
                };
                const dependencyLoader = DependencyLoader({
                    dependencyCache,
                    dependencyFinder,
                    functionReflector: realFunctionReflector
                });
                const module = function ({ firstDependency, secondDependency }) {
                    return {
                        verification: function () {
                            return firstDependency.verification() + secondDependency.verification();
                        }
                    };
                };
                this.instance = dependencyLoader.load('module', module);
            },
            'should instantiate first dependency': function () {
                assert.calledOnce(this.firstDependency);
            },
            'should instantiate second dependency': function () {
                assert.calledOnce(this.secondDependency);
            },
            'should instantiate requested function with correct dependencies': function () {
                assert.equals(this.instance.verification(), 3);
            },
        },
        'when a module has dependency A and B and dependency B is dependent on A should NOT search for A twice': function () {
            const DependencyLoader = require('../../../DependencyLoader/DependencyLoader.js');
            const DependencyCache = require('../../../DependencyLoader/DependencyCache.js');
            const dependencyCache = DependencyCache();
            const dependencyA = sinon.stub().returns({});
            const dependencyC = function () {return {}};
            const dependencyB = function ({ dependencyA, dependencyC }) {return {}};
            const module = function ({ dependencyA, dependencyB }) {return {}};
            const dependencyFinder = {
                findFromArray: sinon.stub()
                    .onCall(0).returns({ dependencyA, dependencyB })
                    .onCall(1).returns({ dependencyC })
            };
            const dependencyLoader = DependencyLoader({
                dependencyCache,
                dependencyFinder,
                functionReflector: realFunctionReflector
            });

            dependencyLoader.load('module', module);

            assert.calledOnce(dependencyA);
            assert.calledTwice(dependencyFinder.findFromArray);
            const argsSecondCall = dependencyFinder.findFromArray.getCall(1).args[0];
            assert.equals(argsSecondCall, ['dependencyC']);
        },
        'when module uses arrow function and has 1 dependency': {
            setUp() {
                const DependencyLoader = require('../../../DependencyLoader/DependencyLoader.js');
                this.exampleDependency = sinon.stub().returns(() => {return {};});
                const dependencyFinder = {
                    findFromArray: () => ({ exampleDependency: this.exampleDependency })
                };
                this.dependencyCache = {
                    add: sinon.stub(),
                    get: () => null
                };
                this.exampleModule = ({ exampleDependency }) => {
                    return {
                        verification: () => {return 'works';}
                    };
                };

                const dependencyLoader = DependencyLoader({
                    dependencyCache: this.dependencyCache,
                    dependencyFinder,
                    functionReflector: realFunctionReflector
                });
                this.instance = dependencyLoader.load('exampleModule', this.exampleModule);
            },
            'should run dependency': function () {
                assert.calledOnce(this.exampleDependency);
            },
            'should cache dependency': function () {
                assert.calledWith(this.dependencyCache.add, sinon.match("exampleDependency", {}));
            },
            'should cache function': function () {
                assert.calledWith(this.dependencyCache.add, sinon.match("exampleModule", {}));
            },
            'should return correct instance': function () {
                assert.equals(this.instance.verification(), 'works');
            }
        },
        'when module has two dependencies chopped down on new lines should work': function () {
            const DependencyLoader = require('../../../DependencyLoader/DependencyLoader.js');
            const dependencyCache = { add() {}, get: () => null };
            this.secondDependency = sinon.stub();
            this.firstDependency = sinon.stub();
            const dependencyFinder = {
                findFromArray: sinon.stub().returns({
                    firstDependency: this.firstDependency,
                    secondDependency: this.secondDependency
                })
            };
            const dependencyLoader = DependencyLoader({
                dependencyCache,
                dependencyFinder,
                functionReflector: realFunctionReflector
            });
            const module = function ({
                firstDependency,
                secondDependency
            }) {};
            dependencyLoader.load('module', module);

            const callArgs = dependencyFinder.findFromArray.getCall(0).args;

            assert.equals(callArgs[0][0], 'firstDependency');
            assert.equals(callArgs[0][1], 'secondDependency');
        }
    },
    'feed()': {
        'when providing an array with one object should save module to cache': function () {
            const dependencyCache = {
                add: sinon.stub(),
            };
            const DependencyLoader = require('../../../DependencyLoader/DependencyLoader.js');
            const dependencyLoader = DependencyLoader({ dependencyCache });
            const nameModulePair = { moduleName: 'testModule', module: {} };
            dependencyLoader.feed([nameModulePair]);

            assert.calledOnce(dependencyCache.add);
            assert.calledWith(dependencyCache.add, 'testModule', {});
        },
        'when providing an array with two objects should save both modules to cache': function () {
            const dependencyCache = {
                add: sinon.stub()
            };
            const DependencyLoader = require('../../../DependencyLoader/DependencyLoader.js');
            const dependencyLoader = DependencyLoader({ dependencyCache });
            const nameModulePairs = [
                { moduleName: 'testModule', module: { key: 'value 1' } },
                { moduleName: 'testModule2', module: { key: 'value 2' } }
            ];
            dependencyLoader.feed(nameModulePairs);

            assert.calledTwice(dependencyCache.add);
            assert.calledWith(dependencyCache.add, 'testModule', { key: 'value 1' });
            assert.calledWith(dependencyCache.add, 'testModule2', { key: 'value 2' });
        },
    }

});