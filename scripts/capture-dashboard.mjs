import { chromium } from 'playwright'

async function run() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  page.on('console', msg => console.log('PAGE LOG:', msg.text()))
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message))

  console.log('Navigating to login...')
  await page.goto('https://multiblast.bangoyan.web.id/login', { waitUntil: 'networkidle' })

  console.log('Filling login form...')
  await page.fill('#email', 'admin@multiblast.app')
  await page.fill('#password', 'admin123456')
  await page.click('button[type="submit"]')

  console.log('Clicked submit, waiting 4s...')
  await page.waitForTimeout(4000)

  console.log('Current URL:', page.url())
  await page.screenshot({ path: 'output/playwright/02-after-submit.png' })

  if (page.url().includes('dashboard')) {
    console.log('Successfully reached dashboard!')
    await page.screenshot({ path: 'output/playwright/03-dashboard.png', fullPage: false })
  }

  await browser.close()
}

run().catch(err => {
  console.error('Capture failed:', err)
  process.exit(1)
})
