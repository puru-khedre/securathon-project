const testString =
  "Visit https://www.example.com or http://test.example.org for more information.";

function findDomains(inputText) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = inputText.match(urlRegex);
  const domainRegex = /(?:https?:\/\/)?(?:www\.)?([^:/\n]+)/;
  const domains = urls ? urls.map((url) => url.match(domainRegex)[1]) : [];
  return domains;
}

function findURLs(inputText) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const urls = inputText.match(urlRegex);
  return urls != null ? urls : [];
}

module.exports = { findDomains, findURLs };
