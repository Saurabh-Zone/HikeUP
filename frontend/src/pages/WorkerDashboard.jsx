import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    dashboard,
    allocations,
    bookings,
    users,
} from "../api";

import { useAuth } from "../auth";
import {
    connectSocket,
    disconnectSocket,
} from "../socket";

import { ErrorBox } from "../components";


export default function WorkerDashboard() {
    const { user } = useAuth();

    const [d, setD] = useState(null);
    const [pending, setPending] = useState([]);
    const [list, setList] = useState([]);
    const [error, setError] = useState("");


    const load = () =>
        Promise.all([
            dashboard.worker(),
            allocations.pending(),
            bookings.list(),
        ])
            .then(([a, b, c]) => {
                setD(a);
                setPending(b.allocations);
                setList(c.bookings);
            })
            .catch((e) => setError(e.message));


    useEffect(() => {
        load();

        const s = connectSocket(user._id);

        s?.on("new-booking", load);

        return () => disconnectSocket();
    }, []);


    const respond = async (a, ok) => {
        try {
            if (ok) {
                await allocations.accept(a._id);
            } else {
                await allocations.reject(
                    a._id,
                    "Not available"
                );
            }

            await load();
        } catch (e) {
            setError(e.message);
        }
    };


    const updateLocation = () =>
        navigator.geolocation?.getCurrentPosition(
            async (p) => {
                try {
                    await users.meUpdate({
                        latitude: p.coords.latitude,
                        longitude: p.coords.longitude,
                        isAvailable: true,
                    });

                    alert("Location updated");
                } catch (e) {
                    setError(e.message);
                }
            }
        );


    return (
        <main className="page">

            <div className="page-head">
                <div>
                    <span className="pill">
                        Worker
                    </span>

                    <h1>
                        Hello, {user.name}
                    </h1>

                    <p>
                        Stay available and accept nearby jobs.
                    </p>
                </div>

                <button
                    className="btn"
                    onClick={updateLocation}
                >
                    📍 Update location
                </button>
            </div>


            <ErrorBox error={error} />


            <div className="stats">
                <Stat
                    t="Jobs"
                    v={d?.totalBookings}
                />

                <Stat
                    t="Completed"
                    v={d?.completedBookings}
                />

                <Stat
                    t="Active"
                    v={d?.activeBookings}
                />

                <Stat
                    t="Earnings"
                    v={`₹${d?.totalEarnings || 0}`}
                />

                <Stat
                    t="Rating"
                    v={`⭐ ${d?.avgRating || 0}`}
                />
            </div>


            {pending.length > 0 && (
                <section className="card alert-card">

                    <h2>
                        New job requests
                    </h2>

                    {pending.map((a) => (
                        <div
                            className="request"
                            key={a._id}
                        >
                            <div>
                                <b>
                                    {a.bookingId?.serviceId?.name ||
                                        "Service"}
                                </b>

                                <p>
                                    {a.customerId?.name} •{" "}
                                    {a.distanceInKm} km away • ETA{" "}
                                    {a.etaMinutes} min
                                </p>

                                <small>
                                    {a.bookingId?.address}
                                </small>
                            </div>

                            <div>
                                <button
                                    className="btn"
                                    onClick={() => respond(a, true)}
                                >
                                    Accept
                                </button>

                                <button
                                    className="btn danger"
                                    onClick={() => respond(a, false)}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </section>
            )}


            <section className="card">

                <h2>
                    My jobs
                </h2>

                {list.length ? (
                    list.map((b) => (
                        <div
                            className="row"
                            key={b._id}
                        >
                            <span>
                                <b>
                                    {b.serviceId?.name}
                                </b>

                                <small>
                                    {b.customerId?.name} •{" "}
                                    {new Date(
                                        b.bookingDate
                                    ).toLocaleString()}
                                </small>
                            </span>

                            <span>
                                ₹{b.price}
                            </span>

                            <span
                                className={`status ${b.status}`}
                            >
                                {b.status.replace("_", " ")}
                            </span>

                            <Link
                                to={`/booking/${b._id}`}
                            >
                                View
                            </Link>
                        </div>
                    ))
                ) : (
                    <p>
                        No jobs assigned yet.
                    </p>
                )}

            </section>

        </main>
    );
}


function Stat({ t, v }) {
    return (
        <div className="stat">
            <small>
                {t}
            </small>

            <b>
                {v ?? "—"}
            </b>
        </div>
    );
}