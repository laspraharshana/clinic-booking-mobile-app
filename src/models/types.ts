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
