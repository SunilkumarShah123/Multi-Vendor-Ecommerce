import axios from "axios";
import { isAccessTokenExpired, setAuthUser, getRefreshToken } from "./auth";
import { BASE_URL } from "./constant";
import Cookies from "js-cookie";

//code to handle automatic token refreshment when token expires during api call and interceptor job is to continously monitor the refresh token validitiy when ever reqeust and response is happening between backend and forntend and invoking istokenExpired and getRefreshToken to avoid 401 error

const useAxios = async () => {
  const access_token = Cookies.get("access");
  const refresh_token = Cookies.get("refresh");

  const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  axiosInstance.interceptors.request.use(async (req) => {
    if (!isAccessTokenExpired(req)) {
      return req;
    }
    const response = await getRefreshToken(refresh_token);
    setAuthUser(response.acess, response.refresh);
    req.headers.Authorization = `Bearer ${response.acess}`;
    return req;
  });
  return axiosInstance
};

export default useAxios
