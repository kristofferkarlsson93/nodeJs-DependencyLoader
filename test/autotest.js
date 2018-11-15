const path = require('path');
const bocha = require('bocha');
process.stdout.write("\x1b]0;AUTOTEST - DependencyLoader\x07");
bocha.watch({
    srcPath: path.join(__dirname, '..'),
    testPath: __dirname,
    fileSuffix: '.tests.js'
});