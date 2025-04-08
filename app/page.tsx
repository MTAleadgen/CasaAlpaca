import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Home, MapPin, Star, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full">
        <Image
          src="/images/casa-alpaca-hero.jpg"
          alt="Casa Alpaca - Luxury Vacation Rental"
          fill
          className="object-cover brightness-[0.85]"
          priority
        />
        <div className="absolute inset-0 mx-auto flex max-w-screen-xl flex-col items-start justify-center px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Welcome to <span className="text-primary">Casa Alpaca</span>
          </h1>
          <p className="mb-8 max-w-xl text-xl text-white/90">
            Experience luxury and tranquility in our beautiful vacation rental
            nestled in the heart of nature.
          </p>
          <Link href="/booking">
            <Button size="lg" className="rounded-full px-8">
              Book Your Stay
            </Button>
          </Link>
        </div>
      </section>

      {/* Property Overview */}
      <section className="mx-auto max-w-screen-xl px-4 py-20">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold">Your Perfect Getaway</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Casa Alpaca offers a peaceful retreat with all the comforts of home
            and the luxury of a high-end resort.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card flex flex-col items-center rounded-lg border p-6 text-center">
            <Home className="text-primary mb-4 size-12" />
            <h3 className="mb-2 text-xl font-medium">Spacious Living</h3>
            <p className="text-muted-foreground">
              3,000 sq ft of beautifully designed space with room for the whole
              family.
            </p>
          </div>

          <div className="bg-card flex flex-col items-center rounded-lg border p-6 text-center">
            <Users className="text-primary mb-4 size-12" />
            <h3 className="mb-2 text-xl font-medium">Perfect for Groups</h3>
            <p className="text-muted-foreground">
              Comfortably accommodates up to 8 guests with 4 bedrooms and 3
              bathrooms.
            </p>
          </div>

          <div className="bg-card flex flex-col items-center rounded-lg border p-6 text-center">
            <MapPin className="text-primary mb-4 size-12" />
            <h3 className="mb-2 text-xl font-medium">Prime Location</h3>
            <p className="text-muted-foreground">
              Minutes from hiking trails, restaurants, and local attractions.
            </p>
          </div>

          <div className="bg-card flex flex-col items-center rounded-lg border p-6 text-center">
            <Calendar className="text-primary mb-4 size-12" />
            <h3 className="mb-2 text-xl font-medium">Flexible Stays</h3>
            <p className="text-muted-foreground">
              From weekend getaways to extended vacations, we accommodate your
              schedule.
            </p>
          </div>
        </div>
      </section>

      {/* Property Gallery */}
      <section className="bg-muted/50 py-16">
        <div className="mx-auto max-w-screen-xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Explore Our Property
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(num => (
              <div
                key={num}
                className="relative aspect-[4/3] overflow-hidden rounded-lg"
              >
                <Image
                  src={`/images/casa-alpaca-${num}.jpg`}
                  alt={`Casa Alpaca - Image ${num}`}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/gallery">
              <Button variant="outline" size="lg">
                View Full Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-screen-xl px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">
          What Our Guests Say
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-background flex flex-col rounded-lg border p-6"
            >
              <div className="mb-4 flex items-center">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`size-5 ${i < testimonial.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground mb-4 flex-1">
                "{testimonial.text}"
              </p>
              <div className="mt-auto">
                <p className="font-medium">{testimonial.name}</p>
                <p className="text-muted-foreground text-sm">
                  {testimonial.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/10 px-4 py-20">
        <div className="mx-auto max-w-screen-xl text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready for an Unforgettable Stay?
          </h2>
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-xl">
            Book your dates now and experience the perfect blend of comfort,
            luxury, and natural beauty at Casa Alpaca.
          </p>
          <Link href="/booking">
            <Button size="lg" className="rounded-full px-8">
              Check Availability
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

const testimonials = [
  {
    name: "Emily & Family",
    rating: 5,
    text: "Casa Alpaca exceeded all our expectations! The house is stunning, spacious, and has everything you could possibly need. We especially loved the outdoor deck and amazing views.",
    date: "July 2023"
  },
  {
    name: "Michael T.",
    rating: 5,
    text: "Our stay was absolutely perfect. The hosts thought of every detail, and the house is even more beautiful than the pictures show. We'll definitely be coming back!",
    date: "March 2023"
  },
  {
    name: "Sarah & James",
    rating: 5,
    text: "We celebrated our anniversary at Casa Alpaca and couldn't have chosen a better place. The privacy, luxurious amenities, and stunning setting made for an unforgettable getaway.",
    date: "October 2023"
  }
]
