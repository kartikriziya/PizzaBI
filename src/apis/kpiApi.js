import axios from "axios"

const API_URL = "http://localhost:5000/api"

export const getKpiMetrics = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/dashboard/kpi`, {
    params: filters,
  })

  return response.data
}
