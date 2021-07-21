const path = require('path');
const fs = require('fs');
const jsonSass = require('./json-sass');
const pluginName = 'JsonSassWebpackPlugin';

class JsonSassWebpackPlugin {
    options = null;

    constructor(options) {
        this.options = options;
    }

    getSass(object) {
        return "$" + path.parse(this.options.src).name.replace(/\./g, '_') + ":" + jsonSass.convertJs(object) + ";";
    }

    apply(compiler) {
        compiler.hooks.watchRun.tapAsync(
            pluginName,
            (compilation, callback) => {
                const changedFiles = compilation.modifiedFiles;
                if (changedFiles && Array.from(changedFiles).some((file) => file === this.options.src)) {
                    delete require.cache[this.options.src];
                    const themeJS = require(this.options.src);
                    const themeSASS = this.getSass(themeJS);
                    fs.writeFile(this.options.target, themeSASS, function () {
                        callback();
                    });
                } else {
                    callback();
                }
            }
        );
    }
}

module.exports = JsonSassWebpackPlugin;
