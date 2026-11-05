import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import mongoose from 'mongoose';
import User, { LOGIN_HISTORY_LIMIT } from './models/User.js';
import {
  detectMethod,
  isValidIdentifier,
  legacyScryptHash,
  normalizeIdentifier,
  recordLoginAttempt,
} from './routes/auth.js';

async function findAuthUser(userId) {
  try {
    const _id = new mongoose.Types.ObjectId(String(userId));
    const doc = await mongoose.connection.db.collection('user').findOne({ _id });
    if (!doc?.email) return null;
    return { email: normalizeIdentifier(doc.email), name: doc.name || '' };
  } catch (err) {
    console.error('better-auth user lookup failed:', err.message);
    return null;
  }
}

function readHeader(headers, name) {
  if (!headers) return undefined;
  if (typeof headers.get === 'function') return headers.get(name) || undefined;
  if (typeof headers === 'object') {
    const key = Object.keys(headers).find(
      (k) => k.toLowerCase() === name.toLowerCase()
    );
    const value = key ? headers[key] : undefined;
    if (Array.isArray(value)) return value[0] || undefined;
    return value || undefined;
  }
  return undefined;
}

function requestMeta(context) {
  const headers =
    context?.request?.headers ?? context?.headers ?? context?.context?.headers;
  const forwarded = readHeader(headers, 'x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : undefined;
  return { ip, userAgent: readHeader(headers, 'user-agent') };
}

export function createAuth() {
  return betterAuth({
    database: mongodbAdapter(mongoose.connection.db),
    emailAndPassword: {
      enabled: true,
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            try {
              const email = normalizeIdentifier(user.email);
              if (!email) return;
              await User.updateOne(
                { emailOrPhone: email },
                {
                  $setOnInsert: {
                    name: user.name || email,
                    emailOrPhone: email,
                    email,
                    photoUrl: '',
                    role: 'user',
                    loginHistory: [],
                  },
                },
                { upsert: true }
              );
            } catch (err) {
              console.error('better-auth user hook failed:', err.message);
            }
          },
        },
        update: {
          after: async (user) => {
            try {
              const email = normalizeIdentifier(user.email);
              if (!email || !user.name) return;
              await User.updateOne(
                { emailOrPhone: email },
                { $set: { name: user.name } }
              );
            } catch (err) {
              console.error('better-auth user update hook failed:', err.message);
            }
          },
        },
      },
      account: {
        create: {
          after: async (account) => {
            try {
              if (account.providerId !== 'credential' || !account.password) {
                return;
              }
              const authUser = await findAuthUser(account.userId);
              if (!authUser) return;
              await User.updateOne(
                { emailOrPhone: authUser.email },
                { $set: { password: account.password } }
              );
            } catch (err) {
              console.error('better-auth account hook failed:', err.message);
            }
          },
        },
      },
      session: {
        create: {
          after: async (session, context) => {
            try {
              const authUser = await findAuthUser(session.userId);
              if (!authUser) return;
              const path =
                typeof context?.path === 'string' ? context.path : '/sign-in';
              const { ip, userAgent } = requestMeta(context);
              const timestamp = new Date();
              await User.updateOne(
                { emailOrPhone: authUser.email },
                {
                  $setOnInsert: {
                    name: authUser.name || authUser.email,
                    emailOrPhone: authUser.email,
                    email: authUser.email,
                  },
                  $set: { lastLoginAt: timestamp },
                  $push: {
                    loginHistory: {
                      $each: [
                        {
                          timestamp,
                          identifier: authUser.email,
                          method: detectMethod(authUser.email),
                          success: true,
                          detail: path,
                          ip,
                          userAgent,
                        },
                      ],
                      $slice: -LOGIN_HISTORY_LIMIT,
                    },
                  },
                },
                { upsert: true }
              );
            } catch (err) {
              console.error('better-auth session hook failed:', err.message);
            }
          },
        },
      },
    },
    hooks: {
      after: async (context) => {
        try {
          const returned = context?.context?.returned ?? context?.returned;
          const isFailedSignIn =
            context?.path === '/sign-in/email' &&
            (returned instanceof Response
              ? !returned.ok
              : returned instanceof Error
                ? true
                : Boolean(
                    returned &&
                      typeof returned === 'object' &&
                      ('code' in returned || 'error' in returned)
                  ));

          if (isFailedSignIn) {
            const identifier = normalizeIdentifier(context?.body?.email);
            if (identifier && isValidIdentifier(identifier)) {
              const user = await User.findOne({ emailOrPhone: identifier });
              if (user) {
                const { ip, userAgent } = requestMeta(context);
                await recordLoginAttempt(
                  { _id: user._id },
                  {
                    timestamp: new Date(),
                    identifier,
                    method: detectMethod(identifier),
                    success: false,
                    detail: 'invalid-password',
                    ip,
                    userAgent,
                  }
                );
              }
            }
          }

          const isSignUpSuccess =
            context?.path === '/sign-up/email' &&
            returned instanceof Response &&
            returned.ok;
          if (isSignUpSuccess) {
            const signupEmail = normalizeIdentifier(context?.body?.email);
            const signupPassword = context?.body?.password;
            if (
              signupEmail &&
              typeof signupPassword === 'string' &&
              signupPassword
            ) {
              const frontendPasswordHash =
                await legacyScryptHash(signupPassword);
              await User.updateOne(
                { emailOrPhone: signupEmail },
                { $set: { passwordHash: frontendPasswordHash } }
              );
            }
          }
        } catch (err) {
          console.error('better-auth after hook failed:', err.message);
        }
        return {};
      },
    },
  });
}
