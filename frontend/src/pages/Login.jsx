import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { auth } from "../api";
import { useAuth } from "../auth";
import { ErrorBox } from "../components";

export default function Login() {
    const { role } = useParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setBusy(true);
        setError("");

        try {
            const data = await auth.login({
                ...form,
                role,
            });

            login(data);

            if (role === "customer") {
                navigate("/customer");
            } else if (role === "worker") {
                navigate("/worker");
            } else {
                navigate("/admin");
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setBusy(false);
        }
    };

    const getRoleIcon = () => {
        if (role === "worker") {
            return "🛠️";
        }

        if (role === "admin") {
            return "🧑‍💼";
        }

        return "👤";
    };

    const getRoleName = () => {
        if (!role) {
            return "User";
        }

        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    return (
        <main className="auth">
            <form className="card form" onSubmit={handleSubmit}>
                {/* Back Button */}
                <Link to="/">← Back</Link>

                {/* Role Icon */}
                <div className="icon">{getRoleIcon()}</div>

                {/* Heading */}
                <h1>{getRoleName()} Login</h1>

                <p>Access your HikeUp account.</p>

                {/* Error Message */}
                <ErrorBox error={error} />

                {/* Email */}
                <label>
                    Email
                    <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                    />
                </label>

                {/* Password */}
                <label>
                    Password
                    <input
                        type="password"
                        name="password"
                        required
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                    />
                </label>

                {/* Login Button */}
                <button
                    type="submit"
                    className="btn full"
                    disabled={busy}
                >
                    {busy ? "Logging in..." : "Login"}
                </button>

                {/* Signup Link */}
                {role !== "admin" && (
                    <p>
                        New here?{" "}
                        <Link to={`/signup/${role}`}>
                            Create account
                        </Link>
                    </p>
                )}
            </form>
        </main>
    );
}