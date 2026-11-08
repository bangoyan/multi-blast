#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { createSupabaseAdmin, createQueue, QUEUE_NAMES } from '@multiblast/shared'

const server = new McpServer({
  name: 'mcp-server-multiblast',
  version: '0.1.0',
})

// --- Tool: schedule_post ---
server.tool(
  'schedule_post',
  'Schedule a new post to one or more social media platforms',
  {
    content: z.string().describe('The post content/caption'),
    platforms: z.array(z.enum(['instagram', 'tiktok', 'facebook', 'youtube'])).describe('Target platforms'),
    mediaUrls: z.array(z.string().url()).optional().describe('Media file URLs to attach'),
    scheduledAt: z.string().datetime().describe('ISO 8601 datetime to publish'),
    userId: z.string().uuid().describe('User ID who owns the post'),
    socialAccountIds: z.record(z.string().uuid()).describe('Map of platform to social account ID'),
    adaptWithAi: z.boolean().optional().default(false).describe('Auto-adapt caption per platform via AI'),
  },
  async ({ content, platforms, mediaUrls, scheduledAt, userId, socialAccountIds, adaptWithAi }) => {
    const supabase = createSupabaseAdmin()

    // Create post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        content,
        media_urls: mediaUrls || [],
        platforms,
        status: 'scheduled',
      })
      .select()
      .single()

    if (postError) {
      return { content: [{ type: 'text' as const, text: `Error creating post: ${postError.message}` }] }
    }

    const schedulerQueue = createQueue(QUEUE_NAMES.POST_SCHEDULER)
    const scheduleIds: string[] = []

    for (const platform of platforms) {
      const accountId = socialAccountIds[platform]
      if (!accountId) continue

      const { data: schedule } = await supabase
        .from('schedules')
        .insert({
          post_id: post.id,
          user_id: userId,
          platform,
          social_account_id: accountId,
          scheduled_at: scheduledAt,
          status: 'scheduled',
        })
        .select()
        .single()

      if (schedule) {
        scheduleIds.push(schedule.id)
        const delay = new Date(scheduledAt).getTime() - Date.now()
        await schedulerQueue.add('publish', { scheduleId: schedule.id }, {
          delay: Math.max(delay, 0),
          jobId: `schedule-${schedule.id}`,
        })
      }
    }

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          postId: post.id,
          scheduleIds,
          scheduledAt,
          platforms,
          status: 'scheduled',
        }),
      }],
    }
  },
)

// --- Tool: get_scheduled_posts ---
server.tool(
  'get_scheduled_posts',
  'Get list of scheduled posts for a user',
  {
    userId: z.string().uuid().describe('User ID'),
    status: z.enum(['scheduled', 'publishing', 'published', 'failed']).optional().describe('Filter by status'),
    limit: z.number().int().min(1).max(100).optional().default(20).describe('Max results'),
  },
  async ({ userId, status, limit }) => {
    const supabase = createSupabaseAdmin()

    let query = supabase
      .from('schedules')
      .select('*, posts(content, media_urls, platforms), social_accounts(username, platform)')
      .eq('user_id', userId)
      .order('scheduled_at', { ascending: true })
      .limit(limit)

    if (status) query = query.eq('status', status)

    const { data, error } = await query

    if (error) {
      return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }] }
    }

    return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] }
  },
)

// --- Tool: configure_auto_comment ---
server.tool(
  'configure_auto_comment',
  'Create or update auto-comment reply rules for a social account',
  {
    userId: z.string().uuid().describe('User ID'),
    socialAccountId: z.string().uuid().describe('Social account ID'),
    name: z.string().describe('Rule name'),
    mode: z.enum(['ai_persona', 'keyword_triggered']).describe('Reply mode'),
    isActive: z.boolean().optional().default(true),
    personaPrompt: z.string().optional().describe('AI persona system prompt (for ai_persona mode)'),
    personaStyle: z.string().optional().describe('Style: ramah, kasual, profesional, santai'),
    keywords: z.array(z.string()).optional().describe('Trigger keywords (for keyword_triggered mode)'),
    replyTemplate: z.string().optional().describe('Reply template with {username}, {comment} placeholders'),
    ruleId: z.string().uuid().optional().describe('Existing rule ID to update'),
  },
  async ({ userId, socialAccountId, name, mode, isActive, personaPrompt, personaStyle, keywords, replyTemplate, ruleId }) => {
    const supabase = createSupabaseAdmin()

    const ruleData = {
      user_id: userId,
      social_account_id: socialAccountId,
      name,
      mode,
      is_active: isActive,
      persona_prompt: personaPrompt,
      persona_style: personaStyle,
      keywords,
      reply_template: replyTemplate,
    }

    let result
    if (ruleId) {
      const { data, error } = await supabase
        .from('comment_rules')
        .update(ruleData)
        .eq('id', ruleId)
        .eq('user_id', userId)
        .select()
        .single()
      result = { data, error }
    } else {
      const { data, error } = await supabase
        .from('comment_rules')
        .insert(ruleData)
        .select()
        .single()
      result = { data, error }
    }

    if (result.error) {
      return { content: [{ type: 'text' as const, text: `Error: ${result.error.message}` }] }
    }

    return { content: [{ type: 'text' as const, text: JSON.stringify(result.data) }] }
  },
)

// --- Tool: configure_auto_dm ---
server.tool(
  'configure_auto_dm',
  'Create or update auto-DM trigger rules for affiliate/Lynk.id funneling',
  {
    userId: z.string().uuid().describe('User ID'),
    socialAccountId: z.string().uuid().describe('Social account ID'),
    name: z.string().describe('Trigger name'),
    isActive: z.boolean().optional().default(true),
    triggerKeywords: z.array(z.string()).describe('Keywords that trigger DM (e.g. "mau link", "beli", "harga")'),
    dmMessageTemplate: z.string().describe('DM template with {username}, {link}, {affiliate_url}, {lynk_id_url} placeholders'),
    affiliateUrl: z.string().url().optional().describe('Affiliate link URL'),
    lynkIdUrl: z.string().url().optional().describe('Lynk.id URL'),
    campaignName: z.string().optional().describe('Campaign name for tracking'),
    triggerId: z.string().uuid().optional().describe('Existing trigger ID to update'),
  },
  async ({ userId, socialAccountId, name, isActive, triggerKeywords, dmMessageTemplate, affiliateUrl, lynkIdUrl, campaignName, triggerId }) => {
    const supabase = createSupabaseAdmin()

    const triggerData = {
      user_id: userId,
      social_account_id: socialAccountId,
      name,
      is_active: isActive,
      trigger_keywords: triggerKeywords,
      dm_message_template: dmMessageTemplate,
      affiliate_url: affiliateUrl,
      lynk_id_url: lynkIdUrl,
      campaign_name: campaignName,
    }

    let result
    if (triggerId) {
      const { data, error } = await supabase
        .from('dm_triggers')
        .update(triggerData)
        .eq('id', triggerId)
        .eq('user_id', userId)
        .select()
        .single()
      result = { data, error }
    } else {
      const { data, error } = await supabase
        .from('dm_triggers')
        .insert(triggerData)
        .select()
        .single()
      result = { data, error }
    }

    if (result.error) {
      return { content: [{ type: 'text' as const, text: `Error: ${result.error.message}` }] }
    }

    return { content: [{ type: 'text' as const, text: JSON.stringify(result.data) }] }
  },
)

// --- Start server ---
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('MultiBlast MCP Server running on stdio')
}

main().catch(console.error)
