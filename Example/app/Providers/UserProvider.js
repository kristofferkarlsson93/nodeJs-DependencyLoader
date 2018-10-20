module.exports = function () {
    return { getUserByEmail };

    function getUserByEmail(email) {
        return { name: 'A name', email };
    }
};