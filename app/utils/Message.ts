import type { Message } from '#shared/types/Message';

/**
 * Formats a timestamp into a human-readable relative time string
 * @param date - The date to format
 * @returns A formatted string like "2 hours ago", "Yesterday", etc.
 */
export const formatTimestamp = (date: Date): string => {
  // Handle invalid dates
  if (!date || isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);

  // Handle future dates
  if (diffInSeconds < 0) {
    return 'just now';
  }

  if (diffInSeconds < 60) {
    return diffInSeconds <= 1 ? 'just now' : `${diffInSeconds} seconds ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes === 1
      ? '1 minute ago'
      : `${diffInMinutes} minutes ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return diffInWeeks === 1 ? '1 week ago' : `${diffInWeeks} weeks ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  // Ensure we don't return "0 years ago" - if we're here, it should be at least 1 year
  const years = Math.max(1, diffInYears);
  return years === 1 ? '1 year ago' : `${years} years ago`;
};

/**
 * Sanitizes HTML content from rich text editor to prevent XSS attacks
 * while preserving safe formatting elements
 * @param content - The HTML content to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHtmlContent = (content: string): string => {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;

  // Define allowed tags and attributes for rich text content
  const allowedTags = [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'strike',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'span',
    'div',
  ];

  const allowedAttributes = ['href', 'target', 'class', 'style'];

  // Remove script tags and other dangerous elements
  const dangerousElements = tempDiv.querySelectorAll(
    'script, object, embed, iframe, form, input, button, meta, link, style',
  );
  dangerousElements.forEach((element) => element.remove());

  // Process all elements
  const allElements = tempDiv.querySelectorAll('*');
  allElements.forEach((element) => {
    // Remove elements not in allowed list
    if (!allowedTags.includes(element.tagName.toLowerCase())) {
      element.replaceWith(...element.childNodes);
      return;
    }

    // Remove dangerous attributes
    Array.from(element.attributes).forEach((attr) => {
      if (
        !allowedAttributes.includes(attr.name.toLowerCase()) &&
        !attr.name.startsWith('data-')
      ) {
        element.removeAttribute(attr.name);
      }
    });

    // Sanitize href attributes
    if (element.tagName.toLowerCase() === 'a') {
      const href = element.getAttribute('href');
      if (href && !href.match(/^(https?:\/\/|mailto:|tel:|#)/)) {
        element.removeAttribute('href');
      }
    }

    // Sanitize style attributes to prevent CSS injection
    const style = element.getAttribute('style');
    if (style) {
      // Remove potentially dangerous CSS properties
      const sanitizedStyle = style
        .split(';')
        .filter((rule) => {
          const property = rule.split(':')[0]?.trim().toLowerCase();
          // Allow safe CSS properties only
          return (
            property &&
            [
              'color',
              'background-color',
              'font-size',
              'font-weight',
              'font-style',
              'text-decoration',
              'text-align',
              'margin',
              'padding',
            ].includes(property)
          );
        })
        .join(';');

      if (sanitizedStyle) {
        element.setAttribute('style', sanitizedStyle);
      } else {
        element.removeAttribute('style');
      }
    }
  });

  return tempDiv.innerHTML;
};

/**
 * Sorts messages in reverse chronological order (newest first)
 * @param messages - Array of messages to sort
 * @returns Sorted array of messages
 */
export const sortMessagesByDate = (messages: Message[]): Message[] => {
  if (!Array.isArray(messages)) {
    return [];
  }

  return [...messages].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);

    // Handle invalid dates by putting them at the end
    if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
    if (isNaN(dateA.getTime())) return 1;
    if (isNaN(dateB.getTime())) return -1;

    // Sort in reverse chronological order (newest first)
    return dateB.getTime() - dateA.getTime();
  });
};

/**
 * Filters messages by author
 * @param messages - Array of messages to filter
 * @param authorId - ID of the author to filter by
 * @returns Filtered array of messages
 */
export const filterMessagesByAuthor = (
  messages: Message[],
  authorId: number,
): Message[] => {
  if (!Array.isArray(messages) || typeof authorId !== 'number') {
    return [];
  }

  return messages.filter((message) => message.author?.id === authorId);
};

/**
 * Filters messages by content search term
 * @param messages - Array of messages to filter
 * @param searchTerm - Term to search for in message content
 * @returns Filtered array of messages
 */
export const filterMessagesByContent = (
  messages: Message[],
  searchTerm: string,
): Message[] => {
  if (!Array.isArray(messages)) {
    return [];
  }

  if (typeof searchTerm !== 'string') {
    return messages;
  }

  if (!searchTerm.trim()) {
    return messages;
  }

  const lowerSearchTerm = searchTerm.toLowerCase();

  return messages.filter((message) => {
    // Search in content (strip HTML tags for text search)
    const textContent = message.content.replace(/<[^>]*>/g, '').toLowerCase();
    const authorName = message.author?.name?.toLowerCase() || '';

    return (
      textContent.includes(lowerSearchTerm) ||
      authorName.includes(lowerSearchTerm)
    );
  });
};

/**
 * Filters messages by date range
 * @param messages - Array of messages to filter
 * @param startDate - Start date for the range (inclusive)
 * @param endDate - End date for the range (inclusive)
 * @returns Filtered array of messages
 */
export const filterMessagesByDateRange = (
  messages: Message[],
  startDate: Date,
  endDate: Date,
): Message[] => {
  if (!Array.isArray(messages)) {
    return [];
  }

  if (
    !startDate ||
    !endDate ||
    isNaN(startDate.getTime()) ||
    isNaN(endDate.getTime())
  ) {
    return messages;
  }

  return messages.filter((message) => {
    const messageDate = new Date(message.createdAt);
    if (isNaN(messageDate.getTime())) {
      return false;
    }

    return messageDate >= startDate && messageDate <= endDate;
  });
};

/**
 * Gets messages with likes above a certain threshold
 * @param messages - Array of messages to filter
 * @param minLikes - Minimum number of likes required
 * @returns Filtered array of messages
 */
export const filterMessagesByLikes = (
  messages: Message[],
  minLikes: number,
): Message[] => {
  if (!Array.isArray(messages)) {
    return [];
  }

  if (typeof minLikes !== 'number' || minLikes < 0) {
    return messages;
  }

  return messages.filter((message) => message.likeCount >= minLikes);
};

/**
 * Combines multiple message arrays and removes duplicates based on ID
 * @param messageArrays - Arrays of messages to combine
 * @returns Combined array with unique messages
 */
export const combineUniqueMessages = (
  ...messageArrays: Message[][]
): Message[] => {
  const allMessages = messageArrays.flat();
  const uniqueMessages = new Map<number, Message>();

  allMessages.forEach((message) => {
    if (message?.id && !uniqueMessages.has(message.id)) {
      uniqueMessages.set(message.id, message);
    }
  });

  return Array.from(uniqueMessages.values());
};
