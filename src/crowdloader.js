#!/usr/bin/env node

const { Command } = require("commander");

const download = require("./commands/download");
const init = require("./commands/init");

const program = new Command();

program
  .name("crowdloader")
  .version(require("../package.json").version)
  .description("An unofficial crowdin CLI tool to manage translations");

program
  .command("config")
  .description("Get project configuration")
  .option("-p, --project <path>","Project folder")
  .action(async (_, args) => {
    const load = require("./actions/load");
    const config = load(args.project || process.cwd());
    if (!config) {
      console.error("Crowdloader not initialized, run 'crowdloader init' first");
      process.exit(1);
    }
    console.log(config);
  });

program
  .command("download")
  .description("Download translations")
  .option("-p, --project <path>","Project folder")
  .action(async (_, args) => await download(args));

program
  .command("init")
  .description("Initialize crowdloader")
  .requiredOption("-id, --projectid <id>","Crowdin project id")
  .requiredOption("-a, --apikey <apikey>","Crowdin API token")
  .option("-p, --project <path>","Project folder")
  .action((_, args) => init(args));

program.parse();