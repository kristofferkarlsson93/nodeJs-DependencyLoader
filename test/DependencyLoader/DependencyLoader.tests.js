const bocha = require('bocha');
const sinon = bocha.sinon;
const testCase = bocha.testCase;
const assert = bocha.assert;
const refute = bocha.refute;
const realFunctionReflector = require('js-function-reflector');

module.exports = testCase('DependencyLoader', {
    'When given a function with no dependencies': {
        setUp() {
            this.dependencyCache = {
                add: sinon.stub(),
                get: () => null
            };
            const DependencyLoader = require('../../DependencyLoader/DependencyLoader.js');
            const dependencyLoader = DependencyLoader({ dependencyCache: this.dependencyCache});
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
        'should get cached intstance for secound call': function () {
            assert.calledWith(this.dependencyCache.get, 'exampleFunction');
        },
        'should instantiate the function only once': function () {
            assert.calledOnce(this.exampleFunction);
        },
    },
    'when given a function with one dependency': {
        setUp() {
            const DependencyLoader = require('../../DependencyLoader/DependencyLoader.js');
            this.exampleDependency = sinon.stub().returns(() => {});
            const dependencyFinder = {
                findByName: () => ({ exampleDependency: this.exampleDependency })
            };
            this.dependencyCache = {
                add: sinon.stub(),
                get: () => null
            };
            this.exampleModule = function ({ exampleDependency }) {return {};};

            const dependencyLoader = DependencyLoader({
                dependencyCache: this.dependencyCache,
                dependencyFinder,
                functionReflector: realFunctionReflector
            });
            dependencyLoader.newInstanceWithName('exampleModule', this.exampleModule);
        },
        'should run dependency': function () {
            assert.calledOnce(this.exampleDependency);
        },
        'should cache dependency': function () {
            assert.calledWith(this.dependencyCache.add, sinon.match("exampleDependency", {}));
        },
        'should cache function': function () {
            assert.calledWith(this.dependencyCache.add, sinon.match("exampleModule", {}));
        }
    }
});