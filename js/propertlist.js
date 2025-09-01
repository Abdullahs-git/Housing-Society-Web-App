// Import necessary Firebase modules
import { db, ref, query, orderByChild, equalTo, get, update, remove } from './firebaseConfig.js';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  const auth = getAuth();
  const propertyListContainer = document.getElementById('propertyList');
  const updatePropertyFormContainer = document.getElementById('updatePropertyFormContainer');
  const updatePropertyForm = document.getElementById('updatePropertyForm');
  const cancelUpdateButton = document.getElementById('cancelUpdate');

  let currentPropertyKey = null; // To store the key of the property being updated

  // Monitor authentication state
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert('You must be logged in to view properties.');
      window.location.href = 'login.html';
      return;
    }

    // Fetch and display properties
    try {
      const propertiesRef = ref(db, 'properties');
      const idTokenResult = await user.getIdTokenResult();
      const isAdmin = idTokenResult.claims.role === 'admin';

      let snapshot;
      if (isAdmin) {
        snapshot = await get(propertiesRef); // Admin fetches all properties
      } else {
        const userPropertiesQuery = query(propertiesRef, orderByChild('uid'), equalTo(user.uid));
        snapshot = await get(userPropertiesQuery); // Regular user fetches their own properties
      }

      if (snapshot.exists()) {
        const properties = snapshot.val();
        propertyListContainer.innerHTML = ''; // Clear existing content

        Object.keys(properties).forEach((key) => {
          const property = properties[key];
          const propertyCard = createPropertyCard(key, property, isAdmin, user.uid);
          propertyListContainer.appendChild(propertyCard);
        });
      } else {
        propertyListContainer.innerHTML = '<p class="text-center">No properties found.</p>';
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      alert(`Error: ${error.message}`);
    }
  });

  /**
   * Creates a dynamic property card element
   * @param {string} key - The unique key of the property in the database
   * @param {object} property - The property data object
   * @param {boolean} isAdmin - Whether the current user is an admin
   * @param {string} userId - The UID of the logged-in user
   * @returns {HTMLElement} - The created property card element
   */
  function createPropertyCard(key, property, isAdmin, userId) {
    const card = document.createElement('div');
    card.className = 'col-lg-4 col-md-6 property-item';
    card.setAttribute('data-type', property.status.toLowerCase());

    card.innerHTML = `
      <div class="property-item-content">
        <div class="position-relative">
          <img src="images/property-1.jpg" alt="Property Image" class="img-fluid">
          <div class="bg-primary text-white position-absolute start-0 top-0 m-3 py-1 px-3">${property.status}</div>
        </div>
        <div class="details">
          <h5>${property.title}</h5>
          <p><i class="fa fa-map-marker-alt text-primary me-2"></i>${property.location}</p>
          <h6>PKR ${property.price.toLocaleString()}</h6>
        </div>
        <div class="meta-info">
          <small><i class="fa fa-ruler-combined text-primary me-2"></i>${property.area} Sqft</small>
          <small><i class="fa fa-bed text-primary me-2"></i>${property.bedrooms} Beds</small>
          <small><i class="fa fa-bath text-primary me-2"></i>${property.bathrooms} Baths</small>
        </div>
        <div class="mt-3 d-flex justify-content-between">
          ${
            (isAdmin || property.uid === userId)
              ? `<button class="btn btn-sm btn-warning update-btn" data-key="${key}">Update</button>
                 <button class="btn btn-sm btn-danger delete-btn" data-key="${key}">Delete</button>`
              : ''
          }
        </div>
      </div>
    `;

    // Add event listeners for Update and Delete buttons
    if (isAdmin || property.uid === userId) {
      const updateButton = card.querySelector('.update-btn');
      const deleteButton = card.querySelector('.delete-btn');

      // Update button click handler
      updateButton.addEventListener('click', () => {
        openUpdateForm(key, property);
      });

      // Delete button click handler
      deleteButton.addEventListener('click', async () => {
        const confirmDelete = confirm(`Are you sure you want to delete "${property.title}"?`);
        if (confirmDelete) {
          try {
            await remove(ref(db, `properties/${key}`)); // Remove the property from the database
            card.remove(); // Remove the card from the UI
            alert('Property deleted successfully!');
          } catch (error) {
            console.error('Error deleting property:', error);
            alert(`Error: ${error.message}`);
          }
        }
      });
    }

    return card;
  }

  /**
   * Opens the update form with pre-filled data
   * @param {string} key - The unique key of the property in the database
   * @param {object} property - The property data object
   */
  function openUpdateForm(key, property) {
    currentPropertyKey = key;

    // Pre-fill the update form fields
    document.getElementById('update-key').value = key;
    document.getElementById('update-title').value = property.title;
    document.getElementById('update-location').value = property.location;
    document.getElementById('update-price').value = property.price;
    document.getElementById('update-area').value = property.area;
    document.getElementById('update-bedrooms').value = property.bedrooms;
    document.getElementById('update-bathrooms').value = property.bathrooms;

    // Show the update form
    updatePropertyFormContainer.classList.remove('d-none');
  }

  // Handle Update Property Form Submission
  updatePropertyForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!currentPropertyKey) return;

    const formData = new FormData(updatePropertyForm);
    const updatedData = {
      title: formData.get('title'),
      location: formData.get('location'),
      price: parseFloat(formData.get('price')),
      area: parseFloat(formData.get('area')),
      bedrooms: parseInt(formData.get('bedrooms')),
      bathrooms: parseInt(formData.get('bathrooms')),
    };

    try {
      const propertyRef = ref(db, `properties/${currentPropertyKey}`);
      await update(propertyRef, updatedData);

      alert('Property updated successfully!');
      resetForms();
    } catch (error) {
      console.error('Error updating property:', error);
      alert(`Error: ${error.message}`);
    }
  });

  // Cancel Update Button
  cancelUpdateButton.addEventListener('click', () => {
    resetForms();
  });

  /**
   * Resets the forms and hides the update form
   */
  function resetForms() {
    currentPropertyKey = null;
    updatePropertyFormContainer.classList.add('d-none');
    updatePropertyForm.reset();
  }
});