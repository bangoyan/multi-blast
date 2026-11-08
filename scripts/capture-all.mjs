import { chromium } from 'playwright'

async function run() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  console.log('Logging in...')
  await page.goto('https://multiblast.bangoyan.web.id/login', { waitUntil: 'networkidle' })
  await page.fill('#email', 'admin@multiblast.app')
  await page.fill('#password', 'admin123456')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(3000)

  const pages = [
    { url: 'https://multiblast.bangoyan.web.id/posts', name: '04-posts.png' },
    { url: 'https://multiblast.bangoyan.web.id/auto-reply', name: '05-auto-reply.png' },
    { url: 'https://multiblast.bangoyan.web.id/auto-dm', name: '06-auto-dm.png' },
    { url: 'https://multiblast.bangoyan.web.id/schedule', name: '07-schedule.png' },
    { url: 'https://multiblast.bangoyan.web.id/settings', name: '08-settings.png' },
  ]

  for (const item of pages) {
    console.log(`Navigating to ${item.url}...`)
    await page.goto(item.url, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    await page.screenshot({ path: `output/playwright/${item.name}`, fullPage: false })
  }

  await browser.close()
  console.log('All screenshots captured successfully!')
}

run().catch(err => {
  console.error('Failed:', err)
  process.exit(1)
})
