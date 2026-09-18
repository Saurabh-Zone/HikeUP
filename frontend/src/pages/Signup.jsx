import React, { useState } from "react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import { auth } from "../api";
import { useAuth } from "../auth";
import { ErrorBox } from "../components";


// Signup Page

export default function Signup() {
    const { role } = useParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        service: "",
        experience: "",
    });

    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);


    // Available worker services
    const serviceOptions = [
        "Electrician",
        "Plumber",
        "Carpenter",
        "Painter",
        "Cleaner",
        "Mechanic",
        "AC Repair",
    ];


    // Update form fields
    const handleChange = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };


    // Submit signup form
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setBusy(true);

        try {
            const data = await auth.signup({
                ...form,
                role,
            });

            // Login after successful signup
            login(data);

            // Redirect according to role
            if (role === "worker") {
                navigate("/worker");
            } else {
                navigate("/customer");
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setBusy(false);
        }
    };


    return (
        <main className="auth">

            <form
                className="card form wide"
                onSubmit={handleSubmit}
            >

                {/* Back Button */}
                <Link to="/">
                    ← Back
                </Link>


                {/* Heading */}
                <h1>
                    Create {role} account
                </h1>

                <p>
                    Start using HikeUp in minutes.
                </p>


                {/* Error Message */}
                <ErrorBox error={error} />


                {/* Basic Information */}
                <div className="grid2">

                    {/* Full Name */}
                    <label>
                        Full name

                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) =>
                                handleChange("name", e.target.value)
                            }
                        />
                    </label>


                    {/* Phone */}
                    <label>
                        Phone

                        <input
                            type="tel"
                            required
                            value={form.phone}
                            onChange={(e) =>
                                handleChange("phone", e.target.value)
                            }
                        />
                    </label>


                    {/* Email */}
                    <label>
                        Email

                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) =>
                                handleChange("email", e.target.value)
                            }
                        />
                    </label>


                    {/* Worker-specific fields */}
                    {role === "worker" && (
                        <>

                            {/* Service */}
                            <label>
                                Service

                                <select
                                    required
                                    value={form.service}
                                    onChange={(e) =>
                                        handleChange(
                                            "service",
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        Choose service
                                    </option>

                                    {serviceOptions.map((service) => (
                                        <option
                                            key={service}
                                            value={service}
                                        >
                                            {service}
                                        </option>
                                    ))}
                                </select>
                            </label>


                            {/* Experience */}
                            <label>
                                Experience

                                <select
                                    value={form.experience}
                                    onChange={(e) =>
                                        handleChange(
                                            "experience",
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        Select
                                    </option>

                                    <option value="0-1 years">
                                        0-1 years
                                    </option>

                                    <option value="1-3 years">
                                        1-3 years
                                    </option>

                                    <option value="3-5 years">
                                        3-5 years
                                    </option>

                                    <option value="5+ years">
                                        5+ years
                                    </option>
                                </select>
                            </label>

                        </>
                    )}

                </div>


                {/* Password */}
                <label>
                    Password

                    <input
                        type="password"
                        minLength={6}
                        required
                        value={form.password}
                        onChange={(e) =>
                            handleChange(
                                "password",
                                e.target.value
                            )
                        }
                    />
                </label>


                {/* Confirm Password */}
                <label>
                    Confirm password

                    <input
                        type="password"
                        required
                        value={form.confirmPassword}
                        onChange={(e) =>
                            handleChange(
                                "confirmPassword",
                                e.target.value
                            )
                        }
                    />
                </label>


                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn full"
                    disabled={busy}
                >
                    {busy
                        ? "Creating..."
                        : "Create account"}
                </button>


                {/* Login Link */}
                <p>
                    Already registered?{" "}
                    <Link to={`/login/${role}`}>
                        Login
                    </Link>
                </p>

            </form>

        </main>
    );
}