import React, { useState, useEffect } from 'react';

const AnimatedSearchInput = ({ value, onChange, onClick, onKeyDown, className, prompts }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (value) return;

    const currentPrompt = prompts[currentPromptIndex];
    const typingSpeed = isDeleting ? 50 : 100;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentPrompt.length) {
          setDisplayText(currentPrompt.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentPromptIndex((prev) => (prev + 1) % prompts.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentPromptIndex, prompts, value]);

  return (
    <input
      type="text"
      placeholder={displayText}
      value={value}
      onChange={onChange}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={className}
    />
  );
};

export default AnimatedSearchInput;
