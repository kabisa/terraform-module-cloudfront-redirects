import { getConfig } from "./config.js";

const rules = getConfig();

export const handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  const host = headers['host'][0].value;
  const uri = `${host}${request.uri}`;
  const normalizedRequest = { uri, method: request.method };

  const rule = rules.find(rule => rule.matches(normalizedRequest));

  if (rule)
    callback(null, {
      status: rule.responseStatus,
      headers: {
        location: [
          {
            key: "Location",
            value: rule.targetFor(normalizedRequest)
          }
        ]
      }
    });
  else
    callback(null, request);
};
