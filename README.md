# Automated dependency loading

This is an attempt to implement an automated dependencyLoader in Javascript.

Dependency loading is the act of injecting the dependencies in to a module/function/object, instead of
letting it create them itself.

## Set up
Install the dependency
```bash
npm install ... 
# No npm package yet
```

Use the dependency loader
```javascript
const DependencyLoader = require('DependencyLoader');
const MyStartModule = require('./your/module/path');
const rootPath = __dirname;

const dependencyLoader = DependencyLoader(rootPath);
const myStartModule = dependencyLoader.newInstanceWithName('myStartModule', MyStartModule );

myStartModule.someFunc();
```

Require the DependencyLoader and the module you want to load. 
The dependencyLoader requires a "root" path, since it searches for dependencies starting from that location.
Pass the name of the module and the module to the dependency loaders `newInstanceWithName`.
The dependency loader will now load the module and all of its dependencies. 
If the dependencies has dependencies them self, they will also be loaded.

### A module
The module needs to implement the Revealing module pattern.
The dependencies need to be destructed from an object like in the example. They also need to have a matching filename in your project 
The instantiated dependencies will automatically be injected as the value of the keys.
  
```javascript
// File: MyStartModule
module.exports = function ({dep1, dep2, dep3}) {
    return { myFunc };
    
    function myFunc() {
        dep1.doStuff()
    }
};
```