import style from "../../Css/Login.module.css";
import { useState, useEffect } from "react";
import { login } from "../../utils/auth";
import toast from "react-hot-toast";
import { FaGoogle } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import userAuthStore from "../../store/auth";

const Login = () => {
  const navigate = useNavigate();
  const loading = userAuthStore((state) => state.loading);
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
      navigate("/dashboard");
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    userAuthStore.getState().setLoading(true);

    if (!isLoggedIn) {
      const { user, error } = await login(formData.email, formData.password);

      userAuthStore.getState().setLoading(false);

      // Handle error FIRST
      if (error) {
        toast.error(error);
        return;
      }

      console.log("Logged in user:", user);

      // Show full name in toast
      toast.success(
        `${user.full_name || "User"} has been logged in successfully`,
      );

      handleResetFrom();

      // Navigate after successful login
      navigate("/dashboard");
    }
  };

  return (
    <>
      <div className="container">
        <h1 className="text-center my-5">Login page</h1>
        <form
          className={`d-flex flex-column w-50 gap-2 mx-auto`}
          onSubmit={handleSubmit}
        >
          <label className="form-label" htmlFor="email">
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-control"
            placeholder="Enter Your Email"
            value={formData.email}
            onChange={handleChange}
          />

          <label className="form-label" htmlFor="password">
            Password:
          </label>
          <input
            type="password"
            id="password"
            className="form-control"
            name="password"
            placeholder="Enter Your Password"
            value={formData.password}
            onChange={handleChange}
          />
          {loading ? (
            <button type="submit" className="btn btn-danger mt-3" disabled>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
              Loging...
            </button>
          ) : (
            <button type="submit" className="btn btn-danger mt-3">
              Login
            </button>
          )}

          <div className="d-flex flex-row justify-content-between mx-2">
            <Link
              className="text-decoration-none text-danger"
              onClick={() => navigate("/password-reset-email")}
            >
              Forget Password ?
            </Link>
            <Link className="text-decoration-none ">Register !</Link>
          </div>
          <div className="text-center">
            <span className="d-block fw-bolder fs-4 text-danger mb-1">or</span>
            <p className={`text-center ${style.google}`}>
              Continue With Google <FaGoogle className="mx-1" />{" "}
            </p>
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;
