const express = require('express');
const router = express.Router();
const Story = require('../models/story');
const auth = require('../middleware/auth');

// CREATE a new story
router.post('/create', auth, async (req, res) => {
  try {
    const newStory = new Story({
      ...req.body,
      author: req.user._id,
      authorName: req.user.username || 'Anonymous',
    });
    await newStory.save();
    res.status(201).json({ message: 'Story created successfully', story: newStory });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET stories created by logged-in user
router.get('/my/stories', auth, async (req, res) => {
  try {
    const stories = await Story.find({ author: req.user._id });
    res.json(stories);
  } catch (error) {
    console.error('Error fetching user stories:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET stories created by a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const stories = await Story.find({ author: req.params.userId });
    res.json(stories);
  } catch (error) {
    console.error('Error fetching user stories:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET a specific story by ID
router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate('author', 'username');
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.json(story);
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// UPDATE a story by ID
router.put('/:id', auth, async (req, res) => {
  try {
    const updatedStory = await Story.findOneAndUpdate(
      { _id: req.params.id, author: req.user._id },
      req.body,
      { new: true }
    );
    if (!updatedStory) {
      return res.status(404).json({ error: 'Story not found or unauthorized' });
    }
    res.json(updatedStory);
  } catch (error) {
    console.error('Error updating story:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE a story by ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedStory = await Story.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id
    });
    if (!deletedStory) {
      return res.status(404).json({ error: 'Story not found or unauthorized' });
    }
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// LIKE a story
router.post('/:id/like', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });

    if (!story.likes.includes(req.user._id)) {
      story.likes.push(req.user._id);
      await story.save();
    }

    res.json({ message: 'Story liked successfully' });
  } catch (error) {
    console.error('Error liking story:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ADD a comment to a story
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });

    const comment = {
      text: req.body.text,
      author: req.user._id
    };

    story.comments.push(comment);
    await story.save();
    res.status(201).json({ message: 'Comment added successfully' });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE a comment from a story
router.delete('/:id/comment/:commentId', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });

    story.comments = story.comments.filter(comment => comment._id.toString() !== req.params.commentId);
    await story.save();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
