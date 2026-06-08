import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  const navHTML = await page.evaluate(() => {
    const nav = document.querySelector('nav');
    return nav ? nav.outerHTML : 'No nav found';
  });
  
  console.log(navHTML);
  await browser.close();
})();
