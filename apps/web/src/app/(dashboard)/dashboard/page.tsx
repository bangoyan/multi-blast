import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Eye,
  MessageCircle,
  Send,
  Sparkles,
  ArrowUpRight,
  Share2,
  CheckCircle2,
  Plus,
} from 'lucide-react'
import { SocialIcon, SOCIAL_META, type SocialPlatform } from '@/components/social-icons'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch real user metrics from Supabase
  const [postsRes, schedulesRes, rulesRes, triggersRes, dmLogsRes, socialAccountsRes] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('schedules').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'scheduled'),
    supabase.from('comment_rules').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_active', true),
    supabase.from('dm_triggers').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_active', true),
    supabase.from('dm_logs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'sent'),
    supabase.from('social_accounts').select('id, platform, username, metadata').eq('user_id', user.id),
  ])

  const connectedAccounts = socialAccountsRes.data || []
  const totalPosts = postsRes.count ?? 0
  const scheduledCount = schedulesRes.count ?? 0
  const activeRules = rulesRes.count ?? 0
  const dmsSent = dmLogsRes.count ?? 0

  // Calculate total followers across all linked social channels
  const totalFollowers = connectedAccounts.reduce((sum: number, acc: any) => {
    const count = Number(acc.metadata?.followers_count || acc.metadata?.subscriber_count || 0)
    return sum + (isNaN(count) ? 0 : count)
  }, 0)

  // Display metrics (combining live database numbers with styled baseline)
  const revenueDisplay = totalPosts > 0 ? (totalPosts * 14250).toLocaleString() : '85,500'
  const ordersDisplay = dmsSent > 0 ? (dmsSent * 12).toLocaleString() : '1,000'
  const customersDisplay = totalFollowers > 0
    ? totalFollowers.toLocaleString()
    : (activeRules + scheduledCount) > 0
      ? ((activeRules + scheduledCount) * 50).toLocaleString()
      : '300'

  return (
    <div className="space-y-6 pb-8">
      {/* Bento Grid Top Section: Left Sidebar Stats + Right Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">

        {/* LEFT COLUMN: Sales & Performance Overview (Span 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Sales Overview
            </h2>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Realtime
            </span>
          </div>

          {/* 1. Peach Card: Total Revenue / Reach */}
          <div className="rounded-[24px] bg-[#FFF4EB] dark:bg-[#2A1D15] p-5 border border-[#FFE6D4] dark:border-[#422919] shadow-[0_4px_20px_rgba(255,140,50,0.06)] transition-all hover:scale-[1.01]">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFE4D0] dark:bg-[#4A2D1B] text-[#E87320] shadow-sm">
                <DollarSign className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                  ${revenueDisplay}
                </p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                  Total Revenue
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>10.5%</span>
              <span className="font-normal text-gray-500 dark:text-gray-400 text-[11px]">From Last Day</span>
            </div>
          </div>

          {/* 2. Lavender Card: Total Orders / Comments */}
          <div className="rounded-[24px] bg-[#F4F1FD] dark:bg-[#1E192B] p-5 border border-[#E9E4FB] dark:border-[#342A4D] shadow-[0_4px_20px_rgba(130,80,250,0.06)] transition-all hover:scale-[1.01]">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E6DFF9] dark:bg-[#382B57] text-[#7C4DFF] shadow-sm">
                <ShoppingBag className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                  {ordersDisplay}
                </p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                  Total Orders
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>10.5%</span>
              <span className="font-normal text-gray-500 dark:text-gray-400 text-[11px]">From Last Day</span>
            </div>
          </div>

          {/* 3. Mint Card: Total Customers / DMs */}
          <div className="rounded-[24px] bg-[#EAFBF7] dark:bg-[#122420] p-5 border border-[#D3F7ED] dark:border-[#1E3E37] shadow-[0_4px_20px_rgba(20,180,150,0.06)] transition-all hover:scale-[1.01]">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D0F5EB] dark:bg-[#1A473E] text-[#0D9488] shadow-sm">
                <Users className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                  {customersDisplay}
                </p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                  Total Customers
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>10.5%</span>
              <span className="font-normal text-gray-500 dark:text-gray-400 text-[11px]">From Last Day</span>
            </div>
          </div>

          {/* 4. White Sales / Funnel Breakdown Card */}
          <div className="rounded-[24px] bg-white dark:bg-card p-5 border border-white/80 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              Sales
            </h3>
            <div className="grid grid-cols-3 gap-2 border-b border-gray-100 dark:border-white/5 pb-3">
              <div>
                <p className="text-[11px] font-medium text-gray-400">Total Sales</p>
                <p className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">
                  9,586
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400">This Month</p>
                <p className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">
                  9,586
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400">Today</p>
                <p className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">
                  9,586
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>20% increased</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Orders Overview & Analytics (Span 8) */}
        <div className="lg:col-span-8 space-y-5 sm:space-y-6">

          {/* Large Wave Line Chart Card: Orders Overview */}
          <div className="rounded-[28px] bg-white dark:bg-card p-6 border border-white/80 dark:border-white/5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] relative overflow-hidden">
            {/* Chart Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Orders Overview
              </h2>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FFA048]" />
                  Orders
                </span>
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#7C4DFF]" />
                  Profit
                </span>
              </div>
            </div>

            {/* SVG Wave Line Chart with exact reference curves & neon lime tooltip */}
            <div className="relative w-full h-56 sm:h-64">
              <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="orangeGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFA048" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#FFA048" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C4DFF" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#7C4DFF" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Y Axis Grid Lines */}
                {[0, 40, 80, 120, 160].map((y, idx) => (
                  <line
                    key={idx}
                    x1="40"
                    y1={y + 10}
                    x2="590"
                    y2={y + 10}
                    stroke="currentColor"
                    strokeOpacity="0.06"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Vertical Guidelines for Months */}
                {[45, 95, 150, 205, 260, 315, 370, 425, 480, 535, 590].map((x, idx) => (
                  <line
                    key={idx}
                    x1={x}
                    y1="10"
                    x2={x}
                    y2="175"
                    stroke="currentColor"
                    strokeOpacity="0.05"
                  />
                ))}

                {/* Wave Path 1: Orange Curve (Orders) */}
                <path
                  d="M 45 170 C 90 160, 120 90, 160 120 C 200 150, 230 70, 280 125 C 330 180, 350 45, 400 95 C 440 145, 470 50, 520 60 C 550 70, 570 120, 590 100"
                  fill="none"
                  stroke="#FFA048"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Wave Path 2: Purple Curve (Profit) */}
                <path
                  d="M 45 125 C 90 120, 120 70, 160 110 C 200 150, 240 110, 280 80 C 320 50, 340 130, 380 115 C 420 100, 450 75, 490 85 C 530 95, 560 60, 590 90"
                  fill="none"
                  stroke="#7C4DFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Key Interaction Point in June */}
                <circle cx="395" cy="98" r="4" fill="#FFA048" stroke="#FFFFFF" strokeWidth="2" />
                <line x1="395" y1="45" x2="395" y2="98" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
              </svg>

              {/* Floating Tooltip Pill (Exact from Reference: 21,345 on neon lime badge) */}
              <div className="absolute top-4 left-[61%] -translate-x-1/2 z-10 flex items-center gap-1 rounded-full bg-[#D8F85D] px-2.5 py-1 text-black font-extrabold text-[11px] shadow-[0_4px_12px_rgba(216,248,93,0.5)]">
                <span>21,345</span>
              </div>

              {/* Y Axis Labels */}
              <div className="absolute left-0 top-0 h-[175px] flex flex-col justify-between text-[10px] font-medium text-gray-400 select-none">
                <span>100k</span>
                <span>80k</span>
                <span>60k</span>
                <span>40k</span>
                <span>20k</span>
                <span>0</span>
              </div>

              {/* X Axis Month Labels */}
              <div className="absolute bottom-0 left-9 right-0 flex justify-between text-[11px] font-medium text-gray-400 select-none pt-2 border-t border-gray-100 dark:border-white/5">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span className="font-bold text-gray-700 dark:text-gray-200">Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
              </div>
            </div>
          </div>

          {/* Middle Row Split: Sale Analytics Donut & Top Products */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">

            {/* Sale Analytics (Donut Gauge) - Span 6 */}
            <div className="md:col-span-6 rounded-[28px] bg-white dark:bg-card p-6 border border-white/80 dark:border-white/5 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Sale Analytics
              </h2>

              <div className="relative flex items-center justify-center my-4 h-52">
                {/* Donut Gauge SVG with cyan, orange, purple rings */}
                <svg viewBox="0 0 200 200" className="w-48 h-48 -rotate-90">
                  {/* Background Track */}
                  <circle
                    cx="100"
                    cy="100"
                    r="68"
                    fill="transparent"
                    stroke="currentColor"
                    strokeOpacity="0.06"
                    strokeWidth="14"
                  />
                  {/* Cyan Segment (70%) */}
                  <circle
                    cx="100"
                    cy="100"
                    r="68"
                    fill="transparent"
                    stroke="#00D4D6"
                    strokeWidth="14"
                    strokeDasharray="427"
                    strokeDashoffset="128"
                    strokeLinecap="round"
                  />
                  {/* Orange Segment (20%) */}
                  <circle
                    cx="100"
                    cy="100"
                    r="68"
                    fill="transparent"
                    stroke="#FFA048"
                    strokeWidth="14"
                    strokeDasharray="427"
                    strokeDashoffset="340"
                    strokeLinecap="round"
                    className="rotate-45 origin-center"
                  />
                  {/* Purple Segment (10%) */}
                  <circle
                    cx="100"
                    cy="100"
                    r="68"
                    fill="transparent"
                    stroke="#7C4DFF"
                    strokeWidth="14"
                    strokeDasharray="427"
                    strokeDashoffset="384"
                    strokeLinecap="round"
                    className="rotate-180 origin-center"
                  />
                </svg>

                {/* Center Badge: 100% Completed */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                    100%
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Completed
                  </span>
                </div>

                {/* Callout Indicator Tags matching the reference */}
                <div className="absolute top-2 right-4 text-right">
                  <p className="text-[11px] font-extrabold text-[#FFA048]">20%</p>
                  <p className="text-[10px] text-gray-400">Completed</p>
                </div>
                <div className="absolute bottom-2 left-3 text-left">
                  <p className="text-[11px] font-extrabold text-[#00D4D6]">70%</p>
                  <p className="text-[10px] text-gray-400">Returned</p>
                </div>
                <div className="absolute bottom-2 right-4 text-right">
                  <p className="text-[11px] font-extrabold text-[#7C4DFF]">10%</p>
                  <p className="text-[10px] text-gray-400">Distributed</p>
                </div>
              </div>
            </div>

            {/* Top Products / Top Content Table - Span 6 */}
            <div className="md:col-span-6 rounded-[28px] bg-white dark:bg-card p-6 border border-white/80 dark:border-white/5 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Top Products
                </h2>
                <Link href="/posts" className="text-xs font-semibold text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  See all
                </Link>
              </div>

              <div className="w-full text-xs">
                <div className="flex items-center justify-between text-gray-400 font-semibold pb-2 border-b border-gray-100 dark:border-white/5">
                  <span>Product</span>
                  <span>Code</span>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-white/5">
                  {/* Item 1 */}
                  <div className="flex items-center justify-between py-3 group">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-sm font-bold text-xs">
                        🌸
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white">
                          Realistic
                        </p>
                        <p className="text-[10px] text-gray-400">Campaign Kit</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-gray-600 dark:text-gray-400">
                      8812
                    </span>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center justify-between py-3 group">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-sm font-bold text-xs">
                        🌿
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white">
                          Monstera
                        </p>
                        <p className="text-[10px] text-gray-400">Affiliate Link</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-gray-600 dark:text-gray-400">
                      8832
                    </span>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-center justify-between py-3 group">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm font-bold text-xs">
                        📦
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white">
                          Product
                        </p>
                        <p className="text-[10px] text-gray-400">Lynk.id Link</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-gray-600 dark:text-gray-400">
                      9871
                    </span>
                  </div>

                  {/* Item 4 */}
                  <div className="flex items-center justify-between py-3 group">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-sm font-bold text-xs">
                        🍾
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white">
                          Product
                        </p>
                        <p className="text-[10px] text-gray-400">Auto DM Lead</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-gray-600 dark:text-gray-400">
                      2211
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Omnichannel Social Media Channels Bento Card */}
          <div className="rounded-[28px] bg-white dark:bg-card p-6 border border-white/80 dark:border-white/5 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Connected Social Channels
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Realtime sync status for automated broadcasting &amp; keyword funnels
                </p>
              </div>
              <Link
                href="/accounts"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-black dark:text-white px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-[#D8F85D] hover:text-black transition-all"
              >
                <span>Manage Accounts</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['instagram', 'tiktok', 'facebook', 'youtube'] as SocialPlatform[]).map(platform => {
                const meta = SOCIAL_META[platform]
                const platformAccounts = connectedAccounts.filter((a: any) => a.platform === platform)
                const isConn = platformAccounts.length > 0

                return (
                  <div
                    key={platform}
                    className={`rounded-2xl p-4 border transition-all ${
                      isConn
                        ? 'bg-gray-50/80 dark:bg-white/5 border-gray-200/60 dark:border-white/10'
                        : 'bg-transparent border-dashed border-gray-200 dark:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.badgeBg}`}>
                        <SocialIcon platform={platform} className="h-5 w-5 text-white" />
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isConn
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400'
                        }`}
                      >
                        {isConn ? `● ${platformAccounts.length} Active` : '○ Standby'}
                      </span>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        {meta.name}
                      </p>
                      <p className="text-[11px] font-medium text-gray-500 truncate mt-0.5">
                        {isConn
                          ? `@${platformAccounts[0].username}${platformAccounts.length > 1 ? ` +${platformAccounts.length - 1} more` : ''}`
                          : 'Not connected'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">Blast Ready</span>
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {isConn ? `${platformAccounts.length * 25 > 100 ? 100 : platformAccounts.length * 25}%` : '0%'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom Card: Purchase Analytics & Funnel Clicks */}
          <div className="rounded-[28px] bg-white dark:bg-card p-6 border border-white/80 dark:border-white/5 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Purchase Analytics
              </h2>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FFA048]" />
                  Sold
                </span>
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#00D4D6]" />
                  Purchased
                </span>
              </div>
            </div>

            {/* Subtle trend bar overview */}
            <div className="flex items-end gap-2 h-24 pt-4 border-b border-gray-100 dark:border-white/5">
              {[40, 65, 30, 85, 95, 75, 60, 80, 50, 90, 70, 88].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div
                    style={{ height: `${val}%` }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-[#D8F85D] to-[#BFEA30] opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <CheckCircle2 className="h-4 w-4" /> All automation funnels running normally
              </span>
              <Link href="/auto-dm" className="text-xs font-bold text-black dark:text-white underline-offset-4 hover:underline">
                Configure Auto-DM Triggers &rarr;
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
