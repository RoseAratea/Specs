import axios from 'axios';

const API_URL = 'http://localhost:8000'; 

export async function getEvents(token) {
  const response = await axios.get(`${API_URL}/events`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function joinEvent(eventId, token) {
  const response = await axios.post(`${API_URL}/events/join/${eventId}`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function leaveEvent(eventId, token) {
  const response = await axios.post(`${API_URL}/events/leave/${eventId}`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
