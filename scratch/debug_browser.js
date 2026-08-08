import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));

    await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
    console.log('Navigated to page');

    await page.click('#btn-menu-sandbox');
    await new Promise(r => setTimeout(r, 500));

    const createCards = await page.$$('.ts-team-card');
    if (createCards.length > 0) {
      await createCards[0].click();
      await new Promise(r => setTimeout(r, 500));
    }

    const startBtn = await page.$('#btn-sb-start-editor');
    if (startBtn) {
      await startBtn.click();
      await new Promise(r => setTimeout(r, 1000));
    }

    const res = await page.evaluate(() => {
      const editor = document.getElementById('screen-sandbox-editor');
      const nodesLayer = document.getElementById('sb-nodes-layer');
      return {
        editorVisible: editor ? getComputedStyle(editor).display : 'none',
        editorZIndex: editor ? getComputedStyle(editor).zIndex : 'none',
        editorChildrenCount: editor ? editor.children.length : 0,
        nodesCount: nodesLayer ? nodesLayer.children.length : 0,
        htmlSnippet: editor ? editor.innerHTML.substring(0, 300) : ''
      };
    });

    console.log('RESULT:', JSON.stringify(res, null, 2));

    await browser.close();
  } catch (err) {
    console.error('PUPPETEER EXCEPTION:', err);
  }
})();
