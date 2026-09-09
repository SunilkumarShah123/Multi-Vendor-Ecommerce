import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import apiInstance from "../../utils/axios";

const PasswordReset = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const otp = searchParams.get("otp");
  const uuid = searchParams.get("uuid");

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmission = async (e) => {
    e.preventDefault();

    if (!otp || !uuid) {
      return toast.error("Invalid or expired reset link");
    }

    if (!password || !password2) {
      return toast.error("Please enter password and confirm password");
    }

    if (password !== password2) {
      return toast.error("Password and Confirm Password must be same");
    }

    setLoading(true);

    try {
      const response = await apiInstance.post("reset-password/", {
        uuid,
        otp,
        password,
      });

      toast.success(response.data.msg || "Password reset successfully");

      setPassword("");
      setPassword2("");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
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
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-5">
          <h2 className="text-center my-4">Password Reset Form</h2>

          <form onSubmit={handleSubmission}>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password:
              </label>

              <input
                type="password"
                name="password"
                id="password"
                className="form-control"
                placeholder="Enter Your New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password2" className="form-label">
                Confirm Password:
              </label>

              <input
                type="password"
                name="password2"
                id="password2"
                className="form-control"
                placeholder="Confirm Your New Password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              className="btn btn-success w-100"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  ></span>
                  Resetting...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;