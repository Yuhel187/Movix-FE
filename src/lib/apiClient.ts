import axios from 'axios';
console.log('API Base URL từ .env:', process.env.NEXT_PUBLIC_API_URL);
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export default api;