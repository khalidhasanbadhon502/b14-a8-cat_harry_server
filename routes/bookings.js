import { Router } from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Studio from '../models/Studio.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function serialize(booking, studio) {
  const output = booking.toObject ? booking.toObject() : { ...booking };
  delete output.__v;
  output.id = String(output._id);
  output.studio =
    studio ?? (output.studioId && typeof output.studioId === 'object' && output.studioId._id
      ? output.studioId
      : null);
  return output;
}

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const body = req.body ?? {};

    const studioId = body.studioId ?? body.studio;
    if (!studioId || !mongoose.isValidObjectId(String(studioId))) {
      return res
        .status(400)
        .json({ error: 'A valid studioId is required' });
    }

    const date = String(body.date ?? '').trim();
    if (!DATE_PATTERN.test(date)) {
      return res
        .status(400)
        .json({ error: 'Date must be in YYYY-MM-DD format' });
    }

    const startTime = String(body.startTime ?? '').trim();
    const endTime = String(body.endTime ?? '').trim();
    if (!TIME_PATTERN.test(startTime) || !TIME_PATTERN.test(endTime)) {
      return res.status(400).json({
        error: 'startTime and endTime must be in HH:MM format',
      });
    }
    if (endTime <= startTime) {
      return res
        .status(400)
        .json({ error: 'endTime must be after startTime' });
    }

    const studio = await Studio.findById(studioId);
    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    const email = String(body.email ?? body.userEmail ?? req.user.email ?? '')
      .trim()
      .toLowerCase();
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const overlapping = await Booking.findOne({
      studioId: studio._id,
      date,
      status: 'Confirmed',
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });
    if (overlapping) {
      return res.status(409).json({
        error: `Studio "${studio.title}" is already booked from ${overlapping.startTime} to ${overlapping.endTime} on ${date}. Please choose a different time slot.`,
      });
    }

    const bookingData = {
      studioId: studio._id,
      studioTitle: studio.title,
      email,
      date,
      startTime,
      endTime,
      status: 'Pending',
    };

    const total = Number(body.total);
    if (body.total !== undefined && Number.isFinite(total)) {
      bookingData.total = total;
    }
    if (typeof body.note === 'string' && body.note.trim()) {
      bookingData.note = body.note.trim();
    }

    const booking = await Booking.create(bookingData);
    res.status(201).json(serialize(booking, studio));
  } catch (err) {
    next(err);
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const email = String(req.query.email ?? '')
      .trim()
      .toLowerCase();
    if (!email) {
      return res
        .status(400)
        .json({ error: 'Email query parameter is required' });
    }

    const bookings = await Booking.find({ email })
      .sort({ createdAt: -1 })
      .populate('studioId');

    res.json(
      bookings.map((booking) => {
        const output = booking.toObject();
        output.id = String(output._id);
        output.studio =
          output.studioId &&
          typeof output.studioId === 'object' &&
          output.studioId._id
            ? output.studioId
            : null;
        return output;
      })
    );
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/cancel', requireAuth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (booking.status !== 'Pending') {
      return res
        .status(400)
        .json({ error: 'Only pending bookings can be cancelled' });
    }

    booking.status = 'Cancelled';
    await booking.save();
    res.json(serialize(booking));
  } catch (err) {
    next(err);
  }
});

export default router;
