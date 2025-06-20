

export interface Client {
  id: string;
  name: string;
  phone?: string; // Optional
}

export enum BookingStatus {
  PERSONAL = "Personal", // Booking belongs to the current driver
  OFFERED = "Offered",   // Booking is offered to the shared pool (by current driver or others)
  
  // Statuses for rides assigned to the current driver (My Active Rides progression)
  ASSIGNED = "Assigned", // Initial status after current driver claims from pool
  CONFIRMED = "Confirmed",
  TRIP_STARTED = "Trip Started",
  ON_TRIP = "On Trip",
  TRIP_ENDED = "Trip Ended", // Ride finished, pending final confirmation to Completed
  COMPLETED = "Completed", // Ride successfully completed and archived

  // Status for a booking originally offered by the current driver, but claimed by someone else
  TAKEN_BY_OTHER = "Taken by Other",

  CANCELLED = "Cancelled" // Booking has been cancelled
}

export enum TripType {
  ONE_WAY = "One Way",
  ROUND_TRIP = "Round Trip",
  OUTSTATION = "Outstation",
}

export interface Booking {
  id: string;
  clientName: string; 
  pickupLocation: string;
  dropoffLocation?: string; // Optional for Round Trip
  dateTime: string; // ISO string
  notes?: string;
  status: BookingStatus;
  originalDriverId?: string; 
  claimedByDriverId?: string; 

  // Fields for categorized booking form
  tripType: TripType;
  whenNeeded?: 'now' | 'later';
  // One Way specific (though dateTime is already present, whenNeeded helps determine its meaning)
  // Round Trip specific
  packageHours?: string;
  // Outstation specific
  outstationTripType?: 'oneWay' | 'roundTrip'; // Outstation can be one-way or round-trip
  estimatedUsage?: string; // e.g., "12 Hrs", "2 Days"

  // Car Type common for all
  carTransmission?: 'manual' | 'auto' | 'any'; // Changed from 'manual' | 'auto'
  carModelType?: 'hatchback' | 'sedan' | 'suv' | 'any';
}

// User interface for authentication
export interface User {
  id: string;
  name: string;
  email: string;
  // password will not be stored here, it's for input only
}

// View type for Sidebar navigation - moved from Sidebar.tsx to types.ts for broader use
export type View = 'profile' | 'dashboard' | 'history' | 'settings' | 'login' | 'signup';

// Specification for car features
export interface CarSpecification {
  label: string;
  value: string;
}

// Car interface for DreamCarGenerator (and potentially other features)
export interface Car {
  id: string;
  make: string;
  model: string;
  year: number; // Or string if preferred, number is better for comparisons
  imageUrl: string;
  description: string;
  specs: CarSpecification[];
  color: string;
}