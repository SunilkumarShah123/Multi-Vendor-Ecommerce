
import userAuthStore from "../store/auth";
import api from "./axios";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

export const login = async (email, password) => {
  try {
    const { data, status } = await api.post("token/", {
      email,
      password,
    });

    if (status === 200) {
      // Create user object
      const userData = {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
      };

      // Store user in Zustand
      await setAuthUser(
        data.access,
        data.refresh,
        userData
      );

      console.log("User data:", userData);

      // Return user data to Login.jsx
      return {
        data,
        user: userData,
        error: null,
      };
    }

    return {
      data: null,
      user: null,
      error: "Login failed",
    };

  } catch (error) {
    return {
      data: null,
      user: null,
      error:
        error.response?.data?.message ||
        "Something went wrong",
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
      full_name,
      email,
      phone,
      password,
      password2,
    });

    alert("User Register Successfully!");

    await login(email, password);

    const { data } = response;

    return {
      data,
      error: null,
    };

  } catch (error) {
    return {
      data: null,
      error:
        error.response?.data?.message ||
        "Something went wrong",
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
      await setAuthUser(
        accessToken,
        refreshToken
      );
    }

  } catch (error) {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");

    userAuthStore.getState().setUser(null);
    userAuthStore.getState().setLoading(false);

    console.error("Authentication error:", error);
  }
};


export const getRefreshToken = async (refresh_token) => {
  const response = await api.post("refresh/", {
    refresh: refresh_token,
  });

  return response;
};


export const setAuthUser = async (
  access_token,
  refresh_token,
  user_data
) => {
  try {
    Cookies.set("access_token", access_token, {
      expires: 7,
    });

    Cookies.set("refresh_token", refresh_token, {
      expires: 7,
    });

    // Store user information in Zustand
    if (user_data) {
      userAuthStore.getState().setUser(user_data);
    }

  } catch (error) {
    console.error(
      "Failed to set authenticated user:",
      error
    );

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