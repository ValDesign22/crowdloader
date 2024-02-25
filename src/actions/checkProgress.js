module.exports = async function checkProgress(projectId, apikey, languageId) {
  const url = `https://api.crowdin.com/api/v2/projects/${projectId}/languages/${languageId}/progress`;
  const headers = { "Authorization": `Bearer ${apikey}` };
  return (await (await fetch(url, { headers })).json()).data;
}