"use server"

import { Suspense } from "react"
import { getMessageTemplatesAction } from "@/actions/db/message-templates-actions"
import { auth } from "@clerk/nextjs/server"
import TemplatesSkeleton from "./_components/templates-skeleton"
import TemplatesInterface from "./_components/templates-interface"

export default async function TemplatesPage() {
  return (
    <div className="container py-6">
      <h1 className="mb-6 text-3xl font-bold">Message Templates</h1>
      <Suspense fallback={<TemplatesSkeleton />}>
        <TemplatesContent />
      </Suspense>
    </div>
  )
}

async function TemplatesContent() {
  const { userId } = await auth()

  if (!userId) {
    return <div>Please sign in to view message templates</div>
  }

  const { data: templates, isSuccess } = await getMessageTemplatesAction(userId)

  if (!isSuccess) {
    return <div>Failed to load templates</div>
  }

  return <TemplatesInterface initialTemplates={templates || []} />
}
