import { Booking, BookingStatus, TripType } from './types';

export const APP_NAME = "DriverLink - Booking Share";
// export const CURRENT_DRIVER_ID = "DRV-001"; // Removed: To be derived from logged-in user

export const WHEN_NEEDED_OPTIONS = [
  { value: 'now', labelKey: 'bookingFormWhenNow' },
  { value: 'later', labelKey: 'bookingFormWhenLater' },
];

export const PACKAGE_HOURS_OPTIONS = [
  { value: '4hrs', label: '4 Hrs' },
  { value: '6hrs', label: '6 Hrs' },
  { value: '8hrs', label: '8 Hrs' },
  { value: '10hrs', label: '10 Hrs' },
  { value: '12hrs', label: '12 Hrs' },
];

export const OUTSTATION_TRIP_TYPE_OPTIONS = [
  { value: 'oneWay', labelKey: 'bookingFormOutstationOneWay' },
  { value: 'roundTrip', labelKey: 'bookingFormOutstationRoundTrip' },
];

export const ESTIMATED_USAGE_OPTIONS = [
  { value: '1day', label: '1 Day' },
  { value: '2days', label: '2 Days' },
  { value: '3days', label: '3 Days' },
  { value: '12hrs', label: '12 Hrs (within day)'},
  { value: '200km', label: 'Approx 200 KM'},
  { value: '300km', label: 'Approx 300 KM'},
  { value: 'custom', labelKey: 'bookingFormCustomUsage'},
];

export const CAR_TRANSMISSION_OPTIONS = [
  { value: 'manual', labelKey: 'bookingFormCarManual' },
  { value: 'auto', labelKey: 'bookingFormCarAuto' },
  { value: 'any', labelKey: 'bookingFormCarAny' },
];

export const CAR_MODEL_TYPE_OPTIONS = [
  { value: 'hatchback', labelKey: 'bookingFormCarHatchback' },
  { value: 'sedan', labelKey: 'bookingFormCarSedan' },
  { value: 'suv', labelKey: 'bookingFormCarSuv' },
  { value: 'any', labelKey: 'bookingFormCarAnyType' },
];


// Sample bookings for demonstration - now empty for "live" data
export const SAMPLE_BOOKINGS: Booking[] = [];
