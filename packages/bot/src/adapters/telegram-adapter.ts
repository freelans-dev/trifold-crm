import type { MessagingAdapter, ParsedMessage } from "./messaging-adapter"

interface TelegramConfig {
  botToken: string
}

export class TelegramAdapter implements MessagingAdapter {
  private botToken: string
  private baseUrl: string

  constructor(config: TelegramConfig) {
    this.botToken = config.botToken
    this.baseUrl = `https://api.telegram.org/bot${config.botToken}`
  }

  async sendText(to: string, text: string): Promise<void> {
    await this.callApi("sendMessage", {
      chat_id: to,
      text,
      parse_mode: "Markdown",
    })
  }

  async sendImage(to: string, url: string, caption?: string): Promise<void> {
    await this.callApi("sendPhoto", {
      chat_id: to,
      photo: url,
      caption,
    })
  }

  async sendDocument(
    to: string,
    url: string,
    filename: string
  ): Promise<void> {
    await this.callApi("sendDocument", {
      chat_id: to,
      document: url,
      caption: filename,
    })
  }

  parseIncoming(body: unknown): ParsedMessage | null {
    const data = body as Record<string, unknown>
    const message = data.message as Record<string, unknown>
    if (!message) return null

    const text = (message.text as string) ?? ""
    if (!text) return null

    const from = message.from as Record<string, unknown>
    const chat = message.chat as Record<string, unknown>

    return {
      from: `tg:${chat.id}`,
      text,
      timestamp: (message.date as number) * 1000,
      messageId: String(message.message_id),
      channel: "telegram",
    }
  }

  async setWebhook(url: string, secret?: string): Promise<void> {
    await this.callApi("setWebhook", {
      url,
      secret_token: secret,
    })
  }

  private async callApi(
    method: string,
    body: Record<string, unknown>
  ): Promise<unknown> {
    const res = await fetch(`${this.baseUrl}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Telegram API error: ${res.status} ${error}`)
    }

    return res.json()
  }
}
