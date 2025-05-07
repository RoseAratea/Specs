import axios from 'axios';
const API_URL = 'http://localhost:8000';

export async function getDashboardAnalytics(token) {
  const response = await axios.get(`${API_URL}/analytics/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
