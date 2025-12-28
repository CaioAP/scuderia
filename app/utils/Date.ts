export const formatDateLastUpdated = (date: Date): string => {
	const today = new Date();
	const diffInMilliseconds: number = today.getTime() - date.getTime();

	const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
	if (diffInSeconds === 1) {
		`${diffInSeconds} segundo atrás`;
	} else if (diffInSeconds < 60) {
		return `${diffInSeconds} segundos atrás`;
	}

	const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
	if (diffInMinutes === 1) {
		return `${diffInMinutes} minuto atrás`;
	} else if (diffInMinutes < 60) {
		return `${diffInMinutes} minutos atrás`;
	}

	const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
	if (diffInHours === 1) {
		return `${diffInHours} hora atrás`;
	} else if (diffInHours < 24) {
		return `${diffInHours} horas atrás`;
	}

	const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
	if (diffInDays === 1) {
		return `${diffInDays} dia atrás`;
	} else if (diffInDays < 30) {
		return `${diffInDays} dias atrás`;
	}

	const diffInMonths = Math.floor(
		diffInMilliseconds / (1000 * 60 * 60 * 24 * 30),
	);
	if (diffInMonths === 1) {
		return `${diffInMonths} mês atrás`;
	} else if (diffInMonths < 12) {
		return `${diffInMonths} meses atrás`;
	}

	const diffInYears = Math.floor(
		diffInMilliseconds / (1000 * 60 * 60 * 24 * 30 * 12),
	);
	if (diffInYears === 1) {
		return `${diffInYears} ano atrás`;
	}

	return `${diffInYears} anos atrás`;
};
