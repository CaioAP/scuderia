import type { Message } from '#shared/types/Message';
import type { User } from '#shared/types/User';
import type { HttpClient } from '#shared/types/HttpClient';

// Mock data for development
export const MOCK_MESSAGES: Message[] = [
  {
    id: 1,
    content:
      '<p>Welcome to our new messaging system! 🎉 This is a rich text message with <strong>bold text</strong> and <em>italic formatting</em>.</p>',
    author: {
      id: 1,
      name: 'Caio Alfonso',
      label: 'Product Manager',
      avatar:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzR0bIMZ71HVeR5zF4PihQaDvTQQk6bsVERw&s',
      jobPosition: 'Product Manager',
    },
    createdAt: new Date('2025-01-17T10:30:00'),
    likeCount: 5,
    isLiked: true,
  },
  {
    id: 2,
    content:
      '<p>Great work on the quarterly results! 📈</p><ul><li>Revenue increased by 15%</li><li>Customer satisfaction up 20%</li><li>Team productivity improved</li></ul>',
    author: {
      id: 2,
      name: 'Maria Silva',
      label: 'CEO',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      jobPosition: 'Chief Executive Officer',
    },
    createdAt: new Date('2025-01-17T09:15:00'),
    likeCount: 12,
    isLiked: false,
  },
  {
    id: 3,
    content:
      "<p>Don't forget about the team building event next Friday! 🎯</p><p>Location: <strong>Conference Room A</strong><br>Time: <strong>2:00 PM - 4:00 PM</strong></p>",
    author: {
      id: 3,
      name: 'João Santos',
      label: 'HR Manager',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      jobPosition: 'Human Resources Manager',
    },
    createdAt: new Date('2025-01-16T16:45:00'),
    likeCount: 8,
    isLiked: true,
  },
  {
    id: 4,
    content:
      '<p>New security guidelines are now in effect. Please review the updated policies in the company handbook.</p>',
    author: {
      id: 4,
      name: 'Ana Costa',
      label: 'IT Security',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      jobPosition: 'IT Security Specialist',
    },
    createdAt: new Date('2025-01-16T14:20:00'),
    likeCount: 3,
    isLiked: false,
  },
  {
    id: 5,
    content:
      '<p>Congratulations to our development team for the successful product launch! 🚀</p><p>The new features are already receiving positive feedback from our users.</p>',
    author: {
      id: 5,
      name: 'Pedro Oliveira',
      label: 'Tech Lead',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      jobPosition: 'Technical Lead',
    },
    createdAt: new Date('2025-01-15T11:30:00'),
    likeCount: 15,
    isLiked: true,
  },
];

export interface MessageService {
  getMessages(): Promise<Message[]>;
  likeMessage(messageId: number): Promise<void>;
  unlikeMessage(messageId: number): Promise<void>;
  createMessage(content: string): Promise<Message>;
}

export class MessageServiceFetch implements MessageService {
  api: typeof $fetch;

  constructor() {
    this.api = useApi();
  }

  getMessages(): Promise<Message[]> {
    return this.api('/messages');
  }

  likeMessage(messageId: number): Promise<void> {
    return this.api(`/messages/${messageId}/like`, { method: 'POST' });
  }

  unlikeMessage(messageId: number): Promise<void> {
    return this.api(`/messages/${messageId}/unlike`, { method: 'POST' });
  }

  createMessage(content: string): Promise<Message> {
    return this.api('/messages', { method: 'POST', body: { content } });
  }
}

export class MessageServiceHttp implements MessageService {
  constructor(readonly httpClient: HttpClient) {}

  async getMessages(): Promise<Message[]> {
    const output = await this.httpClient.get<Message[]>('/messages');
    return output;
  }

  async likeMessage(messageId: number): Promise<void> {
    await this.httpClient.post(`/messages/${messageId}/like`, undefined);
  }

  async unlikeMessage(messageId: number): Promise<void> {
    await this.httpClient.post(`/messages/${messageId}/unlike`, undefined);
  }

  async createMessage(content: string): Promise<Message> {
    const output = await this.httpClient.post<Message, { content: string }>(
      '/messages',
      {
        content,
      },
    );
    return output;
  }
}

export class MessageServiceMock implements MessageService {
  private messages: Message[] = [...MOCK_MESSAGES];

  constructor() {}

  getMessages(): Promise<Message[]> {
    return new Promise((resolve) => {
      // Sort by createdAt descending (newest first)
      const sortedMessages = [...this.messages].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setTimeout(() => resolve(sortedMessages), 10); // Reduced delay for testing
    });
  }

  likeMessage(messageId: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const message = this.messages.find((m) => m.id === messageId);
        if (message && !message.isLiked) {
          message.isLiked = true;
          message.likeCount += 1;
        }
        resolve();
      }, 300);
    });
  }

  unlikeMessage(messageId: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const message = this.messages.find((m) => m.id === messageId);
        if (message && message.isLiked) {
          message.isLiked = false;
          message.likeCount -= 1;
        }
        resolve();
      }, 300);
    });
  }

  createMessage(content: string): Promise<Message> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMessage: Message = {
          id: Math.max(...this.messages.map((m) => m.id)) + 1,
          content,
          author: {
            id: 1,
            name: 'Current User',
            label: 'Employee',
            avatar:
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
            jobPosition: 'Employee',
          },
          createdAt: new Date(),
          likeCount: 0,
          isLiked: false,
        };
        this.messages.push(newMessage);
        resolve(newMessage);
      }, 500);
    });
  }
}
