// electrician.js
import { db, ref, get } from './firebaseConfig.js';

function redirectToBooking(provider, category, service, price, contact, experience) {
  const url = `servicebooking.html?providerCategory=${encodeURIComponent(category)}`
    + `&service=${encodeURIComponent(service)}&provider=${encodeURIComponent(provider)}`
    + `&contact=${encodeURIComponent(contact)}&price=${encodeURIComponent(price)}`
    + `&experience=${encodeURIComponent(experience)}`;
  window.location.href = url;
}

async function showProviders(serviceName) {
  const modalServiceSpan = document.getElementById('modalServiceName');
  const providerList = document.getElementById('providerList');
  modalServiceSpan.textContent = serviceName;
  providerList.innerHTML = '<p>Loading providers...</p>';

  try {
    const snapshot = await get(ref(db, `services/electrician`));
    if (!snapshot.exists()) {
      providerList.innerHTML = '<p>No providers available.</p>';
    } else {
      const data = snapshot.val();
      const matched = [];

      Object.values(data).forEach(provider => {
        const services = provider.services || {};
        if (services[serviceName]) {
          matched.push({
            name: provider.name || 'N/A',
            contact: provider.contact || 'N/A',
            experience: provider.experience || 'N/A',
            price: services[serviceName].price || 'N/A'
          });
        }
      });

      if (matched.length === 0) {
        providerList.innerHTML = '<p>No providers found for this service.</p>';
      } else {
        providerList.innerHTML = '';
        matched.forEach((p) => {
          const item = document.createElement('a');
          item.href = 'javascript:void(0)';
          item.className = 'list-group-item list-group-item-action';
          item.innerHTML = `
            <div><strong>${p.name}</strong> — Rs ${p.price}</div>
            <div>Experience: ${p.experience}</div>
            <small>Contact: ${p.contact}</small>
          `;
          item.onclick = () => {
            redirectToBooking(p.name, 'electrician', serviceName, p.price, p.contact, p.experience);
          };
          providerList.appendChild(item);
        });
      }
    }
  } catch (err) {
    console.error(err);
    providerList.innerHTML = '<p>Error loading providers.</p>';
  }

  const modal = new bootstrap.Modal(document.getElementById('providerModal'));
  modal.show();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('button.btn.btn-primary').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.card');
      const service = card.querySelector('.card-title').innerText.trim();
      showProviders(service);
    });
  });
});
