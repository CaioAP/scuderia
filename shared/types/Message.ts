import type { User } from './User';

export interface Message {
  id: number;
  content: string; // Rich text HTML from Quill editor
  author: User;
  createdAt: Date;
  likeCount: number;
  isLiked: boolean; // Current user's like status
  loading?: boolean; // For optimistic updates
}
