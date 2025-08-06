const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Upload = require('../models/upload'); // Adjust path as needed
const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// POST route to create a new story with image upload
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { name, email, description } = req.body;

    // Validate required fields
    if (!name || !email || !description) {
      return res.status(400).json({ 
        message: 'Name, email, and description are required' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        message: 'Image file is required' 
      });
    }

    // Create new story
    const newStory = new Upload({
      name,
      email,
      description,
      image: req.file.filename
    });

    await newStory.save();

    res.status(201).json({
      message: 'Story created successfully!',
      story: newStory
    });

  } catch (error) {
    console.error('Error creating story:', error);
    
    // Delete uploaded file if database save fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to create story',
      error: error.message 
    });
  }
});

// GET route to fetch all stories
router.get('/all', async (req, res) => {
  try {
    const stories = await Upload.find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(50); // Limit to 50 stories

    res.status(200).json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ 
      message: 'Failed to fetch stories',
      error: error.message 
    });
  }
});

// GET route to fetch stories by email (user's own stories)
router.get('/my/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const stories = await Upload.find({ email })
      .sort({ createdAt: -1 });

    res.status(200).json(stories);
  } catch (error) {
    console.error('Error fetching user stories:', error);
    res.status(500).json({ 
      message: 'Failed to fetch user stories',
      error: error.message 
    });
  }
});

// GET route to fetch a single story by ID
router.get('/:id', async (req, res) => {
  try {
    const story = await Upload.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    res.status(200).json(story);
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ 
      message: 'Failed to fetch story',
      error: error.message 
    });
  }
});

// DELETE route to delete a story
router.delete('/:id', async (req, res) => {
  try {
    const story = await Upload.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Delete the image file
    const imagePath = path.join(uploadsDir, story.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await Upload.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ 
      message: 'Failed to delete story',
      error: error.message 
    });
  }
});

module.exports = router;