import axios from 'axios';
const API_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export async function getOfficerMemberships(token) {
  const response = await apiClient.get(`/membership/officer/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function createOfficerMembership(formData, token) {
  const response = await apiClient.post(`/membership/officer/create`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function updateOfficerMembership(membershipId, formData, token) {
  const response = await apiClient.put(`/membership/officer/update/${membershipId}`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function deleteOfficerMembership(membershipId, token) {
  const response = await apiClient.delete(`/membership/officer/delete/${membershipId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function verifyOfficerMembership(membershipId, action, token) {
  const response = await apiClient.put(`/membership/officer/verify/${membershipId}`, { action }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getOfficerRequirements(token) {
  const response = await apiClient.get(`/membership/officer/requirements`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function updateOfficerRequirement(requirement, payload, token) {
  const response = await apiClient.put(
    `/membership/officer/requirements/${encodeURIComponent(requirement)}`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function deleteOfficerRequirement(requirement, token) {
  const response = await apiClient.delete(
    `/membership/officer/requirements/${encodeURIComponent(requirement)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function uploadOfficerRequirementQRCode(requirement, paymentType, file, token) {
  const data = new FormData();
  data.append("file", file);
  const response = await apiClient.post(
    `/membership/officer/requirement/upload_qrcode?requirement=${encodeURIComponent(requirement)}&payment_type=${paymentType}`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

export async function createOfficerRequirement(formData, token) {
  const response = await apiClient.post(
    `/membership/officer/requirement/create`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

export async function getQRCode(paymentOption, token) {
  const response = await apiClient.get(`/membership/qrcode?payment_type=${paymentOption}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function uploadQRCode(membershipId, file, token) {
  const data = new FormData();
  data.append("file", file);
  const response = await apiClient.post(
    `/membership/upload_qrcode?membership_id=${membershipId}`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}
