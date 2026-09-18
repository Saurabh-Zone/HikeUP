import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { services, bookings, allocations } from "../api";
import { ErrorBox } from "../components";

const INITIAL_FORM_STATE = {
    bookingDate: "",
    address: "",
    notes: "",
    latitude: "",
    longitude: "",
};

export default function Booking() {
    const { serviceId } = useParams();
    console.log("id----", serviceId);
    const navigate = useNavigate();

    const [service, setService] = useState(null);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const data = await services.list();
                console.log("service api calll", data);
                const foundService = data.services.find((x) => x._id == serviceId);
                setService(foundService);
            } catch (e) {
                setError(e.message);
            }
        };

        fetchService();
    }, [serviceId]);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleLocate = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData((prev) => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                }));
            },
            (e) => setError(e.message)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.latitude === "" || formData.longitude === "") {
            return setError("Get your location before booking.");
        }

        setIsSubmitting(true);
        setError("");

        try {
            const data = await bookings.create({
                ...formData,
                serviceId: serviceId,
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude),
            });

            // Attempt allocation dispatch
            try {
                await allocations.dispatch(data.booking._id);
            } catch {
                // Silently catch dispatch errors if any, proceeds to confirmation page
            }

            navigate(`/booking/${data.booking._id}`);
        } catch (e) {
            setError(e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!service) {
        return (
            <main className="page">
                <p>Loading...</p>
            </main>
        );
    }

    const isLocationCaptured = formData.latitude !== "";

    return (
        <main className="page narrow">
            {/* Header */}
            <div className="page-head">
                <div>
                    <span className="pill">{service.category}</span>
                    <h1>Book {service.name}</h1>
                    <p>
                        Base price ₹{service.basePrice} • {service.estimatedDuration} minutes
                    </p>
                </div>
            </div>

            {/* Form */}
            <form className="card form" onSubmit={handleSubmit}>
                <ErrorBox error={error} />

                <label>
                    Date & time
                    <input
                        type="datetime-local"
                        required
                        value={formData.bookingDate}
                        onChange={(e) => handleInputChange("bookingDate", e.target.value)}
                    />
                </label>

                <label>
                    Service address
                    <input
                        required
                        placeholder="House / street / area"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                </label>

                {/* Geolocation Button */}
                <button
                    type="button"
                    className="btn outline"
                    onClick={handleLocate}
                >
                    {isLocationCaptured ? "✓ Location captured" : "📍 Use my current location"}
                </button>

                {isLocationCaptured && (
                    <small>
                        Lat {Number(formData.latitude).toFixed(5)}, Lng{" "}
                        {Number(formData.longitude).toFixed(5)}
                    </small>
                )}

                <label>
                    Notes
                    <textarea
                        rows="4"
                        placeholder="Describe the issue..."
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                    />
                </label>

                {/* Pricing Summary */}
                <div className="summary">
                    <b>Total ₹{service.basePrice}</b>
                    <span>Worker will be allocated by availability + distance.</span>
                </div>

                <button className="btn full" disabled={isSubmitting}>
                    {isSubmitting ? "Booking..." : "Confirm booking"}
                </button>
            </form>
        </main>
    );
}