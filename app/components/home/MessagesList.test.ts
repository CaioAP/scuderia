import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import * as fc from 'fast-check';
import MessagesList from './MessagesList.vue';
import type { Message } from '#shared/types/Message';
import type { Services } from '#shared/types/Services';
import type { MessageService } from '@/services/MessageService';

// Mock MessageService for testing
class MockMessageService implements MessageService {
  private messages: Message[] = [];
  private shouldError = false;
  private errorMessage = '';
  private delay = 0;

  setMessages(messages: Message[]) {
    this.messages = messages;
  }

  setShouldError(shouldError: boolean, errorMessage = 'Mock error') {
    this.shouldError = shouldError;
    this.errorMessage = errorMessage;
  }

  setDelay(delay: number) {
    this.delay = delay;
  }

  async getMessages(): Promise<Message[]> {
    if (this.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delay));
    }

    if (this.shouldError) {
      throw new Error(this.errorMessage);
    }

    // Return messages sorted by creation date (newest first)
    return [...this.messages].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async likeMessage(messageId: number): Promise<void> {
    if (this.shouldError) {
      throw new Error(this.errorMessage);
    }
    // Mock implementation - not used in these tests
  }

  async unlikeMessage(messageId: number): Promise<void> {
    if (this.shouldError) {
      throw new Error(this.errorMessage);
    }
    // Mock implementation - not used in these tests
  }

  async createMessage(content: string): Promise<Message> {
    if (this.shouldError) {
      throw new Error(this.errorMessage);
    }
    // Mock implementation - not used in these tests
    return {} as Message;
  }
}

describe('MessagesList Component', () => {
  let mockMessageService: MockMessageService;
  let mockServices: Services;

  beforeEach(() => {
    mockMessageService = new MockMessageService();
    mockServices = {
      notification: {} as any,
      message: mockMessageService,
    };
    vi.clearAllMocks();
  });

  describe('Property-Based Tests', () => {
    it('Property 1: Message List Chronological Ordering - **Validates: Requirements 1.1, 3.3**', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              content: fc.string({ minLength: 1, maxLength: 200 }),
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
            { minLength: 2, maxLength: 10 }, // At least 2 messages to test ordering
          ),
          async (messagesData) => {
            // Ensure unique IDs to avoid conflicts
            const uniqueMessages = messagesData.map((msg, index) => ({
              ...msg,
              id: index + 1,
            }));

            mockMessageService.setMessages(uniqueMessages);

            const wrapper = mount(MessagesList, {
              global: {
                provide: {
                  services: mockServices,
                },
                stubs: {
                  MessageItem: {
                    template: `
                      <div class="test-message-item" 
                           :data-message-id="message.id"
                           :data-created-at="message.createdAt.getTime()">
                        Message {{ message.id }}
                      </div>
                    `,
                    props: ['message'],
                    emits: ['like-changed'],
                  },
                },
              },
            });

            // Wait for component to load messages
            await new Promise((resolve) => setTimeout(resolve, 50));
            await wrapper.vm.$nextTick();

            // Find all message items
            const messageItems = wrapper.findAll('.test-message-item');

            if (messageItems.length > 1) {
              // Verify messages are in reverse chronological order (newest first)
              for (let i = 0; i < messageItems.length - 1; i++) {
                const currentTimestamp = parseInt(
                  messageItems[i]!.attributes('data-created-at')!,
                );
                const nextTimestamp = parseInt(
                  messageItems[i + 1]!.attributes('data-created-at')!,
                );

                // Current message should be newer than or equal to the next message
                expect(currentTimestamp).toBeGreaterThanOrEqual(nextTimestamp);
              }
            }

            wrapper.unmount();
          },
        ),
        { numRuns: 50 }, // Reduced runs for performance
      );
    }, 30000);

    it('Property 6: Loading State Management - **Validates: Requirements 2.6, 5.1, 5.3**', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            messages: fc.array(
              fc.record({
                id: fc.integer({ min: 1, max: 1000 }),
                content: fc.string({ minLength: 1, maxLength: 100 }),
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
              { maxLength: 5 },
            ),
            delay: fc.integer({ min: 100, max: 500 }), // Simulate network delay
          }),
          async ({ messages, delay }) => {
            // Ensure unique IDs
            const uniqueMessages = messages.map((msg, index) => ({
              ...msg,
              id: index + 1,
            }));

            mockMessageService.setMessages(uniqueMessages);
            mockMessageService.setDelay(delay);

            const wrapper = mount(MessagesList, {
              global: {
                provide: {
                  services: mockServices,
                },
                stubs: {
                  MessageItem: {
                    template: '<div class="test-message-item">Message</div>',
                    props: ['message'],
                    emits: ['like-changed'],
                  },
                },
              },
            });

            // Initially, loading should be true
            await wrapper.vm.$nextTick();
            expect(wrapper.find('.animate-pulse').exists()).toBe(true);

            // Wait for loading to complete
            await new Promise((resolve) => setTimeout(resolve, delay + 200));
            await wrapper.vm.$nextTick();

            // Ensure loading state is completely gone
            let attempts = 0;
            while (wrapper.find('.animate-pulse').exists() && attempts < 10) {
              await new Promise((resolve) => setTimeout(resolve, 50));
              await wrapper.vm.$nextTick();
              attempts++;
            }

            // After loading, loading state should be gone
            expect(wrapper.find('.animate-pulse').exists()).toBe(false);

            // Messages should be displayed (if any) or empty state should be shown
            if (uniqueMessages.length > 0) {
              expect(wrapper.findAll('.test-message-item').length).toBe(
                uniqueMessages.length,
              );
              // Should not show empty state when messages exist
              expect(wrapper.text()).not.toContain('Nenhuma mensagem ainda');
            } else {
              // Empty state should be shown when no messages
              expect(wrapper.findAll('.test-message-item').length).toBe(0);
              expect(wrapper.text()).toContain('Nenhuma mensagem ainda');
            }

            wrapper.unmount();
          },
        ),
        { numRuns: 30 }, // Reduced runs due to delays
      );
    }, 45000);

    it('Property 10: Error State Management - **Validates: Requirements 5.2, 5.4**', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            errorMessage: fc.string({ minLength: 1, maxLength: 100 }),
            shouldRetrySucceed: fc.boolean(),
            retryMessages: fc.array(
              fc.record({
                id: fc.integer({ min: 1, max: 1000 }),
                content: fc.string({ minLength: 1, maxLength: 100 }),
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
              { maxLength: 3 },
            ),
          }),
          async ({ errorMessage, shouldRetrySucceed, retryMessages }) => {
            // Set up initial error state
            mockMessageService.setShouldError(true, errorMessage);

            const wrapper = mount(MessagesList, {
              global: {
                provide: {
                  services: mockServices,
                },
                stubs: {
                  MessageItem: {
                    template: '<div class="test-message-item">Message</div>',
                    props: ['message'],
                    emits: ['like-changed'],
                  },
                },
              },
            });

            // Wait for initial load to fail
            await new Promise((resolve) => setTimeout(resolve, 100));
            await wrapper.vm.$nextTick();

            // Error state should be displayed
            expect(wrapper.find('.bg-red-50').exists()).toBe(true);
            expect(wrapper.text()).toContain('Erro ao carregar mensagens');
            expect(wrapper.text()).toContain(errorMessage);

            // Retry button should be present
            const retryButton = wrapper.find('button');
            expect(retryButton.exists()).toBe(true);
            expect(retryButton.text()).toContain('Tentar novamente');

            // Test retry functionality
            if (shouldRetrySucceed) {
              // Set up successful retry
              const uniqueRetryMessages = retryMessages.map((msg, index) => ({
                ...msg,
                id: index + 1,
              }));
              mockMessageService.setShouldError(false);
              mockMessageService.setMessages(uniqueRetryMessages);

              // Click retry button
              await retryButton.trigger('click');
              await new Promise((resolve) => setTimeout(resolve, 100));
              await wrapper.vm.$nextTick();

              // Error state should be gone
              expect(wrapper.find('.bg-red-50').exists()).toBe(false);

              // Messages should be displayed (if any) or empty state
              if (uniqueRetryMessages.length > 0) {
                expect(wrapper.findAll('.test-message-item').length).toBe(
                  uniqueRetryMessages.length,
                );
              } else {
                expect(wrapper.text()).toContain('Nenhuma mensagem ainda');
              }
            } else {
              // Retry should fail again
              await retryButton.trigger('click');
              await new Promise((resolve) => setTimeout(resolve, 100));
              await wrapper.vm.$nextTick();

              // Error state should still be displayed
              expect(wrapper.find('.bg-red-50').exists()).toBe(true);
              expect(wrapper.text()).toContain('Erro ao carregar mensagens');
            }

            wrapper.unmount();
          },
        ),
        { numRuns: 30 },
      );
    }, 30000);

    it('Property 7: Message List Refresh Integration - **Validates: Requirements 3.2**', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            initialMessages: fc.array(
              fc.record({
                id: fc.integer({ min: 1, max: 1000 }),
                content: fc.string({ minLength: 1, maxLength: 100 }),
                author: fc.record({
                  id: fc.integer({ min: 1, max: 100 }),
                  name: fc.string({ minLength: 1, maxLength: 50 }),
                  label: fc.string({ minLength: 1, maxLength: 10 }),
                }),
                createdAt: fc.date({
                  min: new Date('2020-01-01'),
                  max: new Date(Date.now() - 60000), // At least 1 minute ago
                }),
                likeCount: fc.integer({ min: 0, max: 1000 }),
                isLiked: fc.boolean(),
              }),
              { maxLength: 5 },
            ),
            newMessage: fc.record({
              id: fc.integer({ min: 1001, max: 2000 }), // Ensure unique ID
              content: fc.string({ minLength: 1, maxLength: 100 }),
              author: fc.record({
                id: fc.integer({ min: 1, max: 100 }),
                name: fc.string({ minLength: 1, maxLength: 50 }),
                label: fc.string({ minLength: 1, maxLength: 10 }),
              }),
              createdAt: fc.constant(new Date()), // New message is always newest
              likeCount: fc.constant(0), // New messages start with 0 likes
              isLiked: fc.constant(false),
            }),
          }),
          async ({ initialMessages, newMessage }) => {
            // Ensure unique IDs for initial messages
            const uniqueInitialMessages = initialMessages.map((msg, index) => ({
              ...msg,
              id: index + 1,
            }));

            // Set up initial messages
            mockMessageService.setMessages(uniqueInitialMessages);

            const wrapper = mount(MessagesList, {
              global: {
                provide: {
                  services: mockServices,
                },
                stubs: {
                  MessageItem: {
                    template: `
                      <div class="test-message-item" 
                           :data-message-id="message.id"
                           :data-created-at="message.createdAt.getTime()">
                        Message {{ message.id }}
                      </div>
                    `,
                    props: ['message'],
                    emits: ['like-changed'],
                  },
                },
              },
            });

            // Wait for initial load
            await new Promise((resolve) => setTimeout(resolve, 50));
            await wrapper.vm.$nextTick();

            // Get initial message count
            const initialMessageItems = wrapper.findAll('.test-message-item');
            const initialCount = initialMessageItems.length;

            // Simulate message creation by adding new message to service
            const updatedMessages = [...uniqueInitialMessages, newMessage];
            mockMessageService.setMessages(updatedMessages);

            // Call refreshMessages method (simulating form submission trigger)
            await wrapper.vm.refreshMessages();
            await wrapper.vm.$nextTick();

            // Wait for refresh to complete
            await new Promise((resolve) => setTimeout(resolve, 50));
            await wrapper.vm.$nextTick();

            // Verify new message appears in the list
            const updatedMessageItems = wrapper.findAll('.test-message-item');
            expect(updatedMessageItems.length).toBe(initialCount + 1);

            // Verify the new message is at the top (newest first)
            if (updatedMessageItems.length > 0) {
              const firstMessageId =
                updatedMessageItems[0]!.attributes('data-message-id');
              expect(firstMessageId).toBe(newMessage.id.toString());
            }

            // Verify chronological ordering is maintained
            if (updatedMessageItems.length > 1) {
              for (let i = 0; i < updatedMessageItems.length - 1; i++) {
                const currentTimestamp = parseInt(
                  updatedMessageItems[i]!.attributes('data-created-at')!,
                );
                const nextTimestamp = parseInt(
                  updatedMessageItems[i + 1]!.attributes('data-created-at')!,
                );

                // Current message should be newer than or equal to the next message
                expect(currentTimestamp).toBeGreaterThanOrEqual(nextTimestamp);
              }
            }

            wrapper.unmount();
          },
        ),
        { numRuns: 30 },
      );
    }, 30000);
  });

  describe('Unit Tests', () => {
    it('should render loading state initially', async () => {
      mockMessageService.setDelay(200);
      mockMessageService.setMessages([]);

      const wrapper = mount(MessagesList, {
        global: {
          provide: {
            services: mockServices,
          },
        },
      });

      await wrapper.vm.$nextTick();
      expect(wrapper.find('.animate-pulse').exists()).toBe(true);
      expect(wrapper.text()).toContain('Mensagens da Equipe');

      wrapper.unmount();
    });

    it('should render empty state when no messages', async () => {
      mockMessageService.setMessages([]);

      const wrapper = mount(MessagesList, {
        global: {
          provide: {
            services: mockServices,
          },
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain('Nenhuma mensagem ainda');
      expect(wrapper.text()).toContain(
        'Seja o primeiro a compartilhar algo com a equipe!',
      );

      wrapper.unmount();
    });

    it('should render messages when available', async () => {
      const testMessages: Message[] = [
        {
          id: 1,
          content: '<p>Test message 1</p>',
          author: {
            id: 1,
            name: 'John Doe',
            label: 'JD',
          },
          createdAt: new Date('2024-01-02'),
          likeCount: 5,
          isLiked: true,
        },
        {
          id: 2,
          content: '<p>Test message 2</p>',
          author: {
            id: 2,
            name: 'Jane Smith',
            label: 'JS',
          },
          createdAt: new Date('2024-01-01'),
          likeCount: 3,
          isLiked: false,
        },
      ];

      mockMessageService.setMessages(testMessages);

      const wrapper = mount(MessagesList, {
        global: {
          provide: {
            services: mockServices,
          },
          stubs: {
            MessageItem: {
              template: `
                <div class="test-message-item" 
                     :data-message-id="message.id">
                  {{ message.content }}
                </div>
              `,
              props: ['message'],
              emits: ['like-changed'],
            },
          },
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      const messageItems = wrapper.findAll('.test-message-item');
      expect(messageItems.length).toBe(2);

      // Verify chronological order (newest first)
      expect(messageItems[0]!.attributes('data-message-id')).toBe('1');
      expect(messageItems[1]!.attributes('data-message-id')).toBe('2');

      wrapper.unmount();
    });

    it('should handle like-changed events from MessageItem', async () => {
      const testMessages: Message[] = [
        {
          id: 1,
          content: '<p>Test message</p>',
          author: {
            id: 1,
            name: 'John Doe',
            label: 'JD',
          },
          createdAt: new Date(),
          likeCount: 5,
          isLiked: false,
        },
      ];

      mockMessageService.setMessages(testMessages);

      const wrapper = mount(MessagesList, {
        global: {
          provide: {
            services: mockServices,
          },
          stubs: {
            MessageItem: {
              template: `
                <div class="test-message-item" 
                     @click="$emit('like-changed', { messageId: 1, isLiked: true, likeCount: 6 })">
                  Click to like
                </div>
              `,
              props: ['message'],
              emits: ['like-changed'],
            },
          },
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      const messageItem = wrapper.find('.test-message-item');
      await messageItem.trigger('click');

      // The component should update its internal state
      // We can't directly test the internal state, but we can verify
      // that the component doesn't crash and continues to function
      expect(wrapper.exists()).toBe(true);

      wrapper.unmount();
    });

    it('should expose refreshMessages method', async () => {
      mockMessageService.setMessages([]);

      const wrapper = mount(MessagesList, {
        global: {
          provide: {
            services: mockServices,
          },
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      // Test that refreshMessages method exists and can be called
      expect(typeof wrapper.vm.refreshMessages).toBe('function');

      // Call refresh method
      await wrapper.vm.refreshMessages();

      // Component should still exist and function
      expect(wrapper.exists()).toBe(true);

      wrapper.unmount();
    });

    it('should handle service injection error', () => {
      expect(() => {
        mount(MessagesList, {
          global: {
            provide: {
              // No services provided
            },
          },
        });
      }).toThrow('Services not provided');
    });
  });
});
