
import { useState, useEffect } from "react";
import { Register } from "../../utils/auth";
import { useNavigate, Link } from "react-router-dom";
import userAuthStore from "../../store/auth";

const RegisterUser = () => {
  const navigate = useNavigate();
  const isLoggedIn = userAuthStore((state) => state.isLoggedIn());
  const loading=userAuthStore( state => state.loading)
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
  <div className="container">
    <h1 className="my-5 text-center">Register Page</h1>
    <form
      onSubmit={handleSubmit}
      className="d-flex flex-column my-4 mx-auto"
      style={{ maxWidth: "500px" }}
    >
      <label htmlFor="full_name" className="form-label">
        Full Name:
      </label>
      <input
        type="text"
        id="full_name"
        name="full_name"
        className="form-control mb-3"
        placeholder="Enter Your Full Name"
        value={formData.full_name}
        onChange={handleChange}
      />

      <label htmlFor="email" className="form-label">
        Email:
      </label>
      <input
        type="email"
        id="email"
        name="email"
        className="form-control mb-3"
        placeholder="Enter Your Email"
        value={formData.email}
        onChange={handleChange}
      />

      <label htmlFor="phone" className="form-label">
        Phone:
      </label>
      <input
        type="tel"
        id="phone"
        name="phone"
        className="form-control mb-3"
        placeholder="Enter Your Number"
        value={formData.phone}
        onChange={handleChange}
      />

      <label htmlFor="password" className="form-label">
        Password:
      </label>
      <input
        type="password"
        id="password"
        name="password"
        className="form-control mb-3"
        placeholder="Enter Your Password"
        value={formData.password}
        onChange={handleChange}
      />

      <label htmlFor="password2" className="form-label">
        Confirm Password:
      </label>
      <input
        type="password"
        id="password2"
        name="password2"
        className="form-control mb-3"
        placeholder="Enter Your Confirm Password"
        value={formData.password2}
        onChange={handleChange}
      />

      {loading ? (<button className="btn btn-success mt-3">
        <span className="spinner-border spinner-border-sm me-2"></span>
        Registering ...
      </button>):(<button className="btn btn-danger mt-3" type="submit">
          Register
      </button>)
      }

      <div className="mt-3 text-center">
        <span>Already have an account?</span>
        <Link
          className="text-decoration-none ms-1"
          onClick={() => navigate("/login")}
        >
          Login !
        </Link>
      </div>
    </form>
  </div>
);


};

export default RegisterUser;

