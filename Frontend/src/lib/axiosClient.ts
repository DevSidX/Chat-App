// sets up an Axios instance with a base URL 

import axios from 'axios'

const API = axios.create({
    baseURL: import.meta.env.MODE === "development" ? `${import.meta.env.VITE_API_URL}/api` : "/api",
    withCredentials: true,
})

export { API }