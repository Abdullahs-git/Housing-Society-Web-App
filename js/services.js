import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { app } from "./firebaseConfig.js";

// Firebase DB
const db = getDatabase(app);

// URL params
const params = new URLSearchParams(window.location.search);
const providerName = params.get("provider") || "Unknown Provider";
const serviceName = params.get("service") || "Service";
const contact = params.get("contact") || "";

// Pre-fill dynamic heading and contact field
document.getElementById("providerContact").value = contact;
const heading = document.querySelector("h2");
if (heading) {
    heading.textContent = `Book ${serviceName} with ${providerName}`;
}

// Form submission handler
const form = document.querySelector("form");
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("contact").value.trim();
    const address = document.getElementById("address").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    const bookingData = {
        name,
        contact: phone,
        address,
        date,
        time,
        provider: providerName,
        service: serviceName,
        timestamp: new Date().toISOString()
    };

    try {
        await push(ref(db, "bookings"), bookingData);
        alert("✅ Your service has been booked successfully!");

        // Prepare WhatsApp message
        const whatsappMessage = `Dear ${providerName},\nYou have been booked by ${name} for ${serviceName} on ${date} at ${time}.\nAddress: ${address}`;
        const phoneWithCountryCode = contact.startsWith("+") ? contact : `+92${contact}`;
        const waUrl = `https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(whatsappMessage)}`;

        // Open WhatsApp
        window.open(waUrl, "_blank");

        form.reset();
    } catch (error) {
        console.error("Booking failed:", error);
        alert("❌ Failed to book service. Please try again.");
    }
});
