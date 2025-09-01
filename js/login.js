import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { auth } from './firebaseConfig.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginform');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        alert('Login successful!');
        window.location.href = 'dashboard.html';
      } catch (error) {
        console.error('Login Error:', error);
        alert(`Error: ${error.message}`);
      }
    });
  }
});