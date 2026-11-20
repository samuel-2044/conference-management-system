import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { logger } from "../lib/logger";

type User = {
  id: string;
  roleId: string;
  name: string;
  email: string;
  roleName: string;
  status: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const sessionId = req.cookies?.session_id;

  if (!sessionId) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }

  const user = req.user;

  if (!user) {
    res.clearCookie("session_id", { path: "/", sameSite: "none", secure: true });
    res.status(401).json({ success: false, message: "Invalid session" });
    return;
  }

  if (user.status !== "active") {
    res.clearCookie("session_id", { path: "/", sameSite: "none", secure: true });
    res.status(403).json({
      success: false,
      message: "Your account is inactive. Contact an administrator.",
    });
    return;
  }

  req.user = {
    id: user.id,
    roleId: user.roleId,
    name: user.name,
    email: user.email,
    roleName: user.roleName,
    status: user.status,
  };

  next();
}

export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (!allowedRoles.includes(req.user.roleName)) {
      res.status(403).json({
        success: false,
        message: "You are not authorised to perform this action",
      });
      return;
    }

    next();
  };
}

// PBKDF2-SHA256 via Web Crypto.
//
// bcryptjs (pure JS) needs roughly 100ms of CPU at cost 10, which exceeds the
// Cloudflare Workers CPU limit and makes login fail with "error code: 1102".
// Web Crypto's PBKDF2 is native, so the same work takes a couple of milliseconds.
// Legacy bcrypt hashes ("$2...") are still accepted by comparePasswords.
const PBKDF2_ITERATIONS = 10_000;
const PBKDF2_PREFIX = "pbkdf2";

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveBits(
  password: string,
  salt: Uint8Array,
  iterations: number,
  lengthBytes: number,
): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    lengthBytes * 8,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await deriveBits(password, salt, PBKDF2_ITERATIONS, 32);
  return `${PBKDF2_PREFIX}$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(derived)}`;
}

export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  if (!hashedPassword) return false;

  // Legacy bcrypt record — verify with bcryptjs (slow, but only for old data).
  if (hashedPassword.startsWith("$2")) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  const parts = hashedPassword.split("$");
  if (parts.length !== 4 || parts[0] !== PBKDF2_PREFIX) return false;

  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;

  const salt = fromBase64(parts[2]);
  const expected = fromBase64(parts[3]);
  const actual = await deriveBits(plainPassword, salt, iterations, expected.length);

  if (actual.length !== expected.length) return false;

  let diff = 0;
  for (let i = 0; i < actual.length; i += 1) {
    diff |= actual[i] ^ expected[i];
  }
  return diff === 0;
}

export function createSessionCookie(res: Response, userId: string): void {
  res.cookie("session_id", userId, {
    httpOnly: true,
    // Frontend (pages.dev) and backend (workers.dev) are cross-site, so the
    // cookie must be SameSite=None + Secure to be sent on API requests.
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie("session_id", { path: "/", sameSite: "none", secure: true });
}

export function logActivity(
  actorId: string | undefined,
  action: string,
  meta?: Record<string, unknown>,
): void {
  logger.info({
    actorId,
    action,
    meta,
    timestamp: new Date().toISOString(),
  }, "Activity logged");
}