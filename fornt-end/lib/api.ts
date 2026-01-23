import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.URL_BACK_END || 'http://localhost:3001',
  withCredentials: true,
});
