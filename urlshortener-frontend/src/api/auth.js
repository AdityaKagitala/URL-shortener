import axios from 'axios';


const API_BASE_URL = 'http://localhost:8080/api/auth'; // ✅ Correct port


export const login = async (username, password) => {
  const response = await axios.post(`${API_BASE_URL}/login`, { username,password});
  return response.data;
};

export const signup = async (username, password) => {
  const response = await axios.post(`${API_BASE_URL}/signup`, {
    username,
    password
  });
  return response.data;
};
