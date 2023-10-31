const { stat, writeFileSync } = require('node:fs');
const { relative } = require("node:path");
const colors = require("@multivisio/layout/scripts/colors");

function init(layoutPath) {
    stat(
        `${layoutPath}/config.json`,
        (err, stats) => {
            if (err) {
                console.error(colors.error(`\nCould not find necessary file "config.json" in folder "${layoutPath}".\n`));
            } else {
                let output = [];
                const config = require(`${layoutPath}/config.json`);

                /* Typography */
                if (config.typography && config.typography.length) {
                    const typographyOutput = makeTypography(config.typography);
                    if (typographyOutput !== "") {
                        output.push(typographyOutput);
                    }
                }


                /* Colors */
                if (config.colors && config.colors.length > 0) {
                    const colorsOutput = makeColors(config.colors);
                    if (colorsOutput !== "") {
                        output.push(colorsOutput);
                    }
                }

                /* Grid */
                if (config.grid) {
                    const gridOutput = makeGrid(config.grid);
                    if (gridOutput !== "") {
                        output.push(gridOutput);
                    }
                }

                output = output.join(`\n`)
                const configScssFile = `${layoutPath}/config.scss`;
                writeFileSync(
                    configScssFile,
                    output
                );

                console.log(colors.info(`\nThe following files has been written.\n`));

                console.log(colors.bgWhite(colors.file(relative(process.cwd(), configScssFile))));

                console.log(colors.info(`\nWith content:\n`));

                console.log(colors.prompt(output));
            }
        }
    )
}

function makeTypography(typography) {
    const output = [];
    output.push(`@use "@multivisio/layout/scss/typography/variables.scss" as typographyVariables with (`);
    output.push(`  $typography: (`);
    const typographyOutput = [];
    for (let x = 0; x < typography.length; x++) {
        const typo = typography[x];
        const typographyItem = [];
        typographyItem.push(`    ${typo.name}: (`);
        const valueKeys = Object.keys(typo);
        const valueArr = [];
        for (let x = 0; x < valueKeys.length; x++) {
            if (valueKeys[x] !== "name") {
                valueArr.push(`      ${valueKeys[x]}: ${typo[valueKeys[x]]}`);
            }
        }
        typographyItem.push(valueArr.join(`,\n`));

        typographyItem.push(`    )`);
        typographyOutput.push(typographyItem.join(`\n`))

    }
    output.push(typographyOutput.join(`,\n`))
    output.push(`  )`);
    output.push(`);\n`);

    return output.join(`\n`);
}

function makeColors(colors) {
    const output = [];

    output.push(`@use "@multivisio/layout/scss/colors/variables.scss" as colorsVariables with (`);
    output.push(`  $colors: (`);

    const values = [];
    for ( let x = 0; x < colors.length; x++ ) {
        values.push(`    ${colors[x].name}: ${colors[x].color}`);
    }
    output.push(values.join(`,\n`));

    output.push(`  )`);
    output.push(`);\n`);

    return output.join(`\n`);
}

function makeGrid(grid) {
    const output = [];

    if (grid.breakpoints && grid.breakpoints.length) {

        const containers = [];
        const containerPaddings = [];
        const breakpoints = [];
        const columns = [];
        const rowGaps = [];
        const columnGaps = [];

        for (let x = 0; x < grid.breakpoints.length; x++) {
            const bp = grid.breakpoints[x];
            breakpoints.push(`    ${bp.name}: ${bp.minWidth}`);
            columns.push(`    ${bp.name}: ${bp.columns}`);
            if (bp.maxWidth) {
                containers.push(`    ${bp.name}: ${bp.maxWidth}`);
            } else {
                containers.push(`    ${bp.name}: 100%`);
            }
            if (bp.paddings) {
                containerPaddings.push(`    ${bp.name}: ${bp.paddings}`);
            } else {
                containerPaddings.push(`    ${bp.name}: 0`);
            }
            if (bp.rowGap) {
                rowGaps.push(`    ${bp.name}: ${bp.rowGap}`);
            } else {
                rowGaps.push(`    ${bp.name}: 0`);
            }
            if (bp.colGap) {
                columnGaps.push(`    ${bp.name}: ${bp.colGap}`);
            } else {
                columnGaps.push(`    ${bp.name}: 0`);
            }
        }

        let vars = [];
        let values = [];

        vars.push(`  $containers: (`);
        vars.push(containers.join(`,\n`));
        vars.push(`  )`);
        values.push(vars.join(`\n`));

        vars = [];
        vars.push(`  $container-paddings: (`);
        vars.push(containerPaddings.join(`,\n`));
        vars.push(`  )`);
        values.push(vars.join(`\n`));

        vars = [];
        vars.push(`  $breakpoints: (`);
        vars.push(breakpoints.join(`,\n`));
        vars.push(`  )`);
        values.push(vars.join(`\n`));

        vars = [];
        vars.push(`  $columns: (`);
        vars.push(columns.join(`,\n`));
        vars.push(`  )`);
        values.push(vars.join(`\n`));

        vars = [];
        vars.push(`  $row-gaps: (`);
        vars.push(rowGaps.join(`,\n`));
        vars.push(`  )`);
        values.push(vars.join(`\n`));

        vars = [];
        vars.push(`  $column-gaps: (`);
        vars.push(columnGaps.join(`,\n`));
        vars.push(`  )`);
        values.push(vars.join(`\n`));

        output.push(`@use "@multivisio/layout/scss/grid/variables.scss" as gridVariables with (`);
        output.push(values.join`,\n`);
        output.push(`);\n`);
    }

    return output.join(`\n`);
}

module.exports = {
    init
}