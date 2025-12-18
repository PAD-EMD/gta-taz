import axios from 'axios';
import { BOOKSTACK_API_URL, BOOKSTACK_TOKEN } from './config.js';

export const api = axios.create({
	baseURL: BOOKSTACK_API_URL,
	headers: { Authorization: `Token ${BOOKSTACK_TOKEN}` }
});

export async function fetchBook(bookId = 1) {
	const response = await api.get(`/books/${bookId}`);
	return response.data;
}

export async function fetchPage(pageId) {
	const response = await api.get(`/pages/${pageId}?html=true`);
	return response.data;
}
