#!/usr/bin/env node
const { Command } = require("commander");
const { commanderInstall, commanderUpdate } = require("./scripts/install.js");
const { commanderInit } = require("./scripts/init.js");

const commander = new Command();

commander
    .name("multivisio-layout-install")
    .description("Executables for layout framework")
    .version("1.0.0");

commander.command("install")
    .description("Install entrypoint for layout framework in a specified folder")
    .argument('<folder>', "Folder where to install the entrypoint")
    .option("-f, --force", "Overwrite existing folder, but keep the config files")
    .action(commanderInstall)
    ;

commander.command("update")
    .description("Update entrypoint for layout framework in a specified folder")
    .argument('<folder>', "Folder where to update the entrypoint")
    .action(commanderUpdate)
;

commander.command("init")
    .description("Init the configuration for layout framework in a specified folder")
    .argument('<folder>', "Folder where to init the framework")
    .action(commanderInit)
;

commander.parse();