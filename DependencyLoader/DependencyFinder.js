const path_module = require('path');

module.exports = function ({fs, basePath, moduleLoader}) {
    return {
        findFromArray
    };

    function findFromArray (array) {
        console.log(array);
        const loaded = {};
        const search = function (path) {
            fs.lstat(path, function(err, stat) {
                // DO NOT LOG!!! STUBBED
                if (stat.isDirectory()) {
                    console.log('MEEE');
                    // we have a directory: do a tree walk
                    fs.readdir(path, function(err, files) {
                        var f, l = files.length;
                        for (var i = 0; i < l; i++) {
                            f = path_module.join(path, files[i]);
                            search(f, array);
                        }
                    });
                } else {
                    const fileName = getFileNameFromPath(path);
                    loaded[array[0]] = loaded[array[0]];
                }
            });
        }
        search(basePath);
        return loaded;
    }

    function getFileNameFromPath(path) {
        const parts = path.split('/');

        const  filename = parts[parts.length-1].replace('.js', '');
        return filename;
    }

};