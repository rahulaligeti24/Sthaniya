import React, { useRef } from 'react';
import { StateGallery2 } from "../Pages/StateGallery2.jsx";
import InfiniteMenu from '../Pages/Page1.jsx';
import { items } from '../Pages/Page1_Items.jsx';
import { GalleryWrapper } from '../Pages/responsive.jsx';

function Home() {
  // Create refs for both sections
  const topSectionRef = useRef(null);
  const bottomSectionRef = useRef(null);

  // Function to handle smooth scrolling between sections
  const handleScrollNavigation = () => {
    const currentScrollY = window.scrollY;
    const topSectionHeight = topSectionRef.current?.offsetHeight || 0;
    
    // If user is in top section, scroll to bottom section
    if (currentScrollY < topSectionHeight / 2) {
      bottomSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // If user is in bottom section, scroll to top section
      topSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div>
      {/* Top Section with InfiniteMenu */}
      <div ref={topSectionRef} className="relative">
        <div className="h-[90vh] bg-[#7A5CFA] relative">
          <InfiniteMenu items={items} />
          
          {/* Blue Navigation Marker */}
          <div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 cursor-pointer"
            onClick={handleScrollNavigation}
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300 shadow-lg">
              <svg 
                className="w-4 h-4 text-white animate-bounce" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section with StateGallery2 */}
      <div 
        ref={bottomSectionRef}
        className="desktop:h-screen desktop:w-screen bg-[#E27D60] mobile:h-[100vh] mobile:w-[100vw] relative"
      >
        <div>
          <p className="font-bold text-white desktop:text-5xl desktop:ml-10 desktop:pt-10 mobile:text-[18px] mobile:ml-5 mobile:pt-5">
            Sthaniya
          </p>
          <p className="font-[sans-serif] font-semibold text-white desktop:text-4xl text-center desktop:mt-10 mobile:text-[14px] mobile:pl-10 mobile:mt-5">
            Journey Through the Colors of Every State
          </p>
        </div>
        <GalleryWrapper />
        <StateGallery2 />

        {/* Blue Navigation Marker for bottom section */}
        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 cursor-pointer"
          onClick={handleScrollNavigation}
        >
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300 shadow-lg">
            <svg 
              className="w-4 h-4 text-white animate-bounce rotate-180" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home;