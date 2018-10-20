
module.exports = function ({emailValidator, userProvider, responseCreator, tokenCreator}) {
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