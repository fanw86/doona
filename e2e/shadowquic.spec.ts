import {expect, loadCatalogues, test} from './fixtures';

test.beforeAll(loadCatalogues);
test('ShadowQUIC manual form keeps JLS fields separate from TLS', async ({page}) => {
  await page.goto('/#/nodes?provider=inline');
  await page.getByRole('button', {name: 'Add node', exact: true}).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('tab', {name: 'Manual', exact: true}).click();
  await dialog.getByRole('button', {name: / Protocol$/}).click();
  await page.getByRole('option', {name: 'ShadowQUIC', exact: true}).click();
  await dialog.getByRole('textbox', {name: 'Name', exact: true}).fill('sq-test');
  await dialog.getByRole('textbox', {name: 'Server address', exact: true}).fill('proxy.example');
  await dialog.getByRole('textbox', {name: 'Username', exact: true}).fill('user@name');
  await dialog.getByRole('textbox', {name: 'Password', exact: true}).fill('p:word');
  await expect(dialog.getByRole('button', {name: 'Add', exact: true})).toBeDisabled();
  await dialog.getByRole('textbox', {name: 'SNI', exact: true}).fill('cover.example');
  await expect(dialog.locator('.rp-node-link')).toContainText('shadowquic://user%40name:p%3Aword@proxy.example:443?sni=cover.example');
  await expect(dialog.getByLabel('UUID', {exact: true})).toHaveCount(0);
  await dialog.getByRole('button', {name: 'Advanced', exact: true}).click();
  await expect(dialog.getByLabel('Skip TLS certificate verification', {exact: true})).toHaveCount(0);
  await dialog.getByRole('button', {name: / zero-rtt$/}).click();
  await page.getByRole('option', {name: 'false', exact: true}).click();
  await expect(dialog.locator('.rp-node-link')).toContainText('zero-rtt=false');
  await page.screenshot({path: 'test-results/shadowquic-full.png'});
});
