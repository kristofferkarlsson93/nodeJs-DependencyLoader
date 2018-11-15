module.exports = function ({ dependencyLoader }) {
    return {
        validate
    };

    function validate() {
        if (dependencyLoader.load && dependencyLoader.feed) {
            return 'takesDependencyLoaderAsDependency';
        }
    }
};