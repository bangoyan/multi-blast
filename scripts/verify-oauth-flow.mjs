import { chromium } from 'playwright'

async function run() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
  const page = await context.newPage()

  console.log('Logging in...')
  await page.goto('https://multiblast.bangoyan.web.id/login', { waitUntil: 'networkidle' })
  await page.fill('#email', 'admin@multiblast.app')
  await page.fill('#password', 'admin123456')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(3000)

  // 1. Visit Settings page and capture OAuth portals section
  console.log('Navigating to settings...')
  await page.goto('https://multiblast.bangoyan.web.id/settings', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  await page.screenshot({ path: 'output/playwright/13-settings-oauth.png', fullPage: true })

  // 2. Visit Accounts page
  console.log('Navigating to accounts...')
  await page.goto('https://multiblast.bangoyan.web.id/accounts', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  // 3. Click "Connect via OAuth" on YouTube
  console.log('Clicking Connect via OAuth...')
  const oauthLink = await page.$('a[href="/api/oauth/youtube"]')
  if (oauthLink) {
    await oauthLink.click()
    await page.waitForTimeout(2000)
    console.log('URL after OAuth trigger:', page.url())
    await page.screenshot({ path: 'output/playwright/14-accounts-oauth-flow.png', fullPage: false })
  }

  await browser.close()
  console.log('OAuth verification complete!')
}

run().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
