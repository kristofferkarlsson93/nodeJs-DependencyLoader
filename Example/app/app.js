const DependencyLoader = require('../../DependencyLoader');
const LoginWithEmailController = require('./Controllers/Login/LoginWithEmailController.js');

const dependencyLoader = DependencyLoader(__dirname);
const loginWithEmailController = dependencyLoader.load('loginWithEmailController', LoginWithEmailController);

loginWithEmailController.login('someMail@ignore.mail');
