import { Request, Response, NextFunction } from 'express';
import { getFirebaseAdmin } from '../firebase/admin';
import { userRepository } from '../repositories/userRepository';
import { UserProfile, UserRole } from '../../src/types';

export interface AuthenticatedRequest extends Request {
  user?: UserProfile;
  firebaseToken?: {
    uid: string;
    email?: string;
    admin?: boolean;
    email_verified?: boolean;
    [key: string]: unknown;
  };
}

/**
 * Server-side Administrator Allowlist (UIDs, never mutable emails or client claims).
 * Loaded dynamically on each request to allow immediate revocation when updated.
 */
export function getAdminUids(): string[] {
  return (process.env.ADMIN_UIDS || '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);
}

/**
 * Single authoritative server-side administrator check.
 * Strictly checks:
 * 1. Verified Firebase ID Token custom claim: admin === true
 * 2. Presence of UID in server-side ADMIN_UIDS allowlist
 *
 * NEVER trusts mutable user.role stored in Firestore.
 */
export function isAdministrator(
  uid: string,
  decodedToken?: { admin?: boolean; [key: string]: unknown }
): boolean {
  if (!uid) return false;
  if (decodedToken && decodedToken.admin === true) {
    return true;
  }
  const allowlist = getAdminUids();
  return allowlist.includes(uid);
}

/**
 * Strict Firebase ID token verification middleware.
 * Verifies cryptographic signatures, issuer, expiry, and revocation via Firebase Admin SDK.
 * Never accepts arbitrary strings, mock tokens, or unverified JWT payloads.
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required. Missing or malformed Bearer authorization header.',
    });
  }

  const token = authHeader.split('Bearer ')[1].trim();
  if (!token) {
    return res.status(401).json({ error: 'Authentication token is empty.' });
  }

  const { auth: adminAuth, isLive } = getFirebaseAdmin();

  // If Firebase Admin SDK is not initialized, return a clear service-configuration error.
  // Never fall back to accepting arbitrary unverified strings.
  if (!adminAuth || !isLive) {
    console.error('[requireAuth] Firebase Admin authentication service is not configured on the server.');
    return res.status(503).json({
      error:
        'Firebase Authentication service is unavailable on the server. Please configure FIREBASE_PROJECT_ID or service account credentials.',
    });
  }

  try {
    // Check revocation (checkRevoked = true) to immediately block revoked or disabled credentials
    const decodedToken = await adminAuth.verifyIdToken(token, true);
    const uid = decodedToken.uid;
    const email = decodedToken.email || '';
    const name = (decodedToken.name as string) || email.split('@')[0] || 'Tea Grower';

    req.firebaseToken = decodedToken;

    // Determine administrator authorization strictly from trusted server sources
    const adminAuthorized = isAdministrator(uid, decodedToken);
    const authoritativeRole: UserRole = adminAuthorized ? 'admin' : 'farmer';

    // Retrieve or create persistent user profile in Firestore
    let user = await userRepository.getUser(uid);

    if (!user) {
      user = {
        uid,
        name,
        email: email || `${uid}@croplens.lk`,
        role: authoritativeRole,
        preferredLanguage: 'en',
        createdAt: new Date().toISOString(),
      };
      await userRepository.upsertUser(user);
    } else if (user.role !== authoritativeRole) {
      // Reconcile user role to match server authority
      user = { ...user, role: authoritativeRole };
      await userRepository.upsertUser(user);
    }

    req.user = user;
    next();
  } catch (err: unknown) {
    console.warn('[requireAuth] Token verification failed:', err instanceof Error ? err.message : err);
    return res.status(401).json({
      error: 'Invalid, expired, or revoked Firebase authentication token. Please sign in again.',
    });
  }
}

/**
 * Strict administrator authorization middleware.
 * Enforces that caller holds verified administrator status from trusted server authority.
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.user.uid) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const adminAuthorized = isAdministrator(req.user.uid, req.firebaseToken);

  if (!adminAuthorized) {
    return res.status(403).json({
      error: 'Access denied. You do not possess verified administrator privileges for this operation.',
    });
  }

  next();
}
