export type Doctor = {
  id: string;
  name: string;
  specialty?: string;
  clinicName?: string;
  address?: string;
  bio?: string;
  yearsExp?: number;
  patientsCount?: number;
  rating?: number;
  consultationFee?: number;
  photoUrl?: string;
};

export type Slot = {
  id: string;
  doctorId: string;
  startUtc: number;
  endUtc: number;
  status: 'available' | 'booked';
  bookedBy?: string | null;
};

export type Fee = {
  consultation: number;
  platform: number;
  total: number;
  currency: 'LKR';
};

export type Appointment = {
  id: string;           // same as slotId
  slotId: string;
  doctorId: string;
  patientId: string;
  patientName?: string;
  startUtc: number;
  endUtc: number;
  status: 'booked' | 'canceled';
  notes?: string; 
  fee: Fee;
  createdAt: number;
  canceledAt?: number;
};