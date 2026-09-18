import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { services } from "../api";
import { ErrorBox } from "../components";


// Services Page

export default function Services() {
    const [list, setList] = useState([]);
    const [error, setError] = useState("");


    // Fetch services
    useEffect(() => {
        services
            .list()
            .then((data) => {
                setList(data.services);
            })
            .catch((error) => {
                setError(error.message);
            });
    }, []);


    return (
        <main className="page">

            {/* Page Header */}
            <div className="page-head">
                <div>
                    <span className="pill">
                        Services
                    </span>

                    <h1>
                        What do you need?
                    </h1>

                    <p>
                        Choose a service and we’ll match you
                        with a nearby available worker.
                    </p>
                </div>
            </div>


            {/* Error Message */}
            <ErrorBox error={error} />


            {/* Services Grid */}
            <div className="service-grid">
                {list.map((service) => (
                    <article
                        className="service-card"
                        key={service._id}
                    >

                        {/* Service Icon */}
                        <div className="service-icon">
                            {getServiceIcon(service.category)}
                        </div>


                        {/* Service Name */}
                        <h3>
                            {service.name}
                        </h3>


                        {/* Category */}
                        <span>
                            {service.category}
                        </span>


                        {/* Description */}
                        <p>
                            {service.description ||
                                "Professional service at your location."}
                        </p>


                        {/* Price & Duration */}
                        <div className="service-bottom">
                            <b>
                                ₹{service.basePrice}
                            </b>

                            <small>
                                {service.estimatedDuration} min
                            </small>
                        </div>


                        {/* Book Button */}
                        <Link
                            className="btn full"
                            to={`/book/${service._id}`}
                        >
                            Book now
                        </Link>

                    </article>
                ))}
            </div>


            {/* No Services Message */}
            {!list.length && (
                <div className="card">
                    No services yet. Ask an admin to add
                    services.
                </div>
            )}

        </main>
    );
}


// Service Icon Helper

function getServiceIcon(category) {
    const value = category?.toLowerCase();

    if (value?.includes("electric")) {
        return "⚡";
    }

    if (value?.includes("plumb")) {
        return "🚰";
    }

    if (value?.includes("clean")) {
        return "🧹";
    }

    if (value?.includes("paint")) {
        return "🎨";
    }

    return "🛠️";
}