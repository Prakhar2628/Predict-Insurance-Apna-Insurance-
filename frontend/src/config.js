// Central API configuration
// In production, set VITE_API_URL in your Vercel/Netlify environment variables
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default API_BASE;
