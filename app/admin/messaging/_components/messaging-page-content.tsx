"use server"

import MessagingInterface from "./messaging-interface"
import { getMessagesAction } from "@/actions/db/messages-actions"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Settings, FileText, UserCog, Home } from "lucide-react"

export default async function MessagingPageContent() {
  const { userId } = await auth()

  // Make sure we have an authenticated user
  if (!userId) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold">Authentication Required</h1>
        <p className="text-muted-foreground mt-2">
          Please sign in to access the messaging feature.
        </p>
      </div>
    )
  }

  // Get all messages for the user
  const messagesResult = await getMessagesAction(userId)
  const initialMessages = messagesResult.isSuccess ? messagesResult.data : []

  return (
    <div className="py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Messaging</h1>
        <div className="flex space-x-2">
          <Link href="/admin/messaging/templates">
            <Button variant="outline" size="sm">
              <FileText className="mr-2 size-4" />
              Message Templates
            </Button>
          </Link>
          <Link href="/admin/messaging/property-variables">
            <Button variant="outline" size="sm">
              <Home className="mr-2 size-4" />
              Property Variables
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="outline" size="sm">
              <UserCog className="mr-2 size-4" />
              Messaging Preferences
            </Button>
          </Link>
          <Link href="/admin/messaging/setup">
            <Button variant="outline" size="sm">
              <Settings className="mr-2 size-4" />
              Setup Guide
            </Button>
          </Link>
        </div>
      </div>

      <p className="text-muted-foreground mb-8">
        Send and receive messages with your guests. Messages can be delivered
        via SMS (for US clients) or WhatsApp (international). Create message
        templates to automate common communications.
      </p>

      <MessagingInterface initialMessages={initialMessages} />
    </div>
  )
}
