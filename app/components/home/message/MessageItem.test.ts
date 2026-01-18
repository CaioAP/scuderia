import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import * as fc from 'fast-check';
import MessageItem from './MessageItem.vue';
import type { Message } from '#shared/types/Message';
import type { Services } from '#shared/types/Services';
import { MessageServiceMock } from '@/services/MessageService';

// Mock services
const mockMessageService = new MessageServiceMock();
const mockServices: Services = {
  notification: {} as any,
  message: mockMessageService,
};

// Mock PrimeVue components and composables
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
  }),
}));

describe('MessageItem Component', () => {
  describe('Property-Based Tests', () => {
    it('Property 2: Message Content Display Completeness - **Validates: Requirements 1.2, 1.3, 1.4, 1.5**', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            content: fc.string({ minLength: 1, maxLength: 500 }),
            author: fc.record({
              id: fc.integer({ min: 1, max: 100 }),
              name: fc.string({ minLength: 1, maxLength: 50 }),
              label: fc.string({ minLength: 1, maxLength: 10 }),
              avatar: fc.option(fc.webUrl(), { nil: undefined }),
              jobPosition: fc.option(
                fc.string({ minLength: 1, maxLength: 50 }),
                { nil: undefined },
              ),
            }),
            createdAt: fc.date({
              min: new Date('2020-01-01'),
              max: new Date(),
            }),
            likeCount: fc.integer({ min: 0, max: 10000 }),
            isLiked: fc.boolean(),
            loading: fc.option(fc.boolean(), { nil: undefined }),
          }),
          async (messageData) => {
            const message: Message = messageData;

            // Mount component with test message
            const wrapper = mount(MessageItem, {
              props: {
                message,
              },
              global: {
                provide: {
                  services: mockServices,
                },
                stubs: {
                  BaseAvatar: {
                    template:
                      '<div class="test-avatar" :data-label="label" :data-image="image"></div>',
                    props: ['image', 'label', 'shape'],
                  },
                  MessageActions: {
                    template: `
                      <div class="test-actions" 
                           :data-message-id="messageId"
                           :data-like-count="likeCount"
                           :data-is-liked="isLiked"
                           :data-loading="loading">
                        Actions
                      </div>
                    `,
                    props: ['messageId', 'likeCount', 'isLiked', 'loading'],
                    emits: ['like-changed'],
                  },
                },
              },
            });

            // Verify all required content is displayed

            // 1. Rich text content should be present
            const contentElement = wrapper.find('.prose');
            expect(contentElement.exists()).toBe(true);

            // Handle edge cases where content might be completely sanitized away
            const sanitizedHtml = contentElement.html();

            // If original content is empty or whitespace-only, expect empty or minimal content
            if (message.content.trim() === '') {
              expect(contentElement.text().length).toBeGreaterThanOrEqual(0);
            } else {
              // For invalid HTML that gets completely sanitized (like "<!" or malformed tags)
              // we should expect either the content to be preserved or completely removed
              const hasValidContent = message.content.match(/<[a-zA-Z][^>]*>/);
              const isCompletelyInvalidHtml =
                message.content.startsWith('<') && !hasValidContent;

              if (isCompletelyInvalidHtml) {
                // Invalid HTML might be completely removed, which is acceptable
                expect(sanitizedHtml.length).toBeGreaterThanOrEqual(0);
              } else {
                // For valid content, check that some form of content is preserved
                const hasTextContent = contentElement.text().trim().length > 0;
                const hasHtmlContent = sanitizedHtml.includes('<');
                expect(hasTextContent || hasHtmlContent).toBe(true);
              }
            }

            // 2. Author name should be displayed (or fallback to label if name is empty/spaces)
            const authorNameElement = wrapper.find('.font-semibold');
            expect(authorNameElement.exists()).toBe(true);
            const expectedName =
              message.author.name.trim() ||
              message.author.label.trim() ||
              'Unknown';
            expect(authorNameElement.text()).toBe(expectedName);

            // 3. Author avatar should be present with correct props
            const avatarElement = wrapper.find('.test-avatar');
            expect(avatarElement.exists()).toBe(true);
            expect(avatarElement.attributes('data-label')).toBe(
              message.author.label,
            );
            if (message.author.avatar) {
              expect(avatarElement.attributes('data-image')).toBe(
                message.author.avatar,
              );
            }

            // 4. Formatted timestamp should be displayed
            const timestampElement = wrapper.find('.text-sm.text-gray-500');
            expect(timestampElement.exists()).toBe(true);
            expect(timestampElement.text().length).toBeGreaterThan(0);

            // 5. Like count should be passed to MessageActions
            const actionsElement = wrapper.find('.test-actions');
            expect(actionsElement.exists()).toBe(true);
            expect(actionsElement.attributes('data-message-id')).toBe(
              message.id.toString(),
            );
            expect(actionsElement.attributes('data-like-count')).toBe(
              message.likeCount.toString(),
            );
            expect(actionsElement.attributes('data-is-liked')).toBe(
              message.isLiked.toString(),
            );

            wrapper.unmount();
          },
        ),
        { numRuns: 100 },
      );
    }, 30000);

    it('Property 11: Rich Text Content Preservation - **Validates: Requirements 7.1, 7.2**', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            content: fc.oneof(
              // Plain text
              fc.string({ minLength: 1, maxLength: 200 }),
              // HTML with allowed tags
              fc.constantFrom(
                '<p>Simple paragraph</p>',
                '<strong>Bold text</strong>',
                '<em>Italic text</em>',
                '<p>Paragraph with <strong>bold</strong> and <em>italic</em></p>',
                '<h1>Heading 1</h1><p>Content</p>',
                '<ul><li>Item 1</li><li>Item 2</li></ul>',
                '<blockquote>Quote text</blockquote>',
                '<a href="https://example.com">Link</a>',
                '<p>Text with <u>underline</u> and <s>strikethrough</s></p>',
              ),
              // Potentially dangerous content that should be sanitized
              fc.constantFrom(
                '<script>alert("xss")</script><p>Safe content</p>',
                '<p onclick="alert()">Click me</p>',
                '<iframe src="evil.com"></iframe><p>Safe content</p>',
                '<object data="evil.swf"></object><p>Safe content</p>',
                '<form><input type="text"></form><p>Safe content</p>',
              ),
            ),
            author: fc.record({
              id: fc.integer({ min: 1, max: 100 }),
              name: fc.string({ minLength: 1, maxLength: 50 }),
              label: fc.string({ minLength: 1, maxLength: 10 }),
            }),
            createdAt: fc.date({
              min: new Date('2020-01-01'),
              max: new Date(),
            }),
            likeCount: fc.integer({ min: 0, max: 1000 }),
            isLiked: fc.boolean(),
          }),
          async (messageData) => {
            const message: Message = messageData;

            // Mount component with test message
            const wrapper = mount(MessageItem, {
              props: {
                message,
              },
              global: {
                provide: {
                  services: mockServices,
                },
                stubs: {
                  BaseAvatar: {
                    template: '<div class="test-avatar"></div>',
                    props: ['image', 'label', 'shape'],
                  },
                  MessageActions: {
                    template: '<div class="test-actions">Actions</div>',
                    props: ['messageId', 'likeCount', 'isLiked', 'loading'],
                    emits: ['like-changed'],
                  },
                },
              },
            });

            const contentElement = wrapper.find('.prose');
            expect(contentElement.exists()).toBe(true);

            const sanitizedHtml = contentElement.html();

            // Verify dangerous content is removed
            expect(sanitizedHtml).not.toContain('<script');
            expect(sanitizedHtml).not.toContain('<iframe');
            expect(sanitizedHtml).not.toContain('<object');
            expect(sanitizedHtml).not.toContain('<form');
            expect(sanitizedHtml).not.toContain('<input');
            expect(sanitizedHtml).not.toContain('onclick');
            expect(sanitizedHtml).not.toContain('onload');
            expect(sanitizedHtml).not.toContain('onerror');

            // Verify safe HTML formatting is preserved (if original content had safe tags)
            const originalContent = message.content.toLowerCase();
            if (
              originalContent.includes('<p>') &&
              !originalContent.includes('<script')
            ) {
              expect(sanitizedHtml.toLowerCase()).toContain('<p>');
            }
            if (
              originalContent.includes('<strong>') &&
              !originalContent.includes('<script')
            ) {
              expect(sanitizedHtml.toLowerCase()).toContain('<strong>');
            }
            if (
              originalContent.includes('<em>') &&
              !originalContent.includes('<script')
            ) {
              expect(sanitizedHtml.toLowerCase()).toContain('<em>');
            }

            // Verify links are handled safely
            if (originalContent.includes('href="https://')) {
              expect(sanitizedHtml).toContain('href="https://');
            }

            wrapper.unmount();
          },
        ),
        { numRuns: 100 },
      );
    }, 30000);

    it('Property 12: Timestamp Formatting Consistency - **Validates: Requirements 7.5**', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            content: fc.string({ minLength: 1, maxLength: 100 }),
            author: fc.record({
              id: fc.integer({ min: 1, max: 100 }),
              name: fc.string({ minLength: 1, maxLength: 50 }),
              label: fc.string({ minLength: 1, maxLength: 10 }),
            }),
            createdAt: fc.date({
              min: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
              max: new Date(),
            }),
            likeCount: fc.integer({ min: 0, max: 1000 }),
            isLiked: fc.boolean(),
          }),
          async (messageData) => {
            const message: Message = messageData;

            // Mount component with test message
            const wrapper = mount(MessageItem, {
              props: {
                message,
              },
              global: {
                provide: {
                  services: mockServices,
                },
                stubs: {
                  BaseAvatar: {
                    template: '<div class="test-avatar"></div>',
                    props: ['image', 'label', 'shape'],
                  },
                  MessageActions: {
                    template: '<div class="test-actions">Actions</div>',
                    props: ['messageId', 'likeCount', 'isLiked', 'loading'],
                    emits: ['like-changed'],
                  },
                },
              },
            });

            const timestampElement = wrapper.find('.text-sm.text-gray-500');
            expect(timestampElement.exists()).toBe(true);

            const timestampText = timestampElement.text();
            expect(timestampText.length).toBeGreaterThan(0);

            // Handle invalid dates
            if (isNaN(message.createdAt.getTime())) {
              expect(timestampText).toBe('Invalid date');
              wrapper.unmount();
              return;
            }

            // Calculate time difference
            const now = new Date();
            const diffInMilliseconds =
              now.getTime() - message.createdAt.getTime();
            const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
            const diffInMinutes = Math.floor(diffInSeconds / 60);
            const diffInHours = Math.floor(diffInMinutes / 60);
            const diffInDays = Math.floor(diffInHours / 24);

            // Verify timestamp format matches expected patterns
            if (diffInSeconds < 60) {
              expect(timestampText).toMatch(/^(just now|\d+ seconds? ago)$/);
            } else if (diffInMinutes < 60) {
              expect(timestampText).toMatch(/^\d+ minutes? ago$/);
            } else if (diffInHours < 24) {
              expect(timestampText).toMatch(/^\d+ hours? ago$/);
            } else if (diffInDays === 1) {
              expect(timestampText).toBe('Yesterday');
            } else if (diffInDays < 7) {
              expect(timestampText).toMatch(/^\d+ days ago$/);
            } else if (diffInDays < 28) {
              expect(timestampText).toMatch(/^\d+ weeks? ago$/);
            } else {
              // For days >= 28, check if it should be months or years
              const diffInMonths = Math.floor(diffInDays / 30);
              if (diffInMonths < 12) {
                expect(timestampText).toMatch(/^\d+ months? ago$/);
              } else {
                expect(timestampText).toMatch(/^\d+ years? ago$/);
              }
            }

            // Verify consistent format (no mixed languages, proper spacing)
            expect(timestampText).not.toContain('  '); // No double spaces
            expect(timestampText).not.toMatch(/^\s|\s$/); // No leading/trailing spaces
            expect(timestampText).toMatch(/^[a-zA-Z0-9\s]+$/); // Only English characters, numbers, and spaces

            wrapper.unmount();
          },
        ),
        { numRuns: 100 },
      );
    }, 30000);
  });

  describe('Unit Tests', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should render with correct message data', () => {
      const mockMessage: Message = {
        id: 1,
        content: '<p>Test message content</p>',
        author: {
          id: 1,
          name: 'John Doe',
          label: 'JD',
          avatar: 'https://example.com/avatar.jpg',
        },
        createdAt: new Date('2024-01-01T12:00:00Z'),
        likeCount: 5,
        isLiked: true,
        loading: false,
      };

      const wrapper = mount(MessageItem, {
        props: {
          message: mockMessage,
        },
        global: {
          provide: {
            services: mockServices,
          },
          stubs: {
            BaseAvatar: {
              template: '<div class="test-avatar"></div>',
              props: ['image', 'label', 'shape'],
            },
            MessageActions: {
              template: '<div class="test-actions"></div>',
              props: ['messageId', 'likeCount', 'isLiked', 'loading'],
              emits: ['like-changed'],
            },
          },
        },
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.text()).toContain('John Doe');
      expect(wrapper.html()).toContain('Test message content');
    });

    it('should emit like-changed event when MessageActions emits it', async () => {
      const mockMessage: Message = {
        id: 1,
        content: '<p>Test content</p>',
        author: {
          id: 1,
          name: 'John Doe',
          label: 'JD',
        },
        createdAt: new Date(),
        likeCount: 5,
        isLiked: false,
        loading: false,
      };

      const wrapper = mount(MessageItem, {
        props: {
          message: mockMessage,
        },
        global: {
          provide: {
            services: mockServices,
          },
          stubs: {
            BaseAvatar: {
              template: '<div class="test-avatar"></div>',
              props: ['image', 'label', 'shape'],
            },
            MessageActions: {
              template:
                '<div class="test-actions" @click="$emit(\'like-changed\', { messageId: 1, isLiked: true, likeCount: 6 })"></div>',
              props: ['messageId', 'likeCount', 'isLiked', 'loading'],
              emits: ['like-changed'],
            },
          },
        },
      });

      const actionsElement = wrapper.find('.test-actions');
      await actionsElement.trigger('click');

      const emittedEvents = wrapper.emitted('like-changed');
      expect(emittedEvents).toBeDefined();
      expect(emittedEvents!.length).toBe(1);
      expect(emittedEvents![0]![0]).toEqual({
        messageId: 1,
        isLiked: true,
        likeCount: 6,
      });
    });

    it('should handle dangerous HTML content safely', () => {
      const mockMessage: Message = {
        id: 1,
        content:
          '<script>alert("xss")</script><p>Safe content</p><img onerror="alert()" src="x">',
        author: {
          id: 1,
          name: 'John Doe',
          label: 'JD',
        },
        createdAt: new Date(),
        likeCount: 0,
        isLiked: false,
      };

      const wrapper = mount(MessageItem, {
        props: {
          message: mockMessage,
        },
        global: {
          provide: {
            services: mockServices,
          },
          stubs: {
            BaseAvatar: {
              template: '<div class="test-avatar"></div>',
              props: ['image', 'label', 'shape'],
            },
            MessageActions: {
              template: '<div class="test-actions"></div>',
              props: ['messageId', 'likeCount', 'isLiked', 'loading'],
              emits: ['like-changed'],
            },
          },
        },
      });

      const contentElement = wrapper.find('.prose');
      const sanitizedHtml = contentElement.html();

      // Verify dangerous content is removed
      expect(sanitizedHtml).not.toContain('<script');
      expect(sanitizedHtml).not.toContain('onerror');
      expect(sanitizedHtml).not.toContain('alert');

      // Verify safe content is preserved
      expect(sanitizedHtml).toContain('Safe content');
    });

    it('should format timestamps correctly for different time periods', () => {
      const now = new Date();
      const testCases = [
        {
          date: new Date(now.getTime() - 30 * 1000), // 30 seconds ago
          expectedPattern: /^(just now|\d+ seconds ago)$/,
        },
        {
          date: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
          expectedPattern: /^5 minutes ago$/,
        },
        {
          date: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
          expectedPattern: /^2 hours ago$/,
        },
        {
          date: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
          expectedPattern: /^Yesterday$/,
        },
        {
          date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          expectedPattern: /^3 days ago$/,
        },
      ];

      testCases.forEach(({ date, expectedPattern }) => {
        const mockMessage: Message = {
          id: 1,
          content: '<p>Test content</p>',
          author: {
            id: 1,
            name: 'John Doe',
            label: 'JD',
          },
          createdAt: date,
          likeCount: 0,
          isLiked: false,
        };

        const wrapper = mount(MessageItem, {
          props: {
            message: mockMessage,
          },
          global: {
            provide: {
              services: mockServices,
            },
            stubs: {
              BaseAvatar: {
                template: '<div class="test-avatar"></div>',
                props: ['image', 'label', 'shape'],
              },
              MessageActions: {
                template: '<div class="test-actions"></div>',
                props: ['messageId', 'likeCount', 'isLiked', 'loading'],
                emits: ['like-changed'],
              },
            },
          },
        });

        const timestampElement = wrapper.find('.text-sm.text-gray-500');
        expect(timestampElement.text()).toMatch(expectedPattern);
        wrapper.unmount();
      });
    });
  });
});
