import axios from 'axios';

const API_URL = 'http://localhost:8000'; 

export async function getProfile(token) {
  const response = await axios.get(`${API_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
