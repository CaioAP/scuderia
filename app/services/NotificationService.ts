import type { Notification } from '#shared/types/Notification';

export const NOTIFICATIONS: Notification[] = [
	{
		id: 1,
		read: false,
		initials: 'CA',
		name: 'Caio Alfonso',
		label: 'enviou uma mensagem',
		avatar:
			'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzR0bIMZ71HVeR5zF4PihQaDvTQQk6bsVERw&s',
		createdAt: new Date('2025-12-23T23:38:00'),
	},
	{
		id: 2,
		read: false,
		initials: 'CA',
		name: 'Caio Alfonso',
		label: 'enviou uma mensagem',
		avatar:
			'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzR0bIMZ71HVeR5zF4PihQaDvTQQk6bsVERw&s',
		createdAt: new Date('2025-12-15T12:00:00'),
	},
	{
		id: 3,
		read: true,
		initials: 'CA',
		name: 'Caio Alfonso',
		label: 'enviou uma mensagem',
		avatar:
			'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzR0bIMZ71HVeR5zF4PihQaDvTQQk6bsVERw&s',
		createdAt: new Date('2025-12-10T12:00:00'),
	},
	{
		id: 4,
		read: false,
		initials: 'CA',
		name: 'Caio Alfonso',
		label: 'enviou uma mensagem',
		avatar:
			'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzR0bIMZ71HVeR5zF4PihQaDvTQQk6bsVERw&s',
		createdAt: new Date('2025-12-05T12:00:00'),
	},
	{
		id: 5,
		read: true,
		initials: 'CA',
		name: 'Caio Alfonso',
		label: 'enviou uma mensagem',
		avatar:
			'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzR0bIMZ71HVeR5zF4PihQaDvTQQk6bsVERw&s',
		createdAt: new Date('2025-12-01T12:00:00'),
	},
];

export interface NotificationService {
	getMostRecent(): Promise<Notification[]>;
	markAllRead(): Promise<void>;
	markRead(id: number): Promise<void>;
}

export class NotificationServiceFetch implements NotificationService {
	api: typeof $fetch;

	constructor() {
		this.api = useApi();
	}

	getMostRecent(): Promise<Notification[]> {
		return this.api(`/notifications/recent`);
	}

	markAllRead(): Promise<void> {
		return this.api(`/notifications/read`, { method: 'POST' });
	}

	markRead(id: number): Promise<void> {
		return this.api(`/notifications/read`, { method: 'PATCH', body: { id } });
	}
}

export class NotificationServiceHttp implements NotificationService {
	constructor(readonly httpClient: HttpClient) {}

	async getMostRecent(): Promise<Notification[]> {
		const output = await this.httpClient.get<Notification[]>(
			'/notifications/recent',
		);
		return output;
	}

	async markAllRead(): Promise<void> {
		await this.httpClient.post('/notifications/read', undefined);
	}

	async markRead(id: number): Promise<void> {
		await this.httpClient.patch('/notificiations/read', { id });
	}
}

export class NotificationServiceMock implements NotificationService {
	constructor() {}

	getMostRecent(): Promise<Notification[]> {
		return new Promise((res) => {
			res(NOTIFICATIONS);
		});
	}

	markAllRead(): Promise<void> {
		return new Promise((res) => setTimeout(res, 2000));
	}

	markRead(id: number): Promise<void> {
		return new Promise((res) => setTimeout(res, 2000));
	}
}
