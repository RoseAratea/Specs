import axios from 'axios';
const API_URL = 'http://localhost:8000';

export async function getClearance(userId, token) {
  const response = await axios.get(`${API_URL}/clearance/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
