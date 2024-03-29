const os = require("os");
const fs = require("fs");
const path = require("path");

module.exports = function save(id, token, dir, data) {
  const folder = path.join(os.tmpdir(), "crowdloader");
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  let configs = [];
  const saveFile = path.join(folder, "configs.json");
  if (fs.existsSync(saveFile)) {
    configs = JSON.parse(fs.readFileSync(saveFile));
    if (configs.find(c => c.id === id)) configs = configs.map(c => c.id === id ? { id, token, dir, ...data } : c);
    else configs.push({ id, token, dir, ...data });
  } else configs.push({ id, token, dir, ...data });
  fs.writeFileSync(saveFile, JSON.stringify(configs, null, 2));
}