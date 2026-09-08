
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiInstance from "../../utils/axios";

const PasswordReset = () => {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const otp = searchParams.get("otp");
    const uuid = searchParams.get("uuid");

    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    const handleSubmission = async (e) => {
        e.preventDefault();

        if (!otp || !uuid) {
            return alert("Invalid or expired reset link");
        }

        if (!password || !password2) {
            return alert("Please enter password and confirm password");
        }

        if (password !== password2) {
            return alert("Password and Confirm Password must be same");
        }

        try {

            const response = await apiInstance.post(
                "reset-password/",
                {
                    uuid: uuid,
                    otp: otp,
                    password: password,
                }
            );

            alert(response.data.msg);

            navigate("/login");

        } catch (error) {

            console.log(error);

            alert(
                error.response?.data?.error ||
                error.response?.data?.msg ||
                "Something went wrong"
            );
        }
    };

    return (
        <>
            <h2>Password Reset Form</h2>

            <form onSubmit={handleSubmission}>

                <label htmlFor="password">
                    Password:
                </label>

                <input
                    type="password"
                    name="password"
                    onChange={(e) => setPassword(e.target.value)}
                    id="password"
                    value={password}
                />

                <label htmlFor="password2">
                    Confirm Password:
                </label>

                <input
                    type="password"
                    name="password2"
                    onChange={(e) => setPassword2(e.target.value)}
                    id="password2"
                    value={password2}
                />

                <button
                    className="btn btn-success"
                    type="submit"
                >
                    Submit
                </button>

            </form>
        </>
    );
};

export default PasswordReset;
