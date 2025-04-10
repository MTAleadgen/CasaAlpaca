"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { SelectPropertyDetail } from "@/db/schema"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  createPropertyDetailAction,
  updatePropertyDetailAction,
  getPropertyDetailAction
} from "@/actions/db/property-details-actions"
import { SelectProperty } from "@/db/schema"

interface PropertyDetailsFormProps {
  properties: SelectProperty[]
  initialPropertyId?: string
}

export default function PropertyDetailsForm({
  properties,
  initialPropertyId
}: PropertyDetailsFormProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [propertyId, setPropertyId] = useState(initialPropertyId || "")
  const [address, setAddress] = useState("")
  const [houseRules, setHouseRules] = useState("")
  const [wifiName, setWifiName] = useState("")
  const [wifiPassword, setWifiPassword] = useState("")
  const [listingName, setListingName] = useState("")
  const [checkInInstructions, setCheckInInstructions] = useState("")
  const [checkOutInstructions, setCheckOutInstructions] = useState("")
  const [emergencyContact, setEmergencyContact] = useState("")
  const [localRecommendations, setLocalRecommendations] = useState("")
  const [existingDetailId, setExistingDetailId] = useState<string | null>(null)

  // Load existing property details when property is selected
  useEffect(() => {
    const loadPropertyDetails = async () => {
      if (!user?.id || !propertyId) return

      try {
        setIsLoading(true)
        const result = await getPropertyDetailAction(user.id, propertyId)

        if (result.isSuccess && result.data) {
          const details = result.data
          setExistingDetailId(details.id)
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
          // Reset form if no details found
          resetForm(false)
        }
      } catch (error) {
        console.error("Error loading property details:", error)
        toast.error("Failed to load property details")
      } finally {
        setIsLoading(false)
      }
    }

    loadPropertyDetails()
  }, [user?.id, propertyId])

  const resetForm = (resetPropertyToo = true) => {
    if (resetPropertyToo) {
      setPropertyId("")
    }
    setExistingDetailId(null)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id || !propertyId) return

    setIsLoading(true)

    try {
      const detailData = {
        userId: user.id,
        propertyId,
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

      let result

      if (existingDetailId) {
        // Update existing property details
        result = await updatePropertyDetailAction(existingDetailId, detailData)
      } else {
        // Create new property details
        result = await createPropertyDetailAction(detailData)
      }

      if (result.isSuccess) {
        toast.success(result.message)
        // Update the existing ID if we just created a new record
        if (!existingDetailId && result.data) {
          setExistingDetailId(result.data.id)
        }
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error saving property details:", error)
      toast.error("Failed to save property details")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Message Variables</CardTitle>
        <CardDescription>
          These details will be available as variables in your message
          templates. Use variables like {{ address }}, {{ wifiName }}, etc. in
          your templates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="property">Select Property</label>
            <Select
              value={propertyId}
              onValueChange={setPropertyId}
              disabled={isLoading || properties.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No properties available
                  </SelectItem>
                ) : (
                  properties.map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {propertyId && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="listingName">Listing Name</label>
                  <Input
                    id="listingName"
                    value={listingName}
                    onChange={e => setListingName(e.target.value)}
                    disabled={isLoading}
                    placeholder="Casa Alpaca Beach Villa"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="address">Property Address</label>
                  <Input
                    id="address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    disabled={isLoading}
                    placeholder="123 Beach Road, Malibu, CA 90210"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="wifiName">WiFi Network Name</label>
                  <Input
                    id="wifiName"
                    value={wifiName}
                    onChange={e => setWifiName(e.target.value)}
                    disabled={isLoading}
                    placeholder="CasaAlpaca-Guest"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="wifiPassword">WiFi Password</label>
                  <Input
                    id="wifiPassword"
                    value={wifiPassword}
                    onChange={e => setWifiPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="Beach2023!"
                    type="password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="houseRules">House Rules</label>
                <Textarea
                  id="houseRules"
                  value={houseRules}
                  onChange={e => setHouseRules(e.target.value)}
                  disabled={isLoading}
                  placeholder="1. No smoking indoors. 2. Quiet hours 10pm-8am. 3. No pets."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="checkInInstructions">
                  Check-in Instructions
                </label>
                <Textarea
                  id="checkInInstructions"
                  value={checkInInstructions}
                  onChange={e => setCheckInInstructions(e.target.value)}
                  disabled={isLoading}
                  placeholder="Check-in is after 3pm. The key will be in the lockbox near the front door. The code is 1234."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="checkOutInstructions">
                  Check-out Instructions
                </label>
                <Textarea
                  id="checkOutInstructions"
                  value={checkOutInstructions}
                  onChange={e => setCheckOutInstructions(e.target.value)}
                  disabled={isLoading}
                  placeholder="Check-out is by 11am. Please leave the key in the lockbox and make sure all windows and doors are locked."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="emergencyContact">Emergency Contact</label>
                <Input
                  id="emergencyContact"
                  value={emergencyContact}
                  onChange={e => setEmergencyContact(e.target.value)}
                  disabled={isLoading}
                  placeholder="John Smith: 555-123-4567"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="localRecommendations">
                  Local Recommendations
                </label>
                <Textarea
                  id="localRecommendations"
                  value={localRecommendations}
                  onChange={e => setLocalRecommendations(e.target.value)}
                  disabled={isLoading}
                  placeholder="Restaurants: Ocean View Grill (2 blocks), Sunset Cafe (5 min drive). Activities: Beach Access (5 min walk), Hiking Trails (10 min drive)."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => resetForm()}
                  disabled={isLoading}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? "Saving..."
                    : existingDetailId
                      ? "Update Details"
                      : "Save Details"}
                </Button>
              </div>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
