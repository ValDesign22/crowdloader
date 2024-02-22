#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { program } = require("commander");
const os = require("os");

program
  .version(require("./package.json").version)
  .description("A tool to download translations from Crowdin.")
  .option("-id, --projectid <id>","Crowdin project id")
  .option("-a, --apikey <apikey>","Crowdin API token")
  .option("-p, --project <path>","Project folder")
  .parse(process.argv);

const options = program.opts();

function save(id, token, dir) {
  const folder = path.join(os.tmpdir(), "crowdloader");
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  let configs = [];
  const saveFile = path.join(folder, "configs.json");
  if (fs.existsSync(saveFile)) {
    configs = JSON.parse(fs.readFileSync(saveFile));
    if (configs.find(c => c.id === id)) configs = configs.map(c => c.id === id ? { id, token, dir } : c);
    else configs.push({ id, token, dir });
  } else configs.push({ id, token, dir });
  fs.writeFileSync(saveFile, JSON.stringify(configs, null, 2));
}

function load(dir) {
  const saveFile = path.join(os.tmpdir(), "crowdloader", "configs.json");
  if (!fs.existsSync(saveFile)) return null;
  const configs = JSON.parse(fs.readFileSync(saveFile));
  const config = configs.find(c => c.dir === dir);
  if (!config) return null;
  return config;
}

function printProgress(current, total, message) {
  const percent = Math.min(100, Math.max(0, (current / total) * 100));
  const progressBarLength = 20;
  const progress = Math.round((current / total) * progressBarLength);
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`${"[" + "#".repeat(progress) + "-".repeat(progressBarLength - progress) + "]"} ${percent.toFixed(2)}% ${message}`);
}

(async () => {
  const steps = [
    "Downloading translations...",
    "Fetching build id",
    "Downloading translations",
    "Extracting translations",
    "Downloading translation",
    "Downloaded translation",
  ];

  const projetfolder = options.project || process.cwd();

  if (!fs.existsSync(projetfolder)) {
    console.error("Project folder not found");
    process.exit(1);
  }
  printProgress(0, 6, steps[0]);

  const baseFolder = path.join(__dirname, "extracted");
  const localePath = `\\src\\locales\\`;
  if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder);

  let config = load(projetfolder);
  if (!config) {
    if (!options.projectid) {
      console.error("Project id is required");
      process.exit(1);
    }
    if (!options.apikey) {
      console.error("API key is required");
      process.exit(1);
    }
    save(options.projectid, options.apikey, projetfolder);
  }
  config = load(projetfolder);

  const projectUrl = `https://api.crowdin.com/api/v2/projects/${config.id}/translations/builds`;
  const headers = {
    "Authorization": `Bearer ${config.token}`,
  };
  const builds = (await(await fetch(projectUrl, { headers })).json()).data;
  const buildId = builds[builds.length - 1].data.id;
  printProgress(1, 6, steps[1]);

  const zipPath = path.join(baseFolder, `crowdloader${buildId}.zip`);
  fs.writeFileSync(
    zipPath,
    Buffer.from(
      await(
        await fetch((await(await fetch(`${projectUrl}/${buildId}/download`, {headers })).json()).data.url)
      ).arrayBuffer()
    )
  );
  printProgress(2, 6, steps[2]);
  require("adm-zip")(zipPath).extractAllTo(baseFolder, true);
  fs.unlinkSync(zipPath);
  printProgress(3, 6, steps[3]);

  if (!fs.existsSync(path.join(projetfolder, localePath))) fs.mkdirSync(path.join(projetfolder, localePath), { recursive: true });
  fs.readdirSync(path.join(baseFolder, localePath)).forEach(file => {
    printProgress(4, 6, steps[4]);
    if (fs.existsSync(path.join(projetfolder, localePath, file))) fs.rmSync(path.join(projetfolder, localePath, file), { recursive: true });
    fs.renameSync(
      path.join(baseFolder, localePath, file),
      path.join(projetfolder, localePath ,file)
    );
    printProgress(5, 6, steps[5]);
  });

  fs.rmSync(baseFolder, { recursive: true });
  printProgress(6, 6, "Done");
  process.stdout.write("\n");
})();