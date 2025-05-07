import axios from 'axios';

const API_URL = 'http://localhost:8000';

export async function getOfficerEvents(token) {
  const response = await axios.get(`${API_URL}/events/officer/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function createOfficerEvent(formData, token) {
  const response = await axios.post(`${API_URL}/events/officer/create`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function updateOfficerEvent(eventId, formData, token) {
  const response = await axios.put(`${API_URL}/events/officer/update/${eventId}`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function deleteOfficerEvent(eventId, token) {
  const response = await axios.delete(`${API_URL}/events/officer/delete/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getEventParticipants(eventId) {
  const response = await axios.get(`${API_URL}/events/${eventId}/participants`);
  return response.data;
}
