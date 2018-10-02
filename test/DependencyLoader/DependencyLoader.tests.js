const bocha = require('bocha');
const sinon = bocha.sinon;
const testCase = bocha.testCase;
const assert = bocha.assert;
const refute = bocha.refute;

module.exports = testCase('DependencyLoader', {
    'When given a function with no dependencies': {
        setUp() {
            this.DependencyLoader = require('../../DependencyLoader')();
            this.exampleFunction = sinon.stub();

            this.DependencyLoader.newInstanceWithName('exampleFunction', this.exampleFunction);
        },
        'should run function': function () {
            assert.calledOnce(this.exampleFunction);
        }
    },
    'when given the same function twice should return same instance': function () {
        const dependencyLoader = require('../../DependencyLoader')();
        const exampleFunction = sinon.stub();

        dependencyLoader.newInstanceWithName('exampleFunction', exampleFunction);
        dependencyLoader.newInstanceWithName('exampleFunction', function () {});
        assert.calledOnce(exampleFunction);
    },
    '=>when given a function with one dependency should run dependency': function () {
        const dependencyLoader = require('../../DependencyLoader')();
        const exampleDependency = sinon.stub();
        const exampleModule = function ({ exampleDependency }) {};

        dependencyLoader.newInstanceWithName('exampleModule', exampleModule);

        assert.calledOnce(exampleDependency);
    }
});