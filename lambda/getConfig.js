import fs from "fs";
import path from "path";

import Rule from "./rule.js";

const getConfig = () => {
  const configUrl = new URL("rules.json", import.meta.url);
  const configJSON = fs.readFileSync(configUrl, { encoding: "utf-8" });
  const config = JSON.parse(configJSON);

  return config.map(rule => new Rule(rule));
};

export default getConfig;
