import { db, ref, push, set } from "./firebaseConfig.js";

// Ensure DOM is fully loaded before accessing elements
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactform");

  if (!contactForm) {
    console.error("Form not found in the DOM.");
    return;
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Get form values
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    if (name && email && subject && message) {
      try {
        const contactRef = ref(db, "contacts"); 
        const newContactRef = push(contactRef); 

        await set(newContactRef, {
          name,
          email,
          subject,
          message,
          timestamp: new Date().toISOString()
        });

        alert("Your message has been sent successfully!");
        contactForm.reset();
      } catch (error) {
        console.error("Error saving data: ", error);
        alert("There was an error sending your message. Please try again.");
      }
    } else {
      alert("Please fill out all fields.");
    }
  });
});
