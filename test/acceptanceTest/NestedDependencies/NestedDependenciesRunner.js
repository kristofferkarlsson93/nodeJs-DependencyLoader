module.exports = function ({parent}) {
    return {
        validate
    };

    function validate() {
        return [
            'nestedDependenciesRunner',
            ...parent.validate()
        ];
    }
}