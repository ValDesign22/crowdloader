#!/usr/bin/env node

const { Command } = require("commander");
const { version, description } = require("../package.json");

const download = require("./commands/download");
const init = require("./commands/init");

const program = new Command();

program
  .name("crowdloader")
  .version(version)
  .description(description);

program
  .command("config")
  .description("Get project configuration")
  .option("-p, --project <project>","Project folder")
  .action(async (args) => {
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
  .option("-p, --project <project>","Project folder")
  .action(async (args) => await download(args));

program
  .command("init")
  .description("Initialize crowdloader")
  .requiredOption("-id, --projectId <projectId>","Crowdin project id")
  .requiredOption("-a, --apikey <apikey>","Crowdin API token")
  .option("-p, --project <project>","Project folder")
  .action(async (args) => await init(args));

program.parse();