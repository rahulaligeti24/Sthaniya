const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  foodItem: {
    type: String,
    required: true,
    trim: true,
  },
  origin: {
    type: String,
    default: '',
    trim: true,
  },
  culturalSignificance: {
    type: String,
    default: '',
  },
  personalStory: {
    type: String,
    required: true,
  },
  ingredients: {
    type: String,
    default: '',
  },
  preparationMethod: {
    type: String,
    default: '',
  },
  modernAdaptation: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['traditional', 'street-food', 'festival', 'family-recipe', 'regional-specialty', 'modern-fusion'],
    default: 'traditional',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  images: [{
    url: String,
    caption: String,
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published',
  },
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
storySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for search functionality
storySchema.index({ title: 'text', foodItem: 'text', origin: 'text' });

module.exports = mongoose.model('Story', storySchema);