import { getExtraByIdAction } from "@/actions/db/extras-actions"
import { ExtraForm } from "@/components/admin/extras/extra-form"
import { notFound } from "next/navigation"

interface EditExtraPageProps {
  params: {
    id: string
  }
}

export const metadata = {
  title: "Edit Extra | Casa Alpaca Admin",
  description: "Edit a bookable extra"
}

export default async function EditExtraPage({ params }: EditExtraPageProps) {
  // If the ID is "new", render the form for creating a new extra
  if (params.id === "new") {
    return (
      <div className="container py-10">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">
          Create New Extra
        </h1>
        <ExtraForm />
      </div>
    )
  }

  // Otherwise, get the existing extra and render the form for editing it
  const result = await getExtraByIdAction(params.id, true)

  if (!result.isSuccess) {
    notFound()
  }

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Edit Extra</h1>
      <ExtraForm defaultValues={result.data} />
    </div>
  )
}
