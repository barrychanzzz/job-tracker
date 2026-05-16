import type { GmailMatch } from '../stores/gmailStore'
import { db } from '../db/database'

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me'

interface GmailMessage {
  id: string
  threadId: string
  payload?: {
    headers?: { name: string; value: string }[]
    parts?: { mimeType: string; body?: { data?: string } }[]
    body?: { data?: string }
  }
  snippet?: string
  internalDate?: string
}

function getHeader(headers: { name: string; value: string }[] | undefined, name: string): string {
  return headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''
}

function isJobRelatedSubject(subject: string): boolean {
  const keywords = /application|求职|应聘|resume|cv|申请|面试|interview|offer/i
  return keywords.test(subject)
}

function isRejectionEmail(snippet: string, subject: string): boolean {
  const patterns = /unfortunately|regret|not moving forward|not selected|other candidates|其他候选人|遗憾|未能|不合适|暂不考虑/i
  return patterns.test(subject + ' ' + snippet)
}

function isInterviewEmail(snippet: string, subject: string): boolean {
  const patterns = /interview|面试|schedule|安排|invite you|邀请你|meet|见面/i
  return patterns.test(subject + ' ' + snippet)
}

function isOfferEmail(snippet: string, subject: string): boolean {
  const patterns = /offer|录用|录取|congratulations|恭喜|welcome aboard|薪酬|package/i
  return patterns.test(subject + ' ' + snippet)
}

export async function scanSentMail(accessToken: string): Promise<GmailMatch[]> {
  const results: GmailMatch[] = []

  // Get sent messages
  const sentResp = await fetch(
    `${GMAIL_API}/messages?labelIds=SENT&maxResults=50`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!sentResp.ok) throw new Error(`Gmail API error: ${sentResp.status}`)
  const sentData = await sentResp.json()
  const sentMessages: { id: string; threadId: string }[] = sentData.messages ?? []

  // Get all known recruiter emails
  const allApps = await db.applications.toArray()
  const knownEmails = new Set(
    allApps.flatMap((a) => (a.recruiterEmails ?? []).map((e) => e.toLowerCase().trim()))
  )

  // Fetch details for each message
  for (const msg of sentMessages) {
    const detailResp = await fetch(
      `${GMAIL_API}/messages/${msg.id}?format=full`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    if (!detailResp.ok) continue
    const detail: GmailMessage = await detailResp.json()
    const headers = detail.payload?.headers ?? []
    const subject = getHeader(headers, 'Subject')
    const to = getHeader(headers, 'To')
    const date = getHeader(headers, 'Date')

    // Match: sender in known emails OR job-related subject
    const toEmails = to.toLowerCase().match(/[\w.-]+@[\w.-]+\.\w+/g) ?? []
    const matchesKnown = toEmails.some((e) => knownEmails.has(e))
    const matchesSubject = isJobRelatedSubject(subject)

    if (matchesKnown || matchesSubject) {
      // Find matching application
      const matched = allApps.find((a) =>
        (a.recruiterEmails ?? []).some((re) =>
          toEmails.some((te) => re.toLowerCase().trim() === te)
        )
      )

      results.push({
        id: detail.id,
        threadId: detail.threadId,
        subject,
        from: getHeader(headers, 'From'),
        to,
        date: detail.internalDate
          ? new Date(parseInt(detail.internalDate)).toISOString()
          : date,
        snippet: detail.snippet ?? '',
        matchType: 'sent',
        matchedApplicationId: matched?.id,
        matchedApplicationName: matched ? `${matched.positionName} @ ${matched.companyName}` : undefined,
      })
    }
  }

  return results
}

export async function scanInboxMail(accessToken: string): Promise<GmailMatch[]> {
  const results: GmailMatch[] = []

  const allApps = await db.applications.toArray()
  const knownEmails = new Set(
    allApps.flatMap((a) => (a.recruiterEmails ?? []).map((e) => e.toLowerCase().trim()))
  )

  if (knownEmails.size === 0) return results

  const inboxResp = await fetch(
    `${GMAIL_API}/messages?labelIds=INBOX&maxResults=50`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!inboxResp.ok) return results
  const inboxData = await inboxResp.json()
  const inboxMessages: { id: string; threadId: string }[] = inboxData.messages ?? []

  for (const msg of inboxMessages) {
    const detailResp = await fetch(
      `${GMAIL_API}/messages/${msg.id}?format=full`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    if (!detailResp.ok) continue
    const detail: GmailMessage = await detailResp.json()
    const headers = detail.payload?.headers ?? []
    const from = getHeader(headers, 'From')
    const subject = getHeader(headers, 'Subject')
    const date = getHeader(headers, 'Date')

    const fromEmail = from.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0]?.toLowerCase()
    if (!fromEmail || !knownEmails.has(fromEmail)) continue

    const matched = allApps.find((a) =>
      (a.recruiterEmails ?? []).some((re) => re.toLowerCase().trim() === fromEmail)
    )

    results.push({
      id: detail.id,
      threadId: detail.threadId,
      subject,
      from,
      to: getHeader(headers, 'To'),
      date: detail.internalDate
        ? new Date(parseInt(detail.internalDate)).toISOString()
        : date,
      snippet: detail.snippet ?? '',
      matchType: 'received',
      matchedApplicationId: matched?.id,
      matchedApplicationName: matched ? `${matched.positionName} @ ${matched.companyName}` : undefined,
    })
  }

  return results
}

export function classifyEmail(match: GmailMatch): 'interview' | 'rejection' | 'offer' | 'general' {
  if (isRejectionEmail(match.snippet, match.subject)) return 'rejection'
  if (isOfferEmail(match.snippet, match.subject)) return 'offer'
  if (isInterviewEmail(match.snippet, match.subject)) return 'interview'
  return 'general'
}
