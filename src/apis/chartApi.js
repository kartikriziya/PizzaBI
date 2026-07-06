import axios from "axios"

const API_URL = "http://localhost:5000/api"

export const getLineChartData = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/dashboard/chart/line`, {
    params: filters,
  })

  return response.data
}

export const getCategoryChartData = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/dashboard/chart/category`, {
    params: filters,
  })

  return response.data
}

export const getSizeChartData = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/dashboard/chart/size`, {
    params: filters,
  })

  return response.data
}

export const getAreaChartData = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/dashboard/chart/area`, {
    params: filters,
  })

  return response.data
}

export const getRadarChartData = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/dashboard/chart/radar`, {
    params: filters,
  })

  return response.data
}

export const getWeekdayChartData = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/dashboard/chart/weekday`, {
    params: filters,
  })

  return response.data
}

// ----- Jahn 06.07 ------
export const getCoMatrixData = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/dashboard/chart/comatrix`, {
    params: filters,
  })

  return response.data
}
// ----- Jahn 06.07 ------
