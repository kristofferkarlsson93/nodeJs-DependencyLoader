module.exports = function ({firstFeedDependency, secondFeedDependency}) {
    return {
        validate
    };
    function validate() {
        return [firstFeedDependency.validate(), secondFeedDependency.validate()];
    }
};