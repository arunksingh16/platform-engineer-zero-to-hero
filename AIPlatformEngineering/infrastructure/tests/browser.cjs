/* Optional browser check: requires Playwright externally, not a site dependency. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '../../..');
const prefix = '/handbook/'; // Exercise GitHub Pages project-subpath links.
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
  const base = `http://127.0.0.1:${server.address().port}${prefix}`;
  const course = base + 'AIPlatformEngineering/infrastructure/';
  const browser = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {});
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(course + 'index.html');
    const lessons = await page.locator('#lessons a').evaluateAll(links => links.map(a => a.href));
    assert.equal(lessons.length, 10);
    for (const url of [...lessons, base + 'index.html', base + 'AIPlatformEngineering/index.html']) {
      await page.goto(url);
      assert.equal(await page.locator('h1').count(), 1);
      // Verify local links/assets and fragment destinations from the actual DOM.
      const links = await page.locator('[href], [src]').evaluateAll(nodes => nodes.map(n => n.href || n.src).filter(Boolean));
      for (const link of new Set(links.filter(link => link.startsWith(base)))) {
        const response = await context.request.get(link.split('#')[0]);
        assert.equal(response.status(), 200, link);
        const hash = new URL(link).hash;
        if (hash) {
          const id = decodeURIComponent(hash.slice(1));
          const liveTarget = link.split('#')[0] === page.url().split('#')[0] && await page.evaluate(id => !!document.getElementById(id), id);
          assert.ok(liveTarget || (await response.text()).includes(`id="${id}"`), link);
        }
      }
      if (lessons.includes(url)) {
        assert.ok(await page.locator('#quiz .q').count() >= 3);
        const questions = await page.locator('#quiz-data').evaluate(n => JSON.parse(n.textContent));
        for (let i = 0; i < questions.length; i++) await page.locator('#quiz .q').nth(i).locator('button').nth(questions[i].answer).click();
        assert.match(await page.locator('.score').textContent(), /Lesson complete/);
      }
      await page.setViewportSize({ width: 390, height: 844 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Mobile overflow: ${url}`);
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    await page.goto(course + 'index.html');
    assert.match(await page.locator('.course-summary').textContent(), /10 \/ 10/);
    await page.goto(course + '03-memory.html');
    assert.match(await page.locator('output').textContent(), /22.04/);
    await page.locator('[name=tokens]').fill('8192');
    assert.match(await page.locator('output').textContent(), /Does not fit/);
    await page.locator('[name=devices]').fill('0');
    assert.match(await page.locator('output').textContent(), /Enter values/);
    await page.locator('[name=devices]').fill('1');
    await page.locator('[name=mode]').selectOption('training');
    assert.match(await page.locator('output').textContent(), /109.31/);
    await page.goto(course + '06-storage.html');
    await page.locator('[name=storage]').fill('8');
    assert.match(await page.locator('output').textContent(), /Bottleneck: network/);
    await page.goto(course + '07-inference.html');
    await page.locator('[name=failed]').fill('2');
    assert.match(await page.locator('output').textContent(), /240 requests/);
    await page.goto(course + '08-operations.html');
    await page.locator('[data-scheduler] select').selectOption('packed');
    assert.match(await page.locator('output').textContent(), /can fit/);
    await page.goto(course + '09-capacity.html');
    assert.match(await page.locator('output').first().textContent(), /4,305.57/);
    await page.locator('[data-calculator=inference] [name=demand]').fill('24');
    assert.match(await page.locator('output').last().textContent(), /18 GPUs; \$54/);
    await page.goto(course + '02-accelerators.html');
    await page.locator('[data-accelerators] select').selectOption('yes');
    assert.match(await page.locator('output').textContent(), /1 hypothetical/);
    await page.goto(course + '01-workloads.html');
    const story = page.locator('[data-story]').first();
    await story.getByRole('button', { name: 'Step', exact: true }).click();
    assert.match(await story.locator('[role=status]').textContent(), /Step 2/);
    await story.getByRole('button', { name: 'Reset', exact: true }).click();
    await story.getByRole('button', { name: 'Play', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[data-story] [role=status]').textContent.startsWith('Step 2'));
    await story.getByRole('button', { name: 'Pause', exact: true }).click();
    assert.equal(await story.getByRole('button', { name: 'Pause', exact: true }).isDisabled(), true);
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
    await story.getByRole('button', { name: 'Reset', exact: true }).click();
    await story.getByRole('button', { name: 'Play', exact: true }).click();
    assert.match(await story.locator('[role=status]').textContent(), /Step 2/);
    assert.equal(await story.getByRole('button', { name: 'Pause', exact: true }).isDisabled(), true);
    assert.deepEqual(errors, []);
    if (process.env.SCREENSHOT_DIR) {
      await page.goto(course + '03-memory.html');
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, 'ai-memory-mobile-dark.png'), fullPage: true });
      await page.goto(course + '05-topology.html');
      await page.emulateMedia({ colorScheme: 'light' });
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, 'ai-topology-desktop.png'), fullPage: true });
    }
    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const staticPage = await noJS.newPage();
    await staticPage.goto(course + 'index.html');
    assert.equal(await staticPage.locator('noscript a').count(), 10);
    await staticPage.goto(course + '03-memory.html');
    assert.match(await staticPage.locator('main').textContent(), /22.04 GiB/);
    console.log('PASS: 10 lessons, quizzes/progress, project-subpath links, mobile layout, calculators, animation controls, reduced motion and no-JS reading.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
