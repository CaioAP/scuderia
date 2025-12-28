export interface Notification {
	id: number;
	read: boolean;
	initials: string;
	name: string;
	label: string;
	avatar: string | null;
	createdAt: Date;
	loading?: boolean;
}
