import React, { useState } from 'react';
import './css/Contributor.css';

const Contributor = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stories, setStories] = useState([
    {
      id: 1,
      title: "The Heritage of Hyderabadi Biryani",
      status: "published",
      views: 1250,
      comments: 23,
      date: "2024-07-15"
    },
    {
      id: 2,
      title: "Street Food Chronicles: Gol Gappa Origins",
      status: "draft",
      views: 0,
      comments: 0,
      date: "2024-07-28"
    }
  ]);

  const [newStory, setNewStory] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    image: null
  });

  const handleStorySubmit = (e) => {
    e.preventDefault();
    const story = {
      id: stories.length + 1,
      ...newStory,
      status: 'draft',
      views: 0,
      comments: 0,
      date: new Date().toISOString().split('T')[0]
    };
    setStories([...stories, story]);
    setNewStory({ title: '', content: '', category: '', tags: '', image: null });
    setActiveTab('dashboard');
  };

  const renderDashboard = () => (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Stories</h3>
          <div className="stat-number">{stories.length}</div>
        </div>
        <div className="stat-card">
          <h3>Total Views</h3>
          <div className="stat-number">{stories.reduce((sum, story) => sum + story.views, 0)}</div>
        </div>
        <div className="stat-card">
          <h3>Comments</h3>
          <div className="stat-number">{stories.reduce((sum, story) => sum + story.comments, 0)}</div>
        </div>
        <div className="stat-card">
          <h3>Published</h3>
          <div className="stat-number">{stories.filter(s => s.status === 'published').length}</div>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Stories</h2>
        <div className="stories-list">
          {stories.map(story => (
            <div key={story.id} className="story-item">
              <div className="story-info">
                <h3>{story.title}</h3>
                <div className="story-meta">
                  <span className={`status ${story.status}`}>{story.status}</span>
                  <span className="date">{story.date}</span>
                </div>
              </div>
              <div className="story-stats">
                <span>{story.views} views</span>
                <span>{story.comments} comments</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCreateStory = () => (
    <div className="create-story">
      <h2>Share Your Food Story</h2>
      <form onSubmit={handleStorySubmit} className="story-form">
        <div className="form-group">
          <label>Story Title</label>
          <input
            type="text"
            value={newStory.title}
            onChange={(e) => setNewStory({...newStory, title: e.target.value})}
            placeholder="Enter your story title..."
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select
              value={newStory.category}
              onChange={(e) => setNewStory({...newStory, category: e.target.value})}
              required
            >
              <option value="">Select Category</option>
              <option value="traditional">Traditional Recipes</option>
              <option value="street-food">Street Food</option>
              <option value="festivals">Festival Foods</option>
              <option value="family-recipes">Family Recipes</option>
              <option value="regional">Regional Specialties</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              value={newStory.tags}
              onChange={(e) => setNewStory({...newStory, tags: e.target.value})}
              placeholder="biryani, heritage, hyderabad"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Story Content</label>
          <textarea
            value={newStory.content}
            onChange={(e) => setNewStory({...newStory, content: e.target.value})}
            placeholder="Tell your food story... Share the cultural significance, memories, cooking techniques, or historical background..."
            rows="10"
            required
          />
        </div>

        <div className="form-group">
          <label>Featured Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewStory({...newStory, image: e.target.files[0]})}
            className="file-input"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary">Save as Draft</button>
          <button type="submit" className="btn-primary">Publish Story</button>
        </div>
      </form>
    </div>
  );

  const renderMyStories = () => (
    <div className="my-stories">
      <div className="section-header">
        <h2>My Stories</h2>
        <button 
          className="btn-primary"
          onClick={() => setActiveTab('create')}
        >
          New Story
        </button>
      </div>
      
      <div className="stories-grid">
        {stories.map(story => (
          <div key={story.id} className="story-card">
            <div className="story-image">
              <div className="placeholder-image">📸</div>
            </div>
            <div className="story-content">
              <h3>{story.title}</h3>
              <div className="story-meta">
                <span className={`status ${story.status}`}>{story.status}</span>
                <span className="date">{story.date}</span>
              </div>
              <div className="story-stats">
                <span>👁️ {story.views}</span>
                <span>💬 {story.comments}</span>
              </div>
              <div className="story-actions">
                <button className="btn-secondary">Edit</button>
                <button className="btn-secondary">View</button>
                <button className="btn-danger">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="contributor-container">
      <div className="contributor-sidebar">
        <div className="profile-section">
          <div className="profile-avatar">👨‍🍳</div>
          <h3>Rajesh Kumar</h3>
          <p>Food Story Contributor</p>
        </div>
        
        <nav className="contributor-nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={activeTab === 'create' ? 'active' : ''}
            onClick={() => setActiveTab('create')}
          >
            ✍️ Create Story
          </button>
          <button 
            className={activeTab === 'stories' ? 'active' : ''}
            onClick={() => setActiveTab('stories')}
          >
            📚 My Stories
          </button>
          <button 
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
        </nav>
      </div>

     

        <div className="contributor-content">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'create' && renderCreateStory()}
          {activeTab === 'stories' && renderMyStories()}
          {activeTab === 'analytics' && (
            <div className="analytics">
              <h2>Story Analytics</h2>
              <p>Detailed analytics coming soon...</p>
            </div>
          )}
        </div>
      </div>
  
  );
};

export default Contributor;