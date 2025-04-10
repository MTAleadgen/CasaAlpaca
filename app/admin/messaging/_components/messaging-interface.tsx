"use client"

import { SelectMessage } from "@/db/schema"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  getMessagesByPhoneAction,
  getMessagesAction
} from "@/actions/db/messages-actions"
import { sendWhatsAppMessageAction } from "@/actions/whatsapp-actions"
import { sendSmsAction } from "@/actions/sms-actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Send, Phone, FileText } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import SendTemplatedMessage from "./send-templated-message"

interface MessagingInterfaceProps {
  initialMessages: SelectMessage[]
}

type MessageType = "whatsapp" | "sms"

export default function MessagingInterface({
  initialMessages
}: MessagingInterfaceProps) {
  const { user } = useUser()
  const [messages, setMessages] = useState<SelectMessage[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [filteredMessages, setFilteredMessages] = useState<SelectMessage[]>([])
  const [contacts, setContacts] = useState<
    Array<{ phoneNumber: string; lastMessage: Date }>
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [messageType, setMessageType] = useState<MessageType>("sms")
  const [error, setError] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)

  // Extract unique contacts from messages
  useEffect(() => {
    const uniqueContacts = new Map<
      string,
      { phoneNumber: string; lastMessage: Date }
    >()

    messages.forEach(message => {
      if (
        !uniqueContacts.has(message.phoneNumber) ||
        new Date(message.createdAt) >
          new Date(uniqueContacts.get(message.phoneNumber)?.lastMessage || 0)
      ) {
        uniqueContacts.set(message.phoneNumber, {
          phoneNumber: message.phoneNumber,
          lastMessage: new Date(message.createdAt)
        })
      }
    })

    setContacts(
      Array.from(uniqueContacts.values()).sort(
        (a, b) => b.lastMessage.getTime() - a.lastMessage.getTime()
      )
    )

    // If we have contacts but none selected, select the first one
    if (contacts.length > 0 && !selectedContact) {
      setSelectedContact(contacts[0].phoneNumber)
    }
  }, [messages, selectedContact])

  // Filter messages by selected contact
  useEffect(() => {
    if (selectedContact) {
      setFilteredMessages(
        messages
          .filter(message => message.phoneNumber === selectedContact)
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
      )
    } else {
      setFilteredMessages([])
    }
  }, [selectedContact, messages])

  // Function to refresh messages periodically
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.id) return

      const result = await getMessagesAction(user.id)
      if (result.isSuccess) {
        setMessages(result.data)
      }
    }

    // Initial fetch
    fetchMessages()

    // Set up polling
    const interval = setInterval(fetchMessages, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [user?.id])

  // Function to handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || !user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      let result

      // Send message based on selected message type
      if (messageType === "whatsapp") {
        result = await sendWhatsAppMessageAction(
          selectedContact,
          newMessage,
          user.id
        )
      } else {
        result = await sendSmsAction(selectedContact, newMessage, user.id)
      }

      if (result.isSuccess) {
        // Get updated messages for the contact
        const messagesResult = await getMessagesByPhoneAction(selectedContact)
        if (messagesResult.isSuccess) {
          // Update the messages state with new messages
          setMessages(prev => {
            const existingMessages = prev.filter(
              m => m.phoneNumber !== selectedContact
            )
            return [...existingMessages, ...messagesResult.data]
          })
        }

        // Clear the input
        setNewMessage("")
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setError("Failed to send message. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to refresh messages after template is sent
  const handleTemplateSuccess = async () => {
    if (!selectedContact) return

    try {
      const messagesResult = await getMessagesByPhoneAction(selectedContact)
      if (messagesResult.isSuccess) {
        setMessages(prev => {
          const existingMessages = prev.filter(
            m => m.phoneNumber !== selectedContact
          )
          return [...existingMessages, ...messagesResult.data]
        })
      }

      // Hide templates panel
      setShowTemplates(false)
    } catch (error) {
      console.error("Error refreshing messages:", error)
    }
  }

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    } else if (cleaned.length > 10) {
      return `+${cleaned.slice(0, cleaned.length - 10)} (${cleaned.slice(-10, -7)}) ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`
    }
    return phone
  }

  // Get status icon based on message status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return "✓"
      case "delivered":
        return "✓✓"
      case "read":
        return "✓✓✓"
      case "failed":
        return "✗"
      default:
        return ""
    }
  }

  // Toggle between templates and direct message
  const toggleTemplates = () => {
    setShowTemplates(prev => !prev)
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Contacts sidebar */}
      <Card className="md:col-span-1">
        <CardContent className="p-4">
          <div className="mb-4">
            <h2 className="mb-2 text-lg font-semibold">Guest Contacts</h2>
          </div>

          <ScrollArea className="h-[500px]">
            <div className="space-y-1">
              {contacts.map(contact => (
                <div
                  key={contact.phoneNumber}
                  className={`cursor-pointer rounded p-2 transition-colors ${
                    selectedContact === contact.phoneNumber
                      ? "bg-secondary text-secondary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedContact(contact.phoneNumber)}
                >
                  <div className="font-medium">
                    {formatPhoneNumber(contact.phoneNumber)}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {format(new Date(contact.lastMessage), "MMM d, h:mm a")}
                  </div>
                </div>
              ))}

              {contacts.length === 0 && (
                <div className="text-muted-foreground py-8 text-center">
                  <p>No guest contacts yet</p>
                  <p className="text-sm">
                    Contacts will appear here when guests book stays
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main chat area */}
      <Card className="md:col-span-2">
        <CardContent className="h-full p-0">
          {selectedContact ? (
            <div className="flex h-[600px] flex-col">
              {/* Chat header */}
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <h2 className="font-semibold">
                    {formatPhoneNumber(selectedContact)}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={messageType}
                    onValueChange={(value: MessageType) =>
                      setMessageType(value)
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Message Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button size="sm" variant="outline" onClick={toggleTemplates}>
                    <FileText className="mr-2 size-4" />
                    Templates
                  </Button>
                </div>
              </div>

              {/* Messages area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {filteredMessages.length === 0 ? (
                    <div className="text-muted-foreground py-8 text-center">
                      No messages yet
                    </div>
                  ) : (
                    filteredMessages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.direction === "outbound"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg p-3 ${
                            message.direction === "outbound"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <div className="break-words text-sm">
                            {message.content}
                          </div>
                          <div
                            className={`mt-1 flex justify-end text-xs ${
                              message.direction === "outbound"
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {format(new Date(message.createdAt), "h:mm a")}
                            {message.direction === "outbound" && (
                              <span className="ml-1">
                                {getStatusIcon(message.status)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Templates or Message input */}
              {showTemplates ? (
                <div className="border-t p-4">
                  <SendTemplatedMessage
                    phoneNumber={selectedContact}
                    onSuccess={handleTemplateSuccess}
                  />
                </div>
              ) : (
                <div className="border-t p-4">
                  {error && (
                    <div className="text-destructive mb-2 text-sm">{error}</div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Type a message (${messageType})...`}
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || !newMessage.trim()}
                    >
                      <Send className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground flex h-[600px] items-center justify-center">
              Select a contact to start messaging
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
