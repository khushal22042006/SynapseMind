// chrome-extension/src/utils/textUtils.js
// Text processing utilities

/**
 * Truncate text to a specific length
 */
export const truncateText = (text, maxLength = 200) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Count words in text
 */
export const countWords = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
};

/**
 * Count characters in text
 */
export const countCharacters = (text) => {
  if (!text) return 0;
  return text.length;
};

/**
 * Estimate reading time (in minutes)
 */
export const estimateReadingTime = (text, wordsPerMinute = 200) => {
  const words = countWords(text);
  return Math.ceil(words / wordsPerMinute);
};

/**
 * Clean and normalize text
 */
export const cleanText = (text) => {
  if (!text) return '';
  
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();
};

/**
 * Extract sentences from text
 */
export const extractSentences = (text, maxSentences = 5) => {
  if (!text) return [];
  
  const sentences = text.split(/[.!?]+/);
  return sentences
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .slice(0, maxSentences);
};

/**
 * Extract keywords from text (simple implementation)
 */
export const extractKeywords = (text, maxKeywords = 10) => {
  if (!text) return [];
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/);
  
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'can', 'may', 'might', 'must'
  ]);
  
  const wordFrequency = {};
  words.forEach(word => {
    if (!stopWords.has(word) && word.length > 2) {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
  });
  
  return Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
};

/**
 * Format timestamp to readable date
 */
export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // Less than a minute
  if (diff < 60000) {
    return 'Just now';
  }
  
  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }
  
  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }
  
  // Less than a week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }
  
  // Return full date
  return date.toLocaleDateString();
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate a unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};