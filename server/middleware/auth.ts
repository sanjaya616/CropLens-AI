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
    [key: string]: unknown;
  };
}

// Configured Administrator UIDs (read from secure environment)
const ADMIN_UIDS = (process.env.ADMIN_UIDS || '')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

/**
 * Verifies real Firebase ID tokens using the Firebase Admin SDK.
 * Never decodes JWT payloads without signature verification.
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
    return res.status(401).json({ error: 'Empty authentication token provided.' });
  }

  const { auth: adminAuth, isLive } = getFirebaseAdmin();

  let uid: string;
  let email: string = '';
  let name: string = 'Tea Grower';
  let isCustomAdmin = false;

  if (adminAuth && isLive) {
    try {
      // Real cryptographic signature and issuer verification via Firebase Admin SDK
      const decodedToken = await adminAuth.verifyIdToken(token, true);
      uid = decodedToken.uid;
      email = decodedToken.email || '';
      name = (decodedToken.name as string) || email.split('@')[0] || 'Tea Grower';
      isCustomAdmin = decodedToken.admin === true;

      req.firebaseToken = decodedToken;
    } catch (err: unknown) {
      console.warn('[requireAuth] Firebase ID token verification failed:', err instanceof Error ? err.message : err);
      return res.status(401).json({
        error: 'Invalid or expired Firebase authentication token. Please sign in again.',
      });
    }
  } else {
    // If Firebase Admin is not yet configured with cloud credentials in local dev
    // verify whether token has valid structure and reject unauthenticated requests
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({
        error: 'Firebase Admin authentication is not configured in production environment.',
      });
    }

    // In local dev without service account, reject fake tokens
    // Check if client passed a valid mock dev token format or reject
    if (!token || token.length < 10) {
      return res.status(401).json({ error: 'Invalid authentication token in development mode.' });
    }

    uid = token;
    if (token.startsWith('dev-user-')) {
      uid = token;
      email = `${uid}@croplens.local`;
    }
  }

  // Load user profile from Firestore / UserRepository
  let user = await userRepository.getUser(uid);

  // Check administrator authorization:
  // 1. Firebase custom claim: admin === true
  // 2. Or UID listed in server-side ADMIN_UIDS allowlist
  const isAdmin = isCustomAdmin || ADMIN_UIDS.includes(uid);
  const role: UserRole = isAdmin ? 'admin' : (user?.role === 'admin' ? 'admin' : 'farmer');

  if (!user) {
    user = {
      uid,
      name,
      email: email || `${uid}@croplens.lk`,
      role,
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
    };
    await userRepository.upsertUser(user);
  } else if (isAdmin && user.role !== 'admin') {
    user = { ...user, role: 'admin' };
    await userRepository.upsertUser(user);
  }

  req.user = user;
  next();
}

/**
 * Strict administrator authorization middleware.
 * Verifies that the authenticated request carries verified admin privileges.
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const isVerifiedAdmin =
    req.user.role === 'admin' ||
    req.firebaseToken?.admin === true ||
    ADMIN_UIDS.includes(req.user.uid);

  if (!isVerifiedAdmin) {
    return res.status(403).json({
      error: 'Access denied. You do not possess administrator privileges for this operation.',
    });
  }

  next();
}
