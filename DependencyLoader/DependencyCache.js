
module.exports = function () {
    const cache = {};
    return {
        get,
        add
    };

    function get(key) {
        return cache[key] || null;
    }

    function add (key, value) {
        if (!key) throw Error('No key provided when trying to cache function');
        cache[key] = value;
    }
};