export type { MessagingAdapter, ParsedMessage } from "./adapters/messaging-adapter"
export { WhatsAppAdapter } from "./adapters/whatsapp-adapter"
export { TelegramAdapter } from "./adapters/telegram-adapter"
export { getTelegramFileUrl, downloadFileAsBase64 } from "./utils/telegram-media"
