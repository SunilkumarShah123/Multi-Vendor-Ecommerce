import React, { useState, useEffect } from "react";
import { login } from "../../utils/auth";

import { useNavigate,Link } from "react-router-dom";

import userAuthStore from "../../store/auth";

const Login = () => {
  const navigate = useNavigate();
  const isLoggedIn = userAuthStore((state) => state.isLoggedIn());

  const [formData, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleResetFrom = () => {
    setForm({
      email: "",
      password: "",
    });
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate("dashboard/");
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    userAuthStore.getState().setLoading(true);

    if (!isLoggedIn) {
      const { error } = await login(formData.email, formData.password);

      userAuthStore.getState().setLoading(false);

      if (error) {
        alert(error);
        return;
      }

      handleResetFrom();
      navigate("/dashboard");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter Your Email"
          value={formData.email}
          onChange={handleChange}
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Enter Your Password"
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit" className="btn btn-danger">
          Login
        </button>
      </form>
      <Link onClick={()=> navigate('/password-reset-email')}>Forget Password</Link>
    </>
  );
};

export default Login;