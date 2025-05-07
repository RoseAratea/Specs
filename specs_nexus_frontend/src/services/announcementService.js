import axios from 'axios';
const API_URL = 'http://localhost:8000';

export async function getAnnouncements(token) {
  const response = await axios.get(`${API_URL}/announcements`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
