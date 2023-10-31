const { stat, statSync, rmSync, mkdirSync, readdirSync, writeFileSync, readFileSync } = require('node:fs');
const { resolve, relative } = require( "node:path");
const colors = require("./colors");
const Confirm = require('prompt-confirm');
const {glob} = require("glob");
const { init } = require("../config/config.js");

function copyRecursive(srcFile, dstFile, exclude = []) {
    let results = [];
    const srcStat = statSync(srcFile);
    if (srcStat && srcStat.isDirectory()) {
        const list = readdirSync(srcFile);
        list.forEach( file => {
            const src = srcFile + '/' + file;
            const dst = dstFile + '/' + file;
            const stats = statSync(src);
            if (stats && stats.isDirectory()) {
                mkdirSync(dst);
                results = results.concat( copyRecursive(src, dst, exclude));
            } else {
                writeFileSync(dst, readFileSync(src));
                results.push(dst);
            }

        });
    } else if (srcStat && srcStat.isFile()) {
        writeFileSync(dstFile, readFileSync(srcFile));
        results.push(dstFile);
    }
    return results;
}

function copyFiles( files, layoutPath ) {
    const srcPath = resolve(__dirname, "../");
    let result = [];
    for (let x = 0; x < files.length; x++ ) {
        const file = files[x];
        result = result.concat(
            copyRecursive(
                srcPath + file.src,
                layoutPath + file.dst
            )
        )
    }
    return result;
}

function install( layoutPath ) {
    stat(
        layoutPath,
        (error, stats) => {
            if (error) {
                mkdirSync(layoutPath);
            }

            let result = [];

            result = result.concat(copyRecursive(
                resolve(__dirname, "../public"),
                layoutPath
            ));

            result = result.concat(copyRecursive(
                resolve(__dirname, "../config"),
                layoutPath
            ));

            console.log(colors.info(`\nThe following files has been created.\n`))
            result.forEach(f => {
                console.log(colors.bgWhite(colors.file(relative(process.cwd(), f))));
            });
            init(layoutPath);
        }
    );
}

function update( layoutPath ) {
    stat(
        layoutPath,
        (error, stats) => {
            if (error) {
                console.error(colors.error(`\nThe folder "${layoutPath}" could not be found.\n`));
            } else {
                let result = [];

                result = result.concat(copyRecursive(
                    resolve(__dirname, "../public"),
                    layoutPath
                ));

                console.log(colors.info(`\nThe following files has been updated.\n`))
                result.forEach(f => {
                    console.log(colors.bgWhite(colors.file(relative(process.cwd(), f))));
                });
                init(layoutPath);
            }
        }
    );
}

function commanderInstall(folder, options) {
    const layoutPath = resolve(process.cwd(), folder);
    stat(
        layoutPath,
        (error, stats) => {
            if (error) {
                install(layoutPath);
            } else if (stats.isDirectory()) {
                if (options.force) {
                    let files = glob.sync(
                        `${layoutPath}/**/*`,
                        {
                            stat: true,
                            withFileTypes: true,
                        }
                    );

                    if (!files.length) {
                        install(layoutPath);
                    } else {

                        console.log(colors.info(`\nThe following files and directories will deleted:\n`));

                        for (let x = 0; x < files.length; x++) {
                            const file = files[x];
                            const relativePath = relative(
                                process.env.PWD,
                                file.fullpath()
                            );

                            if (file.isDirectory()) {
                                console.log(colors.bgWhite(colors.folder(relativePath)));
                            } else {
                                console.log(colors.bgWhite(colors.file(relativePath)));
                            }
                        }
                        const prompt = new Confirm({
                            name: "delete",
                            message: `Are you sure to delete the entire folder ${folder}`,
                            default: false
                        });

                        console.log("");

                        prompt.run()
                            .then(function(del) {
                                if (del) {
                                    rmSync(layoutPath, { recursive: true }, (err) => {
                                        if (err) throw err;
                                    });
                                    install(layoutPath);
                                } else {
                                    console.log(colors.info("Aborted!!!"))
                                }
                            });
                    }
                } else {
                    console.error(colors.error(`\nThe folder "${layoutPath}" already exists.\n`));
                    console.log(colors.info(`You can update the entrypoint folder ${folder}\nand keep the existing configuration files.`));
                    console.log(colors.prompt(`\nnpx ${process.env.npm_lifecycle_script} update ${folder}\n`));
                    console.log(colors.info(`or you can force the command to overwrite the entire folder.\nBe carefully with this.`));
                    console.log(colors.prompt(`\nnpx ${process.env.npm_lifecycle_script} install ${folder} -f\n`));
                }
            }
        }
    );
}

function commanderUpdate(folder, options) {
    const layoutPath = resolve(process.cwd(), folder);
    update(layoutPath);
}

module.exports = {
    install,
    update,
    commanderInstall,
    commanderUpdate
}