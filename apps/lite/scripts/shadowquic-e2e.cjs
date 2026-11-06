const {chromium, expect} = require('@playwright/test');
const {waitForDemo} = require('./demo.cjs');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({locale: 'en-US', viewport: {width: 1440, height: 1100}});
    await page.goto('http://127.0.0.1:5199');
    await waitForDemo(page);
    await page.getByRole('link', {name: 'Nodes', exact: true}).click();
    await page.getByRole('button', {name: 'Add node', exact: true}).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('tab', {name: 'Enter manually', exact: true}).click();
    await dialog.getByRole('button', {name: /^Protocol/}).click();
    await page.getByRole('option', {name: 'ShadowQUIC', exact: true}).click();
    await dialog.getByLabel('Name', {exact: true}).fill('sq-test');
    await dialog.getByLabel('Server address', {exact: true}).fill('proxy.example');
    await dialog.getByLabel('Username', {exact: true}).fill('user@name');
    await dialog.getByLabel('Password', {exact: true}).fill('p:word');
    await expect(dialog.getByRole('button', {name: 'Add', exact: true})).toBeDisabled();
    await dialog.getByLabel('SNI', {exact: true}).fill('cover.example');
    await dialog.getByLabel('Advanced options', {exact: true}).click();
    await expect(dialog.getByLabel('UUID', {exact: true})).toHaveCount(0);
    await dialog.getByRole('button', {name: /^zero-rtt/}).click();
    await page.getByRole('option', {name: 'false', exact: true}).click();
    await expect(dialog.getByRole('button', {name: /^zero-rtt/})).toContainText('false');
    await expect(dialog.getByRole('button', {name: 'Add', exact: true})).toBeEnabled();
    fs.mkdirSync('test-results', {recursive: true});
    await page.screenshot({path: 'test-results/shadowquic-lite.png'});
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
