import axios from 'axios';

const API_URL = 'http://localhost:8000';

export async function officerLogin(credentials) {
  const response = await axios.post(`${API_URL}/officers/login`, credentials);
  return response.data;
}
