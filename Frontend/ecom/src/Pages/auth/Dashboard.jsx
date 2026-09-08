import React, { useEffect } from "react";
import userAuthStore from "../../store/auth";
import { useNavigate } from "react-router-dom";
import LogOut from "./LogOut";
const Dashboard = () => {
  const navigate = useNavigate();

  const isLoggedIn = userAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  return <>
  <div>Dashboard</div>
  <LogOut/>
  </>;
};

export default Dashboard;