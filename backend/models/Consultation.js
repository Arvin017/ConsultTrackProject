const mongoose = require('mongoose');

const RecordingSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  url: String,
  duration: Number, // in seconds
  size: Number,
  mimeType: String,
  uploadedAt: { type: Date, default: Date.now },
});

const ConsultationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Consultation title is required'],
      trim: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client is required'],
    },
    consultant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled date/time is required'],
    },
    duration: {
      type: Number, // in minutes
      default: 60,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    type: {
      type: String,
      enum: ['initial', 'follow-up', 'emergency', 'group', 'online'],
      default: 'initial',
    },
    notes: {
      type: String,
    },
    summary: {
      type: String,
    },
    tags: [{ type: String }],
    recordings: [RecordingSchema],
    attachments: [
      {
        filename: String,
        originalName: String,
        url: String,
        size: Number,
        mimeType: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    followUpDate: {
      type: Date,
    },
    followUpNotes: {
      type: String,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// Index for search
ConsultationSchema.index({ title: 'text', notes: 'text', summary: 'text' });

module.exports = mongoose.model('Consultation', ConsultationSchema);
