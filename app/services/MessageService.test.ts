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
        { numRuns: 50 }, // Reduced runs for faster execution
      );
    }, 10000); // 10 second timeout
  });
});
