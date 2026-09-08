import React, { useState, useEffect } from "react";

import { Register } from "../../utils/auth";

import { useNavigate } from "react-router-dom";

import userAuthStore from "../../store/auth";

const RegisterUser = () => {
  const navigate = useNavigate();
  const isLoggedIn = userAuthStore((state) => state.isLoggedIn());

  const [formData, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    password2: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleResetFrom = () => {
    setForm({
      full_name: "",
      email: "",
      phone: "",
      password: "",
      password2: "",
    });
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    userAuthStore.getState().setLoading(true);

    if (!isLoggedIn) {
      if (formData.password !== formData.password2) {
        alert("Passwords do not match");
        userAuthStore.getState().setLoading(false);
        return;
      }

      const { error } = await Register(
        formData.full_name,
        formData.email,
        formData.phone,
        formData.password,
        formData.password2
      );

      userAuthStore.getState().setLoading(false);
      handleResetFrom();
      alert(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="d-flex flex-column my-4 justify-content-center align-items-center"
    >
      <label htmlFor="full_name">Full Name:</label>
      <input
        type="text"
        id="full_name"
        name="full_name"
        placeholder="Enter Your Full Name"
        value={formData.full_name}
        onChange={handleChange}
      />

      <label htmlFor="email">Email:</label>
      <input
        type="email"
        id="email"
        name="email"
        placeholder="Enter Your Email"
        value={formData.email}
        onChange={handleChange}
      />

      <label htmlFor="phone">Phone:</label>
      <input
        type="tel"
        id="phone"
        name="phone"
        placeholder="Enter Your Number"
        value={formData.phone}
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

      <label htmlFor="password2">Confirm Password:</label>
      <input
        type="password"
        id="password2"
        name="password2"
        placeholder="Enter Your Confirm Password"
        value={formData.password2}
        onChange={handleChange}
      />

      <button type="submit" className="btn btn-danger">
        Register
      </button>
    </form>
  );
};

export default RegisterUser;