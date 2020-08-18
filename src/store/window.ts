const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`, {
  url: 'https://localhost/',
  referrer: 'https://localhost',
  contentType: 'text/html',
  includeNodeLocations: true,
  storageQuota: 5000000,
});
export default window;
