import { useState, useEffect } from "react";
import Pagewrapper from "../Pagewrapper";
import { getDashboardPath, login } from "../../utils/auth";
import toast from "react-hot-toast";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, Link } from "react-router-dom";
import userAuthStore from "../../store/auth";
import styles from "../../Css/auth/Login.module.css";

const Login = () => {
  const navigate = useNavigate();
  const loading = userAuthStore((state) => state.loading);
  const isLoggedIn = userAuthStore((state) => state.isLoggedIn);
  const userData = userAuthStore((state) => state.userData);

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
      navigate(getDashboardPath(userData?.role), { replace: true });
    }
  }, [isLoggedIn, navigate, userData?.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter your email and password");
      return;
    }

    userAuthStore.getState().setLoading(true);

    try {
      if (isLoggedIn) return;

      const { user, error } = await login(formData.email, formData.password);

      if (error) {
        toast.error(error);
        return;
      }

      console.log("Logged in user:", user);

      toast.success(
        `${user.full_name || "User"} has been logged in successfully`
      );

      handleResetFrom();
      navigate(getDashboardPath(user.role), { replace: true });
    } catch {
      toast.error("Unable to connect to the server");
    } finally {
      userAuthStore.getState().setLoading(false);
    }
  };

  return (
    <Pagewrapper>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                <h2 className="text-center mb-4 fw-bold">Login</h2>

                <form
                  className="d-flex flex-column gap-3"
                  onSubmit={handleSubmit}
                >
                  <div>
                    <label className="form-label" htmlFor="email">
                      Email
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
                  </div>

                  <div>
                    <label className="form-label" htmlFor="password">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="form-control"
                      placeholder="Enter Your Password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>

                  {loading ? (
                    <button
                      type="submit"
                      className="btn btn-danger w-100 mt-2"
                      disabled
                    >
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Logging in...
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn btn-danger w-100 mt-2"
                    >
                      Login
                    </button>
                  )}

                  <div className="d-flex justify-content-between flex-wrap gap-2 mt-1">
                    <Link
                      to="/password-reset-email"
                      className="text-decoration-none text-danger small"
                    >
                      Forgot Password?
                    </Link>
                    <Link
                      to="/register"
                      className="text-decoration-none small"
                    >
                      Register!
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="text-center my-2">
                    <span className="fw-bold text-danger">or</span>
                  </div>

                  {/* Social Login Buttons */}
                  <div className="d-grid gap-2">
                    <button
                      type="button"
                      className={`btn d-flex align-items-center justify-content-center gap-2 ${styles.google}`}
                    >
                      <FcGoogle aria-hidden="true" />
                      Continue with Google
                    </button>

                    <button
                      type="button"
                      className={`btn d-flex align-items-center justify-content-center gap-2 ${styles.github}`}
                    >
                      <FaGithub aria-hidden="true" />
                      Continue with GitHub
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Pagewrapper>
  );
};

export default Login;