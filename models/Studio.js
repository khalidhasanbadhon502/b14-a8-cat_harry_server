import mongoose from 'mongoose';

const hostSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    verified: { type: Boolean, default: false },
    hostingSince: { type: Number },
    avatar: { type: String },
  },
  { _id: false }
);

const studioSchema = new mongoose.Schema(
  {
    ownerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    ownerName: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    hourlyRate: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, default: 0, min: 0 },
    maxCapacity: { type: Number, default: 0, min: 0 },
    location: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    amenities: { type: [String], default: [] },
    detailedOverview: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    gallery: { type: [String], default: [] },
    host: { type: hostSchema },
  },
  { timestamps: true }
);

const Studio = mongoose.models.Studio || mongoose.model('Studio', studioSchema);

export default Studio;
