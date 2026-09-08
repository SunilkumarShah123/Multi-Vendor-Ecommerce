
import React, { useState } from 'react'
import apiInstance from '../../utils/axios'

const PasswordResetEmail = () => {

    const [email, setEmail] = useState('')

    const handleChange = (e) => {
        setEmail(e.target.value)
    }

    const handleSubmission = async (e) => {
        e.preventDefault()

        try {
            const response = await apiInstance.get(
                `reset-password-email/${email}/`
            )

            console.log(response.data)

        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <h2>Password Reset Email</h2>

            <form onSubmit={handleSubmission}>
                <label htmlFor="email">Reset Email:</label>

                <input
                    type="email"
                    name="email"
                    onChange={handleChange}
                    id="email"
                    value={email}
                />

                <button
                    className="btn btn-success"
                    type="submit"
                >
                    Submit
                </button>
            </form>
        </>
    )
}

export default PasswordResetEmail
