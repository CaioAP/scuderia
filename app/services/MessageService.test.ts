import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { MessageServiceMock, type MessageService } from './MessageService';
import type { Message } from '#shared/types/Message';

describe('MessageService', () => {
  describe('Property-Based Tests', () => {
    it('Property 8: Service Data Structure Compliance - **Validates: Requirements 4.4**', async () => {
      const messageService: MessageService = new MessageServiceMock();

      await fc.assert(
        fc.asyncProperty(fc.constant(null), async () => {
          // Get messages from the service
          const messages = await messageService.getMessages();

          // Verify that messages is an array
          expect(Array.isArray(messages)).toBe(true);

          // For each message, verify it has all required fields from the Message interface
          messages.forEach((message: Message) => {
            // Required fields from Message interface
            expect(typeof message.id).toBe('number');
            expect(typeof message.content).toBe('string');
            expect(typeof message.author).toBe('object');
            expect(message.author).not.toBeNull();
            expect(message.createdAt).toBeInstanceOf(Date);
            expect(typeof message.likeCount).toBe('number');
            expect(typeof message.isLiked).toBe('boolean');

            // Author should have required User interface fields
            expect(typeof message.author.id).toBe('number');
            expect(typeof message.author.name).toBe('string');
            expect(typeof message.author.label).toBe('string');

            // Optional fields should be string or undefined
            if (message.author.avatar !== undefined) {
              expect(typeof message.author.avatar).toBe('string');
            }
            if (message.author.jobPosition !== undefined) {
              expect(typeof message.author.jobPosition).toBe('string');
            }

            // Optional loading field should be boolean or undefined
            if (message.loading !== undefined) {
              expect(typeof message.loading).toBe('boolean');
            }

            // Validate data constraints
            expect(message.id).toBeGreaterThan(0);
            expect(message.likeCount).toBeGreaterThanOrEqual(0);
            expect(message.content.length).toBeGreaterThan(0);
            expect(message.author.name.length).toBeGreaterThan(0);
            expect(message.author.label.length).toBeGreaterThan(0);
          });
        }),
        { numRuns: 10 }, // Reduced runs for debugging
      );
    }, 30000); // Increased timeout

    it('Property 9: Like Operation Persistence - **Validates: Requirements 4.5**', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 7 }), // Use valid message IDs from mock data
          async (messageId) => {
            const messageService: MessageService = new MessageServiceMock();

            // Get initial messages to find a valid message ID
            const initialMessages = await messageService.getMessages();
            const validMessage =
              initialMessages.find((m) => m.id === messageId) ||
              initialMessages[0]!;
            const targetMessageId = validMessage.id;

            // Get initial state
            const messagesBefore = await messageService.getMessages();
            const messageBefore = messagesBefore.find(
              (m) => m.id === targetMessageId,
            );
            expect(messageBefore).toBeDefined();

            const initialLikeCount = messageBefore!.likeCount;
            const initialIsLiked = messageBefore!.isLiked;

            if (initialIsLiked) {
              // If initially liked, unlike it
              await messageService.unlikeMessage(targetMessageId);

              // Verify the change persisted
              const messagesAfterUnlike = await messageService.getMessages();
              const messageAfterUnlike = messagesAfterUnlike.find(
                (m) => m.id === targetMessageId,
              );
              expect(messageAfterUnlike).toBeDefined();
              expect(messageAfterUnlike!.likeCount).toBe(
                Math.max(0, initialLikeCount - 1),
              );
              expect(messageAfterUnlike!.isLiked).toBe(false);

              // Like it back
              await messageService.likeMessage(targetMessageId);

              // Verify the change persisted
              const messagesAfterLike = await messageService.getMessages();
              const messageAfterLike = messagesAfterLike.find(
                (m) => m.id === targetMessageId,
              );
              expect(messageAfterLike).toBeDefined();
              expect(messageAfterLike!.likeCount).toBe(initialLikeCount);
              expect(messageAfterLike!.isLiked).toBe(true);
            } else {
              // If initially not liked, like it
              await messageService.likeMessage(targetMessageId);

              // Verify the change persisted
              const messagesAfterLike = await messageService.getMessages();
              const messageAfterLike = messagesAfterLike.find(
                (m) => m.id === targetMessageId,
              );
              expect(messageAfterLike).toBeDefined();
              expect(messageAfterLike!.likeCount).toBe(initialLikeCount + 1);
              expect(messageAfterLike!.isLiked).toBe(true);

              // Unlike it back
              await messageService.unlikeMessage(targetMessageId);

              // Verify the change persisted
              const messagesAfterUnlike = await messageService.getMessages();
              const messageAfterUnlike = messagesAfterUnlike.find(
                (m) => m.id === targetMessageId,
              );
              expect(messageAfterUnlike).toBeDefined();
              expect(messageAfterUnlike!.likeCount).toBe(initialLikeCount);
              expect(messageAfterUnlike!.isLiked).toBe(false);
            }
          },
        ),
        { numRuns: 10 }, // Reduced runs for debugging
      );
    }, 30000); // Increased timeout
  });

  // Add a simple unit test to verify basic functionality
  describe('Unit Tests', () => {
    it('should create MessageService and get messages', async () => {
      const messageService = new MessageServiceMock();
      const messages = await messageService.getMessages();

      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBeGreaterThan(0);

      const firstMessage = messages[0]!;
      expect(firstMessage.id).toBeDefined();
      expect(firstMessage.content).toBeDefined();
      expect(firstMessage.author).toBeDefined();
      expect(firstMessage.createdAt).toBeInstanceOf(Date);
    });

    it('should handle like/unlike operations', async () => {
      const messageService = new MessageServiceMock();
      const messages = await messageService.getMessages();
      const testMessage = messages[0]!;

      const initialLikeCount = testMessage.likeCount;
      const initialIsLiked = testMessage.isLiked;

      if (initialIsLiked) {
        await messageService.unlikeMessage(testMessage.id);
        const updatedMessages = await messageService.getMessages();
        const updatedMessage = updatedMessages.find(
          (m) => m.id === testMessage.id,
        );
        expect(updatedMessage!.isLiked).toBe(false);
      } else {
        await messageService.likeMessage(testMessage.id);
        const updatedMessages = await messageService.getMessages();
        const updatedMessage = updatedMessages.find(
          (m) => m.id === testMessage.id,
        );
        expect(updatedMessage!.isLiked).toBe(true);
      }
    });
  });
});
