module.exports = function () {
    let calledTimes = 0;
    return {
        validate
    };

    function validate() {
        calledTimes ++;
        return 'firstCached' + calledTimes;
    }
};