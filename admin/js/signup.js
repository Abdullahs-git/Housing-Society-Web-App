import { auth, db, ref, set, createUserWithEmailAndPassword } from './firebaseConfig.js';

// Wait for the DOM to load completely
document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupform');

  // Add event listener for form submission
  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    // Get form values
    const email = document.getElementById('email-signup').value.trim();
    const password = document.getElementById('password-signup').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    // Validate passwords match
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      // Create user with email and password in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store additional user data in Firebase Realtime Database, including UID
      const userRef = ref(db, `users/${user.uid}`);
      await set(userRef, {
        uid: user.uid, // Save the UID explicitly
        email: email,
        createdAt: new Date().toISOString() // Store timestamp of account creation
      });

      // Show success message and redirect to login page
      alert('Account created successfully! Please log in.');
      window.location.href = 'login.html';
    } catch (error) {
      // Handle errors during signup
      const errorCode = error.code;
      const errorMessage = error.message;

      // Display specific error messages to the user
      switch (errorCode) {
        case 'auth/email-already-in-use':
          alert('This email is already registered. Please use another email.');
          break;
        case 'auth/weak-password':
          alert('Password should be at least 6 characters long.');
          break;
        case 'auth/invalid-email':
          alert('Invalid email address.');
          break;
        default:
          alert(`Error: ${errorMessage}`);
      }
    }
  });
});