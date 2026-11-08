import { chromium } from 'playwright'

async function run() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  console.log('Navigating to login...')
  await page.goto('https://multiblast.bangoyan.web.id/login', { waitUntil: 'networkidle' })
  await page.fill('#email', 'admin@multiblast.app')
  await page.fill('#password', 'admin123456')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(3000)

  // 1. Visit Accounts Page
  console.log('Navigating to accounts...')
  await page.goto('https://multiblast.bangoyan.web.id/accounts', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  await page.screenshot({ path: 'output/playwright/09-accounts-social.png' })

  // 2. Click 1-Click Connect on Instagram if not yet connected
  const connectButtons = await page.$$('button:has-text("1-Click Connect")')
  if (connectButtons.length > 0) {
    console.log('Clicking 1-Click Connect for first channel...')
    await connectButtons[0].click()
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'output/playwright/09b-accounts-connected.png' })
  }

  // 3. Visit Posts Page
  console.log('Navigating to posts...')
  await page.goto('https://multiblast.bangoyan.web.id/posts', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  await page.screenshot({ path: 'output/playwright/10-posts-social.png' })

  // 4. Visit Dashboard Page
  console.log('Navigating to dashboard...')
  await page.goto('https://multiblast.bangoyan.web.id/dashboard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: 'output/playwright/11-dashboard-social.png' })

  await browser.close()
  console.log('Social verification completed successfully!')
}

run().catch(err => {
  console.error('Verification failed:', err)
  process.exit(1)
})
