import dotenv from 'dotenv';

dotenv.config();

export const DIR = 'book';
export const BOOKSTACK_API_URL = 'https://emd.dad.ynh.fr/api';
export const BOOKSTACK_TOKEN = process.env.BOOKSTACK_ID + ':' + process.env.BOOKSTACK_TOKEN;
export const DOWNLOAD_IMAGES = process.env.DOWNLOAD_IMAGES !== 'false';

export const state = {
	pages: [],
	tags: []
};
