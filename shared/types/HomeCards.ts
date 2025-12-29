import type { User } from './User';

export interface HomeCardBirthdays {
	today: User[];
	month: User[];
}

export interface HomeCardSurveys {
	month: number;
	total: number;
	answered: number;
}

export interface HomeCardAnnouncements {
	month: number;
	total: number;
}

export interface HomeCardFeedbacks {
	sent: number;
	received: number;
	latestUser: User;
}
