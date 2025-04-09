CREATE TYPE "public"."membership" AS ENUM('free', 'pro');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'cancelled', 'error');--> statement-breakpoint
CREATE TYPE "public"."block_source" AS ENUM('manual', 'ical_vrbo', 'ical_airbnb', 'direct_booking');--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"membership" "membership" DEFAULT 'free' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "extras" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"price" integer NOT NULL,
	"duration" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"address" text NOT NULL,
	"property_type" text NOT NULL,
	"listing_type" text NOT NULL,
	"max_guests" integer NOT NULL,
	"specs" jsonb NOT NULL,
	"rules" jsonb NOT NULL,
	"amenities" jsonb NOT NULL,
	"photos" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_extras" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"extra_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"check_in_date" timestamp NOT NULL,
	"check_out_date" timestamp NOT NULL,
	"guest_name" text NOT NULL,
	"guest_email" text NOT NULL,
	"guest_phone" text NOT NULL,
	"num_guests" integer NOT NULL,
	"total_amount" integer NOT NULL,
	"price_breakdown" jsonb NOT NULL,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"stripe_payment_intent_id" text,
	"stripe_payment_intent_secret" text,
	"booking_source" text DEFAULT 'direct' NOT NULL,
	"applied_gift_card_id" uuid,
	"applied_gift_card_amount" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "availability_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"reason" text,
	"source" "block_source" NOT NULL,
	"external_event_id" text,
	"external_sync_data" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking_extras" ADD CONSTRAINT "booking_extras_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_extras" ADD CONSTRAINT "booking_extras_extra_id_extras_id_fk" FOREIGN KEY ("extra_id") REFERENCES "public"."extras"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_blocks" ADD CONSTRAINT "availability_blocks_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "extras_name_idx" ON "extras" USING btree ("name");