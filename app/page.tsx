"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import {
  Calendar,
  Home,
  MapPin,
  Star,
  Users,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from "lucide-react"
import { useEffect, useState } from "react"
import { ScrollAnimation } from "@/components/utilities/scroll-animation"
import { AlternatingSection } from "@/components/utilities/alternating-section"
import { TestimonialCarousel } from "@/components/utilities/testimonial-carousel"
import { cn } from "@/lib/utils"
import { AnimatedSection } from "@/components/ui/animated-section"
import { useTheme } from "next-themes"
import {
  FaMountain,
  FaUtensils,
  FaCalendarCheck,
  FaParking,
  FaStore,
  FaCoffee,
  FaBiking,
  FaSnowflake,
  FaChair,
  FaDumbbell
} from "react-icons/fa"
import {
  MdCleaningServices,
  MdOutlineMicrowave,
  MdOutlineLocalFireDepartment,
  MdOutlineTableBar,
  MdKitchen
} from "react-icons/md"
import { TiWiFi } from "react-icons/ti"
import { PiTelevisionSimpleFill, PiSpeakerHifiFill } from "react-icons/pi"
import { LuBedDouble } from "react-icons/lu"
import {
  GiCampCookingPot,
  GiHouseKeys,
  GiGrass,
  GiBarbecue,
  GiWashingMachine
} from "react-icons/gi"

export default function HomePage() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Hero carousel images
  const heroImages = [
    {
      src: "/images/casa-alpaca-hero.jpg",
      alt: "Front View of Casa Alpaca"
    },
    {
      src: "/images/casa-alpaca-living.jpg",
      alt: "Cozy Living Room with Fireplace"
    },
    {
      src: "/images/casa-alpaca-patio.jpg",
      alt: "Casa Alpaca outdoor patio area"
    },
    {
      src: "/images/casa-alpaca-bedroom.jpg",
      alt: "Comfortable Bedroom"
    },
    {
      src: "/images/casa-alpaca-dining.jpg",
      alt: "Dining Area with Chess Set"
    }
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex =>
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [heroImages.length])

  const goToPrevious = () => {
    setCurrentIndex(prevIndex =>
      prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex(prevIndex =>
      prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
    )
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Guest testimonials from actual reviews
  const testimonials = [
    {
      id: "1",
      name: "Rachael",
      location: "Ann Arbor, Michigan",
      rating: 5,
      text: "What a nice spot! This is a nice Ferndale neighborhood close to the downtown. The place was clean and had a sweet board game bookshelf. I was impressed with how well appointed the kitchenette was with modern touches and all you need for a comfortable stay.",
      date: "4 days ago"
    },
    {
      id: "2",
      name: "Bradley",
      location: "Evansville, Indiana",
      rating: 5,
      text: "My stay in Michael's home has been the best experience I've had with Airbnb. The location is perfect, the home is tidy and very clean but not sterile - cozy and inviting. Michael is very responsive and helpful.",
      date: "5 days ago"
    },
    {
      id: "3",
      name: "Adrienne",
      location: "Chicago, Illinois",
      rating: 5,
      text: "Wonderful home, very clean and comfortable. Great location, close to downtown Detroit as well as Ferndale & Royal Oak. The neighborhood was great to walk my dogs though! Michael was friendly and responsive.",
      date: "March 2023"
    },
    {
      id: "4",
      name: "Erick",
      location: "Atlanta, Georgia",
      rating: 5,
      text: "I truly never expected to enjoy an Airbnb so much - it's the perfect place with the best hospitality! It is a short drive to Downtown Detroit, and very close to Royal Oak/Birmingham neighborhoods.",
      date: "1 week ago"
    },
    {
      id: "5",
      name: "Kinaale",
      location: "Avon, Michigan",
      rating: 5,
      text: "This place was comfortable. Lots of stuff art and cool things throughout the place. Michael was amazing as a host. I was never short with anything I needed, he provided everything I needed.",
      date: "1 week ago"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section with Carousel */}
      <section className="relative h-[90vh] w-full overflow-hidden">
        {/* Enhanced Carousel */}
        <div className="relative size-full">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 size-full transition-opacity duration-1000 ${
                index === currentIndex
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="100vw"
                className="object-cover"
                priority={index === 0}
              />
              {/* Dark overlay to enhance text readability */}
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          ))}

          {/* Custom navigation arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 z-30 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white shadow-md backdrop-blur-sm hover:bg-black/50 focus:outline-none"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-8" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-30 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white shadow-md backdrop-blur-sm hover:bg-black/50 focus:outline-none"
            aria-label="Next slide"
          >
            <ChevronRight className="size-8" />
          </button>

          {/* Carousel indicators */}
          <div className="absolute inset-x-0 bottom-6 z-30 flex justify-center gap-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === index ? "w-8 bg-white" : "w-2 bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Content overlay - updated styling */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <ScrollAnimation
            direction="from-bottom"
            className="w-full max-w-4xl px-4 text-center"
          >
            <div className="mb-8 flex justify-center">
              <Image
                src="/images/3d7d7d36-b99d-4b9b-9ef1-5e7e5b316389.png"
                alt="Casa Alpaca Logo"
                width={360}
                height={360}
                className="rounded-full bg-[#F8F4E3]/90 p-2"
                priority
              />
            </div>
            <h1 className="mb-6 text-4xl font-medium text-white md:text-5xl lg:text-6xl">
              Eclectic Charm in Ferndale
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-white/90">
              Experience our unique vacation rental with creative design, modern
              amenities, and a perfect location near downtown Ferndale's vibrant
              scene.
            </p>
            <Link href="/booking" className="pointer-events-auto">
              <Button
                size="lg"
                className="rounded-full bg-[#E27D60] px-8 text-white hover:bg-[#C25D40]"
              >
                Book Your Stay
              </Button>
            </Link>
          </ScrollAnimation>
        </div>
      </section>

      {/* Retreat/Unplug/Recharge Section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-screen-xl px-4">
          <ScrollAnimation direction="from-bottom">
            <h2 className="mb-16 text-center text-3xl font-medium text-[#1A1A1A] md:text-4xl">
              Discover. Explore. Connect.
            </h2>
          </ScrollAnimation>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <ScrollAnimation direction="from-bottom" delay={0.1}>
              <div className="flex flex-col items-center text-center">
                <Home className="mb-6 size-12 text-[#5CA496]" />
                <h3 className="mb-3 text-xl font-medium">Artful Living</h3>
                <p className="text-muted-foreground">
                  Our thoughtfully curated space features unique art, games, and
                  creative touches throughout that reflect Ferndale's eclectic
                  spirit.
                </p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation direction="from-bottom" delay={0.2}>
              <div className="flex flex-col items-center text-center">
                <MapPin className="mb-6 size-12 text-[#5CA496]" />
                <h3 className="mb-3 text-xl font-medium">Prime Location</h3>
                <p className="text-muted-foreground">
                  Just minutes from downtown Ferndale's vibrant shops, breweries
                  and restaurants, with easy access to Royal Oak and Detroit
                  attractions.
                </p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation direction="from-bottom" delay={0.3}>
              <div className="flex flex-col items-center text-center">
                <Users className="mb-6 size-12 text-[#5CA496]" />
                <h3 className="mb-3 text-xl font-medium">
                  Comfort Meets Style
                </h3>
                <p className="text-muted-foreground">
                  Experience the perfect balance of comfort and modern design in
                  a space that welcomes both relaxation and social gatherings.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Alternating Sections */}
      <section className="bg-[#F9F9F9] py-12">
        <div className="mx-auto max-w-screen-xl px-4">
          <AlternatingSection
            title="Eclectic Design & Modern Comfort"
            description="Casa Alpaca merges eclectic design with modern comfort. Discover unique art pieces, playful decor, and thoughtful touches throughout—from the world map bedroom to the coffee and game stations. Every corner offers Instagram-worthy moments in a space that feels both inspiring and homey."
            imageSrc="/images/casa-alpaca-living.jpg"
            imageAlt="Eclectic living room with fireplace and modern furnishings"
          />

          <AlternatingSection
            title="Entertainment & Relaxation"
            description="Whether you're challenging friends to a board game, working out in the basement gym with cool green lighting, or unwinding by the outdoor fire pit, Casa Alpaca offers spaces for every mood. The home includes a dedicated workspace, smart TVs, and plenty of areas to socialize or find solitude."
            imageSrc="/images/game-room-coffee-station.jpg"
            imageAlt="Game room with coffee station and entertainment options"
            reversed={true}
          />

          <AlternatingSection
            title="Ideal Ferndale Location"
            description="Located in a charming, walkable neighborhood, Casa Alpaca puts you minutes from Ferndale's vibrant downtown scene. Explore local favorites like Ferndale Project brewery, Valentine Distilling, and The Rust Belt Market. With easy access to Detroit and Royal Oak, it's the perfect home base for your Michigan adventure."
            imageSrc="/images/casa-alpaca-patio.jpg"
            imageAlt="Casa Alpaca outdoor patio area"
          />
        </div>
      </section>

      {/* Gallery Section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-screen-xl px-4">
          <ScrollAnimation direction="from-bottom">
            <h2 className="mb-12 text-center text-3xl font-medium md:text-4xl">
              Explore Casa Alpaca
            </h2>
          </ScrollAnimation>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                src: "/images/casa-alpaca-dining.jpg",
                alt: "Dining Area with Chess Set"
              },
              {
                src: "/images/coffee-bar-chess-setup.jpg",
                alt: "Coffee Bar and Chess Setup"
              },
              {
                src: "/images/basement-gym-green-lighting.jpg",
                alt: "Basement Gym with Green Lighting"
              },
              {
                src: "/images/casa-alpaca-kitchen.jpg",
                alt: "Modern Kitchen"
              },
              {
                src: "/images/bedroom-world-map-decor.jpg",
                alt: "Bedroom with World Map Decor"
              },
              {
                src: "/images/casa-alpaca-office.jpg",
                alt: "Home Office Space"
              }
            ].map((image, index) => (
              <ScrollAnimation key={index} direction="zoom" delay={index * 0.1}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </ScrollAnimation>
            ))}
          </div>

          <ScrollAnimation direction="from-bottom" delay={0.2}>
            <div className="mt-12 text-center">
              <Link href="/property">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full border-[#5CA496] text-[#5CA496] hover:bg-[#5CA496] hover:text-white"
                >
                  View Full Gallery
                </Button>
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-[#1A1A1A] py-24 text-white">
        <div className="mx-auto max-w-screen-xl px-4">
          <h2 className="mb-16 text-center text-4xl font-medium tracking-tight md:text-5xl">
            What Our Guests Say
          </h2>

          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* Ferndale Highlights Section */}
      <section className="bg-[#F9F9F9] py-24">
        <div className="mx-auto max-w-screen-xl px-4">
          <ScrollAnimation direction="from-bottom">
            <h2 className="mb-12 text-center text-3xl font-medium md:text-4xl">
              Discover Ferndale
            </h2>
          </ScrollAnimation>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <ScrollAnimation direction="from-bottom" delay={0.1}>
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-xl font-medium text-[#5CA496]">
                  Vibrant Downtown
                </h3>
                <p className="text-muted-foreground mb-4">
                  Explore the eclectic shops, cafes, and restaurants along 9
                  Mile Road and Woodward Avenue, just minutes from Casa Alpaca.
                </p>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li>• The Rust Belt Market - Artisan goods & unique finds</li>
                  <li>• Valentine Distilling - Award-winning craft spirits</li>
                  <li>
                    • Ferndale Project - Experimental brewery & community hub
                  </li>
                </ul>
              </div>
            </ScrollAnimation>

            <ScrollAnimation direction="from-bottom" delay={0.2}>
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-xl font-medium text-[#E27D60]">
                  Food & Drink Scene
                </h3>
                <p className="text-muted-foreground mb-4">
                  Ferndale is known for its diverse culinary offerings, from
                  casual eateries to fine dining experiences.
                </p>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li>• Howe's Bayou - Cajun classics & cocktails</li>
                  <li>• Blue Nile - Ethiopian dining experience</li>
                  <li>• The Emory - Gastropub with craft cocktails</li>
                  <li>
                    • Numerous cafes and coffee shops within walking distance
                  </li>
                </ul>
              </div>
            </ScrollAnimation>

            <ScrollAnimation direction="from-bottom" delay={0.3}>
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-xl font-medium text-[#5CA496]">
                  Events & Activities
                </h3>
                <p className="text-muted-foreground mb-4">
                  There's always something happening in Ferndale, from weekly
                  events to annual festivals.
                </p>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li>• Monday Trivia Nights at local breweries</li>
                  <li>• Ferndale Blues Festival (winter)</li>
                  <li>• Ferndale Pride (summer)</li>
                  <li>• DIY Street Fair (fall)</li>
                  <li>• Holiday Ice Festival (winter)</li>
                </ul>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-screen-lg px-4 text-center">
          <ScrollAnimation direction="from-bottom">
            <h2 className="mb-6 text-3xl font-medium md:text-4xl">
              Your Eclectic Getaway Awaits
            </h2>
            <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
              Book your stay at Casa Alpaca and experience the perfect blend of
              unique design, modern comfort, and an ideal location in one of
              Metro Detroit's most vibrant communities.
            </p>
            <Link href="/booking">
              <Button
                size="lg"
                className="rounded-full bg-[#E27D60] px-8 text-white hover:bg-[#C25D40]"
              >
                Book Your Stay
              </Button>
            </Link>
          </ScrollAnimation>
        </div>
      </section>

      {/* Property Highlights */}
      <AnimatedSection className="px-4 py-20 md:px-8">
        <div className="container mx-auto">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            An Eclectic Designer Haven
          </h2>
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="mb-6 text-lg">
                Experience our distinctive two-bedroom vacation rental featuring
                eclectic design, fun décor, and all the amenities you need for a
                fantastic stay.
              </p>
              <p className="mb-6 text-lg">
                Our unique space celebrates creativity with authentic art
                pieces, vintage finds, and colorful accents, creating a
                one-of-a-kind atmosphere.
              </p>
              <p className="text-lg">
                Whether you're a design enthusiast or simply looking for a
                comfortable and inspiring place to stay, Casa Alpaca delivers a
                memorable experience.
              </p>
            </div>
            <div className="overflow-hidden rounded-xl shadow-xl">
              <Image
                src="/images/bedroom-world-map-decor.jpg"
                width={600}
                height={400}
                alt="Casa Alpaca bedroom with world map decor"
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Location Section */}
      <AnimatedSection
        className={`px-4 py-20 md:px-8 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
      >
        <div className="container mx-auto">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            Ideal Ferndale Location
          </h2>
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="order-2 overflow-hidden rounded-xl shadow-xl md:order-1">
              <Image
                src="/images/casa-alpaca-dining.jpg"
                width={600}
                height={400}
                alt="Casa Alpaca dining area"
                className="h-auto w-full"
              />
            </div>
            <div className="order-1 md:order-2">
              <p className="mb-6 text-lg">
                Located just minutes from downtown Ferndale, you'll have easy
                access to amazing restaurants, shops, and entertainment.
              </p>
              <p className="mb-6 text-lg">
                Enjoy our quiet residential neighborhood while being close to
                everything the vibrant Ferndale community has to offer.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <FaUtensils className="text-xl text-amber-600" />
                  <span>Great Dining</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaStore className="text-xl text-amber-600" />
                  <span>Unique Shops</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaMountain className="text-xl text-amber-600" />
                  <span>Parks Nearby</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaParking className="text-xl text-amber-600" />
                  <span>Easy Parking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Amenities */}
      <AnimatedSection className="px-4 py-20 md:px-8">
        <div className="container mx-auto">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            Modern Amenities
          </h2>

          {/* Comfort & Essentials */}
          <h3 className="mb-6 text-2xl font-semibold">Comfort & Essentials</h3>
          <div className="mb-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <MdCleaningServices className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Sparkling Clean</h3>
              <p className="mt-1 text-sm">
                Professionally cleaned before every stay
              </p>
            </div>
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <TiWiFi className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Fast WiFi</h3>
              <p className="mt-1 text-sm">Available throughout the property</p>
            </div>
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <FaCalendarCheck className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Long-term Stays</h3>
              <p className="mt-1 text-sm">Stay for 28 days or more</p>
            </div>
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <LuBedDouble className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Comfy Beds</h3>
              <p className="mt-1 text-sm">
                With premium linens and extra pillows
              </p>
            </div>
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <GiHouseKeys className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Self Check-In</h3>
              <p className="mt-1 text-sm">Easy access with smart lock</p>
            </div>
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <FaParking className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Free Parking</h3>
              <p className="mt-1 text-sm">Convenient on-premises parking</p>
            </div>
          </div>

          {/* Kitchen & Dining */}
          <h3 className="mb-6 text-2xl font-semibold">Kitchen & Dining</h3>
          <div className="mb-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <GiCampCookingPot className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Full Kitchen</h3>
              <p className="mt-1 text-sm">
                Everything you need to prepare meals
              </p>
            </div>
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <FaUtensils className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Cooking Basics</h3>
              <p className="mt-1 text-sm">Pots, pans, oil, salt and pepper</p>
            </div>
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <FaCoffee className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Coffee Station</h3>
              <p className="mt-1 text-sm">Espresso machine, French press</p>
            </div>
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <MdOutlineTableBar className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Dining Table</h3>
              <p className="mt-1 text-sm">Seating for 4 people</p>
            </div>
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <FaUtensils className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Gas Stove</h3>
              <p className="mt-1 text-sm">For all your cooking needs</p>
            </div>
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <MdKitchen className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Full Appliances</h3>
              <p className="mt-1 text-sm">
                Dishwasher, oven, microwave, refrigerator
              </p>
            </div>
          </div>

          {/* Entertainment & Relaxation */}
          <h3 className="mb-6 text-2xl font-semibold">
            Entertainment & Relaxation
          </h3>
          <div className="mb-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <PiTelevisionSimpleFill className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Smart TVs</h3>
              <p className="mt-1 text-sm">Access to Netflix, Hulu, and more</p>
            </div>
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <PiSpeakerHifiFill className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Sound System</h3>
              <p className="mt-1 text-sm">Aux, Bluetooth connectivity</p>
            </div>
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <MdOutlineLocalFireDepartment className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Indoor Fireplace</h3>
              <p className="mt-1 text-sm">Cozy up during cooler evenings</p>
            </div>
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <FaChair className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Private Living Room</h3>
              <p className="mt-1 text-sm">Comfortable space to relax</p>
            </div>
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <MdOutlineLocalFireDepartment className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Fire Pit</h3>
              <p className="mt-1 text-sm">Outdoor enjoyment in the evenings</p>
            </div>
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <GiBarbecue className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">BBQ Grill</h3>
              <p className="mt-1 text-sm">
                Private gas grill for outdoor cooking
              </p>
            </div>
          </div>

          {/* Additional Amenities */}
          <h3 className="mb-6 text-2xl font-semibold">Additional Amenities</h3>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <FaDumbbell className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Private Gym</h3>
              <p className="mt-1 text-sm">
                Exercise equipment for your workouts
              </p>
            </div>
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <GiGrass className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Backyard</h3>
              <p className="mt-1 text-sm">Open grassy space to enjoy</p>
            </div>
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <Briefcase className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Workspace</h3>
              <p className="mt-1 text-sm">
                Dedicated desk with comfortable chair
              </p>
            </div>
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <FaBiking className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Bikes</h3>
              <p className="mt-1 text-sm">Available for exploring the area</p>
            </div>
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <GiWashingMachine className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Laundry</h3>
              <p className="mt-1 text-sm">Washer and dryer included</p>
            </div>
            <div className="flex flex-col items-center rounded-lg p-4 text-center shadow-md">
              <FaSnowflake className="mb-2 text-4xl text-amber-600" />
              <h3 className="font-semibold">Climate Control</h3>
              <p className="mt-1 text-sm">AC, heating, ceiling fans</p>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  )
}
