import { Metadata } from "next"
import MessagingPageContent from "./_components/messaging-page-content"

export const metadata: Metadata = {
  title: "Messaging | Admin Dashboard | Casa Alpaca",
  description: "Send and receive WhatsApp messages with guests"
}

export default function MessagingPage() {
  return <MessagingPageContent />
}
