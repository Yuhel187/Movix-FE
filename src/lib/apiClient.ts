import axios from 'axios';
const isServer = typeof window === 'undefined';

const api = axios.create({
  baseURL: isServer
    ? process.env.API_URL               
    : process.env.NEXT_PUBLIC_API_URL,  
});

export default api;