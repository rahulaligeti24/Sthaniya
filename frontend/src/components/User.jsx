import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
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
      const res = await fetch('http://localhost:5000/api/stories/all');
      const data = await res.json();
      setStories(data);
    } catch (err) {
      console.error('Failed to fetch stories:', err);
    }
  };

  const handleCreateStoryClick = () => setShowCreateStory(true);
  const handleCloseCreateStory = () => {
    setShowCreateStory(false);
    fetchStories(); // Refresh stories after creating a new one
  };

  return (
    <div className="dashboard-container">
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
                  {story.image && (
                    <div className="story-image">
                      <img 
                        src={`http://localhost:5000/uploads/${story.image}`} 
                        alt={story.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="story-content">
                    <h4>{story.name}</h4>
                    <p><strong>By:</strong> {story.email}</p>
                    <p className="story-description">{story.description}</p>
                    <small className="story-date">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </small>
                  </div>
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
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: user?.email || "",
    description: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.description || !formData.image) {
      setError("Please fill in all fields and select an image.");
      setSuccess("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("description", formData.description);
    data.append("image", formData.image);

    try {
      const res = await axios.post("http://localhost:5000/api/stories/upload", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(res.data.message || "Story created successfully!");

      // Reset form fields
      setFormData({
        name: "",
        email: user?.email || "",
        description: "",
        image: null,
      });

      // Clear file input field visually
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Close modal after successful submission
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
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
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="story-form">
          <div className="form-group">
            <label htmlFor="name">Story Title *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your food story title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Your Food Story *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Tell us about your food experience, culture, memories..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Upload Food Image *</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleChange}
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