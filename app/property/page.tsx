import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertyGallery } from "@/components/ui/property-gallery"
import {
  Bed,
  Coffee,
  Utensils,
  Wifi,
  Tv,
  Bike,
  Thermometer,
  Car,
  MapPin
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export const metadata = {
  title: "Property Details | Casa Alpaca",
  description:
    "Explore our cozy brick cottage with modern amenities and comforts of home"
}

export default function PropertyPage() {
  // Property images from the provided collection
  const propertyImages = [
    {
      src: "/images/casa-alpaca-hero.jpg",
      alt: "Casa Alpaca - Front View of Brick Cottage"
    },
    {
      src: "/images/casa-alpaca-living.jpg",
      alt: "Casa Alpaca - Cozy Living Room with Fireplace"
    },
    {
      src: "/images/casa-alpaca-bedroom.jpg",
      alt: "Casa Alpaca - Primary Bedroom with Blue Walls"
    },
    {
      src: "/images/casa-alpaca-bathroom.jpg",
      alt: "Casa Alpaca - Modern Bathroom with Subway Tile"
    },
    {
      src: "/images/casa-alpaca-dining.jpg",
      alt: "Casa Alpaca - Dining Area with Chess Set"
    },
    {
      src: "/images/casa-alpaca-kitchen.jpg",
      alt: "Casa Alpaca - Kitchen with Coffee Station"
    },
    {
      src: "/images/casa-alpaca-patio.jpg",
      alt: "Casa Alpaca - Outdoor Patio and Seating Area"
    },
    {
      src: "/images/casa-alpaca-laundry.jpg",
      alt: "Casa Alpaca - Laundry Room Facilities"
    },
    {
      src: "/images/casa-alpaca-office.jpg",
      alt: "Casa Alpaca - Workspace with Green Ambient Lighting"
    }
  ]

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        {/* Property Header */}
        <div className="mb-8">
          <div className="mb-2">
            <Image
              src="/images/6974955a-8165-45c3-9791-90fd02133fdd.png"
              alt="Casa Alpaca Logo"
              width={250}
              height={60}
              className="h-auto object-contain"
              priority
            />
          </div>
          <div className="text-muted-foreground mb-4 flex items-center">
            <MapPin className="mr-1 size-4" />
            <span>Main Street, Anytown USA</span>
          </div>
          <p className="max-w-3xl text-lg">
            A charming brick cottage with modern amenities, offering a perfect
            blend of cozy comfort and stylish living for your next getaway.
          </p>
        </div>

        {/* Property Gallery */}
        <div className="mb-8">
          <PropertyGallery images={propertyImages} />
        </div>

        {/* Property Tabs */}
        <Tabs defaultValue="overview" className="mb-12">
          <TabsList className="mb-6 w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                <div>
                  <h2 className="mb-4 text-2xl font-semibold">
                    About This Property
                  </h2>
                  <p className="mb-4">
                    Casa Alpaca is a beautifully renovated brick cottage that
                    combines classic charm with modern comfort. The soft blue
                    walls, hardwood floors, and thoughtful decor create a
                    peaceful atmosphere perfect for relaxation.
                  </p>
                  <p>
                    With comfortable bedrooms, a cozy living room featuring a
                    fireplace, and a fully equipped kitchen, this home has
                    everything you need for a memorable stay. The property also
                    offers outdoor spaces to enjoy, including a patio area
                    perfect for outdoor dining.
                  </p>
                </div>

                <div>
                  <h2 className="mb-4 text-2xl font-semibold">Key Features</h2>
                  <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <li className="flex items-center">
                      <Bed className="text-primary mr-2 size-5" />
                      <span>Multiple comfortable bedrooms</span>
                    </li>
                    <li className="flex items-center">
                      <Wifi className="text-primary mr-2 size-5" />
                      <span>High-speed WiFi throughout</span>
                    </li>
                    <li className="flex items-center">
                      <Coffee className="text-primary mr-2 size-5" />
                      <span>Coffee bar with espresso machine</span>
                    </li>
                    <li className="flex items-center">
                      <Tv className="text-primary mr-2 size-5" />
                      <span>Smart TV with streaming services</span>
                    </li>
                    <li className="flex items-center">
                      <Bike className="text-primary mr-2 size-5" />
                      <span>Bicycle storage available</span>
                    </li>
                    <li className="flex items-center">
                      <Thermometer className="text-primary mr-2 size-5" />
                      <span>Central heating and cooling</span>
                    </li>
                    <li className="flex items-center">
                      <Utensils className="text-primary mr-2 size-5" />
                      <span>Fully equipped kitchen</span>
                    </li>
                    <li className="flex items-center">
                      <Car className="text-primary mr-2 size-5" />
                      <span>Free parking on premises</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Booking Card */}
              <div>
                <div className="bg-card sticky top-4 rounded-lg border p-6">
                  <h3 className="mb-2 text-xl font-semibold">Book Your Stay</h3>
                  <p className="text-muted-foreground mb-6">
                    Starting from{" "}
                    <span className="not-muted text-xl font-semibold">
                      $199
                    </span>{" "}
                    per night
                  </p>
                  <Link href="/booking">
                    <Button className="mb-4 w-full">Check Availability</Button>
                  </Link>
                  <p className="text-muted-foreground text-sm">
                    Free cancellation up to 7 days before check-in
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Rooms Tab */}
          <TabsContent value="rooms">
            <h2 className="mb-6 text-2xl font-semibold">Rooms & Spaces</h2>

            <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-xl font-medium">Primary Bedroom</h3>
                <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src="/images/casa-alpaca-bedroom.jpg"
                    alt="Primary Bedroom"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-muted-foreground">
                  Relax in our spacious primary bedroom featuring a comfortable
                  queen bed, wooden furnishings, and calming blue walls.
                  Includes storage space and bedside tables.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-xl font-medium">Living Room</h3>
                <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src="/images/casa-alpaca-living.jpg"
                    alt="Living Room"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-muted-foreground">
                  Gather in our cozy living room with comfortable leather
                  seating, smart TV, and a beautiful fireplace. The perfect spot
                  to unwind after a day of exploration.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-xl font-medium">Dining & Game Area</h3>
                <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src="/images/casa-alpaca-dining.jpg"
                    alt="Dining and Game Area"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-muted-foreground">
                  Enjoy meals or play chess in this multifunctional space with a
                  wooden dining table. The credenza features a coffee bar with a
                  professional espresso machine.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-xl font-medium">Bathroom</h3>
                <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src="/images/casa-alpaca-bathroom.jpg"
                    alt="Bathroom"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-muted-foreground">
                  Clean and modern bathroom with a classic white subway tile
                  shower/tub combo, plenty of towels, and essential toiletries
                  provided for your convenience.
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-xl font-medium">Additional Spaces</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 font-medium">Outdoor Patio</h4>
                  <p className="text-muted-foreground text-sm">
                    A comfortable outdoor dining area perfect for enjoying meals
                    in the fresh air.
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 font-medium">Laundry Room</h4>
                  <p className="text-muted-foreground text-sm">
                    Full laundry facilities with washer, dryer and utility sink
                    for your convenience.
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 font-medium">Bike Storage</h4>
                  <p className="text-muted-foreground text-sm">
                    Secure storage area for bicycles, perfect if you want to
                    explore the area on wheels.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Amenities Tab */}
          <TabsContent value="amenities">
            <h2 className="mb-6 text-2xl font-semibold">
              Amenities & Services
            </h2>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <h3 className="mb-4 flex items-center text-xl font-medium">
                  <Coffee className="text-primary mr-2 size-5" />
                  Kitchen & Dining
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Fully equipped kitchen</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Professional espresso machine</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Coffee grinder</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Dining table with seating for 4</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Outdoor dining furniture</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-4 flex items-center text-xl font-medium">
                  <Tv className="text-primary mr-2 size-5" />
                  Entertainment
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Smart TV with streaming services</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>High-speed WiFi throughout</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Chess set and board games</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Books and reading material</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Cozy fireplace</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-4 flex items-center text-xl font-medium">
                  <Bed className="text-primary mr-2 size-5" />
                  Comfort & Convenience
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Premium bed linens and towels</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Central heating and cooling</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Washer and dryer</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Workspace/desk area</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Free parking on premises</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location">
            <h2 className="mb-6 text-2xl font-semibold">Location</h2>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <p>
                  Casa Alpaca is perfectly situated to enjoy both quiet
                  residential living and easy access to local attractions. The
                  charming brick cottage is located in a peaceful neighborhood
                  with friendly neighbors and tree-lined streets.
                </p>

                <div>
                  <h3 className="mb-3 text-xl font-medium">
                    Nearby Attractions
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <div>
                        <span className="font-medium">Local Parks</span>
                        <p className="text-muted-foreground text-sm">
                          Just a 5-minute walk to beautiful green spaces and
                          walking trails.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <div>
                        <span className="font-medium">Downtown Area</span>
                        <p className="text-muted-foreground text-sm">
                          10-minute drive to restaurants, shops, and
                          entertainment.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <div>
                        <span className="font-medium">Bike Trails</span>
                        <p className="text-muted-foreground text-sm">
                          Easy access to scenic biking routes (bikes can be
                          safely stored at the property).
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-3 text-xl font-medium">Getting Around</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <div>
                        <span className="font-medium">Car</span>
                        <p className="text-muted-foreground text-sm">
                          Free parking available on premises.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <div>
                        <span className="font-medium">Cycling</span>
                        <p className="text-muted-foreground text-sm">
                          Bike-friendly neighborhood with dedicated paths.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <div>
                        <span className="font-medium">Public Transit</span>
                        <p className="text-muted-foreground text-sm">
                          Bus stop within a 10-minute walk from the property.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="relative aspect-video overflow-hidden rounded-lg">
                {/* Placeholder for map or location image */}
                <div className="bg-muted absolute inset-0 flex items-center justify-center">
                  <p className="p-6 text-center">
                    Map view will be available soon
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <div className="bg-primary/10 rounded-lg p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">
            Ready to experience Casa Alpaca?
          </h2>
          <p className="mx-auto mb-6 max-w-2xl">
            Book your stay now and enjoy this cozy, beautifully designed home
            with all the modern amenities you need for a perfect getaway.
          </p>
          <Link href="/booking">
            <Button size="lg">Check Availability</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
