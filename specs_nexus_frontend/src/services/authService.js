import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const login = async ({ emailOrStudentNumber, password }) => {
  const response = await axios.post(`${API_URL}/auth/login`, { 
    email_or_student_number: emailOrStudentNumber, 
    password 
  });
  return response.data;
};