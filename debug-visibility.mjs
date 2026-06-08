import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  const visibility = await page.evaluate(() => {
    const nav = document.querySelector('nav');
    const midLinks = nav.querySelector('.md\\:gap-8');
    const rightLinks = nav.querySelector('.md\\:gap-4');
    const mobileMenu = nav.querySelector('.md\\:hidden');
    
    return {
      navWidth: nav.offsetWidth,
      midLinksVisible: midLinks ? getComputedStyle(midLinks).display : 'null',
      rightLinksVisible: rightLinks ? getComputedStyle(rightLinks).display : 'null',
      mobileMenuVisible: mobileMenu ? getComputedStyle(mobileMenu).display : 'null'
    };
  });
  
  console.log(visibility);
  await browser.close();
})();
