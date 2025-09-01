import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { app } from './firebaseConfig.js';

const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
  const forgetForm = document.getElementById('forgetform');
  if (forgetForm) {
    forgetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Get form values
      const email = document.getElementById('email-forget').value;

      try {
        // Send password reset email
        await sendPasswordResetEmail(auth, email);
        alert(`A password reset link has been sent to ${email}. Please check your inbox.`);
        
        // Redirect to login page after successful reset request
        window.location.href = 'login.html';
      } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
      }
    });
  }
});