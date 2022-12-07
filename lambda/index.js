import getConfig from "./getConfig.js";

const rules = getConfig();

export const handler = (event, context, callback) => {
  const cfRequest = event.Records[0].cf.request;
  const headers = cfRequest.headers;

  const host = headers['host'][0].value;
  const url = `${host}${cfRequest.uri}`;
  const request = { url, method: cfRequest.method };

  const rule = rules.find(rule => rule.matches(request));

  if (rule)
    callback(null, {
      status: rule.status,
      headers: {
        location: [
          {
            key: "Location",
            value: rule.responseLocation(request)
          }
        ]
      }
    });
  else
    callback(null, request);
};
