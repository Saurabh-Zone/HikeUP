import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboard, bookings } from "../api";
import { useAuth } from "../auth";
import { ErrorBox } from "../components";

export default function CustomerDashboard() {
    const { user } = useAuth();

    const [dashboardData, setDashboardData] = useState(null);
    const [bookingsList, setBookingsList] = useState([]);
    const [error, setError] = useState("");

    const fetchDashboardData = async () => {
        try {
            setError("");
            const [dash, bookingsRes] = await Promise.all([
                dashboard.customer(),
                bookings.list(),
            ]);
            setDashboardData(dash);
            setBookingsList(bookingsRes.bookings);
        } catch (e) {
            setError(e.message);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <main className="page">
            {/* Page Header */}
            <div className="page-head">
                <div>
                    <span className="pill">Customer</span>
                    <h1>Welcome, {user?.name}</h1>
                    <p>Manage bookings and find the right professional.</p>
                </div>
                <Link className="btn" to="/services">
                    + Book service
                </Link>
            </div>

            <ErrorBox error={error} />

            {/* Overview Stats */}
            <div className="stats">
                <Stat title="Total bookings" value={dashboardData?.totalBookings} />
                <Stat title="Completed" value={dashboardData?.completedBookings} />
                <Stat title="Pending" value={dashboardData?.pendingBookings} />
                <Stat title="Total spent" value={`₹${dashboardData?.totalSpent || 0}`} />
            </div>

            {/* Recent Bookings List */}
            <section className="card">
                <h2>Recent bookings</h2>
                {bookingsList.length > 0 ? (
                    <div className="table">
                        {bookingsList.slice(0, 8).map((booking) => (
                            <div className="row" key={booking._id}>
                                <span>
                                    <b>{booking.serviceId?.name}</b>
                                    <small>{new Date(booking.bookingDate).toLocaleString()}</small>
                                </span>
                                <span>₹{booking.price}</span>
                                <span className={`status ${booking.status}`}>
                                    {booking.status.replace("_", " ")}
                                </span>
                                <Link to={`/booking/${booking._id}`}>View</Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>
                        No bookings yet. <Link to="/services">Book your first service.</Link>
                    </p>
                )}
            </section>
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