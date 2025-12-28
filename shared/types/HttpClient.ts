export interface HttpClient {
	baseURL: string;

	get<T>(endpoint: string): Promise<T>;
	post<T, D>(endpoint: string, body: D): Promise<T>;
	patch<T, D>(endpoint: string, body: D): Promise<T>;
	put<T, D>(endpoint: string, body: D): Promise<T>;
	delete<T>(endpoint: string): Promise<T>;
}
