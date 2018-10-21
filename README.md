# DependencyLoader
No more passing around dependencies from file to file. This tool takes care of that for you.
This is an automated dependency loader. It will inject all required dependencies in to your module without
you having to do anything.

Take a look in the 
[Example folder](https://github.com/kristofferkarlsson93/JavaScript-DependencyLoader/tree/master/Example/) in the repo
## Usage

### Install it
 ```bash
 npm install ...
 ```
 
 ### Start it
 _snippet 1.0_ 
 ```javascript
 const DependencyLoader = require('DependencyLoader');
 const MyStartModule = require('./your/module/path');
 const rootPath = __dirname;
 
 const dependencyLoader = DependencyLoader(rootPath);
 const myStartModule = dependencyLoader.newInstanceWithName('myStartModule', MyStartModule );
 
 myStartModule.myFunc();
 ```
 
 ### Make use of it
 _snippet 2.0_
 ```javascript
 // in file: MyStartModule.js
 module.exports = function ({dep1, dep2, dep3}) {
     return { myFunc };
     
     function myFunc() {
         dep1.doStuff()
     }
 };
 ```

## How does it work?
### API 
| Functions                            | Requirements                                                  | Returns
| ------------------------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------------|
| DependencyLoader                     | Requires your projects entry path                             | An instance of the DependencyLoader containing the method newInstanceWithName  |
| dependencyLoader.newInstanceWithName | Requires a name for your module and the uninstantiaded module | The instantiated module                                                        |

The DependencyLoader requires you to specify a path from which it will start searching for dependencies.
The easiest way of doing this is to provide it with the nodejs property __dirname.

When the DependencyLoader has been instantiated, access is granted to the newInstanceWithName method.
This method takes two parameters. First the name of the module and secondly the module itself. It returns the 
instantiated module.

### Modules
A module should ideally implement the [Revealing Module Pattern](https://www.oreilly.com/library/view/learning-javascript-design/9781449334840/ch09s03.html)
and must take a destructed object as parameter. The destructed keys will get the instantiated dependencies as value. See usage
in _snippet 2.0_

### Dependency loading
The dependencyLoader.newInstanceWithName will start searching the project tree to find files matching the dependencies
names in the module provided. If the dependencies them self have dependencies they also will be found and instantiated.

It will find dependencies that matches the following criteria. The search is case insensitive.
- File name is equal to the module name
- File name is index.js but parent directory matches the module name  

It ignores folders with the following names
- test
- tests
- node_modules
 
## What is dependencyInjection
Dependency injection is the act of injecting the dependencies a module uses in to it. This means that the module do not
need to use `require('./someModule.js')`. This makes the module easier to test and simpler to use.