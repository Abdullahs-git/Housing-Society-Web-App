// js/plumber.js
import { db, ref, get } from './firebaseConfig.js';

function redirectToBooking(provider, category, service, price, contact) {
    const url = `servicebooking.html?providerCategory=${encodeURIComponent(category)}&service=${encodeURIComponent(service)}&provider=${encodeURIComponent(provider)}&contact=${encodeURIComponent(contact)}&price=${encodeURIComponent(price)}`;
    window.location.href = url;
}

async function showProviders(serviceName) {
    const modalServiceSpan = document.getElementById('modalServiceName');
    const providerList = document.getElementById('providerList');
    modalServiceSpan.textContent = serviceName;
    providerList.innerHTML = '<p>Loading providers...</p>';

    try {
        const snapshot = await get(ref(db, `services/plumber`));
        if (!snapshot.exists()) {
            providerList.innerHTML = '<p>No providers available.</p>';
            return;
        }

        const data = snapshot.val();
        const matched = [];

        Object.values(data).forEach(provider => {
            const services = provider.services || {};
            if (services[serviceName]) {
                matched.push({
                    name: provider.name,
                    contact: provider.contact,
                    price: services[serviceName].price
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
          <small>Contact: ${p.contact}</small>
        `;
                item.onclick = () => {
                    redirectToBooking(p.name, 'plumber', serviceName, p.price, p.contact);
                };
                providerList.appendChild(item);
            });
        }

        const modal = new bootstrap.Modal(document.getElementById('providerModal'));
        modal.show();
    } catch (error) {
        console.error(error);
        providerList.innerHTML = '<p>Error loading providers.</p>';
    }
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
