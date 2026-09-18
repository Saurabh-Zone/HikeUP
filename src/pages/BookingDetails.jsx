import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { bookings, allocations, reviews } from "../api";
import { useAuth } from "../auth";
import { ErrorBox } from "../components";
import { connectSocket, disconnectSocket } from "../socket";

export default function BookingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [booking, setBooking] = useState(null);
    const [history, setHistory] = useState([]);
    const [nearbyAllocations, setNearbyAllocations] = useState([]);
    const [error, setError] = useState("");
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        review: "",
    });

    const fetchBookingDetails = async () => {
        try {
            const [bookingRes, historyRes] = await Promise.all([
                bookings.get(id),
                bookings.history(id),
            ]);
            setBooking(bookingRes.booking);
            setHistory(historyRes.history);
        } catch (e) {
            setError(e.message);
        }
    };

    useEffect(() => {
        fetchBookingDetails();

        const socket = connectSocket(user?._id);
        socket?.on("booking-updated", (data) => data.bookingId === id && fetchBookingDetails());
        socket?.on("booking-accepted", (data) => data.bookingId === id && fetchBookingDetails());

        return () => {
            disconnectSocket();
        };
    }, [id, user?._id]);

    const handleDispatchWorkers = async () => {
        try {
            const res = await allocations.dispatch(id);
            setNearbyAllocations(res.allocations || []);
            await fetchBookingDetails();
        } catch (e) {
            setError(e.message);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            await bookings.status(id, { status: newStatus });
            await fetchBookingDetails();
        } catch (e) {
            setError(e.message);
        }
    };

    const handleSubmitReview = async () => {
        try {
            await reviews.submit({
                bookingId: id,
                rating: Number(reviewForm.rating),
                review: reviewForm.review,
            });
            alert("Review submitted");
            await fetchBookingDetails();
        } catch (e) {
            setError(e.message);
        }
    };

    if (!booking) {
        return (
            <main className="page">
                <ErrorBox error={error} />
                <p>Loading...</p>
            </main>
        );
    }

    const isCustomer = user?.role === "customer";
    const isWorker = user?.role === "worker";

    return (
        <main className="page">
            {/* Page Header */}
            <div className="page-head">
                <div>
                    <span className={`status ${booking.status}`}>
                        {booking.status.replace("_", " ")}
                    </span>
                    <h1>{booking.serviceId?.name}</h1>
                    <p>
                        {new Date(booking.bookingDate).toLocaleString()} • ₹{booking.price}
                    </p>
                </div>
                <a
                    className="btn outline"
                    target="_blank"
                    rel="noreferrer"
                    href={`https://www.google.com/maps/search/?api=1&query=${booking.latitude},${booking.longitude}`}
                >
                    Open map
                </a>
            </div>

            <ErrorBox error={error} />

            {/* Main Grid */}
            <div className="detail-grid">
                {/* Booking Details Card */}
                <section className="card">
                    <h2>Booking information</h2>
                    <p>
                        <b>Address:</b> {booking.address}
                    </p>
                    <p>
                        <b>Notes:</b> {booking.notes || "—"}
                    </p>
                    <p>
                        <b>Payment:</b> {booking.paymentStatus}
                    </p>

                    {/* Assigned Worker */}
                    {booking.workerId && (
                        <div className="person">
                            <span>🧑‍🔧</span>
                            <div>
                                <b>{booking.workerId.name}</b>
                                <small>
                                    {booking.workerId.phone} • ⭐ {booking.workerId.rating || 0}
                                </small>
                            </div>
                        </div>
                    )}

                    {/* Customer Actions */}
                    {isCustomer && booking.status === "pending" && (
                        <button className="btn" onClick={handleDispatchWorkers}>
                            Find / notify nearby workers
                        </button>
                    )}

                    {isCustomer &&
                        booking.status === "completed" &&
                        booking.paymentStatus !== "completed" && (
                            <Link className="btn" to={`/payment/${booking._id}`}>
                                Pay ₹{booking.price}
                            </Link>
                        )}

                    {/* Worker Actions */}
                    {isWorker &&
                        ["accepted", "on_the_way", "in_progress"].includes(booking.status) && (
                            <div className="actions">
                                {booking.status === "accepted" && (
                                    <button
                                        className="btn"
                                        onClick={() => handleUpdateStatus("on_the_way")}
                                    >
                                        On the way
                                    </button>
                                )}
                                {booking.status === "on_the_way" && (
                                    <button
                                        className="btn"
                                        onClick={() => handleUpdateStatus("in_progress")}
                                    >
                                        Start job
                                    </button>
                                )}
                                {booking.status === "in_progress" && (
                                    <button
                                        className="btn"
                                        onClick={() => handleUpdateStatus("completed")}
                                    >
                                        Complete job
                                    </button>
                                )}
                            </div>
                        )}
                </section>

                {/* Timeline Section */}
                <section className="card">
                    <h2>Status timeline</h2>
                    {history.map((item) => (
                        <div className="timeline" key={item._id}>
                            <span></span>
                            <div>
                                <b>{item.status.replace("_", " ")}</b>
                                <small>{new Date(item.timestamp).toLocaleString()}</small>
                                <p>{item.notes}</p>
                            </div>
                        </div>
                    ))}
                </section>
            </div>

            {/* Worker Offers / Allocations */}
            {nearbyAllocations.length > 0 && (
                <section className="card">
                    <h2>Worker offers</h2>
                    {nearbyAllocations.map((offer) => (
                        <div className="row" key={offer._id}>
                            <span>Worker offer</span>
                            <span>
                                {offer.distanceInKm} km • {offer.etaMinutes} min
                            </span>
                        </div>
                    ))}
                </section>
            )}

            {/* Review Section */}
            {isCustomer && booking.status === "completed" && !booking.rating && (
                <section className="card form">
                    <h2>Rate your worker</h2>
                    <select
                        value={reviewForm.rating}
                        onChange={(e) =>
                            setReviewForm({ ...reviewForm, rating: e.target.value })
                        }
                    >
                        {[1, 2, 3, 4, 5].map((num) => (
                            <option key={num} value={num}>
                                {num}
                            </option>
                        ))}
                    </select>
                    <textarea
                        rows="3"
                        placeholder="Write a review..."
                        value={reviewForm.review}
                        onChange={(e) =>
                            setReviewForm({ ...reviewForm, review: e.target.value })
                        }
                    />
                    <button className="btn" onClick={handleSubmitReview}>
                        Submit review
                    </button>
                </section>
            )}
        </main>
    );
}