import axios from 'axios';

const API_URL = 'http://localhost:8000';

export async function getOfficerAnnouncements(token) {
  const response = await axios.get(`${API_URL}/announcements`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function createOfficerAnnouncement(formData, token) {
  const response = await axios.post(`${API_URL}/announcements/officer/create`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function updateOfficerAnnouncement(announcementId, formData, token) {
  const response = await axios.put(`${API_URL}/announcements/officer/update/${announcementId}`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function deleteOfficerAnnouncement(announcementId, token) {
  const response = await axios.delete(`${API_URL}/announcements/officer/delete/${announcementId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
