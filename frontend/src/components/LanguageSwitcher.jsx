import React, { useState } from 'react';
import './css/LanguageSwitcher.css'; // Ensure you have this CSS file for styling

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'mr', name: 'Marathi' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ur', name: 'Urdu' },
];

const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lang) => {
    const selectElem = document.querySelector('.goog-te-combo');
    if (selectElem) {
      selectElem.value = lang;
      selectElem.dispatchEvent(new Event('change'));
    }
    setIsOpen(false);
  };

  return (
    <div className="language-switcher">
      <button onClick={() => setIsOpen(!isOpen)}>🌐 Language</button>
      {isOpen && (
        <div className="language-popup">
          {languages.map((lang) => (
            <button key={lang.code} onClick={() => changeLanguage(lang.code)}>
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
