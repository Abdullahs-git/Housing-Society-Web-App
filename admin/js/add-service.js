import { auth, db, ref, push, set } from './firebaseConfig.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';

// Redirect to login if not authenticated
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please log in to add a service provider.");
    window.location.href = "login.html";
  }
});

const categorySelect = document.getElementById('category');
const servicesContainer = document.getElementById('servicesContainer');
const servicesList = document.getElementById('servicesList');

const serviceOptions = {
  electrician: ['Wiring', 'Fan Installation', 'Lighting Repair', 'Visit'],
  plumber: ['Leak Fixing', 'Pipe Installation', 'Bathroom Fittings', 'Visit']
};

// Show services based on category
categorySelect.addEventListener('change', () => {
  const selectedCategory = categorySelect.value;
  servicesList.innerHTML = '';

  if (selectedCategory && serviceOptions[selectedCategory]) {
    servicesContainer.style.display = 'block';

    serviceOptions[selectedCategory].forEach(service => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('mb-2');

      wrapper.innerHTML = `
        <div class="form-check">
          <input class="form-check-input service-checkbox" type="checkbox" id="${service}" value="${service}">
          <label class="form-check-label" for="${service}">${service}</label>
        </div>
        <input type="number" min="0" class="form-control mt-1 price-input" placeholder="Enter price for ${service}" data-service="${service}" disabled />
      `;

      servicesList.appendChild(wrapper);
    });

    document.querySelectorAll('.service-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const priceInput = e.target.parentElement.nextElementSibling;
        priceInput.disabled = !e.target.checked;
      });
    });
  } else {
    servicesContainer.style.display = 'none';
  }
});

// Submit form and save to Firebase
document.getElementById('serviceForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const category = document.getElementById('category').value.trim();
  const contact = document.getElementById('contact').value.trim();
  const experience = document.getElementById('experience').value.trim();

  if (!name || !category || !contact || !experience) {
    alert("Please fill out all fields.");
    return;
  }

  const selectedServices = {};
  document.querySelectorAll('.service-checkbox').forEach((checkbox) => {
    if (checkbox.checked) {
      const service = checkbox.value;
      const priceInput = document.querySelector(`.price-input[data-service="${service}"]`);
      const price = priceInput.value.trim();
      if (price) {
        selectedServices[service] = {
          price: price
        };
      }
    }
  });

  if (Object.keys(selectedServices).length === 0) {
    alert("Please select at least one service and provide its price.");
    return;
  }

  try {
    const newProviderRef = push(ref(db, `services/${category}`));
    await set(newProviderRef, {
      name,
      contact,
      experience,
      services: selectedServices
    });

    alert("Service provider added successfully!");
    document.getElementById('serviceForm').reset();
    servicesContainer.style.display = 'none';
    servicesList.innerHTML = '';
  } catch (error) {
    console.error("Error adding service provider:", error);
    alert("Something went wrong. Please try again.");
  }
});
