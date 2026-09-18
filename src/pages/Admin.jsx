import React, { useEffect, useState } from "react";
import { dashboard, users, services, bookings } from "../api";
import { ErrorBox } from "../components";

const INITIAL_FORM_STATE = {
    name: "",
    category: "",
    description: "",
    basePrice: "",
    estimatedDuration: "",
};

export default function Admin() {
    const [dashboardData, setDashboardData] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [servicesList, setServicesList] = useState([]);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [error, setError] = useState("");

    const fetchAdminData = async () => {
        try {
            setError("");
            const [dash, usersRes, servicesRes] = await Promise.all([
                dashboard.admin(),
                users.list(),
                services.all(),
            ]);
            setDashboardData(dash);
            setUsersList(usersRes.users);
            setServicesList(servicesRes.services);
        } catch (e) {
            setError(e.message);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddService = async (e) => {
        e.preventDefault();
        try {
            await services.create({
                ...formData,
                basePrice: Number(formData.basePrice),
                estimatedDuration: Number(formData.estimatedDuration),
            });
            setFormData(INITIAL_FORM_STATE);
            await fetchAdminData();
        } catch (e) {
            setError(e.message);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Delete user?")) return;
        try {
            await users.remove(id);
            await fetchAdminData();
        } catch (e) {
            setError(e.message);
        }
    };

    const handleToggleVerifyUser = async (user) => {
        try {
            await users.verify(user._id, !user.isVerified);
            await fetchAdminData();
        } catch (e) {
            setError(e.message);
        }
    };

    const handleDeleteService = async (id) => {
        if (!window.confirm("Delete service?")) return;
        try {
            await services.remove(id);
            await fetchAdminData();
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <main className="page">
            {/* Header */}
            <div className="page-head">
                <div>
                    <span className="pill">Admin</span>
                    <h1>Control center</h1>
                    <p>Manage platform users, services and operations.</p>
                </div>
            </div>

            <ErrorBox error={error} />

            {/* Stats Cards */}
            <div className="stats">
                <Stat title="Users" value={dashboardData?.users} />
                <Stat title="Customers" value={dashboardData?.customers} />
                <Stat title="Workers" value={dashboardData?.workers} />
                <Stat title="Bookings" value={dashboardData?.bookings} />
            </div>

            {/* Grid Content */}
            <div className="detail-grid">
                {/* Add & List Services Section */}
                <section className="card">
                    <h2>Add service</h2>
                    <form className="form" onSubmit={handleAddService}>
                        <input
                            placeholder="Service name"
                            required
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                        />
                        <input
                            placeholder="Category (e.g. Plumber)"
                            required
                            value={formData.category}
                            onChange={(e) => handleInputChange("category", e.target.value)}
                        />
                        <textarea
                            placeholder="Description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                        />
                        <div className="grid2">
                            <input
                                type="number"
                                placeholder="Price"
                                value={formData.basePrice}
                                onChange={(e) => handleInputChange("basePrice", e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Duration"
                                value={formData.estimatedDuration}
                                onChange={(e) => handleInputChange("estimatedDuration", e.target.value)}
                            />
                        </div>
                        <button className="btn">Add service</button>
                    </form>

                    <hr />

                    {servicesList.map((service) => (
                        <div className="row" key={service._id}>
                            <span>
                                <b>{service.name}</b>
                                <small>
                                    {service.category} • ₹{service.basePrice}
                                </small>
                            </span>
                            <button
                                className="btn danger small"
                                onClick={() => handleDeleteService(service._id)}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </section>

                {/* User Management Section */}
                <section className="card">
                    <h2>Users</h2>
                    <div className="table">
                        {usersList.map((user) => (
                            <div className="row" key={user._id}>
                                <span>
                                    <b>{user.name}</b>
                                    <small>
                                        {user.email} • {user.role}
                                    </small>
                                </span>
                                {user.role === "worker" && (
                                    <button
                                        className="btn outline small"
                                        onClick={() => handleToggleVerifyUser(user)}
                                    >
                                        {user.isVerified ? "Unverify" : "Verify"}
                                    </button>
                                )}
                                <button
                                    className="btn danger small"
                                    onClick={() => handleDeleteUser(user._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}

function Stat({ title, value }) {
    return (
        <div className="stat">
            <small>{title}</small>
            <b>{value ?? "—"}</b>
        </div>
    );
}