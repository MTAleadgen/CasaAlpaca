"use server"

import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { getProfileByUserIdAction } from "@/actions/db/profiles-actions"
import SettingsInterface from "./_components/settings-interface"
import SettingsSkeleton from "./_components/settings-skeleton"

export default async function SettingsPage() {
  return (
    <div className="container py-6">
      <h1 className="mb-6 text-3xl font-bold">Settings</h1>
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  )
}

async function SettingsContent() {
  const { userId } = await auth()

  if (!userId) {
    return <div>Please sign in to view settings</div>
  }

  const { data: profile, isSuccess } = await getProfileByUserIdAction(userId)

  if (!isSuccess) {
    return <div>Failed to load profile</div>
  }

  return <SettingsInterface initialProfile={profile} />
}
