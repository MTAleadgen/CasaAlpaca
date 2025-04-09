"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Star, ArrowLeft } from "lucide-react"

export default function TestimonialsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const testimonialsPerPage = 3
  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage)

  // Get current testimonials
  const indexOfLastTestimonial = currentPage * testimonialsPerPage
  const indexOfFirstTestimonial = indexOfLastTestimonial - testimonialsPerPage
  const currentTestimonials = testimonials.slice(
    indexOfFirstTestimonial,
    indexOfLastTestimonial
  )

  // Change page
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center text-sm font-medium"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Home
        </Link>
        <h1 className="mb-2 text-4xl font-bold">Guest Reviews</h1>
        <p className="text-muted-foreground text-xl">
          See what our {testimonials.length} guests have to say about their
          stays at Casa Alpaca
        </p>
      </div>

      {/* Stats Summary */}
      <div className="bg-card mb-12 rounded-lg border p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-medium">Overall Rating</p>
            <div className="mt-2 flex items-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="size-6 fill-yellow-500 text-yellow-500"
                  />
                ))}
              </div>
              <span className="ml-2 text-lg font-medium">5.0</span>
              <span className="text-muted-foreground ml-2">
                ({testimonials.length} reviews)
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Cleanliness</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-yellow-500 text-yellow-500"
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Location</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-yellow-500 text-yellow-500"
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Communication</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-yellow-500 text-yellow-500"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mb-12 space-y-6">
        {currentTestimonials.map((testimonial, index) => (
          <div
            key={testimonial.id || index}
            className="bg-card rounded-lg border p-6 transition-all hover:shadow-md"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="font-medium">{testimonial.name}</p>
                <p className="text-muted-foreground text-sm">
                  {testimonial.location} · {testimonial.date}
                </p>
              </div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`size-5 ${
                      i < testimonial.rating
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-base">
              "{testimonial.text || "Excellent stay!"}"
            </p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>

        {Array.from({ length: totalPages }).map((_, index) => {
          const pageNumber = index + 1
          // Show first page, last page, current page and pages around current page
          if (
            pageNumber === 1 ||
            pageNumber === totalPages ||
            (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
          ) {
            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(pageNumber)}
                className="min-w-[40px]"
              >
                {pageNumber}
              </Button>
            )
          }
          // Show ellipsis
          if (
            (pageNumber === currentPage - 3 && pageNumber > 1) ||
            (pageNumber === currentPage + 3 && pageNumber < totalPages)
          ) {
            return (
              <span key={pageNumber} className="text-muted-foreground px-2">
                ...
              </span>
            )
          }
          return null
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

// Define testimonials array with an id property
const testimonials = [
  {
    id: 1,
    name: "Tatiana",
    location: "3 years on Airbnb",
    rating: 5,
    text: "Great!",
    date: "February 2023"
  },
  {
    id: 2,
    name: "Damon",
    location: "7 months on Airbnb",
    rating: 5,
    text: "Nice! I had an Airbnb no problem at all. Very clean and updated.",
    date: "February 2023"
  },
  {
    id: 3,
    name: "Michael",
    location: "Paw Paw, Michigan",
    rating: 5,
    text: "Nice place, had lots of set up in the home. Enjoyed the local area food. Michael was a great host...will definitely stay again.",
    date: "February 2023"
  },
  {
    id: 4,
    name: "Chandler",
    location: "Cincinnati, Ohio",
    rating: 5,
    text: "Nice place to stay, very helpful and responsive host.",
    date: "February 2023"
  },
  {
    id: 5,
    name: "Dulce",
    location: "Oak Park, Michigan",
    rating: 5,
    text: "Michael is a great host, I felt so comfortable, and he was super friendly.",
    date: "February 2023"
  },
  {
    id: 6,
    name: "Eric",
    location: "Rochester Hills, Michigan",
    rating: 5,
    text: "Walkable area, friendly neighbors, appreciate it's dog friendly. Offered local accommodations with original plans fell through.",
    date: "February 2023"
  },
  {
    id: 7,
    name: "Jamie",
    location: "Muskegon, Michigan",
    rating: 5,
    text: "Excellent stay!",
    date: "February 2023"
  },
  {
    id: 8,
    name: "Rebecca",
    location: "Akron, Ohio",
    rating: 5,
    text: "Michael is a great host and very attentive! He helped resolve any issues we had. It was a very homey place & very nice. A quiet & nice neighborhood.",
    date: "February 2023"
  },
  {
    id: 9,
    name: "Jordan",
    location: "Cleveland, Ohio",
    rating: 5,
    text: "The place was cozy and like home. Michael was a very attentive host, checking in to make sure everything was running smoothly. We brought our dog and the place was pet friendly. The location was close to everything we needed to do during our stay in Detroit. I would definitely recommend this place for someone visiting the Detroit area.",
    date: "February 2023"
  },
  {
    id: 10,
    name: "Brendan",
    location: "3 years on Airbnb",
    rating: 5,
    text: "Michael was such a welcoming host!",
    date: "February 2023"
  },
  {
    id: 11,
    name: "Elijah",
    location: "Las Vegas, Nevada",
    rating: 5,
    text: "Michael was hospitable, helpful, and great with instructions. I would definitely recommend booking with him as I will again!",
    date: "February 2023"
  },
  {
    id: 12,
    name: "Adjowa",
    location: "Los Angeles, California",
    rating: 5,
    text: "Michael was super accommodating and made sure my friend and I were comfortable at his place. The home had great lighting, lots of space, and was in a beautiful neighborhood.",
    date: "January 2023"
  },
  {
    id: 13,
    name: "Jason",
    location: "Regina, Canada",
    rating: 5,
    text: "Perfect home for couple or just person. Great location, nice and quiet. Would stay again!",
    date: "January 2023"
  },
  {
    id: 14,
    name: "Erik",
    location: "Livonia, Michigan",
    rating: 5,
    text: "Excellent stay!",
    date: "January 2023"
  },
  {
    id: 15,
    name: "Scott Andrew",
    location: "Portland, Michigan",
    rating: 5,
    text: "Great host, clean house. I'd definitely stay again.",
    date: "January 2023"
  },
  {
    id: 16,
    name: "Dullio",
    location: "Denver, Illinois",
    rating: 5,
    text: "Michael provided all the amenities you needed and then some. I would love to come back here if I'm ever visiting Michigan again.",
    date: "January 2023"
  },
  {
    id: 17,
    name: "Zayed",
    location: "Detroit, Michigan",
    rating: 5,
    text: "My stay was great and serene, his house was nice and felt like home. I loved the technology throughout the area. I would stay here again for sure!",
    date: "January 2023"
  },
  {
    id: 18,
    name: "Robert",
    location: "Cleveland, Ohio",
    rating: 5,
    text: "Excellent stay!",
    date: "2 weeks ago"
  },
  {
    id: 19,
    name: "Christina",
    location: "Columbus, Ohio",
    rating: 5,
    text: "Michael's place was clean, comfy, cozy, and well stocked. I loved the mattress and slept so well. Michael was great with communication. I would definitely stay again!",
    date: "2 weeks ago"
  },
  {
    id: 20,
    name: "Riley",
    location: "Chicago, Illinois",
    rating: 5,
    text: "Michael's place was perfectly located! The neighborhood was cute and quiet and super close to Downtown Detroit. Michael was also an amazing host and communicated so well. Would absolutely stay again.",
    date: "2 weeks ago"
  },
  {
    id: 21,
    name: "Keira",
    location: "Evansville, Indiana",
    rating: 5,
    text: "Great host and great location. Accurate photos. Responsive host and checked on us during the stay.",
    date: "2 weeks ago"
  },
  {
    id: 22,
    name: "Tom",
    location: "Lorain, Ohio",
    rating: 5,
    text: "Clean and great location. A+ host.",
    date: "March 2023"
  },
  {
    id: 23,
    name: "Cordney",
    location: "Detroit, Michigan",
    rating: 5,
    text: "Best airbnb host I've encountered! 100% will be returning.",
    date: "March 2023"
  },
  {
    id: 24,
    name: "Jessica",
    location: "Columbus, Ohio",
    rating: 5,
    text: "Great place to stay in a very cute neighborhood. Michael was very helpful and we had great communication throughout the stay.",
    date: "March 2023"
  },
  {
    id: 25,
    name: "Adrienne",
    location: "Chicago, Illinois",
    rating: 5,
    text: "Wonderful home, very clean and comfortable. Great location, close to downtown Detroit as well as Ferndale & Royal Oak. The neighborhood was great to walk my dogs though! Michael was friendly and responsive.",
    date: "March 2023"
  },
  {
    id: 26,
    name: "Ryan",
    location: "Toronto, Canada",
    rating: 5,
    text: "The best!",
    date: "March 2023"
  },
  {
    id: 27,
    name: "James",
    location: "Queensbury, New York",
    rating: 5,
    text: "Michael was a great host. Extremely proactive in making sure we received entry to the space and that everything was functioning properly. Everything was exactly as the reviews had said. The wifi was great, he had a multitude of kitchen equipment, and even smart TVs. The electronic kettle for tea with was great for me. We will definitely try to stay there again the next time we are in the area.",
    date: "March 2023"
  },
  {
    id: 28,
    name: "Andrew",
    location: "Grand Rapids, Michigan",
    rating: 5,
    text: "Would stay here again in the future.",
    date: "February 2023"
  },
  {
    id: 29,
    name: "Leroy",
    location: "Plainwell, Michigan",
    rating: 5,
    text: "Michael was an excellent host. Room was amazing. Highly recommend.",
    date: "1 day ago"
  },
  {
    id: 30,
    name: "Timayna",
    location: "Detroit, Michigan",
    rating: 5,
    text: "My stay here was absolutely enjoyable. Everything was perfect. Check-in was easy and Michael was flexible with check in and check out times which made it convenient for me. The loft is absolutely cozy. I'd stay here again.",
    date: "2 days ago"
  },
  {
    id: 31,
    name: "Rachael",
    location: "Ann Arbor, Michigan",
    rating: 5,
    text: "What a nice spot! This is a nice Ferndale neighborhood close to the downtown. The place was clean and had a sweet board game bookshelf. I was impressed with how well appointed the kitchenette was with modern touches and all you need for a comfortable stay. Overall this was a pleasant stay and I wish I'd been able to stay longer. Thank you, Michael!",
    date: "4 days ago"
  },
  {
    id: 32,
    name: "Bradley",
    location: "Evansville, Indiana",
    rating: 5,
    text: "My stay in Michael's home has been the best experience I've had with Airbnb. The location is perfect, the home is tidy and very clean but not sterile - cozy and inviting. Michael is very responsive and helpful - there is a special set of instructions for all the tech in the living room and passwords to share.",
    date: "5 days ago"
  },
  {
    id: 33,
    name: "Erick",
    location: "Atlanta, Georgia",
    rating: 5,
    text: "I truly never expected to enjoy an Airbnb so much - it's the perfect place with the best hospitality! Michael's place is the best option if you're visiting SE Michigan, it is a short drive to Downtown Detroit, and very close to Royal Oak/Birmingham neighborhoods. It has everything you'd need, no matter how long you stay. There was plenty of parking, honestly or street.",
    date: "1 week ago"
  },
  {
    id: 34,
    name: "Harley",
    location: "Portage, Wisconsin",
    rating: 5,
    text: "Michael was one of the nicest hosts I've ever had. He was quick to respond to any questions/needs and perfect in his home for our visit. If I'm back in the area definitely staring there again. Great place!",
    date: "1 week ago"
  },
  {
    id: 35,
    name: "Kinaale",
    location: "Avon, Michigan",
    rating: 5,
    text: "This place was comfortable. Lots of stuff art and cool things throughout the place. Michael was amazing as a host. I was never short with anything I needed, he provided everything I needed.",
    date: "1 week ago"
  },
  {
    id: 36,
    name: "Dana",
    location: "Columbus, Ohio",
    rating: 5,
    text: "Had an amazing stay. Would definitely book again. The neighborhood was nice and quiet. The place was clean and comfortable. Michael was phenomenal host throughout the trip and recommended nice restaurants to really hit the spot. He truly knows how to host and make people feel at home.",
    date: "2 weeks ago"
  }
]
