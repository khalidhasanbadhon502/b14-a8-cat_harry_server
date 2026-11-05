import { Router } from 'express';
import mongoose from 'mongoose';
import Studio from '../models/Studio.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const SEED_OWNER_EMAIL = 'listings@studiospace.com';

const SEED_STUDIOS = [
  {
    title: 'Halo Cyc Wall Studio',
    category: 'Photo Studio',
    location: 'Gulshan, Dhaka',
    rating: 4.9,
    hourlyRate: 45,
    securityDeposit: 100,
    maxCapacity: 12,
    image:
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=800&auto=format&fit=crop',
    ],
    detailedOverview:
      'A 1,200 sq ft white cyclorama studio with natural north light, a blackout option and a dedicated prep room. Ideal for product, fashion and portrait shoots.',
    amenities: [
      'Lighting kit',
      'Backdrops',
      'WiFi',
      'Air conditioning',
      'Makeup room',
      'Parking',
    ],
    host: {
      name: 'Nadia Rahman',
      verified: true,
      hostingSince: 2024,
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    },
  },
  {
    title: 'Northlight Sound Stage',
    category: 'Film Stage',
    location: 'Banani, Dhaka',
    rating: 4.8,
    hourlyRate: 120,
    securityDeposit: 250,
    maxCapacity: 25,
    image:
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop',
    ],
    detailedOverview:
      'Spacious sound-isolated stage equipped with full cinema lighting grid, green screen options, and heavy gear access for large video productions.',
    amenities: [
      'Soundproofing',
      'Green Screen',
      'Camera Crane',
      'WiFi',
      'Dressing Room',
      'Parking',
    ],
    host: {
      name: 'Ayman Sadiq',
      verified: true,
      hostingSince: 2023,
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    },
  },
  {
    title: 'Echo Room Podcast Lounge',
    category: 'Podcast Room',
    location: 'Dhanmondi, Dhaka',
    rating: 4.7,
    hourlyRate: 30,
    securityDeposit: 50,
    maxCapacity: 6,
    image:
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=800&auto=format&fit=crop',
    ],
    detailedOverview:
      'A cozy, acoustically treated studio perfect for video podcasts, interviews, and audio recordings. Fitted with Shure SM7B mics and 4K cameras.',
    amenities: [
      'Shure Mics',
      'Rodecaster Pro',
      'Video Lighting',
      'WiFi',
      'Air conditioning',
      'Beverages',
    ],
    host: {
      name: 'Tanvir Hasan',
      verified: true,
      hostingSince: 2025,
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    },
  },
  {
    title: 'Vinyl Lane Recording Suite',
    category: 'Music Suite',
    location: 'Uttara, Dhaka',
    rating: 4.8,
    hourlyRate: 60,
    securityDeposit: 150,
    maxCapacity: 8,
    image:
      'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=800&auto=format&fit=crop',
    ],
    detailedOverview:
      'Professional music tracking and mixing suite with industry-standard studio monitors, analog outboard gear, and a isolated vocal booth.',
    amenities: [
      'Vocal Booth',
      'MIDI Controller',
      'Studio Monitors',
      'WiFi',
      'Air conditioning',
      'Lounge',
    ],
    host: {
      name: 'Sabrina Chowdhury',
      verified: true,
      hostingSince: 2022,
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    },
  },
  {
    title: 'Clay & Canvas Art Workshop',
    category: 'Art Workshop',
    location: 'Mirpur, Dhaka',
    rating: 4.6,
    hourlyRate: 25,
    securityDeposit: 40,
    maxCapacity: 15,
    image:
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop',
    ],
    detailedOverview:
      'Sunlit open art studio suitable for painting classes, pottery workshops, crafting, and small creative meetups with flexible seating.',
    amenities: [
      'Easels & Tables',
      'Water Access',
      'Natural Light',
      'WiFi',
      'Storage',
      'Restroom',
    ],
    host: {
      name: 'Mahmudul Karim',
      verified: true,
      hostingSince: 2024,
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    },
  },
  {
    title: 'Daylight Loft Studio',
    category: 'Photo Studio',
    location: 'Bashundhara, Dhaka',
    rating: 4.7,
    hourlyRate: 50,
    securityDeposit: 100,
    maxCapacity: 10,
    image:
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop',
    ],
    detailedOverview:
      'A minimalist industrial loft featuring floor-to-ceiling windows, modern furniture props, and soft natural daylight for aesthetic shoot concepts.',
    amenities: [
      'Floor Windows',
      'Modern Props',
      'Makeup Mirror',
      'WiFi',
      'Air conditioning',
      'Elevator',
    ],
    host: {
      name: 'Farhana Islam',
      verified: true,
      hostingSince: 2023,
      avatar:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    },
  },
  {
    title: 'Prism Chroma Creative Lab',
    category: 'Film Stage',
    location: 'Mohakhali, Dhaka',
    rating: 4.9,
    hourlyRate: 95,
    securityDeposit: 200,
    maxCapacity: 18,
    image:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
    ],
    detailedOverview:
      'High-tech creative studio featuring full RGB ambient lighting setup, motor-controlled backdrops, and high-speed internet for live streams.',
    amenities: [
      'RGB Smart Lighting',
      'Motorized Rollers',
      'Fiber Internet',
      'WiFi',
      'AC',
      'Green Room',
    ],
    host: {
      name: 'Raziul Ahmed',
      verified: true,
      hostingSince: 2024,
      avatar:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop',
    },
  },
  {
    title: 'Vibe Central Dance & Motion',
    category: 'Art Workshop',
    location: 'Badda, Dhaka',
    rating: 4.5,
    hourlyRate: 35,
    securityDeposit: 60,
    maxCapacity: 20,
    image:
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop',
    ],
    detailedOverview:
      'Spacious studio with wooden flooring, wall-to-wall mirrors, and high-powered PA sound systems for dance rehearsals, fitness shoots, and workshops.',
    amenities: [
      'Full Wall Mirrors',
      'PA Sound System',
      'Wooden Floor',
      'WiFi',
      'Changing Room',
    ],
    host: {
      name: 'Nusrat Jahan',
      verified: true,
      hostingSince: 2025,
      avatar:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
    },
  },
  {
    title: 'Acoustic Attic Live Room',
    category: 'Music Suite',
    location: 'Khilgaon, Dhaka',
    rating: 4.8,
    hourlyRate: 55,
    securityDeposit: 100,
    maxCapacity: 10,
    image:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
    ],
    detailedOverview:
      'Atmospheric attic live room fitted with vintage instruments, acoustic drums, and multi-track recording capabilities for band jam sessions.',
    amenities: [
      'Drum Kit Included',
      'Guitar Amps',
      'Multi-track Recording',
      'WiFi',
      'Air conditioning',
    ],
    host: {
      name: 'Shafiqul Islam',
      verified: true,
      hostingSince: 2023,
      avatar:
        'https://images.unsplash.com/photo-1522075469953-3a6694fb2f61?q=80&w=200&auto=format&fit=crop',
    },
  },
];

export async function seedStudiosIfEmpty() {
  try {
    const count = await Studio.countDocuments();
    if (count > 0) return;
    await Studio.insertMany(
      SEED_STUDIOS.map((studio) => ({
        ...studio,
        ownerEmail: SEED_OWNER_EMAIL,
        ownerName: studio.host.name,
      }))
    );
    console.log(`Seeded ${SEED_STUDIOS.length} studios`);
  } catch (error) {
    console.error('Studio seed failed:', error.message);
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeAmenities(value) {
  if (Array.isArray(value)) {
    return value
      .filter((entry) => typeof entry === 'string' && entry.trim())
      .map((entry) => entry.trim());
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}

function serialize(studio) {
  const output = studio.toObject ? studio.toObject() : { ...studio };
  delete output.__v;
  output.id = String(output._id);
  output.price = output.hourlyRate;
  output.pricePerHour = output.hourlyRate;
  output.capacity = output.maxCapacity;
  output.overview = output.detailedOverview;
  if (!output.host) {
    output.host = {
      name: output.ownerName,
      verified: false,
      hostingSince: output.createdAt
        ? new Date(output.createdAt).getFullYear()
        : undefined,
    };
  }
  return output;
}

function readOptionalString(value) {
  return typeof value === 'string' ? value.trim() : undefined;
}

function readOptionalNumber(value, label) {
  if (value === undefined || value === null || value === '') {
    return { error: undefined };
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { error: `${label} must be a non-negative number` };
  }
  return { error: undefined, value: parsed };
}

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    const category = req.query.category;
    if (category) {
      filter.category = {
        $regex: escapeRegex(String(category)),
        $options: 'i',
      };
    }

    const total = await Studio.countDocuments(filter);
    const query = Studio.find(filter).sort({ rating: -1, createdAt: -1 });

    const limit = Number.parseInt(req.query.limit, 10);
    const page = Number.parseInt(req.query.page, 10);
    if (Number.isFinite(limit) && limit > 0) {
      const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
      query.skip((currentPage - 1) * limit).limit(limit);
    }

    const studios = await query;
    res.set('X-Total-Count', String(total));
    res.json(studios.map(serialize));
  } catch (err) {
    next(err);
  }
});

router.get('/my-listings', async (req, res, next) => {
  try {
    const email = String(req.query.email ?? '')
      .trim()
      .toLowerCase();
    if (!email) {
      return res
        .status(400)
        .json({ error: 'Email query parameter is required' });
    }
    const studios = await Studio.find({ ownerEmail: email }).sort({
      createdAt: -1,
    });
    res.json(studios.map(serialize));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Studio not found' });
    }
    const studio = await Studio.findById(req.params.id);
    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }
    res.json(serialize(studio));
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const authEmail = String(req.user.email ?? '')
      .trim()
      .toLowerCase();
    if (!authEmail) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const title = readOptionalString(body.title) ?? '';
    const category = readOptionalString(body.category) ?? '';
    const location = readOptionalString(body.location) ?? '';
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }
    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    const hourlyRate = Number(body.hourlyRate);
    if (!Number.isFinite(hourlyRate) || hourlyRate < 0) {
      return res
        .status(400)
        .json({ error: 'Hourly rate must be a non-negative number' });
    }

    const depositResult = readOptionalNumber(
      body.securityDeposit,
      'Security deposit'
    );
    if (depositResult.error) {
      return res.status(400).json({ error: depositResult.error });
    }
    const capacityResult = readOptionalNumber(
      body.maxCapacity,
      'Max capacity'
    );
    if (capacityResult.error) {
      return res.status(400).json({ error: capacityResult.error });
    }

    if (
      body.ownerEmail !== undefined &&
      readOptionalString(body.ownerEmail)?.toLowerCase() !== authEmail
    ) {
      return res
        .status(403)
        .json({ error: 'ownerEmail must match the authenticated user' });
    }

    const ownerName =
      readOptionalString(body.ownerName) || req.user.name || authEmail;
    const image = readOptionalString(body.image) ?? '';
    const detailedOverview = readOptionalString(body.detailedOverview) ?? '';
    const amenities = normalizeAmenities(body.amenities);
    const gallery = Array.isArray(body.gallery)
      ? body.gallery.filter(
          (entry) => typeof entry === 'string' && entry.trim()
        )
      : image
        ? [image]
        : [];

    const studio = await Studio.create({
      ownerEmail: authEmail,
      ownerName,
      title,
      category,
      hourlyRate,
      securityDeposit: depositResult.value ?? 0,
      maxCapacity: capacityResult.value ?? 0,
      location,
      image,
      amenities,
      detailedOverview,
      gallery,
      rating: 0,
      host: {
        name: ownerName,
        verified: false,
        hostingSince: new Date().getFullYear(),
      },
    });

    res.status(201).json(serialize(studio));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Studio not found' });
    }
    const studio = await Studio.findById(req.params.id);
    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    const authEmail = String(req.user.email ?? '')
      .trim()
      .toLowerCase();
    if (!authEmail || studio.ownerEmail !== authEmail) {
      return res
        .status(403)
        .json({ error: 'You can only update your own studio listings' });
    }

    const body = req.body ?? {};
    const updates = {};

    const stringFields = [
      ['title', 'Title'],
      ['category', 'Category'],
      ['location', 'Location'],
      ['image', 'Image'],
      ['detailedOverview', 'Detailed overview'],
      ['ownerName', 'Owner name'],
    ];
    for (const [field, label] of stringFields) {
      if (body[field] !== undefined) {
        const value = readOptionalString(body[field]);
        if (value === '') {
          return res
            .status(400)
            .json({ error: `${label} cannot be empty` });
        }
        if (value !== undefined) updates[field] = value;
      }
    }

    const numberFields = [
      ['hourlyRate', 'Hourly rate'],
      ['securityDeposit', 'Security deposit'],
      ['maxCapacity', 'Max capacity'],
    ];
    for (const [field, label] of numberFields) {
      if (body[field] !== undefined) {
        const result = readOptionalNumber(body[field], label);
        if (result.error) {
          return res.status(400).json({ error: result.error });
        }
        if (result.value !== undefined) updates[field] = result.value;
      }
    }

    if (body.amenities !== undefined) {
      updates.amenities = normalizeAmenities(body.amenities);
    }

    Object.assign(studio, updates);
    await studio.save();
    res.json(serialize(studio));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Studio not found' });
    }
    const studio = await Studio.findById(req.params.id);
    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    const authEmail = String(req.user.email ?? '')
      .trim()
      .toLowerCase();
    if (!authEmail || studio.ownerEmail !== authEmail) {
      return res
        .status(403)
        .json({ error: 'You can only delete your own studio listings' });
    }

    await studio.deleteOne();
    res.json({ message: 'Studio deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
