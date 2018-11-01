# Nodejs DependencyLoader
No more passing around dependencies from file to file. This tool takes care of that for you.
This is an automated dependency loader. It will inject all required dependencies in to your module without
you having to do anything.

## Usage

### Install it

 ```bash
 npm i @krikar/dependencyloader
 ```
 
### Start it
 
 _snippet 1.0_ 
 
 ```javascript
 const DependencyLoader = require('DependencyLoader');
 const MyStartModule = require('./your/module/path');
 const rootPath = __dirname;
 
 const dependencyLoader = DependencyLoader(rootPath);
 const myStartModule = dependencyLoader.load('myStartModule', MyStartModule );
 
 myStartModule.myFunc();
 ```
 
### Make use of it
 
 _snippet 2.0_
 
 ```javascript
 // in file: MyStartModule.js
 module.exports = function ({ dep1, dep2, dep3 }) {
     return { myFunc };
     
     function myFunc() {
         dep1.doStuff()
     }
 };
 ```
 
For more detailed example see below. [Detailed example](#Detailed-usage)

## How does it work?

### API
 
| Functions              | Input                                                                                            | Returns
| ---------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| DependencyLoader       | Your projects entry path                                                                         | An instance of the DependencyLoader containing the method `load` |
| dependencyLoader.load  | A name for your module and the uninstantiated module                                             | The instantiated module                                          |
| dependencyLoader.feed  | An array with objects containing the name and module `[{ moduleName: 'myModule', module: {} }]`  |                                                                  |

The DependencyLoader requires you to specify a path from which it will start searching for dependencies.
The easiest way of doing this is to provide it with the nodejs `__dirname`.

When the DependencyLoader has been instantiated, access is granted to the `load` method and the `feed` method.

The load method takes two parameters. First the name of the module and secondly the module itself. It returns the 
instantiated module.

The feed method takes an array of objects containing the moduleName and the instantiated module you want to feed the dependency loader with.
This method can be used for hooking up your npm-dependencies with the dependencyLoader. For example you could feed the 
dependencyLoader with Express, and thus get access to express wherever you want by specifying it in your module. 
_WARNING_ It is often a better practice to make a wrapper to your dependencies. 

### Modules

A module should ideally implement the [Revealing Module Pattern](https://www.oreilly.com/library/view/learning-javascript-design/9781449334840/ch09s03.html)
and must take a destructed object as parameter. The destructed keys will get the instantiated dependencies as value. See usage
in _snippet 2.0_

### Dependency loading

The `dependencyLoader.load` will start searching the project tree to find files matching the dependency names 
in the module provided. If the dependencies them self have dependencies they also will be found and instantiated.

It will find dependencies that matches the following criteria. The search is case insensitive.
- File name is equal to the module name
- File name is index.js but parent directory matches the module name  

It ignores folders with the following names
- test
- tests
- node_modules
 
## Detailed usage

To better illustrate the use of the dependencyLoader a more detailed example is provided.

The following example can also be found in full in the github 
[Example folder](https://github.com/kristofferkarlsson93/JavaScript-DependencyLoader/tree/master/Example/) in the repo.

```ASCII
|
| - | Controllers
| - - | Login
| - - - | LoginWithEmailController.js 
|
| - | DatabaseGateways
| - - | UserDataBaseGateway.js
|
| - | Helpers
| - - | TokenCreator
| - - - | index.js
| - - | ResponceCreator.js
|
| - | Providers
| - - | UserProvider.js
|
|- | app.js
```

Let's dive in to app.js.

```javascript
const DependencyLoader = require('DependencyLoader');
const LoginWithEmailController = require('./Controllers/Login/LoginWithEmailController.js');

const dependencyLoader = DependencyLoader(__dirname);
const loginWithEmailController = dependencyLoader.load('loginWithEmailController', LoginWithEmailController);

loginWithEmailController.login('someMail@ignore.mail');
```

Here you would of course have some server-setup code too. But for this example that is not necessary.

When the DependencyLoader is required and instantiated the `load` function is executed to load the first module (LoginWithEmailController).
As seen in the fileTree that module is located under `Controllers/Login/`. 
The module looks like this.

```javascript
// LoginWithEmailController.js
module.exports = function ({ emailValidator, userProvider, responseCreator, tokenCreator }) {
    return {
        login
    };

    function login (email) {
        if (emailValidator.validates(email)) {
            const user = userProvider.getUserByEmail();
            const token = tokenCreator.createForUser(user);
            responseCreator.sendSuccess({ token });
        } else {
            responseCreator.sendBadCredentials();
        }
    }
};
```

As seen in the exported function the module requires four dependencies. When this module is loaded through the 
dependencyLoader the dependencyLoader will find these four dependencies in the project and inject them in to the module.
So as long as the dependencies specified can be found, they will be injected.

If the modules dependencies themselves requires dependencies they will also be loaded, as seen in UserProvider, 
which is dependent on UserDatabaseGateway.

```javascript
// Userprovider.js
module.exports = function ({ userDatabaseGateway }) {
    return {
        getUserByEmail
    };

    function getUserByEmail(email) {
        return userDatabaseGateway.getByEmail(email);
    }
};
```

When a dependency has been loaded once it is added to the cache.

## Versions
- 1.0 - First release.
- 1.1 
  - Adding the `feed` function.
  - Fixing a bug that occurred when dependencies are chopped down on new line. 