const fs = require("fs");
const load = require("../actions/load");
const save = require("../actions/save");

module.exports = function init(args) {
  const projectFolder = args.project || process.cwd();

  if (!fs.existsSync(projectFolder)) {
    console.error("Project folder not found");
    process.exit(1);
  }

  const config = load(projectFolder);
  if (!config) {
    if (!args.projectid) {
      console.error("Project id is required");
      process.exit(1);
    }
    if (!args.apikey) {
      console.error("API key is required");
      process.exit(1);
    }
    save(args.projectid, args.apikey, projectFolder);
  }

  console.log("Crowdloader initialized");
}