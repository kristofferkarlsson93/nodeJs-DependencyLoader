module.exports = function ({ userDatabaseGateway }) {
    return {
        getUserByEmail
    };

    function getUserByEmail(email) {
        userDatabaseGateway.getByEmail(email);
    }
};