module.exports = function () {
    return {
        getByEmail
    };

    function getByEmail(email) {
        return { name: 'A name', email };
    }
};