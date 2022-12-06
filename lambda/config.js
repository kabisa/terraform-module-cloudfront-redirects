import fs from "fs";
import path from "path";

import Rule from "./rule.js";

const isNonEmptyLine = line =>
  !line.match(/^\s*$/);

const parseLine = line => {
  const segments = line.trim().split(/\s+/);

  if (segments.count === 3)
    throw new Error(`error parsing line: ${line}`);

  const [
    requestMethod,
    requestUriRegExp,
    responseStatus,
    responseUri
  ] = segments;

  let requestUriRegExp;

  try {
    requestUriExp = new RegExp(`^${requestPathRegExpRaw}$`);
  } catch {
    throw new Error(`error parsing line: ${line}`);
  }

  return new Rule(requestMethod, requestUriRegExp, responseUri, responseStatus);
};

const parseRules = config =>
  config
    .split("\n")
    .filter(isNonEmptyLine)
    .map(parseLine);

export const getConfig = () => {
  const configUrl = new URL("config", import.meta.url);
  const config = fs.readFileSync(configUrl, { encoding: "utf-8" });

  return parseRules(config);
};
