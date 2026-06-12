const express = require('express');
const path = require('path');
const fs = require('fs');
const Consultation = require('../models/Consultation');
const { protect } = require('../middleware/auth');
const { uploadRecording } = require('../middleware/upload');

const router = express.Router();
router.use(protect);

// POST /api/recordings/:consultationId/upload
router.post('/:consultationId/upload', uploadRecording.single('recording'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No recording file uploaded' });

    const consultation = await Consultation.findOne({
      _id: req.params.consultationId,
      consultant: req.user._id,
    });
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found' });

    const recording = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/recordings/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype,
      duration: req.body.duration ? Number(req.body.duration) : 0,
    };

    consultation.recordings.push(recording);
    await consultation.save();

    res.json({ success: true, recording });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/recordings/:consultationId/:recordingId
router.delete('/:consultationId/:recordingId', async (req, res) => {
  try {
    const consultation = await Consultation.findOne({
      _id: req.params.consultationId,
      consultant: req.user._id,
    });
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found' });

    const recording = consultation.recordings.id(req.params.recordingId);
    if (!recording) return res.status(404).json({ success: false, message: 'Recording not found' });

    // Delete file from disk
    const filePath = path.join(__dirname, '../uploads/recordings', recording.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    recording.deleteOne();
    await consultation.save();

    res.json({ success: true, message: 'Recording deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
