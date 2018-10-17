const path_module = require('path');

module.exports = function ({ fs, basePath, moduleLoader }) {
    return {
        findFromArray
    };

    function findFromArray(array) {
        const loaded = {};
        const search = function (path) {
            fs.lstat(path, function (err, stat) {
                if (stat.isDirectory()) {
                    fs.readdir(path, function (err, files) {
                        files.forEach(file => {
                            filePath = path_module.join(path, file);
                            search(filePath)
                        });
                    });
                } else {
                    const fileName = getFileNameFromPath(path);
                    if (array.includes(fileName)) {
                        loaded[array[0]] = moduleLoader.load(path);
                    }
                }
            });
        };
        search(basePath);
        return loaded;
    }

    function getFileNameFromPath(path) {
        return path.replace(/^.*[\\\/]/, '').replace('.js', '');
    }

};