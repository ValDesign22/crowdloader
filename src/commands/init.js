const fs = require("fs");
const load = require("../actions/load");
const save = require("../actions/save");

module.exports = async function init(args) {
  const projectFolder = args.project || process.cwd();

  if (!fs.existsSync(projectFolder)) {
    console.error("Project folder not found");
    process.exit(1);
  }

  const config = load(projectFolder);
  if (!config) {
    console.log(args.projectId)
    if (!args.projectId) {
      console.error("Project id is required");
      process.exit(1);
    }
    if (!args.apikey) {
      console.error("API key is required");
      process.exit(1);
    }

    const resProject = await fetch(`https://api.crowdin.com/api/v2/projects/${args.projectId}`, {
      headers: { "Authorization": `Bearer ${args.apikey}` },
    });
    if (!resProject.ok) {
      console.error("Failed to fetch languages");
      console.error(await resLanguages.text());
      process.exit(1);
    }
    const languages = (await resProject.json()).data.targetLanguageIds
    save(args.projectId, args.apikey, projectFolder, {
      languages,
    });
  } else {
    console.error("Crowdloader already initialized");
    process.exit(1);
  }

  console.log("Crowdloader initialized");
}