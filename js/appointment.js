// appointment.js
import { db, ref, push, set } from './firebaseauth.js'; // Adjust path if needed

document.addEventListener('DOMContentLoaded', () => {
    const appointmentDateInput = document.getElementById('appointmentDate');
    const appointmentForm = document.getElementById('appointmentForm');
    const emailInput = document.getElementById('email');

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    appointmentDateInput.setAttribute('min', today);

    appointmentForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const selectedDate = appointmentDateInput.value;
        const email = emailInput.value.trim();
        const timestamp = new Date().toISOString();

        if (!email || !selectedDate) {
            alert('Please fill out all fields.');
            return;
        }

        if (selectedDate < today) {
            alert('Please select today or a future date.');
            return;
        }

        try {
            const appointmentsRef = ref(db, 'appointments');
            const newRef = push(appointmentsRef);
            await set(newRef, {
                email,
                date: selectedDate,
                timestamp
            });

            alert('Appointment scheduled successfully!');
            appointmentForm.reset();

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('appointmentModal'));
            if (modal) modal.hide();

        } catch (error) {
            console.error('Error saving appointment:', error);
            alert('Failed to schedule appointment. Please try again.');
        }
    });
});
