import { db, ref, get } from './firebaseConfig.js';

document.addEventListener('DOMContentLoaded', async () => {
    const propertyList = document.getElementById('propertyList');
    let allProperties = [];

    // URL params (for redirects from index.html)
    const urlParams = new URLSearchParams(window.location.search);
    const defaultKeyword = urlParams.get('keyword')?.toLowerCase() || '';
    const defaultType = urlParams.get('type')?.toLowerCase() || 'all';
    const defaultLocation = urlParams.get('location')?.toLowerCase() || '';

    try {
        const mainPropertiesRef = ref(db, 'mainproperties');
        const snapshot = await get(mainPropertiesRef);

        if (!snapshot.exists()) {
            propertyList.innerHTML = `<div class="col-12 text-center"><p>No properties available.</p></div>`;
            return;
        }

        const properties = snapshot.val();
        allProperties = Object.entries(properties).map(([id, property]) => ({
            id,
            ...property
        }));

        // Set default filter from URL
        applyFilters(defaultKeyword, defaultType, defaultLocation);

        // --- EVENT: On Search Button Click (internal search) ---
        document.getElementById('searchBtn').addEventListener('click', () => {
            const keyword = document.getElementById('searchKeyword').value.trim().toLowerCase();
            const type = document.getElementById('searchType').value.toLowerCase();
            const location = document.getElementById('searchLocation').value.trim().toLowerCase();
            applyFilters(keyword, type, location);
        });

        // Filter Buttons
        document.getElementById('filterSale').addEventListener('click', () => filterProperties('for-sale'));
        document.getElementById('filterRent').addEventListener('click', () => filterProperties('for-rent'));
        document.getElementById('filterAll').addEventListener('click', () => filterProperties('all'));

    } catch (error) {
        console.error('Error fetching properties:', error);
        propertyList.innerHTML = `<div class="col-12 text-center"><p>Failed to load properties. Please try again later.</p></div>`;
    }

    // Core Filtering Logic
    function applyFilters(keyword, type, location) {
        const filtered = allProperties.filter(property => {
            const title = (property.title || '').toLowerCase();
            const propType = (property.status || '').toLowerCase().replace(' ', '-');
            const propLocation = (property.location || '').toLowerCase();

            const matchKeyword = !keyword || title.includes(keyword);
            const matchType = type === 'all' || propType === type;
            const matchLocation = !location || propLocation.includes(location);

            return matchKeyword && matchType && matchLocation;
        });

        renderProperties(filtered.length > 0 ? filtered : []);
    }

    // Render cards
    function renderProperties(list) {
        propertyList.innerHTML = '';
        if (list.length === 0) {
            propertyList.innerHTML = `<div class="col-12 text-center"><p>No matching properties found.</p></div>`;
            return;
        }

        list.forEach(property => {
            const statusClass = property.status === 'For Sale' ? 'bg-primary' : 'bg-dark';
            const type = (property.status || '').toLowerCase().replace(' ', '-');

            const card = `
                <div class="col-lg-4 col-md-6 property-item" data-type="${type}">
                    <div class="property-item-content">
                        <div class="position-relative">
                            <img src="images/property-1.jpg" alt="Property Image" class="img-fluid">
                            <div class="${statusClass} text-white position-absolute start-0 top-0 m-3 py-1 px-3">${property.status}</div>
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
                    </div>
                </div>
            `;
            propertyList.insertAdjacentHTML('beforeend', card);
        });
    }

    // Filter type buttons
    function filterProperties(type) {
        const items = document.querySelectorAll('.property-item');
        items.forEach(item => {
            const itemType = item.getAttribute('data-type');
            item.style.display = (type === 'all' || itemType === type) ? 'block' : 'none';
        });
    }
});
