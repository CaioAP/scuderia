import type { Message } from '#shared/types/Message';
import type { User } from '#shared/types/User';

export interface MessageService {
  getMessages(): Promise<Message[]>;
  likeMessage(messageId: number): Promise<void>;
  unlikeMessage(messageId: number): Promise<void>;
  createMessage(content: string): Promise<Message>;
}

// Mock user data for sample messages
const mockUsers: User[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    label: 'alice.johnson',
    avatar: '/images/avatars/alice.jpg',
    jobPosition: 'Product Manager',
  },
  {
    id: 2,
    name: 'Bob Smith',
    label: 'bob.smith',
    avatar: '/images/avatars/bob.jpg',
    jobPosition: 'Senior Developer',
  },
  {
    id: 3,
    name: 'Carol Davis',
    label: 'carol.davis',
    avatar: '/images/avatars/carol.jpg',
    jobPosition: 'UX Designer',
  },
  {
    id: 4,
    name: 'David Wilson',
    label: 'david.wilson',
    avatar: '/images/avatars/david.jpg',
    jobPosition: 'Marketing Lead',
  },
  {
    id: 5,
    name: 'Emma Brown',
    label: 'emma.brown',
    avatar: '/images/avatars/emma.jpg',
    jobPosition: 'HR Manager',
  },
];

// Mock message data with various content types and timestamps
const mockMessages: Message[] = [
  {
    id: 1,
    content:
      "<p>Welcome to our new employee engagement platform! 🎉 We're excited to have everyone on board and look forward to better communication and collaboration.</p>",
    author: mockUsers[4]!, // Emma Brown (HR Manager)
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    likeCount: 12,
    isLiked: false,
  },
  {
    id: 2,
    content:
      '<p>Great job on the Q4 product launch! 🚀</p><p><strong>Key achievements:</strong></p><ul><li>Delivered on time</li><li>Exceeded user engagement targets by 25%</li><li>Positive customer feedback</li></ul><p>Thank you to everyone who contributed!</p>',
    author: mockUsers[0]!, // Alice Johnson (Product Manager)
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    likeCount: 8,
    isLiked: true,
  },
  {
    id: 3,
    content:
      '<p>Just pushed the latest updates to the design system. 🎨</p><p>New components include:</p><ul><li>Enhanced button variants</li><li>Improved form controls</li><li>Updated color palette</li></ul><p>Check out the <a href="/design-system">design system docs</a> for details!</p>',
    author: mockUsers[2]!, // Carol Davis (UX Designer)
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    likeCount: 15,
    isLiked: false,
  },
  {
    id: 4,
    content:
      "<p>Reminder: Team building event this Friday at 3 PM! 🎯</p><p>We'll be doing some fun activities in the main conference room. Pizza and drinks will be provided. Looking forward to seeing everyone there!</p>",
    author: mockUsers[4]!, // Emma Brown (HR Manager)
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    likeCount: 23,
    isLiked: true,
  },
  {
    id: 5,
    content:
      '<p>Code review best practices session was fantastic! 👨‍💻</p><p>Key takeaways:</p><ol><li>Focus on readability and maintainability</li><li>Provide constructive feedback</li><li>Test edge cases thoroughly</li></ol><p>Thanks to everyone who attended and shared their insights.</p>',
    author: mockUsers[1]!, // Bob Smith (Senior Developer)
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    likeCount: 7,
    isLiked: false,
  },
  {
    id: 6,
    content:
      '<p>Exciting news! 📈 Our latest marketing campaign achieved:</p><ul><li><strong>150% increase</strong> in website traffic</li><li><strong>85% boost</strong> in lead generation</li><li><strong>40% improvement</strong> in conversion rates</li></ul><p>Fantastic work from the entire marketing team!</p>',
    author: mockUsers[3]!, // David Wilson (Marketing Lead)
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    likeCount: 19,
    isLiked: true,
  },
  {
    id: 7,
    content:
      "<p>Monthly all-hands meeting scheduled for next Tuesday at 10 AM. 📅</p><p><em>Agenda includes:</em></p><ul><li>Q1 goals and objectives</li><li>Department updates</li><li>New hire introductions</li><li>Q&A session</li></ul><p>Please come prepared with any questions or topics you'd like to discuss.</p>",
    author: mockUsers[4]!, // Emma Brown (HR Manager)
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    likeCount: 11,
    isLiked: false,
  },
];

export class MessageServiceMock implements MessageService {
  private messages: Message[] = [...mockMessages];
  private currentUserId: number = 1; // Simulated current user

  async getMessages(): Promise<Message[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Return messages sorted by creation date (newest first)
    return this.messages
      .map((message) => ({
        ...message,
        isLiked: this.isMessageLikedByCurrentUser(message.id),
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async likeMessage(messageId: number): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const message = this.messages.find((m) => m.id === messageId);
    if (!message) {
      throw new Error(`Message with id ${messageId} not found`);
    }

    if (!this.isMessageLikedByCurrentUser(messageId)) {
      message.likeCount += 1;
      // In a real implementation, this would be stored in a separate likes table
      // For mock purposes, we'll track it in a simple way
      this.addLikeForCurrentUser(messageId);
    }
  }

  async unlikeMessage(messageId: number): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const message = this.messages.find((m) => m.id === messageId);
    if (!message) {
      throw new Error(`Message with id ${messageId} not found`);
    }

    if (this.isMessageLikedByCurrentUser(messageId)) {
      message.likeCount = Math.max(0, message.likeCount - 1);
      this.removeLikeForCurrentUser(messageId);
    }
  }

  async createMessage(content: string): Promise<Message> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const newMessage: Message = {
      id: Math.max(...this.messages.map((m) => m.id)) + 1,
      content,
      author:
        mockUsers.find((u) => u.id === this.currentUserId) || mockUsers[0]!,
      createdAt: new Date(),
      likeCount: 0,
      isLiked: false,
    };

    this.messages.push(newMessage);
    return newMessage;
  }

  // Private helper methods for like tracking
  private likedMessages: Set<number> = new Set([2, 4, 6]); // Mock some initial likes

  private isMessageLikedByCurrentUser(messageId: number): boolean {
    return this.likedMessages.has(messageId);
  }

  private addLikeForCurrentUser(messageId: number): void {
    this.likedMessages.add(messageId);
  }

  private removeLikeForCurrentUser(messageId: number): void {
    this.likedMessages.delete(messageId);
  }
}

export class MessageServiceHttp implements MessageService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async getMessages(): Promise<Message[]> {
    // TODO: Implement HTTP-based message fetching
    // const response = await fetch(`${this.baseUrl}/messages`);
    // const data = await response.json();
    // return data.map(this.transformMessageData);
    throw new Error('MessageServiceHttp not yet implemented');
  }

  async likeMessage(messageId: number): Promise<void> {
    // TODO: Implement HTTP-based like operation
    // await fetch(`${this.baseUrl}/messages/${messageId}/like`, { method: 'POST' });
    throw new Error('MessageServiceHttp not yet implemented');
  }

  async unlikeMessage(messageId: number): Promise<void> {
    // TODO: Implement HTTP-based unlike operation
    // await fetch(`${this.baseUrl}/messages/${messageId}/like`, { method: 'DELETE' });
    throw new Error('MessageServiceHttp not yet implemented');
  }

  async createMessage(content: string): Promise<Message> {
    // TODO: Implement HTTP-based message creation
    // const response = await fetch(`${this.baseUrl}/messages`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ content })
    // });
    // return await response.json();
    throw new Error('MessageServiceHttp not yet implemented');
  }
}

export class MessageServiceFetch implements MessageService {
  async getMessages(): Promise<Message[]> {
    // TODO: Implement Nuxt API-based message fetching
    // const { data } = await $fetch('/api/messages');
    // return data;
    throw new Error('MessageServiceFetch not yet implemented');
  }

  async likeMessage(messageId: number): Promise<void> {
    // TODO: Implement Nuxt API-based like operation
    // await $fetch(`/api/messages/${messageId}/like`, { method: 'POST' });
    throw new Error('MessageServiceFetch not yet implemented');
  }

  async unlikeMessage(messageId: number): Promise<void> {
    // TODO: Implement Nuxt API-based unlike operation
    // await $fetch(`/api/messages/${messageId}/like`, { method: 'DELETE' });
    throw new Error('MessageServiceFetch not yet implemented');
  }

  async createMessage(content: string): Promise<Message> {
    // TODO: Implement Nuxt API-based message creation
    // return await $fetch('/api/messages', {
    //   method: 'POST',
    //   body: { content }
    // });
    throw new Error('MessageServiceFetch not yet implemented');
  }
}
