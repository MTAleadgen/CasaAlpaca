/*
Contains the utility functions for the app.
*/

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as USD currency
 * @param amount The amount to format
 * @returns Formatted currency string (e.g., $50.00)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
  }).format(amount)
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param date The date to check
 * @returns True if the date is a weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // 0 is Sunday, 6 is Saturday
}

/**
 * Get all dates in a range (inclusive of start and end dates)
 * @param startDate The start date
 * @param endDate The end date
 * @returns Array of dates in the range
 */
export function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []
  const currentDate = new Date(startDate)

  // Adjust to start of day to make comparisons simpler
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)
  currentDate.setHours(0, 0, 0, 0)

  // Add dates until we reach endDate
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

/**
 * Calculate the number of nights between two dates
 * @param checkInDate The check-in date
 * @param checkOutDate The check-out date
 * @returns Number of nights
 */
export function calculateNights(checkInDate: Date, checkOutDate: Date): number {
  const oneDay = 24 * 60 * 60 * 1000 // hours*minutes*seconds*milliseconds
  const diffDays = Math.round(
    Math.abs((checkOutDate.getTime() - checkInDate.getTime()) / oneDay)
  )
  return diffDays
}

/**
 * Convert a date to ISO format but only the date part (YYYY-MM-DD)
 * @param date The date to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateToISODate(date: Date): string {
  return date.toISOString().split("T")[0]
}

/**
 * Check if two date ranges overlap
 * @param range1Start Start of first range
 * @param range1End End of first range
 * @param range2Start Start of second range
 * @param range2End End of second range
 * @returns True if the ranges overlap
 */
export function dateRangesOverlap(
  range1Start: Date,
  range1End: Date,
  range2Start: Date,
  range2End: Date
): boolean {
  return range1Start <= range2End && range2Start <= range1End
}
