const bocha = require('bocha');
const sinon = bocha.sinon;
const testCase = bocha.testCase;
const assert = bocha.assert;
const refute = bocha.refute;
const realFunctionReflector = require('js-function-reflector');

module.exports = testCase('DependencyLoader', {
    'When given a function with NO dependencies': {
        setUp() {
            this.dependencyCache = {
                add: sinon.stub(),
                get: () => null
            };
            const DependencyLoader = require('../../DependencyLoader/DependencyLoader.js');
            const dependencyLoader = DependencyLoader({ dependencyCache: this.dependencyCache });
            this.exampleFunction = sinon.stub().returns({});

            dependencyLoader.newInstanceWithName('exampleFunction', this.exampleFunction);
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
            const DependencyLoader = require('../../DependencyLoader/DependencyLoader.js');
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

            this.dependencyLoader.newInstanceWithName('exampleFunction', this.exampleFunction);
            this.dependencyLoader.newInstanceWithName('exampleFunction', this.exampleFunction);
        },
        'should get cached intstance for second call': function () {
            assert.calledWith(this.dependencyCache.get, 'exampleFunction');
        },
        'should instantiate the function only once': function () {
            assert.calledOnce(this.exampleFunction);
        },
    },
    'when given a function with 1 dependency': {
        setUp() {
            const DependencyLoader = require('../../DependencyLoader/DependencyLoader.js');
            this.exampleDependency = sinon.stub().returns(function () {return {};});
            const dependencyFinder = {
                findFromArray: () => ({exampleDependency: this.exampleDependency})
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
            this.instance = dependencyLoader.newInstanceWithName('exampleModule', this.exampleModule);
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
            const DependencyLoader = require('../../DependencyLoader/DependencyLoader.js');
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
            this.instance = dependencyLoader.newInstanceWithName('module', module);
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
            const DependencyLoader = require('../../DependencyLoader/DependencyLoader.js');
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
            this.instance = dependencyLoader.newInstanceWithName('module', module);
        },
        'should instantiate first dependency': function () {
            assert.calledOnce(this.firstDependency);
        },
        'should instantiate second dependency': function () {
            assert.calledOnce(this.secondDependency);
        },
        'should instantiate requested function with correct dependencies': function () {
            assert.equals(this.instance.verification(), 3);
        }
        // TODO: Refactor so that dependencyFinder has a function that takes an array of dep-names
    }
});