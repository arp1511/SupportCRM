import React, { useState, useRef, useEffect } from "react";

const FocusFrame = ({ text, className = "" }) => {
  const [frameStyle, setFrameStyle] = useState({
    width: 0,
    height: 0,
    transform: "translate3d(0, 0, 0)",
    opacity: 0,
  });

  const containerRef = useRef(null);
  const wordsRef = useRef([]);
  const words = text.split(" ");

  const updateFrame = (index) => {
    const wordEl = wordsRef.current[index];
    const containerEl = containerRef.current;
    
    if (wordEl && containerEl) {
      const rect = wordEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();
      
      const x = rect.left - containerRect.left;
      const y = rect.top - containerRect.top;
      
      setFrameStyle({
        width: rect.width,
        height: rect.height,
        transform: `translate3d(${x}px, ${y}px, 0)`,
        opacity: 1,
      });
    }
  };

  const clearFrame = () => {
    setFrameStyle((prev) => ({
      ...prev,
      opacity: 0,
    }));
  };

  // Keep frame updated during window resizing or wrapping
  useEffect(() => {
    const handleResize = () => {
      clearFrame();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`focus-container ${className}`}
      onMouseLeave={clearFrame}
    >
      {words.map((word, index) => (
        <span
          key={index}
          ref={(el) => (wordsRef.current[index] = el)}
          className="focus-word"
          onMouseEnter={() => updateFrame(index)}
        >
          {word}
        </span>
      ))}
      <div 
        className="focus-frame" 
        style={{
          width: `${frameStyle.width}px`,
          height: `${frameStyle.height}px`,
          transform: frameStyle.transform,
          opacity: frameStyle.opacity,
        }}
      >
        <div className="corner top-left"></div>
        <div className="corner top-right"></div>
        <div className="corner bottom-left"></div>
        <div className="corner bottom-right"></div>
      </div>
    </div>
  );
};

export default FocusFrame;
