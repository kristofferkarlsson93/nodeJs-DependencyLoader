const path_module = require('path');

module.exports = function ({ fs, basePath, moduleLoader }) {
    const dirNamesToExclude = ['test', 'tests', 'node_modules'];
    return {
        findFromArray
    };

    function findFromArray(moduleNames) {
        const loaded = {};
        const search = function (path) {
            if (!moduleNames.length) {
                return;
            }
            const stat = fs.lstatSync(path);
            if (stat.isDirectory()) {
                const items = fs.readdirSync(path);
                const noItems = items.length;
                let i = 0;
                for (; i < noItems; i++) {
                    if (!dirNamesToExclude.includes(items[i])) {
                        search(path_module.join(path, items[i]));
                    }
                }
            } else {
                const { valid, name } = evaluateFoundFilePath(path, moduleNames);
                if (valid) {
                    loaded[name] = moduleLoader.load(path);
                    moduleNames.splice(moduleNames.indexOf(name), 1);
                }
            }
        };
        search(basePath);
        if (moduleNames.length) {
            throw Error(`Could not find module(s) ${moduleNames.join(', ')}`);
        }
        return loaded;
    }

    function evaluateFoundFilePath(path, modules) {
        const { fileName, directory } = extractDataFromPath(path);
        if (moduleIsRequested(fileName, modules)) {
            const name = modules.find(module => module.toLowerCase() === fileName.toLowerCase());
            return { valid: true, name };
        }
        else if ((fileName === 'index' && moduleIsRequested(directory, modules))) {
            const name = modules.find(module => module.toLowerCase() === directory.toLowerCase());
            return { valid: true, name };
        }
        else return { valid: false, name: null }
    }

    function moduleIsRequested(moduleName, files) {
        return files.some(file => file.toLowerCase() === moduleName.toLowerCase());
    }

    function extractDataFromPath(path) {
        const pathData = path.split(/[\\\/]/);
        return {
            fileName: pathData[pathData.length - 1].replace('.js', ''),
            directory: pathData[pathData.length - 2]
        };
    }
};