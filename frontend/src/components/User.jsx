import React, { useState } from 'react';
import './css/User.css';

const User = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStory, setSelectedStory] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');

  const [stories] = useState([
    {
      id: 1,
      title: "The Heritage of Hyderabadi Biryani",
      excerpt: "Discover the royal origins of Hyderabad's most beloved dish, passed down through generations of Nizami cuisine...",
      author: "Rajesh Kumar",
      category: "traditional",
      tags: ["biryani", "heritage", "hyderabad", "nizami"],
      readTime: "8 min read",
      date: "July 15, 2024",
      views: 1250,
      likes: 89,
      image: "🍛",
      content: `The aromatic steam rises from perfectly aged rice, each grain distinct yet harmoniously married with tender meat that has been marinating in yogurt and spices for hours. This isn't just a meal; it's a celebration of Hyderabad's rich culinary heritage that dates back to the Mughal era.

The story of Hyderabadi Biryani begins in the royal kitchens of the Nizams, where Persian cooking techniques met local Deccan flavors. Legend has it that the dish was created during the rule of Nizam Mir Osman Ali Khan, when the royal chefs experimented with combining meat and rice in a single pot.

What makes Hyderabadi Biryani unique is the 'Dum' cooking method - a slow-cooking technique where the pot is sealed with dough and cooked over low heat. This allows the meat to cook in its own juices while the rice absorbs all the flavors, creating layers of taste that unfold with each bite.

The secret lies not just in the cooking method, but in the quality of ingredients: the aged Basmati rice from the fields of Punjab, the tender goat meat, the pure ghee, and most importantly, the blend of spices that each family guards as their precious heirloom.

Today, as we sit in modern restaurants enjoying this royal dish, we're not just eating - we're participating in a centuries-old tradition that connects us to the courts of the Nizams and the rich cultural tapestry of Hyderabad.`
    },
    {
      id: 2,
      title: "Street Food Chronicles: The Journey of Gol Gappa",
      excerpt: "From the streets of Delhi to every corner of India, trace the incredible journey of everyone's favorite street snack...",
      author: "Priya Sharma",
      category: "street-food",
      tags: ["golgappa", "chaat", "street-food", "delhi"],
      readTime: "6 min read",
      date: "July 12, 2024",
      views: 892,
      likes: 67,
      image: "🥟",
      content: `The crispy puri crackles between your teeth, followed by an explosion of tangy, spicy water that awakens every taste bud. Gol Gappa, known by many names across India - Pani Puri in Mumbai, Phuchka in Bengal - is more than just street food; it's a cultural phenomenon that unites the diverse flavors of our nation.`
    },
    {
      id: 3,
      title: "Festival Flavors: Diwali Sweets and Their Stories",
      excerpt: "Every mithai box tells a story of tradition, celebration, and the sweet bonds that tie families together...",
      author: "Amit Gupta",
      category: "festivals",
      tags: ["diwali", "sweets", "mithai", "tradition"],
      readTime: "10 min read",
      date: "July 10, 2024",
      views: 1156,
      likes: 94,
      image: "🍯",
      content: `As the festival of lights approaches, kitchens across India transform into sweet workshops where age-old recipes come alive. Each sweet carries within it stories of celebration, tradition, and the loving hands that shape them.`
    },
    {
      id: 4,
      title: "Grandmother's Kitchen: Lost Recipes of Rural Bengal",
      excerpt: "In the heart of rural Bengal, discover recipes that have been whispered from grandmother to granddaughter...",
      author: "Meera Banerjee",
      category: "family-recipes",
      tags: ["bengal", "traditional", "family", "recipes"],
      readTime: "12 min read",
      date: "July 8, 2024",
      views: 734,
      likes: 56,
      image: "🍲",
      content: `In a small village in West Bengal, 78-year-old Kamala Devi still wakes up at dawn to prepare meals the way her grandmother taught her. These aren't just recipes; they're living memories passed down through generations.`
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Stories', icon: '📚' },
    { id: 'traditional', name: 'Traditional', icon: '🏛️' },
    { id: 'street-food', name: 'Street Food', icon: '🛍️' },
    { id: 'festivals', name: 'Festivals', icon: '🎉' },
    { id: 'family-recipes', name: 'Family Recipes', icon: '👨‍👩‍👧‍👦' },
    { id: 'regional', name: 'Regional', icon: '🗺️' }
  ];

  const filteredStories = stories.filter(story => {
    const matchesCategory = selectedCategory === 'all' || story.category === selectedCategory;
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleStoryClick = (story) => {
    setSelectedStory(story);
    if (!comments[story.id]) {
      setComments({
        ...comments,
        [story.id]: [
          {
            id: 1,
            author: "Sunita Reddy",
            content: "What a beautifully written piece! This reminded me of my grandmother's biryani recipe.",
            date: "2 days ago",
            likes: 12
          },
          {
            id: 2,
            author: "Mohammed Ali",
            content: "As a Hyderabadi, I can confirm every word of this article. The dum method is indeed the secret!",
            date: "1 day ago",
            likes: 8
          }
        ]
      });
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: (comments[selectedStory.id]?.length || 0) + 1,
      author: "You",
      content: newComment,
      date: "Just now",
      likes: 0
    };

    setComments({
      ...comments,
      [selectedStory.id]: [...(comments[selectedStory.id] || []), comment]
    });
    setNewComment('');
  };

  if (selectedStory) {
    return (
      <div className="user-container">
        <div className="story-reader">
          <button 
            className="back-button"
            onClick={() => setSelectedStory(null)}
          >
            ← Back to Stories
          </button>
          
          <article className="story-content">
            <header className="story-header">
              <div className="story-category">{selectedStory.category}</div>
              <h1>{selectedStory.title}</h1>
              <div className="story-meta">
                <div className="author-info">
                  <div className="author-avatar">👨‍🍳</div>
                  <div>
                    <div className="author-name">{selectedStory.author}</div>
                    <div className="story-date">{selectedStory.date} • {selectedStory.readTime}</div>
                  </div>
                </div>
                <div className="story-stats">
                  <span>👁️ {selectedStory.views}</span>
                  <span>❤️ {selectedStory.likes}</span>
                </div>
              </div>
              <div className="story-tags">
                {selectedStory.tags.map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
            </header>

            <div className="story-image-hero">
              <div className="story-emoji">{selectedStory.image}</div>
            </div>

            <div className="story-body">
              {selectedStory.content.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </article>

          <section className="comments-section">
            <h3>Comments ({comments[selectedStory.id]?.length || 0})</h3>
            
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this story..."
                rows="3"
              />
              <button type="submit" className="btn-primary">Post Comment</button>
            </form>

            <div className="comments-list">
              {comments[selectedStory.id]?.map(comment => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <div className="comment-author">
                      <div className="comment-avatar">👤</div>
                      <span>{comment.author}</span>
                    </div>
                    <div className="comment-meta">
                      <span>{comment.date}</span>
                      <button className="comment-like">❤️ {comment.likes}</button>
                    </div>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="user-container">
       

      <main className="main-content">
        <div className="hero-section">
          <h2>Explore Food Stories from Around India</h2>
          <p>From ancient recipes to modern adaptations, discover the cultural heritage behind every dish</p>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search stories, recipes, or ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-button">🔍</button>
          </div>
        </div>

        <div className="content-area">
          <aside className="sidebar">
            <div className="categories">
              <h3>Categories</h3>
              <div className="category-list">
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <span className="category-icon">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="trending-tags">
              <h3>Trending Tags</h3>
              <div className="tags-cloud">
                <span className="tag">#biryani</span>
                <span className="tag">#street-food</span>
                <span className="tag">#heritage</span>
                <span className="tag">#festival</span>
                <span className="tag">#traditional</span>
                <span className="tag">#family-recipe</span>
              </div>
            </div>
          </aside>

          <div className="stories-section">
            <div className="section-header">
              <h2>
                {selectedCategory === 'all' ? 'All Stories' : 
                 categories.find(c => c.id === selectedCategory)?.name} 
                ({filteredStories.length})
              </h2>
              <div className="sort-options">
                <select>
                  <option>Latest</option>
                  <option>Most Popular</option>
                  <option>Most Commented</option>
                </select>
              </div>
            </div>

            <div className="stories-grid">
              {filteredStories.map(story => (
                <article key={story.id} className="story-card" onClick={() => handleStoryClick(story)}>
                  <div className="story-image">
                    <div className="story-emoji">{story.image}</div>
                    <div className="story-category-badge">{story.category}</div>
                  </div>
                  
                  <div className="story-content">
                    <h3>{story.title}</h3>
                    <p className="story-excerpt">{story.excerpt}</p>
                    
                    <div className="story-footer">
                      <div className="author-info">
                        <div className="author-avatar-small">👨‍🍳</div>
                        <span>{story.author}</span>
                      </div>
                      <div className="story-meta">
                        <span>{story.readTime}</span>
                        <span>👁️ {story.views}</span>
                        <span>❤️ {story.likes}</span>
                      </div>
                    </div>
                    
                    <div className="story-tags">
                      {story.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="tag-small">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredStories.length === 0 && (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No stories found</h3>
                <p>Try adjusting your search or browse different categories</p>
              </div>
            )}
          </div>
        </div>
      </main>

      
    </div>
  );
};

export default User;