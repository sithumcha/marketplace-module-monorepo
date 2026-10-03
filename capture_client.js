const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

(async () => {
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1440,900']
  });

  const screenshotsDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Home / Explore Tab
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(screenshotsDir, 'client_web_home.png') });
  console.log('Saved client_web_home.png');

  // 2. Business Directory Tab
  let navButtons = await page.$$('nav button, button');
  for (const btn of navButtons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text && (text.includes('Directory') || text.includes('Business'))) {
      await btn.click();
      console.log('Clicked Directory');
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(screenshotsDir, 'client_web_directory.png') });
  console.log('Saved client_web_directory.png');

  // 3. Orders Tab
  navButtons = await page.$$('nav button, button');
  for (const btn of navButtons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text && text.includes('Orders')) {
      await btn.click();
      console.log('Clicked Orders');
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(screenshotsDir, 'client_web_orders.png') });
  console.log('Saved client_web_orders.png');

  // 4. Profile Tab
  navButtons = await page.$$('nav button, button');
  for (const btn of navButtons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text && (text.includes('Profile') || text.includes('Account') || text.includes('User'))) {
      await btn.click();
      console.log('Clicked Profile');
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(screenshotsDir, 'client_web_profile.png') });
  console.log('Saved client_web_profile.png');

  // Go back to explore to open cart drawer
  navButtons = await page.$$('nav button, button');
  for (const btn of navButtons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text && (text.includes('Explore') || text.includes('Store') || text.includes('Marketplace'))) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));

  // 5. Open Cart Drawer by clicking cart button in Navbar
  const allBtns = await page.$$('button');
  for (const btn of allBtns) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text && (text.includes('Cart') || text.includes('🛒'))) {
      await btn.click();
      console.log('Clicked Cart');
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(screenshotsDir, 'client_web_cart.png') });
  console.log('Saved client_web_cart.png');

  await browser.close();
  console.log('All client web screenshots captured successfully!');
})();
