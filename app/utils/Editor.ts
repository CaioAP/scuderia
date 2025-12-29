export const stripHtml = (html: string) => {
	// Use a regex or DOMParser to remove tags
	// This regex removes everything between < and >
	return html
		.replace(/<[^>]*>/g, '')
		.replace(/&nbsp;/g, ' ')
		.trim();
};
