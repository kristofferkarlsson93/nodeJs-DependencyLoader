module.exports = function () {
    return {
        load
    };

    function load (modulePath) {
        return require(modulePath);
    }
};