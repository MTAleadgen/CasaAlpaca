import BookingForm from "@/components/booking/booking-form"

export const metadata = {
  title: "Book Your Stay | Casa Alpaca",
  description:
    "Book your perfect getaway at Casa Alpaca, a charming vacation rental with modern amenities"
}

export default function BookingPage() {
  return (
    <div className="py-12">
      <div className="container max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">
            Book Your Stay
          </h1>
          <p className="text-muted-foreground mx-auto max-w-xl">
            Complete the form below to book your dates at Casa Alpaca. Select
            your preferred options and we'll confirm your reservation right
            away.
          </p>
        </div>

        <BookingForm />
      </div>
    </div>
  )
}
