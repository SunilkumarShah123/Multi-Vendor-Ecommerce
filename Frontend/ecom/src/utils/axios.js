import axios from "axios"
const apiInstance = axios.create({
    baseURL:"http://127.0.0.1:8000/api/",
    timeout:5000,
    headers:{
        //invoke during sending api request
        "Content-Type":"application/json",
        //invoke during accepting api response
        Accept:"application/json",
    }
})

export default apiInstance
