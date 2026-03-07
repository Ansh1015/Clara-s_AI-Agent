import axios from 'react-axios'
// Reverting to basic axios since react-axios is not what we want
import defaultAxios from 'axios'

export const api = defaultAxios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json'
    }
})
