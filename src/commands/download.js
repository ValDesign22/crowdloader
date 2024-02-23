const fs = require("fs");
const path = require("path");
const load = require("../actions/load");

module.exports = async function download(args) {
  const steps = [
    "Downloading translations...",
    "Fetching build id",
    "Downloading translations",
    "Extracting translations",
    "Downloading translation",
    "Downloaded translation",
  ];

  const projectFolder = args.project || process.cwd();

  if (!fs.existsSync(projectFolder)) {
    console.error("Project folder not found");
    process.exit(1);
  }
  printProgress(0, 6, steps[0]);

  const baseFolder = path.join(projectFolder, "extracted");
  const localePath = `\\src\\locales\\`;
  if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder);

  const config = load(projectFolder);
  if (!config) {
    console.error("Crowdloader not initialized, run 'crowdloader init' first");
    process.exit(1);
  }

  const buildsUrl = `https://api.crowdin.com/api/v2/projects/${config.id}/translations/builds`;
  const headers = { "Authorization": `Bearer ${config.token}` };
  const buildsRes = await fetch(buildsUrl, { headers });
  if (!buildsRes.ok) {
    console.error("Failed to fetch translations");
    console.error(await buildsRes.text());
    process.exit(1);
  }
  const builds = (await buildsRes.json()).data;
  const buildId = builds[builds.length - 1].data.id;
  printProgress(1, 6, steps[1]);

  const zipPath = path.join(baseFolder, `crowdloader${buildId}.zip`);
  fs.writeFileSync(
    zipPath,
    Buffer.from(
      await (
        await fetch((await (await fetch(`${buildsUrl}/${buildId}/download`, { headers })).json()).data.url)
      ).arrayBuffer()
    )
  );
  printProgress(2, 6, steps[2]);
  require("adm-zip")(zipPath).extractAllTo(baseFolder, true);
  fs.unlinkSync(zipPath);
  printProgress(3, 6, steps[3]);

  if (!fs.existsSync(path.join(projectFolder, localePath))) fs.mkdirSync(path.join(projectFolder, localePath));
  printProgress(4, 6, steps[4]);
  fs.readdirSync(path.join(baseFolder, localePath)).forEach(file => {
    if (fs.existsSync(path.join(projectFolder, localePath, file))) fs.rmSync(path.join(projectFolder, localePath, file), { recursive: true });
    printProgress(4, 6, `Downloading translation ${file}...`);
    fs.renameSync(
      path.join(baseFolder, localePath, file),
      path.join(projectFolder, localePath ,file)
    );
    printProgress(4, 6, `Downloaded translation ${file}`);
  });
  printProgress(5, 6, steps[5]);

  fs.rmSync(baseFolder, { recursive: true });
  printProgress(6, 6, "Done");
  process.stdout.write("\n");
}

function printProgress(current, total, message) {
  const percent = Math.min(100, Math.max(0, (current / total) * 100));
  const progressBarLength = 20;
  const progress = Math.round((current / total) * progressBarLength);
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`${"[" + "#".repeat(progress) + "-".repeat(progressBarLength - progress) + "]"} ${percent.toFixed(2)}% ${message}`);
}