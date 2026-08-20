const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // 1. MOBILE APP SCREENSHOTS
    console.log('Capturing Mobile Web App screenshots with rich item data...');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({
      width: 412,
      height: 890,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });

    // Populate localStorage with Cart Items so Cart Screen & Home have rich data
    await mobilePage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    await mobilePage.evaluate(() => {
      const item1 = JSON.stringify({
        id: 'item_dell_xps',
        title: 'Dell XPS 15 Laptop 2026 Edition',
        price: 1299.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600',
        category: 'Electronics'
      });
      const item2 = JSON.stringify({
        id: 'item_sony_headphones',
        title: 'Sony WH-1000XM5 Wireless Headphones',
        price: 349.99,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
        category: 'Electronics'
      });
      const item3 = JSON.stringify({
        id: 'item_nike_shoes',
        title: 'Nike Air Max 270 Sneakers',
        price: 135.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
        category: 'Fashion'
      });
      localStorage.setItem('flutter.user_cart_items', JSON.stringify([item1, item2, item3]));
    });

    // Reload Mobile App to apply localStorage cart items and fetch MongoDB listings
    await mobilePage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Waiting 5 seconds for Flutter Home Feed & MongoDB items to render...');
    await new Promise(r => setTimeout(r, 5000));

    // Mobile Home Screenshot
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_home.png') });
    console.log('Saved screenshots/mobile_home.png (with items)');

    // Open Cart Screen (Click cart icon top right: x=370, y=40)
    await mobilePage.mouse.click(370, 40);
    await new Promise(r => setTimeout(r, 3000));
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_cart.png') });
    console.log('Saved screenshots/mobile_cart.png (with 3 cart items & subtotal)');

    // Go back to Home
    await mobilePage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    // Click "Sell Item" FAB (x=320, y=770) to open Create Listing Wizard
    await mobilePage.mouse.click(320, 770);
    await new Promise(r => setTimeout(r, 2000));

    // Click Next Step (Step 1 -> Step 2 Photos)
    await mobilePage.mouse.click(320, 850);
    await new Promise(r => setTimeout(r, 1000));

    // Click Next Step (Step 2 -> Step 3 Details)
    await mobilePage.mouse.click(320, 850);
    await new Promise(r => setTimeout(r, 1000));

    // Click Next Step (Step 3 -> Step 4 Preferences)
    await mobilePage.mouse.click(320, 850);
    await new Promise(r => setTimeout(r, 1000));

    // Click Next Step (Step 4 -> Step 5 Live Item Card Preview)
    await mobilePage.mouse.click(320, 850);
    await new Promise(r => setTimeout(r, 2000));

    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_create_listing.png') });
    console.log('Saved screenshots/mobile_create_listing.png (with item preview step)');

    // Click Profile Tab (4th tab at bottom: x=360, y=850)
    await mobilePage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    await mobilePage.mouse.click(360, 850);
    await new Promise(r => setTimeout(r, 2000));
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_profile.png') });
    console.log('Saved screenshots/mobile_profile.png');

    await mobilePage.close();

    // 2. ADMIN PANEL SCREENSHOTS (DESKTOP)
    console.log('Capturing Admin Panel Web screenshots...');
    const adminPage = await browser.newPage();
    await adminPage.setViewport({
      width: 1440,
      height: 900,
      deviceScaleFactor: 2
    });

    await adminPage.goto('http://localhost:3001', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    const getButtons = async () => await adminPage.$$('button');
    let buttons = await getButtons();

    // Dashboard
    for (const btn of buttons) {
      const text = await adminPage.evaluate(el => el.textContent, btn);
      if (text && text.includes('Dashboard')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1500));
    await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_dashboard.png') });
    await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop_web_app.png') });
    console.log('Saved screenshots/admin_dashboard.png & desktop_web_app.png');

    // Customer Orders tab
    buttons = await getButtons();
    for (const btn of buttons) {
      const text = await adminPage.evaluate(el => el.textContent, btn);
      if (text && text.includes('Customer Orders')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1500));
    await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_orders.png') });
    console.log('Saved screenshots/admin_orders.png');

    // Store Inventory tab
    buttons = await getButtons();
    for (const btn of buttons) {
      const text = await adminPage.evaluate(el => el.textContent, btn);
      if (text && text.includes('Store Inventory')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1500));
    await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_inventory.png') });
    console.log('Saved screenshots/admin_inventory.png');

    // Listing Moderation tab
    buttons = await getButtons();
    for (const btn of buttons) {
      const text = await adminPage.evaluate(el => el.textContent, btn);
      if (text && text.includes('Listing Moderation')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1500));
    await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_moderation.png') });
    console.log('Saved screenshots/admin_moderation.png');

    // Business Verification tab
    buttons = await getButtons();
    for (const btn of buttons) {
      const text = await adminPage.evaluate(el => el.textContent, btn);
      if (text && text.includes('Business Verification')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1500));
    await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_verification.png') });
    console.log('Saved screenshots/admin_verification.png');

    await adminPage.close();
    console.log('🎉 All updated screenshots with items captured successfully!');
  } catch (err) {
    console.error('Error taking screenshots:', err);
  } finally {
    await browser.close();
  }
}

run();
