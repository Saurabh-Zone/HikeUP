import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <main className="hero">
            {/* Hero Content / Copy */}
            <div className="hero-copy">
                <span className="pill">On-demand home services</span>
                <h1>
                    Book trusted workers,
                    <br />
                    <span>right when you need them.</span>
                </h1>
                <p>
                    HikeUp connects customers with nearby skilled professionals for plumbing,
                    electrical, cleaning, painting and more.
                </p>

                <div className="actions">
                    <Link className="btn" to="/signup/customer">
                        Book a Service
                    </Link>
                    <Link className="btn outline" to="/signup/worker">
                        Become a Worker
                    </Link>
                </div>

                <p style={{ marginTop: 20, fontSize: 13 }}>
                    <Link to="/login/admin">Admin login</Link> (seeded admin)
                </p>
            </div>

            {/* Hero Visual Card */}
            <div className="hero-card">
                <div className="mapfake">
                    <span>📍</span>
                    <span className="pin p1">🔧</span>
                    <span className="pin p2">🛠️</span>
                    <span className="pin p3">🧹</span>
                </div>
                <div className="mini">
                    <b>Nearest worker</b>
                    <span>Assigned by distance + availability</span>
                </div>
            </div>
        </main>
    );
}