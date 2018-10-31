const bocha = require('bocha');
const sinon = bocha.sinon;
const testCase = bocha.testCase;
const assert = bocha.assert;
const refute = bocha.refute;
const DependencyLoader = require('../../DependencyLoader');
const FirstFeedDependency = require('./FeedDependencies/FirstFeedDependency');
const SecondFeedDependency = require('./FeedDependencies/SecondFeedDependency');
const StartModule = require('./StartModule');

module.exports = testCase('AcceptanceTest', {
    'ACCEPTANCE-TEST': {
        'When using the dependencyLoader': {
            setUp() {
                const dependencyLoader = DependencyLoader(__dirname);
                dependencyLoader.feed([
                    { moduleName: 'firstFeedDependency', module: FirstFeedDependency() },
                    { moduleName: 'secondFeedDependency', module: SecondFeedDependency() }
                ]);
                const startModule = dependencyLoader.load('startModule', StartModule);
                this.result = startModule.validate();
            },
            'it loads dependencies that uses "function"': function () {
                assert(this.result.includes('standardFunction'));
            },
            'it loads dependencies that uses "() => {})"': function () {
                assert(this.result.includes('arrowFunction'));
            },
            'it loads named functions': function () {
                assert(this.result.includes('namedFunction'));
            },
            'it loads modules that has filename index.js but has a matching folder name': function () {},
            'it loads dependencies dependencies': function () {},
            'it can load modules it was fed': function () {
                assert(this.result.includes('firstFeedDependency'));
                assert(this.result.includes('secondFeedDependency'));
            },
        }
    }
});