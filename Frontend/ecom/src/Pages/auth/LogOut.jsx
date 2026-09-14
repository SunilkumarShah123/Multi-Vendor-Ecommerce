import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logOut } from "../../utils/auth";
import toast from "react-hot-toast";

const LogOut = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      await logOut();
      toast.success("You have been logged out");
      navigate("/home", { replace: true });
    };

    handleLogout();
  }, [navigate]);

  return null;
};

export default LogOut;