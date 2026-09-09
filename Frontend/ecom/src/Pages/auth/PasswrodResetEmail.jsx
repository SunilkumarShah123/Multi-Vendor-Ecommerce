import React, { useState } from "react";
import apiInstance from "../../utils/axios";
import toast from "react-hot-toast";

const PasswordResetEmail = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmission = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const response = await apiInstance.get(
        `reset-password-email/${email}/`
      );

      console.log(response.data);

      toast.success(
        response.data?.msg || "Password reset email sent successfully"
      );

      setEmail("");
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.error ||
          error.response?.data?.msg ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container">
        {/* Title */}
        <h1 className="text-center my-5">
          Password Reset Email
        </h1>

        {/* Form */}
        <form
          className="d-flex flex-column w-50 gap-2 mx-auto"
          onSubmit={handleSubmission}
        >
          {/* Email Label */}
          <label
            className="form-label"
            htmlFor="email"
          >
            Reset Email:
          </label>

          {/* Email Input */}
          <input
            type="email"
            name="email"
            id="email"
            className="form-control"
            placeholder="Enter Your Email"
            value={email}
            onChange={handleChange}
            disabled={loading}
          />

          {/* Submit Button */}
          {loading ? (
            <button
              type="submit"
              className="btn btn-success mt-3"
              disabled
            >
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>

              Sending...
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-success mt-3"
            >
              Send Reset Email
            </button>
          )}
        </form>
      </div>
    </>
  );
};

export default PasswordResetEmail;