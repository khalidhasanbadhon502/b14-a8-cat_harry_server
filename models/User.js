import mongoose from 'mongoose';

export const LOGIN_HISTORY_LIMIT = 50;

const loginHistorySchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true, default: Date.now },
    identifier: { type: String, required: true },
    method: { type: String, enum: ['email', 'phone'], required: true },
    success: { type: Boolean, required: true },
    detail: { type: String },
    ip: { type: String },
    userAgent: { type: String },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    emailOrPhone: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    hashedPassword: { type: String, select: false },
    password: { type: String, select: false },
    passwordHash: { type: String },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true, lowercase: true },
    photoUrl: { type: String, default: '' },
    role: { type: String, default: 'user' },
    loginHistory: { type: [loginHistorySchema], default: [] },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
