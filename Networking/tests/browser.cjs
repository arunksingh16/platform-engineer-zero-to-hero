/* Optional: NODE_PATH=/external/node_modules node Networking/tests/browser.cjs */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '../..');
const prefix = '/handbook/';
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, pathname.slice(prefix.length));
  if (!pathname.startsWith(prefix) || !file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end(); return;
  }
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
  res.setHeader('Content-Type', mime[path.extname(file)] || 'text/plain');
  res.end(fs.readFileSync(file));
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {});
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const base = `http://127.0.0.1:${server.address().port}${prefix}`;
    const course = base + 'Networking/';
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(course + 'index.html');
    const lessons = await page.locator('#lessons a').evaluateAll(links => links.map(a => a.href));
    assert.equal(lessons.length, 12);
    let questionCount = 0;
    for (const url of lessons) {
      await page.goto(url);
      const ids = await page.locator('[id]').evaluateAll(nodes => nodes.map(n => n.id));
      assert.equal(new Set(ids).size, ids.length, 'duplicate IDs: ' + url);
      const links = await page.locator('[href], [src]').evaluateAll(nodes => nodes.map(n => n.href || n.src).filter(Boolean));
      for (const link of new Set(links.filter(link => link.startsWith(base)))) {
        assert.equal((await context.request.get(link.split('#')[0])).status(), 200, link);
      }
      assert.ok(await page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0 && img.alt.length > 0)));
      const lab = page.locator('[data-walkthrough]');
      assert.equal(await lab.count(), 1);
      assert.match(await lab.locator('[role=status]').textContent(), /Step 1 \/ 4/);
      for (let step = 2; step <= 4; step++) {
        await lab.getByRole('button', { name: 'Next step', exact: true }).click();
        assert.match(await lab.locator('[role=status]').textContent(), new RegExp('Step ' + step));
      }
      assert.ok(await lab.getByRole('button', { name: 'Next step', exact: true }).isDisabled());
      await lab.getByRole('button', { name: 'Reset', exact: true }).click();
      const questions = await page.locator('#quiz-data').evaluate(n => JSON.parse(n.textContent));
      questionCount += questions.length;
      for (let i = 0; i < questions.length; i++) {
        await page.locator('#quiz .q').nth(i).locator('button').nth(questions[i].answer).click();
      }
      assert.match(await page.locator('.score').textContent(), /Lesson complete/);
      await page.setViewportSize({ width: 390, height: 844 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'mobile overflow: ' + url);
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    assert.equal(questionCount, 42);
    await page.goto(course + 'index.html');
    assert.match(await page.locator('.course-summary').textContent(), /12 \/ 12/);
    await page.goto(lessons[1]);
    for (const [value, total, usable] of [[24, 256, 251], [25, 128, 123], [26, 64, 59], [27, 32, 27], [28, 16, 11]]) {
      await page.locator('#net-prefix').fill(String(value));
      const result = await page.locator('#net-subnet-result').textContent();
      assert.ok(result.includes(total + ' addresses'));
      assert.ok(result.includes(usable + ' assignable'));
      assert.ok(result.includes(usable >= 61 ? 'Fits this' : 'Does not fit'));
    }
    await page.goto(lessons[2]);
    for (const [time, expected] of [[0, 'region A'], [10, '50s TTL remaining'], [59, '1s TTL remaining'], [60, 'next lookup can fetch B'], [90, 'next lookup can fetch B']]) {
      await page.locator('#net-dns-time').fill(String(time));
      assert.ok((await page.locator('#net-dns-result').textContent()).includes(expected));
    }
    await page.goto(lessons[10]);
    assert.match(await page.locator('#net-mtu-result').textContent(), /packet dropped and ICMP blocked/);
    await page.locator('#net-icmp').check();
    assert.match(await page.locator('#net-mtu-result').textContent(), /can reduce packet size/);
    await page.locator('#net-packet-size').fill('1400');
    assert.match(await page.locator('#net-mtu-result').textContent(), /Fits/);
    await page.locator('#net-packet-size').fill('1420');
    assert.match(await page.locator('#net-mtu-result').textContent(), /Too large/);
    await page.goto(lessons[0]);
    const lab = page.locator('[data-walkthrough]');
    await lab.getByRole('button', { name: 'Next step', exact: true }).focus();
    await page.keyboard.press('Enter');
    assert.match(await lab.locator('[role=status]').textContent(), /Step 2/);
    await lab.getByRole('button', { name: 'Play walkthrough', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.net-status').textContent.startsWith('Step 3'));
    await lab.getByRole('button', { name: 'Pause walkthrough', exact: true }).click();
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
    await page.waitForFunction(() => document.querySelector('.net-controls button:nth-child(3)').hidden);
    await lab.getByRole('button', { name: 'Reset', exact: true }).click();
    await lab.getByRole('button', { name: 'Next step', exact: true }).click();
    assert.match(await lab.locator('[role=status]').textContent(), /Step 2/);
    assert.equal(await lab.locator('.is-current').evaluate(node => getComputedStyle(node).animationName), 'none');
    if (process.env.SCREENSHOT_DIR) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, 'networking-mobile.png'), fullPage: true });
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.emulateMedia({ colorScheme: 'light' });
      await page.locator('.net-figure').screenshot({ path: path.join(process.env.SCREENSHOT_DIR, 'networking-packet.png') });
    }
    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const staticPage = await noJS.newPage();
    for (const url of lessons) {
      await staticPage.goto(url);
      assert.equal(await staticPage.locator('.net-flow > li').count(), 4);
      assert.equal(await staticPage.locator('.net-controls').count(), 0);
      assert.ok(await staticPage.locator('.net-flow').isVisible());
    }
    assert.deepEqual(errors, []);
    console.log('Passed: 12 lessons, 42 quiz answers, local links/assets, walkthroughs, calculators, keyboard, mobile, reduced motion, no-JS and persisted progress.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
