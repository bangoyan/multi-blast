import OpenAI from 'openai'
import type { Platform } from '../types'

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY || 'dummy-key-for-build'
  return new OpenAI({ apiKey })
}

const PLATFORM_LIMITS: Record<Platform, { maxLength: number; hashtagStyle: string }> = {
  instagram: { maxLength: 2200, hashtagStyle: 'grouped at end, max 30' },
  tiktok: { maxLength: 2200, hashtagStyle: 'inline or at end, max 5 trending' },
  facebook: { maxLength: 63206, hashtagStyle: 'minimal, 2-3 max' },
  youtube: { maxLength: 5000, hashtagStyle: 'in description, max 15' },
}

export async function adaptCaption(
  content: string,
  platform: Platform,
  tone?: string,
): Promise<{ caption: string; hashtags: string[] }> {
  const limits = PLATFORM_LIMITS[platform]
  const toneInstruction = tone ? `Tone: ${tone}.` : 'Keep the original tone.'

  const openai = getOpenAIClient()
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You adapt social media captions for ${platform}. Max ${limits.maxLength} chars. Hashtag style: ${limits.hashtagStyle}. ${toneInstruction} Return JSON: {"caption": "...", "hashtags": ["tag1", "tag2"]}. No markdown.`,
      },
      { role: 'user', content },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  })

  const text = res.choices[0]?.message?.content || '{}'
  const parsed = JSON.parse(text)
  return {
    caption: parsed.caption || content,
    hashtags: parsed.hashtags || [],
  }
}

export async function generateCommentReply(
  comment: string,
  personaPrompt: string,
  personaStyle?: string,
): Promise<string> {
  const styleNote = personaStyle ? `Style: ${personaStyle}.` : ''

  const openai = getOpenAIClient()
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `${personaPrompt} ${styleNote} You are replying to a social media comment. Keep it short (1-3 sentences), natural, and on-brand. Never use hashtags in replies.`,
      },
      { role: 'user', content: `Comment: "${comment}"` },
    ],
    temperature: 0.8,
    max_tokens: 150,
  })

  return res.choices[0]?.message?.content?.trim() || 'Thanks for your comment!'
}

export function checkKeywordMatch(
  comment: string,
  keywords: string[],
): boolean {
  const lower = comment.toLowerCase()
  return keywords.some(kw => lower.includes(kw.toLowerCase()))
}

export async function personalDmMessage(
  template: string,
  username: string,
  affiliateUrl?: string,
  lynkIdUrl?: string,
): Promise<string> {
  let message = template
    .replace(/\{username\}/g, username)
    .replace(/\{link\}/g, affiliateUrl || lynkIdUrl || '')
    .replace(/\{affiliate_url\}/g, affiliateUrl || '')
    .replace(/\{lynk_id_url\}/g, lynkIdUrl || '')

  return message
}
