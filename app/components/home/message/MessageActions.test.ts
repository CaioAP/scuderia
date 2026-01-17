import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import * as fc from 'fast-check';
import MessageActions from './MessageActions.vue';
import type { Services } from '#shared/types/Services';
import { MessageServiceMock } from '@/services/MessageService';

// Mock PrimeVue components and composables
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
  }),
}));

// Mock services
const mockMessageService = new MessageServiceMock();
const mockServices: Services = {
  notification: {} as any,
  message: mockMessageService,
};

describe('MessageActions Component', () => {
  describe('Property-Based Tests', () => {
    it('Property 3: Like State Toggle Behavior - **Validates: Requirements 2.1**', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            messageId: fc.integer({ min: 1, max: 1000 }),
            likeCount: fc.integer({ min: 0, max: 10000 }),
            isLiked: fc.boolean(),
          }),
          async ({ messageId, likeCount, isLiked }) => {
            // Mount component with test props
            const wrapper = mount(MessageActions, {
              props: {
                messageId,
                likeCount,
                isLiked,
                loading: false,
              },
              global: {
                provide: {
                  services: mockServices,
                },
                stubs: {
                  Button: {
                    template:
                      '<button @click="$emit(\'click\')" :disabled="disabled"><slot /></button>',
                    props: [
                      'disabled',
                      'loading',
                      'variant',
                      'severity',
                      'size',
                      'rounded',
                    ],
                    emits: ['click'],
                  },
                },
              },
            });

            // Get initial state
            const initialIsLiked = isLiked;

            // Simulate click on like button
            const button = wrapper.find('button');
            await button.trigger('click');

            // Wait for any async operations
            await wrapper.vm.$nextTick();

            // Verify that like-changed event was emitted with toggled state
            const emittedEvents = wrapper.emitted('like-changed');
            expect(emittedEvents).toBeDefined();
            expect(emittedEvents!.length).toBeGreaterThan(0);

            const lastEmittedEvent = emittedEvents![
              emittedEvents!.length - 1
            ]![0] as any;
            expect(lastEmittedEvent.messageId).toBe(messageId);
            expect(lastEmittedEvent.isLiked).toBe(!initialIsLiked);

            wrapper.unmount();
          },
        ),
        { numRuns: 50 },
      );
    }, 30000);

    it('Property 4: Like Count Accuracy - **Validates: Requirements 2.2, 2.3**', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            messageId: fc.integer({ min: 1, max: 1000 }),
            likeCount: fc.integer({ min: 0, max: 10000 }),
            isLiked: fc.boolean(),
          }),
          async ({ messageId, likeCount, isLiked }) => {
            // Mount component with test props
            const wrapper = mount(MessageActions, {
              props: {
                messageId,
                likeCount,
                isLiked,
                loading: false,
              },
              global: {
                provide: {
                  services: mockServices,
                },
                stubs: {
                  Button: {
                    template:
                      '<button @click="$emit(\'click\')" :disabled="disabled"><slot /></button>',
                    props: [
                      'disabled',
                      'loading',
                      'variant',
                      'severity',
                      'size',
                      'rounded',
                    ],
                    emits: ['click'],
                  },
                },
              },
            });

            // Get initial state
            const initialLikeCount = likeCount;
            const initialIsLiked = isLiked;

            // Simulate click on like button
            const button = wrapper.find('button');
            await button.trigger('click');

            // Wait for any async operations
            await wrapper.vm.$nextTick();

            // Verify that like-changed event was emitted with correct count
            const emittedEvents = wrapper.emitted('like-changed');
            expect(emittedEvents).toBeDefined();
            expect(emittedEvents!.length).toBeGreaterThan(0);

            const lastEmittedEvent = emittedEvents![
              emittedEvents!.length - 1
            ]![0] as any;
            expect(lastEmittedEvent.messageId).toBe(messageId);

            if (initialIsLiked) {
              // If initially liked, count should decrease by 1 (but not below 0)
              expect(lastEmittedEvent.likeCount).toBe(
                Math.max(0, initialLikeCount - 1),
              );
            } else {
              // If initially not liked, count should increase by 1
              expect(lastEmittedEvent.likeCount).toBe(initialLikeCount + 1);
            }

            wrapper.unmount();
          },
        ),
        { numRuns: 50 },
      );
    }, 30000);

    it('Property 5: Like Button State Representation - **Validates: Requirements 2.4, 2.5**', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            messageId: fc.integer({ min: 1, max: 1000 }),
            likeCount: fc.integer({ min: 0, max: 10000 }),
            isLiked: fc.boolean(),
            loading: fc.boolean(),
          }),
          async ({ messageId, likeCount, isLiked, loading }) => {
            // Mount component with test props
            const wrapper = mount(MessageActions, {
              props: {
                messageId,
                likeCount,
                isLiked,
                loading,
              },
              global: {
                provide: {
                  services: mockServices,
                },
                stubs: {
                  Button: {
                    template: `
                      <button 
                        :class="[
                          'test-button',
                          variant === 'filled' ? 'filled' : 'outlined',
                          severity === 'primary' ? 'primary' : 'secondary'
                        ]" 
                        :disabled="disabled || loading"
                        @click="$emit('click')"
                      >
                        <slot />
                      </button>
                    `,
                    props: [
                      'disabled',
                      'loading',
                      'variant',
                      'severity',
                      'size',
                      'rounded',
                    ],
                    emits: ['click'],
                  },
                },
              },
            });

            // Check button state representation
            const button = wrapper.find('button');
            expect(button.exists()).toBe(true);

            // Verify button variant and severity based on like state
            if (isLiked) {
              expect(button.classes()).toContain('filled');
              expect(button.classes()).toContain('primary');
            } else {
              expect(button.classes()).toContain('outlined');
              expect(button.classes()).toContain('secondary');
            }

            // Verify button is disabled when loading
            if (loading) {
              expect(button.attributes('disabled')).toBeDefined();
            } else {
              // Button should not be disabled when not loading
              const disabledAttr = button.attributes('disabled');
              expect(disabledAttr === undefined || disabledAttr === null).toBe(
                true,
              );
            }

            // Verify heart icon color based on like state
            const heartIcon = wrapper.find('svg');
            expect(heartIcon.exists()).toBe(true);

            if (isLiked) {
              expect(heartIcon.classes()).toContain('text-red-500');
            } else {
              expect(heartIcon.classes()).toContain('text-gray-400');
            }

            wrapper.unmount();
          },
        ),
        { numRuns: 50 },
      );
    }, 30000);
  });

  describe('Unit Tests', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should render with correct initial props', () => {
      const wrapper = mount(MessageActions, {
        props: {
          messageId: 1,
          likeCount: 5,
          isLiked: true,
          loading: false,
        },
        global: {
          provide: {
            services: mockServices,
          },
          stubs: {
            Button: {
              template: '<button><slot /></button>',
              props: [
                'disabled',
                'loading',
                'variant',
                'severity',
                'size',
                'rounded',
              ],
            },
          },
        },
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.text()).toContain('5');
    });

    it('should format like count correctly', () => {
      const testCases = [
        { count: 0, expected: '0' },
        { count: 1, expected: '1' },
        { count: 999, expected: '999' },
        { count: 1000, expected: '1.0k' },
        { count: 1500, expected: '1.5k' },
        { count: 1000000, expected: '1.0M' },
        { count: 2500000, expected: '2.5M' },
      ];

      testCases.forEach(({ count, expected }) => {
        const wrapper = mount(MessageActions, {
          props: {
            messageId: 1,
            likeCount: count,
            isLiked: false,
            loading: false,
          },
          global: {
            provide: {
              services: mockServices,
            },
            stubs: {
              Button: {
                template: '<button><slot /></button>',
                props: [
                  'disabled',
                  'loading',
                  'variant',
                  'severity',
                  'size',
                  'rounded',
                ],
              },
            },
          },
        });

        expect(wrapper.text()).toContain(expected);
        wrapper.unmount();
      });
    });

    it('should handle click when not loading', async () => {
      const wrapper = mount(MessageActions, {
        props: {
          messageId: 1,
          likeCount: 5,
          isLiked: false,
          loading: false,
        },
        global: {
          provide: {
            services: mockServices,
          },
          stubs: {
            Button: {
              template:
                '<button @click="$emit(\'click\')" :disabled="disabled"><slot /></button>',
              props: [
                'disabled',
                'loading',
                'variant',
                'severity',
                'size',
                'rounded',
              ],
              emits: ['click'],
            },
          },
        },
      });

      const button = wrapper.find('button');
      await button.trigger('click');

      const emittedEvents = wrapper.emitted('like-changed');
      expect(emittedEvents).toBeDefined();
      expect(emittedEvents!.length).toBeGreaterThan(0);
    });

    it('should not handle click when loading', async () => {
      const wrapper = mount(MessageActions, {
        props: {
          messageId: 1,
          likeCount: 5,
          isLiked: false,
          loading: true,
        },
        global: {
          provide: {
            services: mockServices,
          },
          stubs: {
            Button: {
              template:
                '<button @click="$emit(\'click\')" :disabled="disabled || loading"><slot /></button>',
              props: [
                'disabled',
                'loading',
                'variant',
                'severity',
                'size',
                'rounded',
              ],
              emits: ['click'],
            },
          },
        },
      });

      const button = wrapper.find('button');
      expect(button.attributes('disabled')).toBeDefined();
    });
  });
});
