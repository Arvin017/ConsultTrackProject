const express = require('express');
const Consultation = require('../models/Consultation');
const Client = require('../models/Client');
const { protect } = require('../middleware/auth');
const { uploadAttachment } = require('../middleware/upload');
const path = require('path');

const router = express.Router();
router.use(protect);

// GET /api/consultations — list with filters
router.get('/', async (req, res) => {
  try {
    const { search, status, type, client, page = 1, limit = 10, from, to } = req.query;
    const query = { consultant: req.user._id };

    if (status) query.status = status;
    if (type) query.type = type;
    if (client) query.client = client;
    if (from || to) {
      query.scheduledAt = {};
      if (from) query.scheduledAt.$gte = new Date(from);
      if (to) query.scheduledAt.$lte = new Date(to);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Consultation.countDocuments(query);
    const consultations = await Consultation.find(query)
      .populate('client', 'name email phone')
      .sort({ scheduledAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, consultations, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/consultations/stats
router.get('/stats', async (req, res) => {
  try {
    const baseQuery = { consultant: req.user._id };
    const [total, completed, scheduled, cancelled, thisMonth] = await Promise.all([
      Consultation.countDocuments(baseQuery),
      Consultation.countDocuments({ ...baseQuery, status: 'completed' }),
      Consultation.countDocuments({ ...baseQuery, status: 'scheduled' }),
      Consultation.countDocuments({ ...baseQuery, status: 'cancelled' }),
      Consultation.countDocuments({
        ...baseQuery,
        scheduledAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          $lte: new Date(),
        },
      }),
    ]);

    res.json({ success: true, stats: { total, completed, scheduled, cancelled, thisMonth } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/consultations
router.post('/', async (req, res) => {
  try {
    const consultation = await Consultation.create({ ...req.body, consultant: req.user._id });
    await Client.findByIdAndUpdate(req.body.client, { $inc: { totalConsultations: 1 } });
    await consultation.populate('client', 'name email phone');
    res.status(201).json({ success: true, consultation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/consultations/:id
router.get('/:id', async (req, res) => {
  try {
    const consultation = await Consultation.findOne({ _id: req.params.id, consultant: req.user._id })
      .populate('client', 'name email phone dateOfBirth address')
      .populate('consultant', 'name email');
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found' });
    res.json({ success: true, consultation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/consultations/:id
router.put('/:id', async (req, res) => {
  try {
    const consultation = await Consultation.findOneAndUpdate(
      { _id: req.params.id, consultant: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('client', 'name email phone');
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found' });
    res.json({ success: true, consultation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/consultations/:id
router.delete('/:id', async (req, res) => {
  try {
    const consultation = await Consultation.findOneAndDelete({ _id: req.params.id, consultant: req.user._id });
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found' });
    res.json({ success: true, message: 'Consultation deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/consultations/:id/attachments
router.post('/:id/attachments', uploadAttachment.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const consultation = await Consultation.findOne({ _id: req.params.id, consultant: req.user._id });
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found' });

    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/attachments/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype,
    };

    consultation.attachments.push(attachment);
    await consultation.save();

    res.json({ success: true, attachment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
