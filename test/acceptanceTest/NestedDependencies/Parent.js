module.exports = function ({firstLevelChildOne, firstLevelChildTwo}) {
    return {
        validate
    };

    function validate() {
        return [
            'parent',
            ...firstLevelChildOne.validate(),
            ...firstLevelChildTwo.validate()
        ];
    }
}