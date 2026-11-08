import { chromium } from 'playwright'

async function run() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1300 } })
  await page.goto('https://multiblast.bangoyan.web.id/login', { waitUntil: 'networkidle' })
  await page.fill('#email', 'admin@multiblast.app')
  await page.fill('#password', 'admin123456')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(3000)
  await page.goto('https://multiblast.bangoyan.web.id/dashboard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  await page.screenshot({ path: 'output/playwright/12-dashboard-full.png', fullPage: true })
  await browser.close()
  console.log('Done full screenshot!')
}

run()
