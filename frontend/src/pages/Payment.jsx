import React, { useEffect, useState } from "react";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    Elements,
    PaymentElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";

import { loadStripe } from "@stripe/stripe-js";

import { bookings, payments } from "../api";
import { ErrorBox } from "../components";


// Stripe public key
const key = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

const stripePromise = key ? loadStripe(key) : null;


// Checkout Component

function Checkout({ booking, paymentId }) {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");


    // Handle payment submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setBusy(true);
        setError("");

        try {
            // Validate PaymentElement
            const submitResult = await elements.submit();

            if (submitResult.error) {
                throw new Error(submitResult.error.message);
            }


            // Confirm payment with Stripe
            const result = await stripe.confirmPayment({
                elements,
                redirect: "if_required",
            });

            if (result.error) {
                throw new Error(result.error.message);
            }


            // Payment successful
            if (result.paymentIntent?.status === "succeeded") {
                await payments.confirm({
                    paymentId,
                });
            }


            // Redirect to booking page
            navigate(`/booking/${booking._id}`);
        } catch (error) {
            setError(error.message);
        } finally {
            setBusy(false);
        }
    };


    return (
        <form className="form" onSubmit={handleSubmit}>
            <PaymentElement />

            <ErrorBox error={error} />

            <button
                type="submit"
                className="btn full"
                disabled={busy || !stripe}
            >
                {busy
                    ? "Processing..."
                    : `Pay ₹${booking.price}`}
            </button>
        </form>
    );
}


// --------------------------------------------------
// Payment Page
// --------------------------------------------------

export default function Payment() {
    const { id } = useParams();

    const [booking, setBooking] = useState(null);
    const [secret, setSecret] = useState("");
    const [paymentId, setPaymentId] = useState("");
    const [error, setError] = useState("");


    // Fetch booking details
    useEffect(() => {
        bookings
            .get(id)
            .then((data) => {
                setBooking(data.booking);
            })
            .catch((error) => {
                setError(error.message);
            });
    }, [id]);


    // Create Stripe payment
    const startPayment = async () => {
        try {
            const data = await payments.create({
                bookingId: id,
            });

            setPaymentId(data.paymentId);
            setSecret(data.clientSecret);
        } catch (error) {
            setError(error.message);
        }
    };


    return (
        <main className="page narrow">
            <div className="card">

                {/* Payment Badge */}
                <span className="pill">
                    Secure payment
                </span>


                {/* Payment Amount */}
                <h1>
                    Pay ₹{booking?.price || "—"}
                </h1>


                {/* Error Message */}
                <ErrorBox error={error} />


                {/* Start Payment */}
                {booking && !secret && (
                    <>
                        <p>
                            Pay after the service is completed.
                            Stripe test keys are required.
                        </p>

                        <button
                            className="btn"
                            onClick={startPayment}
                        >
                            Continue to payment
                        </button>
                    </>
                )}


                {/* Stripe Checkout */}
                {secret && stripePromise && (
                    <Elements
                        stripe={stripePromise}
                        options={{
                            clientSecret: secret,
                        }}
                    >
                        <Checkout
                            booking={booking}
                            paymentId={paymentId}
                        />
                    </Elements>
                )}


                {/* Missing Stripe Key */}
                {secret && !stripePromise && (
                    <p>
                        Add VITE_STRIPE_PUBLIC_KEY to
                        frontend/.env.
                    </p>
                )}

            </div>
        </main>
    );
}