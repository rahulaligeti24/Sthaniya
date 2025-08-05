import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const API_KEY = 'AIzaSyDTjlVsz4zUDAhIQSGhERQCLJc9aXThuD0';

  // Available Indian languages
  const languages = [
    { code: 'en', name: 'English', flag: '🇮🇳' },
    { code: 'hi', name: 'Hindi (हिंदी)', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali (বাংলা)', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu (తెలుగు)', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi (मराठी)', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil (தமிழ்)', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati (ગુજરાતી)', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam (മലയാളം)', flag: '🇮🇳' },
    { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)', flag: '🇮🇳' },
    { code: 'or', name: 'Odia (ଓଡ଼ିଆ)', flag: '🇮🇳' },
    { code: 'as', name: 'Assamese (অসমীয়া)', flag: '🇮🇳' },
    { code: 'ur', name: 'Urdu (اردو)', flag: '🇮🇳' },
    { code: 'sa', name: 'Sanskrit (संस्कृत)', flag: '🇮🇳' }
  ];

  // Default English content
  const defaultContent = {
    heroTitle: 'Share Your Food Stories',
    heroSubtitle: 'Explore the journey of local food—from cultural roots and historical significance to its place in the modern world. Share the narratives behind what you eat.',
    getStarted: 'Get Started',
    signIn: 'Sign In',
    whyShare: 'Why Share Your Food Stories?',
    preserveCulture: 'Preserve Culture',
    preserveDesc: 'Keep traditional recipes and food stories alive for future generations',
    connectCommunities: 'Connect Communities',
    connectDesc: 'Share local food experiences and connect with food lovers worldwide',
    shareMemories: 'Share Memories',
    shareDesc: 'Tell the personal stories behind your favorite dishes and ingredients',
    selectLanguage: 'Select Language / भाषा चुनें',
    loading: 'Translating...'
  };

  // Google Translate API function
  const translateText = async (text, targetLanguage) => {
    if (targetLanguage === 'en') return text;
    
    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            target: targetLanguage,
            source: 'en'
          })
        }
      );

      const data = await response.json();
      return data.data?.translations?.[0]?.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  // Translate all content
  const translateAllContent = async (targetLanguage) => {
    if (targetLanguage === 'en') {
      setTranslations(defaultContent);
      return;
    }

    setIsLoading(true);
    const translatedContent = {};

    try {
      for (const [key, value] of Object.entries(defaultContent)) {
        translatedContent[key] = await translateText(value, targetLanguage);
      }
      setTranslations(translatedContent);
    } catch (error) {
      console.error('Error translating content:', error);
      setTranslations(defaultContent);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize with English content
  useEffect(() => {
    setTranslations(defaultContent);
  }, []);

  // Handle language change
  const handleLanguageChange = async (languageCode) => {
    setCurrentLanguage(languageCode);
    setIsLanguageModalOpen(false);
    await translateAllContent(languageCode);
  };

  // Toggle modal
  const toggleModal = () => {
    setIsLanguageModalOpen(!isLanguageModalOpen);
  };

  return (
    <div className="home-container">
      {/* Language Selector Button */}
      <div className="language-selector">
        <button
          onClick={toggleModal}
          disabled={isLoading}
          className="language-button"
        >
          <span className="language-flag">
            {languages.find(lang => lang.code === currentLanguage)?.flag || '🌐'}
          </span>
          <span className="language-name">
            {languages.find(lang => lang.code === currentLanguage)?.name || 'Language'}
          </span>
          {isLoading ? (
            <div className="loading-spinner" />
          ) : (
            <span>▼</span>
          )}
        </button>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          flexDirection: 'column'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #ff6b35',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }} />
          <p style={{ margin: 0, fontSize: '16px', color: '#6b7280' }}>
            {translations.loading || 'Translating...'}
          </p>
        </div>
      )}

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Share Your <span className="highlight">Food Stories</span>
          </h1>
          <p className="hero-subtitle">
            {translations.heroSubtitle || defaultContent.heroSubtitle}
          </p>
          <div className="hero-actions">
            <button
              className="primary-btn"
              onClick={() => navigate('/register')}
            >
              {translations.getStarted || defaultContent.getStarted}
            </button>
            <button
              className="secondary-btn"
              onClick={() => navigate('/login')}
            >
              {translations.signIn || defaultContent.signIn}
            </button>
          </div>
        </div>
        
        <div className="hero-image">
          <div className="food-emoji">🍽️</div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="features-container">
          <h2 className="features-title">
            {translations.whyShare || defaultContent.whyShare}
          </h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📖</div>
              <h3 className="feature-title">
                {translations.preserveCulture || defaultContent.preserveCulture}
              </h3>
              <p className="feature-description">
                {translations.preserveDesc || defaultContent.preserveDesc}
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3 className="feature-title">
                {translations.connectCommunities || defaultContent.connectCommunities}
              </h3>
              <p className="feature-description">
                {translations.connectDesc || defaultContent.connectDesc}
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">❤️</div>
              <h3 className="feature-title">
                {translations.shareMemories || defaultContent.shareMemories}
              </h3>
              <p className="feature-description">
                {translations.shareDesc || defaultContent.shareDesc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Language Modal - FIXED WITH INLINE STYLES */}
      {isLanguageModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000  // Very high z-index
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsLanguageModalOpen(false);
            }
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '15px'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '18px', 
                fontWeight: '600',
                color: '#1f2937'
              }}>
                {translations.selectLanguage || 'Select Language / भाषा चुनें'}
              </h3>
              <button 
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  borderRadius: '4px'
                }}
                onClick={() => setIsLanguageModalOpen(false)}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>

            {/* Language List */}
            <div style={{ display: 'grid', gap: '8px' }}>
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    border: currentLanguage === language.code ? '2px solid #ff6b35' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: currentLanguage === language.code ? '#fff5f3' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '14px',
                    width: '100%',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    if (currentLanguage !== language.code) {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.borderColor = '#d1d5db';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (currentLanguage !== language.code) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#e5e7eb';
                    }
                  }}
                >
                  <span style={{ 
                    marginRight: '12px', 
                    fontSize: '16px' 
                  }}>
                    {language.flag}
                  </span>
                  <span style={{ 
                    fontWeight: currentLanguage === language.code ? '600' : '400',
                    color: '#1f2937'
                  }}>
                    {language.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Home;