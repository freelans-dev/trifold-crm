/**
 * Telegram media utilities for downloading files from the Telegram Bot API.
 */

export async function getTelegramFileUrl(
  botToken: string,
  fileId: string
): Promise<string | null> {
  const res = await fetch(
    `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`,
    { signal: AbortSignal.timeout(10000) }
  )
  if (!res.ok) return null
  const data = (await res.json()) as {
    result: { file_path: string }
  }
  return `https://api.telegram.org/file/bot${botToken}/${data.result.file_path}`
}

export async function downloadFileAsBase64(
  url: string
): Promise<{ base64: string; mimeType: string } | null> {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) })
  if (!res.ok) return null
  const buffer = await res.arrayBuffer()
  const base64 = Buffer.from(buffer).toString("base64")
  const contentType = res.headers.get("content-type") || "image/jpeg"
  return { base64, mimeType: contentType }
}
