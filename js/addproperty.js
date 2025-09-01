import { db, ref, push, getAuth } from './firebaseConfig.js';

document.addEventListener('DOMContentLoaded', () => {
  const addPropertyForm = document.getElementById('addpropertyform');
  const auth = getAuth(); // Get the authentication instance

  // Add event listener for form submission
  addPropertyForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    // Ensure the user is logged in
    const user = auth.currentUser;
    if (!user) {
      alert('You must be logged in to add a property.');
      return;
    }

    // Log the authenticated user's UID for debugging
    console.log('Authenticated user UID:', user.uid);

    // Get form values
    const title = document.getElementById('title').value.trim();
    const type = document.getElementById('type').value.trim();
    const status = document.getElementById('status').value.trim();
    const location = document.getElementById('location').value.trim();
    const price = document.getElementById('price').value.trim();
    const area = document.getElementById('area').value.trim();
    const bedrooms = document.getElementById('bedrooms').value.trim();
    const bathrooms = document.getElementById('bathrooms').value.trim();

    // Validate that all fields are filled
    if (!title || !type || !status || !location || !price || !area || !bedrooms || !bathrooms) {
      alert('Please fill in all fields.');
      return;
    }

    // Validate numeric fields
    if (isNaN(parseFloat(price)) || isNaN(parseFloat(area))) {
      alert('Price and area must be valid numbers.');
      return;
    }
    if (isNaN(parseInt(bedrooms)) || isNaN(parseInt(bathrooms))) {
      alert('Bedrooms and bathrooms must be valid integers.');
      return;
    }

    // Create an object to store property data
    const propertyData = {
      title,
      type,
      status,
      location,
      price: parseFloat(price), // Convert price to a number
      area: parseFloat(area),   // Convert area to a number
      bedrooms: parseInt(bedrooms), // Convert bedrooms to an integer
      bathrooms: parseInt(bathrooms), // Convert bathrooms to an integer
      createdAt: new Date().toISOString(), // Store timestamp of creation
      uid: user.uid // Associate the property with the user's UID
    };

    try {
      const propertiesRef = ref(db, 'properties');
      const mainPropertiesRef = ref(db, 'mainproperties'); 
        await Promise.all([
        push(propertiesRef, propertyData), 
        push(mainPropertiesRef, propertyData)
      ]);

      // Show success message
      alert('Property added successfully!');
      console.log('Property added to both "properties" and "mainproperties":', propertyData);

      // Clear the form after successful submission
      addPropertyForm.reset();
    } catch (error) {
      // Handle errors during database operation
      console.error('Error adding property:', error);
      alert(`Error: ${error.message}`);
    }
  });
});