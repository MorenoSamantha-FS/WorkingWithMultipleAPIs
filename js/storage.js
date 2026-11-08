"use strict";

const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Save a successful API result
export const saveBook = (title, data) => {
  const cacheEntry = {
    timestamp: Date.now(),
    data: data,
  };

  localStorage.setItem(
    `book-${title.toLowerCase()}`,
    JSON.stringify(cacheEntry),
  );
};

// Retrieve a saved result
export const getSavedBook = (title) => {
  const key = `book-${title.toLowerCase()}`;
  const saved = localStorage.getItem(key);

  if (!saved) {
    return null;
  }

  try {
    const cacheEntry = JSON.parse(saved);

    if (Date.now() - cacheEntry.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }

    return cacheEntry.data;
  } catch (error) {
    localStorage.removeItem(key);
    return null;
  }
};
