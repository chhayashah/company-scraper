import axios from "axios";

export const createJob = (payload) =>
  axios.post("/api/jobs", payload).then((r) => r.data);
export const getJob = (id) => axios.get(`/api/jobs/${id}`).then((r) => r.data);
export const getCompanies = (jobId) =>
  axios.get("/api/companies", { params: { jobId } }).then((r) => r.data);
export const exportUrl = (format, jobId) =>
  `/api/companies/export?format=${format}&jobId=${jobId}`;
