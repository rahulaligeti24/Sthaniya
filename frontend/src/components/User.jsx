import React, { useState, useEffect, useContext } from 'react';
import './css/User.css';
import { UserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const User = () => {
  const { user, logout } = useContext(UserContext);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [stories, setStories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchStories();
    }
  }, [user]);

  const fetchStories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/stories/my/stories');
      const data = await res.json();
      setStories(data);
    } catch (err) {
      console.error('Failed to fetch stories:', err);
    }
  };

  const handleCreateStoryClick = () => setShowCreateStory(true);
  const handleCloseCreateStory = () => {
    setShowCreateStory(false);
    fetchStories();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Welcome, {user?.name || 'Guest'}!</h2>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </header>

      <main className="dashboard-main">
        <div className="hero-section">
          <h2>Share Your Food Story</h2>
          <p className="hero-subtitle">
            Explore the journey of local food—from cultural roots and historical significance 
            to its place in the modern world. Share the narratives behind what you eat.
          </p>
          <button className="create-story-btn" onClick={handleCreateStoryClick}>
            <span className="btn-icon">✍️</span>
            Create a Story
          </button>
        </div>

        <section className="recent-stories">
          <h3>Recent Stories</h3>
          <div className="stories-grid">
            {stories.length > 0 ? (
              stories.map((story) => (
                <div className="story-card" key={story._id}>
                  <h4>{story.title}</h4>
                  <p><strong>By:</strong> {story.authorName || 'Anonymous'}</p>
                  <p><strong>Food:</strong> {story.foodItem}</p>
                  <p>{story.personalStory}</p>
                </div>
              ))
            ) : (
              <div className="story-card placeholder">
                <div className="story-image-placeholder"></div>
                <h4>Your stories will appear here</h4>
                <p>Start by creating your first food story!</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {showCreateStory && (
        <CreateStoryModal onClose={handleCloseCreateStory} />
      )}
    </div>
  );
};

const CreateStoryModal = ({ onClose }) => {
  const { user } = useContext(UserContext);
  const [storyData, setStoryData] = useState({
    title: '',
    foodItem: '',
    origin: '',
    culturalSignificance: '',
    personalStory: '',
    ingredients: '',
    preparationMethod: '',
    modernAdaptation: '',
    category: 'traditional'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setStoryData({
      ...storyData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/stories/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...storyData,
          authorName: user?.name || 'Anonymous'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Story created successfully!');
        onClose();
      } else {
        setError(data.message || 'Failed to create story');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content create-story-modal">
        <div className="modal-header">
          <h3>Create Your Food Story</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="story-form">
          <div className="form-group">
            <label htmlFor="title">Story Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={storyData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="foodItem">Food Item *</label>
            <input
              type="text"
              id="foodItem"
              name="foodItem"
              value={storyData.foodItem}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="personalStory">Your Personal Story *</label>
            <textarea
              id="personalStory"
              name="personalStory"
              value={storyData.personalStory}
              onChange={handleInputChange}
              rows="4"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default User;
