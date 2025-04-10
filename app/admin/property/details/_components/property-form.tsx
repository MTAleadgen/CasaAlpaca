"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  createPropertyAction,
  updatePropertyAction
} from "@/actions/db/properties-actions"
import {
  createPropertyDetailAction,
  getPropertyDetailAction,
  updatePropertyDetailAction
} from "@/actions/db/property-details-actions"
import { SelectProperty } from "@/db/schema"
import { useRouter } from "next/navigation"
import { InfoIcon } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PropertyFormProps {
  property: SelectProperty | null
  allProperties: SelectProperty[]
}

export function PropertyForm({ property, allProperties }: PropertyFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    property?.id || "new"
  )

  // Property form state
  const [name, setName] = useState(property?.name || "")
  const [description, setDescription] = useState(property?.description || "")

  // Property details form state
  const [address, setAddress] = useState("")
  const [houseRules, setHouseRules] = useState("")
  const [wifiName, setWifiName] = useState("")
  const [wifiPassword, setWifiPassword] = useState("")
  const [listingName, setListingName] = useState("")
  const [checkInInstructions, setCheckInInstructions] = useState("")
  const [checkOutInstructions, setCheckOutInstructions] = useState("")
  const [emergencyContact, setEmergencyContact] = useState("")
  const [localRecommendations, setLocalRecommendations] = useState("")
  const [detailId, setDetailId] = useState<string | null>(null)

  // Load property details when property changes
  useEffect(() => {
    if (selectedPropertyId === "new") {
      resetDetailsForm()
      setName("")
      setDescription("")
      return
    }

    // If selecting a property from dropdown
    if (selectedPropertyId && selectedPropertyId !== property?.id) {
      const selectedProperty = allProperties.find(
        p => p.id === selectedPropertyId
      )
      if (selectedProperty) {
        setName(selectedProperty.name)
        setDescription(selectedProperty.description)

        // Load property details for this property
        loadPropertyDetails(selectedPropertyId)
      }
    } else if (property) {
      // Initial load with a property passed in
      setName(property.name)
      setDescription(property.description)
      loadPropertyDetails(property.id)
    }
  }, [selectedPropertyId, property])

  const loadPropertyDetails = async (propertyId: string) => {
    if (!user?.id) return

    try {
      const result = await getPropertyDetailAction(user.id, propertyId)

      if (result.isSuccess && result.data) {
        const details = result.data
        setDetailId(details.id)
        setAddress(details.address || "")
        setHouseRules(details.houseRules || "")
        setWifiName(details.wifiName || "")
        setWifiPassword(details.wifiPassword || "")
        setListingName(details.listingName || "")
        setCheckInInstructions(details.checkInInstructions || "")
        setCheckOutInstructions(details.checkOutInstructions || "")
        setEmergencyContact(details.emergencyContact || "")
        setLocalRecommendations(details.localRecommendations || "")
      } else {
        resetDetailsForm()
      }
    } catch (error) {
      console.error("Error loading property details:", error)
      toast({
        title: "Error",
        description: "Failed to load property details",
        variant: "destructive"
      })
      resetDetailsForm()
    }
  }

  const resetDetailsForm = () => {
    setDetailId(null)
    setAddress("")
    setHouseRules("")
    setWifiName("")
    setWifiPassword("")
    setListingName("")
    setCheckInInstructions("")
    setCheckOutInstructions("")
    setEmergencyContact("")
    setLocalRecommendations("")
  }

  const handlePropertyChange = (propertyId: string) => {
    setSelectedPropertyId(propertyId)
    if (propertyId !== "new") {
      router.push(`/admin/property/details?id=${propertyId}`)
    } else {
      router.push("/admin/property/details")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setIsSubmitting(true)

    try {
      let propertyId = selectedPropertyId
      let propertyResponse

      // Step 1: Handle property creation/update
      if (propertyId === "new") {
        // Create new property
        propertyResponse = await createPropertyAction({
          name,
          description
        })

        if (propertyResponse.isSuccess && propertyResponse.data) {
          propertyId = propertyResponse.data.id
          toast({
            title: "Property created",
            description: "Property has been created successfully."
          })
        } else {
          throw new Error(propertyResponse.message)
        }
      } else {
        // Update existing property
        propertyResponse = await updatePropertyAction(propertyId, {
          name,
          description
        })

        if (propertyResponse.isSuccess) {
          toast({
            title: "Property updated",
            description: "Property details have been updated successfully."
          })
        } else {
          throw new Error(propertyResponse.message)
        }
      }

      // Step 2: Handle property details
      const detailData = {
        userId: user.id,
        propertyId: propertyId,
        address,
        houseRules,
        wifiName,
        wifiPassword,
        listingName,
        checkInInstructions,
        checkOutInstructions,
        emergencyContact,
        localRecommendations
      }

      let detailsResponse

      if (detailId) {
        // Update existing details
        detailsResponse = await updatePropertyDetailAction(detailId, detailData)
      } else {
        // Create new details
        detailsResponse = await createPropertyDetailAction(detailData)
      }

      if (detailsResponse.isSuccess) {
        toast({
          title: "Property details updated",
          description: "Property details have been saved successfully."
        })

        if (propertyId !== selectedPropertyId) {
          // Redirect to the new property
          router.push(`/admin/property/details?id=${propertyId}`)
        }

        // Refresh data
        router.refresh()
      } else {
        throw new Error(detailsResponse.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-6">
          <Label htmlFor="propertySelect">Select Property</Label>
          <Select
            value={selectedPropertyId}
            onValueChange={handlePropertyChange}
          >
            <SelectTrigger className="mt-2 w-full md:w-80">
              <SelectValue placeholder="Select a property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Create New Property</SelectItem>
              {allProperties.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="details">Property Details</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="basic" className="space-y-6">
              <div className="bg-muted mb-6 flex items-start rounded-md p-4">
                <InfoIcon className="mr-3 mt-0.5 size-5 text-blue-600" />
                <div>
                  <h3 className="font-medium">Property Information</h3>
                  <p className="text-muted-foreground text-sm">
                    Update basic details about your property.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Property Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Casa Alpaca"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="A beautiful vacation rental property..."
                    rows={5}
                    required
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <div className="bg-muted mb-6 flex items-start rounded-md p-4">
                <InfoIcon className="mr-3 mt-0.5 size-5 text-blue-600" />
                <div>
                  <h3 className="font-medium">Property Details</h3>
                  <p className="text-muted-foreground text-sm">
                    Add property details that will be available as variables in
                    your message templates.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="listingName">Listing Name</Label>
                    <Input
                      id="listingName"
                      value={listingName}
                      onChange={e => setListingName(e.target.value)}
                      placeholder="Casa Alpaca Beach Villa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Property Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="123 Beach Road, Malibu, CA 90210"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="wifiName">WiFi Network Name</Label>
                    <Input
                      id="wifiName"
                      value={wifiName}
                      onChange={e => setWifiName(e.target.value)}
                      placeholder="CasaAlpaca-Guest"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wifiPassword">WiFi Password</Label>
                    <Input
                      id="wifiPassword"
                      value={wifiPassword}
                      onChange={e => setWifiPassword(e.target.value)}
                      placeholder="Beach2023!"
                      type="password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="houseRules">House Rules</Label>
                  <Textarea
                    id="houseRules"
                    value={houseRules}
                    onChange={e => setHouseRules(e.target.value)}
                    placeholder="No smoking, no parties, quiet hours after 10 PM..."
                    rows={4}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="checkInInstructions">
                      Check-in Instructions
                    </Label>
                    <Textarea
                      id="checkInInstructions"
                      value={checkInInstructions}
                      onChange={e => setCheckInInstructions(e.target.value)}
                      placeholder="Check-in is at 3 PM. Use the keypad code..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkOutInstructions">
                      Check-out Instructions
                    </Label>
                    <Textarea
                      id="checkOutInstructions"
                      value={checkOutInstructions}
                      onChange={e => setCheckOutInstructions(e.target.value)}
                      placeholder="Check-out is at 11 AM. Please remove all trash..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">
                    Emergency Contact Information
                  </Label>
                  <Textarea
                    id="emergencyContact"
                    value={emergencyContact}
                    onChange={e => setEmergencyContact(e.target.value)}
                    placeholder="For emergencies, contact: John Doe at (555) 123-4567..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="localRecommendations">
                    Local Recommendations
                  </Label>
                  <Textarea
                    id="localRecommendations"
                    value={localRecommendations}
                    onChange={e => setLocalRecommendations(e.target.value)}
                    placeholder="Local restaurants we recommend: Ocean Grill, Beach Cafe..."
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>

            <div className="mt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : selectedPropertyId === "new"
                    ? "Create Property"
                    : "Update Property"}
              </Button>
            </div>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  )
}
