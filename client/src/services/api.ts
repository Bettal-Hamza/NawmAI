import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const registerUser = async (name: string, email: string, age?: number) => {
  const { data } = await api.post('/api/users', { name, email, age });
  return data;
};

export const getUser = async (email: string) => {
  const { data } = await api.get(`/api/users/${email}`);
  return data;
};

export const createSleepProfile = async (
  userId: string,
  bedtimeGoal: string,
  wakeupGoal: string,
  sleepChallenges: string[]
) => {
  const { data } = await api.post('/api/sleep-profiles', {
    userId, bedtimeGoal, wakeupGoal, sleepChallenges,
  });
  return data;
};

export const getSleepProfile = async (userId: string) => {
  const { data } = await api.get(`/api/sleep-profiles/${userId}`);
  return data;
};

export const submitCheckin = async (checkin: {
  userId: string;
  checkinDate: string;
  bedtime: string;
  wakeupTime: string;
  sleepQuality: number;
  mood: number;
  notes?: string;
  phoneBeforeBed?: boolean;
}) => {
  const { data } = await api.post('/api/checkins', checkin);
  return data;
};

export const getCheckins = async (userId: string, limit = 7) => {
  const { data } = await api.get(`/api/checkins/${userId}?limit=${limit}`);
  return data;
};

export const getWeeklySummary = async (userId: string) => {
  const { data } = await api.get(`/api/checkins/${userId}/summary`);
  return data;
};

export const getWeeklyReport = async (userId: string, regenerate = false) => {
  const { data } = await api.get(`/api/reports/${userId}/weekly${regenerate ? '?regenerate=true' : ''}`);
  return data;
};

export const getReportByDate = async (userId: string, date: string) => {
  const { data } = await api.get(`/api/reports/${userId}/by-date?date=${date}`);
  return data;
};

export const submitFeedback = async (userId: string, message: string, rating: number) => {
  const { data } = await api.post('/api/feedback', { userId, message, rating });
  return data;
};
