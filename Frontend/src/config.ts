const API_BASE_URL = import.meta.env.PROD
  ? 'https://inventory-manager-zs7j.onrender.com/api' // IMPORTANT: Replace with your actual backend URL from Render
  : 'http://localhost:5000/api';

export default API_BASE_URL;
