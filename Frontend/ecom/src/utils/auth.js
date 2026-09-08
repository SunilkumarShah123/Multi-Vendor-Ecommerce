
import userAuthStore from "../store/auth";
import api from "./axios";
import {jwtDecode} from "jwt-decode";
import Cookies from "js-cookie";

export const login = async (email, password) => {
  try {
    const { data, status } = await api.post("token/", {
      email,
      password,
    });

    if (status === 200) {
      await setAuthUser(data.access, data.refresh);
      alert("User Login Successfully");
    }

    return {
      data: data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data?.message || "Something went wrong",
    };
  }
};

export const Register = async (
  full_name,
  email,
  phone,
  password,
  password2
) => {
  try {
    const response = await api.post("register/", {
      full_name: full_name,
      email: email,
      phone: phone,
      password: password,
      password2: password2,
    });

    alert("User Register Successfully!");

    await login(email, password);

    const { data } = response;

    return {
      data: data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data?.message || "Something went wrong",
    };
  }
};

export const logOut = async () => {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");

  userAuthStore.getState().setUser(null);
};

export const setUser = async () => {
  try {
    const accessToken = Cookies.get("access_token");
    const refreshToken = Cookies.get("refresh_token");

    if (!accessToken || !refreshToken) {
      userAuthStore.getState().setUser(null);
      userAuthStore.getState().setLoading(false);
      return;
    }

    if (isAccessTokenExpired(accessToken)) {
      const response = await getRefreshToken(refreshToken);

      await setAuthUser(
        response.data.access,
        response.data.refresh || refreshToken
      );
    } else {
      await setAuthUser(accessToken, refreshToken);
    }
  } catch (error) {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");

    userAuthStore.getState().setUser(null);
    userAuthStore.getState().setLoading(false);

    console.error("Authentication error:", error);
  }
};

export const getRefreshToken= async (refresh_token)=>{
     const response= await api.post("refresh/", {
        refresh: refresh_token,
      })
      return response
}

export const setAuthUser = async (access_token, refresh_token) => {
  try {
    Cookies.set("access_token", access_token, {
      expires: 7,
    });

    Cookies.set("refresh_token", refresh_token, {
      expires: 7,
    });

    const decoded = jwtDecode(access_token);

    const user = decoded.user ?? null;

    if (user) {
      userAuthStore.getState().setUser(user);
    } else {
      userAuthStore.getState().setUser(null);
    }

    userAuthStore.getState().setLoading(false);
  } catch (error) {
    console.error("Failed to set authenticated user:", error);

    userAuthStore.getState().setUser(null);
    userAuthStore.getState().setLoading(false);
  }
};

export const isAccessTokenExpired = (access_token) => {
  if (access_token) {
    const decoded = jwtDecode(access_token);

    return decoded.expires < Date.now() / 1000;
  }

  return true;
};

