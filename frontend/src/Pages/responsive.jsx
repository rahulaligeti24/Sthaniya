import { useState, useEffect } from "react";
import CircularGallery from "./Page2";


export const GalleryWrapper=()=>{
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <=768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ height: "700px", position: "relative" } } >
      {isMobile ? (
        <CircularGallery
          bend={0}
          textColor="white"
          borderRadius={0.05}
          scrollEase={0.02}
        />
      ) : (
        <CircularGallery
          bend={3}
          textColor="white"
          borderRadius={0.05}
          scrollEase={0.02}
        />
      )}
    </div>
  );
}
