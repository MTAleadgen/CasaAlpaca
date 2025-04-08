# Bookable Extras Feature

This document explains how to set up and use the bookable extras feature in Casa Alpaca.

## Overview

The extras feature allows guests to add optional services to their booking, such as:
- Early check-in
- Late check-out
- Welcome baskets
- Other add-on services

Admins can manage these extras through a dedicated admin interface.

## Setup Instructions

1. **Run database migrations**

   The extras feature requires new database tables. Run the migrations:

   ```bash
   npm run db:run-migrations
   ```

   This will create the `extras` table and add some default extras.

2. **Admin Access**

   Make sure your admin user ID is set in the `.env.local` file:

   ```
   ADMIN_USER_ID=your_clerk_user_id
   ```

## Admin Features

Admins can access the extras management interface at `/admin/extras`.

### Managing Extras

- **View Extras**: See all extras with their details and status
- **Add New Extras**: Create new extras with name, description, price, and duration
- **Edit Extras**: Modify existing extras
- **Toggle Extras**: Activate or deactivate extras without deleting them
- **Delete Extras**: Remove extras that are no longer needed

### Extra Types

Each extra has a type that determines how it's used:

- `early_checkin`: Early check-in options
- `late_checkout`: Late check-out options
- `addon`: Other add-on services

## Guest Experience

Guests can select extras during the booking process. The extras appear in the "Enhance Your Stay" step of the booking flow.

## Integration with Booking System

The extras feature integrates with the booking system:

1. Guests select extras during booking
2. The price of extras is added to the total booking cost
3. Selected extras are stored with the booking record
4. Extras information is included in the booking confirmation

## API Endpoints

### Public Endpoints

- `GET /api/extras`: Returns all active extras

### Admin-Only Endpoints

- `GET /api/admin/extras`: Returns all extras (active and inactive)
- `POST /api/admin/extras`: Creates a new extra
- `GET /api/admin/extras/:id`: Returns a specific extra
- `PATCH /api/admin/extras/:id`: Updates a specific extra
- `DELETE /api/admin/extras/:id`: Deletes a specific extra

## Component Usage

To integrate extras selection into a booking form:

```tsx
import { BookingExtrasStep } from "@/components/booking/booking-extras-step"

// In your multi-step booking form
function BookingForm() {
  const [selectedExtras, setSelectedExtras] = useState([])
  
  return (
    <BookingExtrasStep
      onNext={(extras) => {
        setSelectedExtras(extras)
        // Move to next step
      }}
      onPrevious={() => {
        // Move to previous step
      }}
      initialExtras={selectedExtras} // To preserve selection
    />
  )
}
``` 