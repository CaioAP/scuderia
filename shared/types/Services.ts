import type { NotificationService } from '@/services/NotificationService';
import type { MessageService } from '@/services/MessageService';

export interface Services {
  notification: NotificationService;
  message: MessageService;
}
