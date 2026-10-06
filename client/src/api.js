import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "";

export const createJob = (payload) =>
  axios.post(`${BASE}/api/jobs`, payload).then((r) => r.data);
export const getJob = (id) =>
  axios.get(`${BASE}/api/jobs/${id}`).then((r) => r.data);
export const getJobs = () => axios.get(`${BASE}/api/jobs`).then((r) => r.data);
export const getCompanies = (jobId) =>
  axios.get(`${BASE}/api/companies`, { params: { jobId } }).then((r) => r.data);
export const exportUrl = (format, jobId) =>
  `${BASE}/api/companies/export?format=${format}&jobId=${jobId}`;
