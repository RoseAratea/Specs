import axios from 'axios';

const API_URL = 'http://localhost:8000'; 

export async function getEvents(token) {
  try {
    const response = await axios.get(`${API_URL}/events`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

export async function getEvent(eventId, token) {
  try {
    const response = await axios.get(`${API_URL}/events/${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    throw error;
  }
}

export async function joinEvent(eventId, token) {
  try {
    const response = await axios.post(`${API_URL}/events/join/${eventId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error joining event ${eventId}:`, error);
    throw error;
  }
}

export async function leaveEvent(eventId, token) {
  try {
    const response = await axios.post(`${API_URL}/events/leave/${eventId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error leaving event ${eventId}:`, error);
    throw error;
  }
}