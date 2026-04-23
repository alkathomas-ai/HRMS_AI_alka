import React, { useState, useEffect, useRef } from 'react';

const AnimatedSearchInput = ({ value, onChange, onClick, onKeyDown, onFocus, className, prompts }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (value || isFocused) {
      // Clear any pending timeouts when focused or has value
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    const currentPrompt = prompts[currentPromptIndex];
    const typingSpeed = isDeleting ? 50 : 100;

    if (!isDeleting) {
      if (displayText.length < currentPrompt.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayText(currentPrompt.slice(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        timeoutRef.current = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, typingSpeed);
      } else {
        setIsDeleting(false);
        setCurrentPromptIndex((prev) => (prev + 1) % prompts.length);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [displayText, isDeleting, currentPromptIndex, prompts, value, isFocused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <input
      type="text"
      placeholder={isFocused ? "Ask me anything..." : displayText}
      value={value}
      onChange={onChange}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onFocus={(e) => {
        setIsFocused(true);
        onFocus?.(e);
      }}
      onBlur={() => setIsFocused(false)}
      className={className}
    />
  );
};

export default AnimatedSearchInput;
