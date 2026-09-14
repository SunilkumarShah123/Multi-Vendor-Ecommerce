import React, { useEffect } from "react";
import userAuthStore from "../../store/auth";
import Pagewrapper from "../Pagewrapper";
import { useNavigate } from "react-router-dom";
const Dashboard = () => {
  const navigate = useNavigate();
  const isLoggedIn = userAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  return (
    <>
      <Pagewrapper>
        <div>Dashboard</div>
      </Pagewrapper>
    </>
  );
};

export default Dashboard;
