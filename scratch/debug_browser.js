import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err));

    await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
    console.log('Navigated to http://localhost:8080');

    // Click SANDBOX MODE button
    await page.click('#btn-menu-sandbox');
    await new Promise(r => setTimeout(r, 500));

    // Click CREATE NEW EVENT card
    const cards = await page.$$('.ts-team-card');
    if (cards.length > 0) {
      await cards[0].click();
      await new Promise(r => setTimeout(r, 500));
    }

    // Click OPEN BRACKET EDITOR button
    const startBtn = await page.$('#btn-sb-start-editor');
    if (startBtn) {
      await startBtn.click();
      await new Promise(r => setTimeout(r, 1000));
    }

    const html = await page.evaluate(() => {
      const editor = document.getElementById('screen-sandbox-editor');
      return {
        editorClass: editor ? editor.className : 'null',
        editorInnerHTML: editor ? editor.innerHTML : 'null',
        viewport: document.querySelector('.sandbox-viewport') ? true : false
      };
    });

    console.log('EVALUATION RESULT:', JSON.stringify(html, null, 2));

    await browser.close();
  } catch (err) {
    console.error('Puppeteer test failed:', err);
  }
})();
