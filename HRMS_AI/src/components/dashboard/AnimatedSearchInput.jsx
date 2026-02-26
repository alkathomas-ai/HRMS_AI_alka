import React, { useState, useEffect } from 'react';

const AnimatedSearchInput = ({ value, onChange, onClick, className, prompts }) => {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [placeholder, setPlaceholder] = useState(prompts[0]);

  useEffect(() => {
    if (!value) {
      const interval = setInterval(() => {
        setCurrentPromptIndex((prev) => {
          const nextIndex = (prev + 1) % prompts.length;
          setPlaceholder(prompts[nextIndex]);
          return nextIndex;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [value, prompts]);

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onClick={onClick}
      className={className}
    />
  );
};

export default AnimatedSearchInput;
