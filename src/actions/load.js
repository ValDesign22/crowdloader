const os = require("os");
const fs = require("fs");
const path = require("path");

module.exports = function load(dir) {
  const saveFile = path.join(os.tmpdir(), "crowdloader", "configs.json");
  if (!fs.existsSync(saveFile)) return null;
  const configs = JSON.parse(fs.readFileSync(saveFile));
  const config = configs.find(c => c.dir === dir);
  if (!config) return null;
  return config;
}