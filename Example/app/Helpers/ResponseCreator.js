module.exports = function () {
    return {
        sendSuccess,
        sendBadCredentials
    };

    function sendSuccess (data) {
        console.log( 'sending', data);
    }
    function sendBadCredentials() {
        console.log('sending bad credentials...');
    }
};