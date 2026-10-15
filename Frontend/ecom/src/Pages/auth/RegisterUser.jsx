import Pagewrapper from "../Pagewrapper";
import { useState, useEffect } from "react";
import { Register } from "../../utils/auth";
import { useNavigate, Link } from "react-router-dom";
import userAuthStore from "../../store/auth";
import toast from "react-hot-toast";

const RegisterUser = () => {
  const navigate = useNavigate();
  const isLoggedIn = userAuthStore((state) => state.isLoggedIn);
  const loading = userAuthStore((state) => state.loading);

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
      navigate("/home");
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    userAuthStore.getState().setLoading(true);

    try {
      if (isLoggedIn) return;

      if (formData.password !== formData.password2) {
        toast.error("Passwords do not match");
        return;
      }

      const { error } = await Register(
        formData.full_name,
        formData.email,
        formData.phone,
        formData.password,
        formData.password2
      );

      if (error) {
        toast.error(error);
        return;
      }

      toast.success("Registration successful. You are now logged in.");
      handleResetFrom();
      navigate("/dashboard");
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
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                <h2 className="text-center mb-4 fw-bold">Register</h2>

                <form
                  onSubmit={handleSubmit}
                  className="d-flex flex-column gap-3"
                >
                  <div>
                    <label htmlFor="full_name" className="form-label">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      className="form-control"
                      placeholder="Enter Your Full Name"
                      value={formData.full_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="form-label">
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
                    <label htmlFor="phone" className="form-label">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="form-control"
                      placeholder="Enter Your Number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="form-label">
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

                  <div>
                    <label htmlFor="password2" className="form-label">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="password2"
                      name="password2"
                      className="form-control"
                      placeholder="Confirm Your Password"
                      value={formData.password2}
                      onChange={handleChange}
                    />
                  </div>

                  {loading ? (
                    <button
                      className="btn btn-danger w-100 mt-2"
                      type="submit"
                      disabled
                    >
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Registering...
                    </button>
                  ) : (
                    <button
                      className="btn btn-danger w-100 mt-2"
                      type="submit"
                    >
                      Register
                    </button>
                  )}

                  <div className="text-center mt-2">
                    <span className="small">Already have an account?</span>
                    <Link
                      to="/login"
                      className="text-decoration-none ms-1 small text-danger"
                    >
                      Login!
                    </Link>
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

export default RegisterUser;