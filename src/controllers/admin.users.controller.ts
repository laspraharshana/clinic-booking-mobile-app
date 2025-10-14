// =================================================================
// 1. IMPORTS (Now using real modules)
// =================================================================
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// ✅ IMPORT the real getAuth function and UserRecord type from the Firebase Admin SDK
import { getAuth, UserRecord } from 'firebase-admin/auth';

// ✅ IMPORT your actual users repository
import { usersRepo } from '../repositories/users.repo.js';

// ✅ IMPORT the single source of truth for your UserProfile type from the repository
import type { UserProfile } from '../repositories/users.repo.js';

// =================================================================
// 🛑 ALL MOCK INTERFACES AND IMPLEMENTATIONS HAVE BEEN REMOVED
// =================================================================

// =================================================================
// 2. CONTROLLER LOGIC (Using the real implementations)
// =================================================================

const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
});

/**
 * Creates a new user with an 'admin' role in both Firebase Auth and Firestore.
 */
export async function createAdminUser(req: Request, res: Response, next: NextFunction) {
  try {
    // 1) Validate the incoming request body
    const { email, password, name, phone } = createAdminSchema.parse(req.body);

    // 2) Create the user in Firebase Authentication using the REAL SDK
    // The 'userRecord' object contains the new user's data, including the real UID.
    const userRecord: UserRecord = await getAuth().createUser({
      email,
      password,
      displayName: name || undefined,
      phoneNumber: phone && phone.trim() !== '' ? phone : undefined,
    });

    // 3) Set a custom claim on the user to identify them as an admin
    // This is crucial for securing your frontend and backend routes.
    await getAuth().setCustomUserClaims(userRecord.uid, { role: 'admin' });

    // 4) Prepare the user profile data for Firestore
    // We only create the data the controller is responsible for.
    // The repository will handle setting 'createdAt' and 'updatedAt'.
    const profileData: Partial<Omit<UserProfile, 'id'>> = {
      role: 'admin',
      name: name ?? '',
      phone: phone ?? '',
      photoUrl: null, // Use `null` to explicitly set the field as empty in Firestore
    };
    
    // 5) Create the user's profile document in Firestore via the repository
    await usersRepo.upsert(userRecord.uid, profileData);

    // 6) Send a success response with the new user's real data
    res.status(201).json({
      data: {
        uid: userRecord.uid, // ✅ This is now the REAL UID from Firebase
        email: userRecord.email,
        role: 'admin',
      },
    });
  } catch (e) {
    // If any step fails, pass the error to the Express error handler
    next(e);
  }
}