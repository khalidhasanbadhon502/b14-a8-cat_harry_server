import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    studioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Studio',
      required: true,
      index: true,
    },
    studioTitle: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    total: { type: Number },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

bookingSchema.index({ studioId: 1, date: 1, status: 1 });

const Booking =
  mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

export default Booking;
