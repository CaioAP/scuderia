import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  formatTimestamp,
  sanitizeHtmlContent,
  sortMessagesByDate,
  filterMessagesByAuthor,
  filterMessagesByContent,
  filterMessagesByDateRange,
  filterMessagesByLikes,
  combineUniqueMessages,
} from './Message';
import type { Message } from '#shared/types/Message';

// Mock DOM for sanitization tests
const mockDocument = {
  createElement: vi.fn(() => ({
    innerHTML: '',
    querySelectorAll: vi.fn(() => []),
    remove: vi.fn(),
    replaceWith: vi.fn(),
    removeAttribute: vi.fn(),
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    attributes: [],
    childNodes: [],
    tagName: 'DIV',
  })),
};

// Mock global document
Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
});

describe('Message Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock document behavior
    mockDocument.createElement.mockReturnValue({
      innerHTML: '',
      querySelectorAll: vi.fn(() => []),
      remove: vi.fn(),
      replaceWith: vi.fn(),
      removeAttribute: vi.fn(),
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
      attributes: [],
      childNodes: [],
      tagName: 'DIV',
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('formatTimestamp', () => {
    it('should return "Invalid date" for invalid dates', () => {
      expect(formatTimestamp(new Date('invalid'))).toBe('Invalid date');
      expect(formatTimestamp(null as any)).toBe('Invalid date');
      expect(formatTimestamp(undefined as any)).toBe('Invalid date');
    });

    it('should return "just now" for very recent dates', () => {
      const now = new Date();
      const oneSecondAgo = new Date(now.getTime() - 1000);

      expect(formatTimestamp(now)).toBe('just now');
      expect(formatTimestamp(oneSecondAgo)).toBe('just now');
    });

    it('should handle future dates gracefully', () => {
      const future = new Date(Date.now() + 60000); // 1 minute in future
      expect(formatTimestamp(future)).toBe('just now');
    });

    it('should format seconds correctly', () => {
      const now = new Date();
      const fiveSecondsAgo = new Date(now.getTime() - 5000);
      const thirtySecondsAgo = new Date(now.getTime() - 30000);

      expect(formatTimestamp(fiveSecondsAgo)).toBe('5 seconds ago');
      expect(formatTimestamp(thirtySecondsAgo)).toBe('30 seconds ago');
    });

    it('should format minutes correctly', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60000);
      const fiveMinutesAgo = new Date(now.getTime() - 300000);

      expect(formatTimestamp(oneMinuteAgo)).toBe('1 minute ago');
      expect(formatTimestamp(fiveMinutesAgo)).toBe('5 minutes ago');
    });

    it('should format hours correctly', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);
      const fiveHoursAgo = new Date(now.getTime() - 18000000);

      expect(formatTimestamp(oneHourAgo)).toBe('1 hour ago');
      expect(formatTimestamp(fiveHoursAgo)).toBe('5 hours ago');
    });

    it('should return "Yesterday" for one day ago', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 86400000);

      expect(formatTimestamp(yesterday)).toBe('Yesterday');
    });

    it('should format days correctly', () => {
      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 172800000);
      const sixDaysAgo = new Date(now.getTime() - 518400000);

      expect(formatTimestamp(twoDaysAgo)).toBe('2 days ago');
      expect(formatTimestamp(sixDaysAgo)).toBe('6 days ago');
    });

    it('should format weeks correctly', () => {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 604800000);
      const threeWeeksAgo = new Date(now.getTime() - 1814400000);

      expect(formatTimestamp(oneWeekAgo)).toBe('1 week ago');
      expect(formatTimestamp(threeWeeksAgo)).toBe('3 weeks ago');
    });

    it('should format months correctly', () => {
      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 2592000000); // 30 days
      const sixMonthsAgo = new Date(now.getTime() - 15552000000); // 180 days

      expect(formatTimestamp(oneMonthAgo)).toBe('1 month ago');
      expect(formatTimestamp(sixMonthsAgo)).toBe('6 months ago');
    });

    it('should format years correctly', () => {
      const now = new Date();
      const oneYearAgo = new Date(now.getTime() - 31536000000); // 365 days
      const twoYearsAgo = new Date(now.getTime() - 63072000000); // 730 days

      expect(formatTimestamp(oneYearAgo)).toBe('1 year ago');
      expect(formatTimestamp(twoYearsAgo)).toBe('2 years ago');
    });
  });

  describe('sanitizeHtmlContent', () => {
    beforeEach(() => {
      // Mock a more realistic DOM element
      const mockElement = {
        innerHTML: '',
        querySelectorAll: vi.fn(() => []),
        remove: vi.fn(),
        replaceWith: vi.fn(),
        removeAttribute: vi.fn(),
        setAttribute: vi.fn(),
        getAttribute: vi.fn(() => null),
        attributes: [],
        childNodes: [],
        tagName: 'DIV',
      };

      mockDocument.createElement.mockReturnValue(mockElement);
    });

    it('should return empty string for invalid input', () => {
      expect(sanitizeHtmlContent('')).toBe('');
      expect(sanitizeHtmlContent(null as any)).toBe('');
      expect(sanitizeHtmlContent(undefined as any)).toBe('');
      expect(sanitizeHtmlContent(123 as any)).toBe('');
    });

    it('should handle basic HTML content', () => {
      const mockElement = {
        innerHTML: '<p>Hello World</p>',
        querySelectorAll: vi.fn(() => []),
        remove: vi.fn(),
        replaceWith: vi.fn(),
        removeAttribute: vi.fn(),
        setAttribute: vi.fn(),
        getAttribute: vi.fn(() => null),
        attributes: [],
        childNodes: [],
        tagName: 'DIV',
      };

      mockDocument.createElement.mockReturnValue(mockElement as any);

      const result = sanitizeHtmlContent('<p>Hello World</p>');
      expect(result).toBe('<p>Hello World</p>');
    });

    it('should remove dangerous script tags', () => {
      const mockScript = {
        remove: vi.fn(),
        tagName: 'SCRIPT',
      };

      const mockElement = {
        innerHTML: '<p>Safe content</p><script>alert("xss")</script>',
        querySelectorAll: vi.fn((selector) => {
          if (selector.includes('script')) {
            return [mockScript];
          }
          return [];
        }),
        remove: vi.fn(),
        replaceWith: vi.fn(),
        removeAttribute: vi.fn(),
        setAttribute: vi.fn(),
        getAttribute: vi.fn(() => null),
        attributes: [],
        childNodes: [],
        tagName: 'DIV',
      };

      mockDocument.createElement.mockReturnValue(mockElement as any);

      sanitizeHtmlContent('<p>Safe content</p><script>alert("xss")</script>');

      // Verify script was removed
      expect(mockScript.remove).toHaveBeenCalled();
    });

    it('should sanitize href attributes', () => {
      const mockLink = {
        tagName: 'A',
        getAttribute: vi.fn((attr) => {
          if (attr === 'href') return 'javascript:alert("xss")';
          return null;
        }),
        removeAttribute: vi.fn(),
        setAttribute: vi.fn(),
        attributes: [{ name: 'href' }],
        replaceWith: vi.fn(),
      };

      const mockElement = {
        innerHTML: '<a href="javascript:alert(\'xss\')">Click me</a>',
        querySelectorAll: vi.fn((selector) => {
          if (selector === '*') return [mockLink];
          return [];
        }),
        remove: vi.fn(),
        replaceWith: vi.fn(),
        removeAttribute: vi.fn(),
        setAttribute: vi.fn(),
        getAttribute: vi.fn(() => null),
        attributes: [],
        childNodes: [],
        tagName: 'DIV',
      };

      mockDocument.createElement.mockReturnValue(mockElement as any);

      sanitizeHtmlContent('<a href="javascript:alert(\'xss\')">Click me</a>');

      // Verify dangerous href was removed
      expect(mockLink.removeAttribute).toHaveBeenCalledWith('href');
    });

    it('should preserve safe href attributes', () => {
      const mockLink = {
        tagName: 'A',
        getAttribute: vi.fn((attr) => {
          if (attr === 'href') return 'https://example.com';
          return null;
        }),
        removeAttribute: vi.fn(),
        setAttribute: vi.fn(),
        attributes: [{ name: 'href' }],
        replaceWith: vi.fn(),
      };

      const mockElement = {
        innerHTML: '<a href="https://example.com">Safe link</a>',
        querySelectorAll: vi.fn((selector) => {
          if (selector === '*') return [mockLink];
          return [];
        }),
        remove: vi.fn(),
        replaceWith: vi.fn(),
        removeAttribute: vi.fn(),
        setAttribute: vi.fn(),
        getAttribute: vi.fn(() => null),
        attributes: [],
        childNodes: [],
        tagName: 'DIV',
      };

      mockDocument.createElement.mockReturnValue(mockElement as any);

      sanitizeHtmlContent('<a href="https://example.com">Safe link</a>');

      // Verify safe href was not removed
      expect(mockLink.removeAttribute).not.toHaveBeenCalledWith('href');
    });
  });

  describe('sortMessagesByDate', () => {
    const createMessage = (id: number, createdAt: Date): Message => ({
      id,
      content: `Message ${id}`,
      author: { id: 1, name: 'Test User', label: 'TU' },
      createdAt,
      likeCount: 0,
      isLiked: false,
    });

    it('should return empty array for invalid input', () => {
      expect(sortMessagesByDate(null as any)).toEqual([]);
      expect(sortMessagesByDate(undefined as any)).toEqual([]);
      expect(sortMessagesByDate('not an array' as any)).toEqual([]);
    });

    it('should sort messages in reverse chronological order', () => {
      const messages = [
        createMessage(1, new Date('2024-01-01')),
        createMessage(2, new Date('2024-01-03')),
        createMessage(3, new Date('2024-01-02')),
      ];

      const sorted = sortMessagesByDate(messages);

      expect(sorted[0]!.id).toBe(2); // 2024-01-03 (newest)
      expect(sorted[1]!.id).toBe(3); // 2024-01-02
      expect(sorted[2]!.id).toBe(1); // 2024-01-01 (oldest)
    });

    it('should handle messages with same timestamps', () => {
      const sameDate = new Date('2024-01-01');
      const messages = [createMessage(1, sameDate), createMessage(2, sameDate)];

      const sorted = sortMessagesByDate(messages);
      expect(sorted).toHaveLength(2);
    });

    it('should handle invalid dates by putting them at the end', () => {
      const messages = [
        createMessage(1, new Date('2024-01-01')),
        createMessage(2, new Date('invalid')),
        createMessage(3, new Date('2024-01-02')),
      ];

      const sorted = sortMessagesByDate(messages);

      expect(sorted[0]!.id).toBe(3); // Valid date (newest)
      expect(sorted[1]!.id).toBe(1); // Valid date (older)
      expect(sorted[2]!.id).toBe(2); // Invalid date (last)
    });

    it('should not mutate original array', () => {
      const messages = [
        createMessage(1, new Date('2024-01-01')),
        createMessage(2, new Date('2024-01-02')),
      ];
      const originalOrder = messages.map((m) => m.id);

      sortMessagesByDate(messages);

      expect(messages.map((m) => m.id)).toEqual(originalOrder);
    });
  });

  describe('filterMessagesByAuthor', () => {
    const messages: Message[] = [
      {
        id: 1,
        content: 'Message 1',
        author: { id: 1, name: 'Alice', label: 'A' },
        createdAt: new Date(),
        likeCount: 0,
        isLiked: false,
      },
      {
        id: 2,
        content: 'Message 2',
        author: { id: 2, name: 'Bob', label: 'B' },
        createdAt: new Date(),
        likeCount: 0,
        isLiked: false,
      },
      {
        id: 3,
        content: 'Message 3',
        author: { id: 1, name: 'Alice', label: 'A' },
        createdAt: new Date(),
        likeCount: 0,
        isLiked: false,
      },
    ];

    it('should return empty array for invalid input', () => {
      expect(filterMessagesByAuthor(null as any, 1)).toEqual([]);
      expect(filterMessagesByAuthor([], 'invalid' as any)).toEqual([]);
    });

    it('should filter messages by author ID', () => {
      const filtered = filterMessagesByAuthor(messages, 1);

      expect(filtered).toHaveLength(2);
      expect(filtered[0]!.id).toBe(1);
      expect(filtered[1]!.id).toBe(3);
    });

    it('should return empty array for non-existent author', () => {
      const filtered = filterMessagesByAuthor(messages, 999);
      expect(filtered).toEqual([]);
    });

    it('should handle messages with missing author', () => {
      const messagesWithMissingAuthor = [
        ...messages,
        {
          id: 4,
          content: 'Message 4',
          author: null as any,
          createdAt: new Date(),
          likeCount: 0,
          isLiked: false,
        },
      ];

      const filtered = filterMessagesByAuthor(messagesWithMissingAuthor, 1);
      expect(filtered).toHaveLength(2);
    });
  });

  describe('filterMessagesByContent', () => {
    const messages: Message[] = [
      {
        id: 1,
        content: '<p>Hello world</p>',
        author: { id: 1, name: 'Alice Johnson', label: 'AJ' },
        createdAt: new Date(),
        likeCount: 0,
        isLiked: false,
      },
      {
        id: 2,
        content: '<p>Goodbye everyone</p>',
        author: { id: 2, name: 'Bob Smith', label: 'BS' },
        createdAt: new Date(),
        likeCount: 0,
        isLiked: false,
      },
      {
        id: 3,
        content: '<p>Hello team</p>',
        author: { id: 3, name: 'Charlie Brown', label: 'CB' },
        createdAt: new Date(),
        likeCount: 0,
        isLiked: false,
      },
    ];

    it('should return all messages for invalid input', () => {
      expect(filterMessagesByContent(null as any, 'test')).toEqual([]);
      expect(filterMessagesByContent(messages, null as any)).toEqual(messages);
      expect(filterMessagesByContent(messages, '')).toEqual(messages);
      expect(filterMessagesByContent(messages, '   ')).toEqual(messages);
    });

    it('should filter messages by content text', () => {
      const filtered = filterMessagesByContent(messages, 'hello');

      expect(filtered).toHaveLength(2);
      expect(filtered[0]!.id).toBe(1);
      expect(filtered[1]!.id).toBe(3);
    });

    it('should filter messages by author name', () => {
      const filtered = filterMessagesByContent(messages, 'alice');

      expect(filtered).toHaveLength(1);
      expect(filtered[0]!.id).toBe(1);
    });

    it('should be case insensitive', () => {
      const filtered = filterMessagesByContent(messages, 'HELLO');
      expect(filtered).toHaveLength(2);
    });

    it('should strip HTML tags when searching content', () => {
      const filtered = filterMessagesByContent(messages, 'world');

      expect(filtered).toHaveLength(1);
      expect(filtered[0]!.id).toBe(1);
    });
  });

  describe('filterMessagesByDateRange', () => {
    const messages: Message[] = [
      {
        id: 1,
        content: 'Message 1',
        author: { id: 1, name: 'Alice', label: 'A' },
        createdAt: new Date('2024-01-01'),
        likeCount: 0,
        isLiked: false,
      },
      {
        id: 2,
        content: 'Message 2',
        author: { id: 2, name: 'Bob', label: 'B' },
        createdAt: new Date('2024-01-15'),
        likeCount: 0,
        isLiked: false,
      },
      {
        id: 3,
        content: 'Message 3',
        author: { id: 3, name: 'Charlie', label: 'C' },
        createdAt: new Date('2024-02-01'),
        likeCount: 0,
        isLiked: false,
      },
    ];

    it('should return empty array for invalid input', () => {
      expect(
        filterMessagesByDateRange(null as any, new Date(), new Date()),
      ).toEqual([]);
    });

    it('should return all messages for invalid dates', () => {
      expect(
        filterMessagesByDateRange(messages, null as any, new Date()),
      ).toEqual(messages);
      expect(
        filterMessagesByDateRange(messages, new Date(), null as any),
      ).toEqual(messages);
      expect(
        filterMessagesByDateRange(messages, new Date('invalid'), new Date()),
      ).toEqual(messages);
    });

    it('should filter messages within date range', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const filtered = filterMessagesByDateRange(messages, startDate, endDate);

      expect(filtered).toHaveLength(2);
      expect(filtered[0]!.id).toBe(1);
      expect(filtered[1]!.id).toBe(2);
    });

    it('should include messages on boundary dates', () => {
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-15');

      const filtered = filterMessagesByDateRange(messages, startDate, endDate);

      expect(filtered).toHaveLength(1);
      expect(filtered[0]!.id).toBe(2);
    });

    it('should handle messages with invalid dates', () => {
      const messagesWithInvalidDate = [
        ...messages,
        {
          id: 4,
          content: 'Message 4',
          author: { id: 4, name: 'David', label: 'D' },
          createdAt: new Date('invalid'),
          likeCount: 0,
          isLiked: false,
        },
      ];

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const filtered = filterMessagesByDateRange(
        messagesWithInvalidDate,
        startDate,
        endDate,
      );

      expect(filtered).toHaveLength(3); // Should exclude message with invalid date
    });
  });

  describe('filterMessagesByLikes', () => {
    const messages: Message[] = [
      {
        id: 1,
        content: 'Message 1',
        author: { id: 1, name: 'Alice', label: 'A' },
        createdAt: new Date(),
        likeCount: 0,
        isLiked: false,
      },
      {
        id: 2,
        content: 'Message 2',
        author: { id: 2, name: 'Bob', label: 'B' },
        createdAt: new Date(),
        likeCount: 5,
        isLiked: false,
      },
      {
        id: 3,
        content: 'Message 3',
        author: { id: 3, name: 'Charlie', label: 'C' },
        createdAt: new Date(),
        likeCount: 10,
        isLiked: false,
      },
    ];

    it('should return all messages for invalid input', () => {
      expect(filterMessagesByLikes(null as any, 5)).toEqual([]);
      expect(filterMessagesByLikes(messages, 'invalid' as any)).toEqual(
        messages,
      );
      expect(filterMessagesByLikes(messages, -1)).toEqual(messages);
    });

    it('should filter messages by minimum likes', () => {
      const filtered = filterMessagesByLikes(messages, 5);

      expect(filtered).toHaveLength(2);
      expect(filtered[0]!.id).toBe(2);
      expect(filtered[1]!.id).toBe(3);
    });

    it('should include messages with exact minimum likes', () => {
      const filtered = filterMessagesByLikes(messages, 10);

      expect(filtered).toHaveLength(1);
      expect(filtered[0]!.id).toBe(3);
    });

    it('should return all messages for zero minimum', () => {
      const filtered = filterMessagesByLikes(messages, 0);
      expect(filtered).toHaveLength(3);
    });
  });

  describe('combineUniqueMessages', () => {
    const messages1: Message[] = [
      {
        id: 1,
        content: 'Message 1',
        author: { id: 1, name: 'Alice', label: 'A' },
        createdAt: new Date(),
        likeCount: 0,
        isLiked: false,
      },
      {
        id: 2,
        content: 'Message 2',
        author: { id: 2, name: 'Bob', label: 'B' },
        createdAt: new Date(),
        likeCount: 0,
        isLiked: false,
      },
    ];

    const messages2: Message[] = [
      {
        id: 2,
        content: 'Message 2 Updated',
        author: { id: 2, name: 'Bob', label: 'B' },
        createdAt: new Date(),
        likeCount: 5,
        isLiked: true,
      },
      {
        id: 3,
        content: 'Message 3',
        author: { id: 3, name: 'Charlie', label: 'C' },
        createdAt: new Date(),
        likeCount: 0,
        isLiked: false,
      },
    ];

    it('should combine arrays and remove duplicates', () => {
      const combined = combineUniqueMessages(messages1, messages2);

      expect(combined).toHaveLength(3);
      expect(combined.find((m) => m.id === 1)).toBeDefined();
      expect(combined.find((m) => m.id === 2)).toBeDefined();
      expect(combined.find((m) => m.id === 3)).toBeDefined();
    });

    it('should keep first occurrence of duplicate IDs', () => {
      const combined = combineUniqueMessages(messages1, messages2);
      const message2 = combined.find((m) => m.id === 2);

      expect(message2!.content).toBe('Message 2'); // From first array
      expect(message2!.likeCount).toBe(0); // From first array
    });

    it('should handle empty arrays', () => {
      expect(combineUniqueMessages()).toEqual([]);
      expect(combineUniqueMessages([])).toEqual([]);
      expect(combineUniqueMessages([], [])).toEqual([]);
    });

    it('should handle messages without IDs', () => {
      const invalidMessages = [
        { content: 'No ID' } as any,
        null as any,
        undefined as any,
      ];

      const combined = combineUniqueMessages(messages1, invalidMessages);
      expect(combined).toHaveLength(2); // Only valid messages with IDs
    });

    it('should handle single array', () => {
      const combined = combineUniqueMessages(messages1);
      expect(combined).toEqual(messages1);
    });
  });
});
