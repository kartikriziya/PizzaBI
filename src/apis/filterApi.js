import axios from "axios"

const API_URL = "http://localhost:5000/api"

export const getFilters = async (filters = {}) => {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value)
    }
  })

  const response = await axios.get(`${API_URL}/filters?${params.toString()}`)
  return response.data
}

export const getDefaultDateRange = async () => {
  const response = await axios.get(`${API_URL}/filters/default-range`)
  return response.data
}

export const getAllTimeRange = async () => {
  const response = await axios.get(`${API_URL}/filters/all-time-range`)
  return response.data
}
