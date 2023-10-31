const { resolve } = require("node:path");
const { init } = require("../config/config.js");

function commanderInit(folder, options) {
    const layoutPath = resolve(process.cwd(), folder);
    init(layoutPath);
}

module.exports = {
    commanderInit
}