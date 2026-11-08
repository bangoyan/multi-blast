import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HelpCircle, BookOpen, MessageSquare, Send, Cpu, CheckCircle } from 'lucide-react'

export default function HelpPage() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Help &amp; Documentation
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
          Quick start guides for social scheduling, keyword auto-replies, and affiliate funnel DMs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF4EB] text-[#E87320]">
                <MessageSquare className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-bold">Auto Reply Rules</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <p>Setup rules without AI using keyword triggers to save tokens, or enable AI Persona for natural organic conversational replies.</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">Variables supported: {'{username}'}, {'{comment}'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4F1FD] text-[#7C4DFF]">
                <Send className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-bold">Auto DM Funneling</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <p>Automatically send affiliate links, Lynk.id URLs, or product coupons directly to users who comment trigger keywords like &ldquo;mau&rdquo; or &ldquo;spill&rdquo;.</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">Variables supported: {'{username}'}, {'{url}'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAFBF7] text-[#0D9488]">
                <Cpu className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-bold">MCP Server Integration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <p>Connect Claude Desktop or AI Agents directly using the built-in MCP server at <code className="bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded">packages/mcp-server</code>.</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">Tools: schedule_post, get_scheduled_posts, configure_auto_comment, configure_auto_dm</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
