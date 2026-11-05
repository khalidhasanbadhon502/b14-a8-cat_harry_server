import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import User, { LOGIN_HISTORY_LIMIT } from '../models/User.js';

const router = Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9]{7,15}$/;
const BCRYPT_PATTERN = /^\$2[aby]\$\d{2}\$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function normalizeIdentifier(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw || EMAIL_PATTERN.test(raw)) return raw;
  return raw.replace(/[\s()-]/g, '');
}

export function pickIdentifier(body) {
  const raw = body?.emailOrPhone ?? body?.email ?? body?.phone ?? '';
  return normalizeIdentifier(raw);
}

export function isValidIdentifier(identifier) {
  return EMAIL_PATTERN.test(identifier) || PHONE_PATTERN.test(identifier);
}

export function detectMethod(identifier) {
  return EMAIL_PATTERN.test(identifier) ? 'email' : 'phone';
}

export function signToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email ?? user.emailOrPhone,
      name: user.name,
    },
    process.env.BETTER_AUTH_SECRET || 'secret',
    { expiresIn: '7d' }
  );
}

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE_MS,
  });
}

function scryptKey(password, salt, keylen, options) {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, options, (err, key) =>
      err ? reject(err) : resolve(key)
    );
  });
}

export function legacyScryptHash(password) {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString('hex');
    scrypt(password, salt, 64, (err, key) =>
      err ? reject(err) : resolve(`${salt}:${key.toString('hex')}`)
    );
  });
}

export async function verifyStoredPassword(stored, password) {
  if (typeof stored !== 'string' || !stored) return false;

  if (BCRYPT_PATTERN.test(stored)) {
    return bcrypt.compare(password, stored);
  }

  const [salt, expectedHex] = stored.split(':');
  if (!salt || !expectedHex || !/^[0-9a-f]+$/i.test(expectedHex)) return false;

  const expected = Buffer.from(expectedHex, 'hex');

  const hardened = await scryptKey(password.normalize('NFKC'), salt, expected.length, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  });
  if (hardened.length === expected.length && timingSafeEqual(hardened, expected)) {
    return true;
  }

  const legacy = await scryptKey(password, salt, expected.length, {});
  return legacy.length === expected.length && timingSafeEqual(legacy, expected);
}

function requestMeta(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const ip = (first ? first.split(',')[0] : req.ip) || '';
  const userAgent = req.get?.('user-agent') || undefined;
  return { ip, userAgent };
}

export async function recordLoginAttempt(filter, entry) {
  try {
    const update = {
      $push: { loginHistory: { $each: [entry], $slice: -LOGIN_HISTORY_LIMIT } },
    };
    if (entry.success) {
      update.$set = { lastLoginAt: entry.timestamp };
    }
    await User.updateOne(filter, update);
  } catch (err) {
    console.error('Could not record login attempt:', err.message);
  }
}

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    emailOrPhone: user.emailOrPhone,
    photoUrl: user.photoUrl ?? '',
    role: user.role ?? 'user',
    lastLoginAt: user.lastLoginAt ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

router.post('/register', async (req, res, next) => {
  try {
    const name = String(req.body?.name ?? '').trim();
    const identifier = pickIdentifier(req.body);
    const password = req.body?.password;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!identifier) {
      return res
        .status(400)
        .json({ error: 'Email or phone number is required' });
    }
    if (!isValidIdentifier(identifier)) {
      return res
        .status(400)
        .json({ error: 'Enter a valid email address or phone number' });
    }
    if (typeof password !== 'string' || !PASSWORD_PATTERN.test(password)) {
      return res.status(400).json({
        error:
          'Password must be at least 6 characters and include at least one uppercase letter and one lowercase letter',
      });
    }

    const existing = await User.findOne({
      $or: [
        { emailOrPhone: identifier },
        { email: identifier },
        { phone: identifier },
      ],
    });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const passwordHash = await legacyScryptHash(password);
    const photoUrl =
      typeof req.body?.photoUrl === 'string' && req.body.photoUrl.trim()
        ? req.body.photoUrl.trim()
        : '';

    const user = await User.create({
      name,
      emailOrPhone: identifier,
      email: identifier,
      ...(detectMethod(identifier) === 'phone' ? { phone: identifier } : {}),
      password: hashedPassword,
      passwordHash,
      photoUrl,
      role: 'user',
      loginHistory: [],
    });

    const token = signToken(user);
    setAuthCookie(res, token);

    res
      .status(201)
      .json({ message: 'User registered successfully', token, user: toPublicUser(user) });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ error: 'User already exists' });
    }
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const identifier = pickIdentifier(req.body);
    const password = req.body?.password;

    if (!identifier) {
      return res
        .status(400)
        .json({ error: 'Email or phone number is required' });
    }
    if (!isValidIdentifier(identifier)) {
      return res
        .status(400)
        .json({ error: 'Enter a valid email address or phone number' });
    }
    if (typeof password !== 'string' || !password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const user = await User.findOne({
      $or: [
        { emailOrPhone: identifier },
        { email: identifier },
        { phone: identifier },
      ],
    }).select('+password +hashedPassword');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { ip, userAgent } = requestMeta(req);
    const success = await verifyStoredPassword(
      user.password ?? user.hashedPassword ?? user.passwordHash,
      password
    );
    const entry = {
      timestamp: new Date(),
      identifier,
      method: detectMethod(identifier),
      success,
      detail: success ? 'password' : 'invalid-password',
      ip,
      userAgent,
    };

    await recordLoginAttempt({ _id: user._id }, entry);

    if (!success) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    user.lastLoginAt = entry.timestamp;

    const token = signToken(user);
    setAuthCookie(res, token);

    res
      .status(200)
      .json({ message: 'Login successful', token, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

export default router;
