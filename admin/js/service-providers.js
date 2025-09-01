import { app, getDatabase, ref, onValue, update, remove } from "./firebaseConfig.js";

const db = getDatabase(app);
const providerList = document.getElementById("providerList");

let allProviders = [];

const renderProviders = (categoryFilter = "all") => {
  providerList.innerHTML = "";
  allProviders.forEach(({ category, key, value }) => {
    if (categoryFilter !== "all" && categoryFilter !== category) return;

    const card = document.createElement("div");
    card.className = "card mb-3";

    let servicesHtml = "<ul>";
    if (value.services) {
      Object.entries(value.services).forEach(([service, obj]) => {
        servicesHtml += `<li>${service}: Rs ${obj.price}</li>`;
      });
    }
    servicesHtml += "</ul>";

    card.innerHTML = `
      <div class="card-body" id="display-${key}">
        <h5>${value.name}</h5>
        <p>Category: ${category}</p>
        <p>Contact: ${value.contact}</p>
        <p>Experience: ${value.experience}</p>
        <p><strong>Services:</strong></p>
        ${servicesHtml || '<p><em>No services listed</em></p>'}
        <button class="btn btn-primary btn-sm me-2" onclick="showForm('${key}')">Update</button>
        <button class="btn btn-danger btn-sm" onclick="deleteProvider('${category}', '${key}')">Delete</button>
      </div>

      <form id="form-${key}" class="p-3 d-none">
        <input id="name-${key}" class="form-control mb-2" value="${value.name}" />
        <input id="contact-${key}" class="form-control mb-2" value="${value.contact}" />
        <input id="experience-${key}" class="form-control mb-2" value="${value.experience}" />
        <div class="mb-2">
          <strong>Services Offered:</strong><br />
          ${generateServiceInputs(category, key, value.services || {})}
        </div>
        <button class="btn btn-success btn-sm" onclick="updateProvider(event, '${category}', '${key}')">Save</button>
      </form>
    `;

    providerList.appendChild(card);
  });
};

function generateServiceInputs(category, key, services) {
  const serviceOptions = {
    electrician: ["Wiring", "Fan Repair", "Socket Fixing", "Visit"],
    plumber: ["Pipe Fixing", "Leak Repair", "Drain Cleaning", "Visit"]
  };

  return serviceOptions[category]
    .map(service => {
      const checked = services[service] ? "checked" : "";
      const price = services[service]?.price || "";
      return `
        <div class="form-check mb-1">
          <input class="form-check-input" type="checkbox" id="${key}-${service}" ${checked} />
          <label class="form-check-label" for="${key}-${service}">${service}</label>
          <input type="number" class="form-control" id="${key}-price-${service}" placeholder="Price" value="${price}" />
        </div>
      `;
    })
    .join("");
}

function collectUpdatedServices(key, category) {
  const serviceOptions = {
    electrician: ["Wiring", "Fan Repair", "Socket Fixing", "Visit"],
    plumber: ["Pipe Fixing", "Leak Repair", "Drain Cleaning", "Visit"]
  };

  const selected = {};
  serviceOptions[category].forEach(service => {
    const checkbox = document.getElementById(`${key}-${service}`);
    const priceInput = document.getElementById(`${key}-price-${service}`);
    if (checkbox.checked && priceInput.value) {
      selected[service] = {
        price: priceInput.value
      };
    }
  });
  return selected;
}

window.showForm = (key) => {
  document.getElementById(`form-${key}`).classList.remove("d-none");
  document.getElementById(`display-${key}`).classList.add("d-none");
};

window.updateProvider = (e, category, key) => {
  e.preventDefault();
  const name = document.getElementById(`name-${key}`).value;
  const contact = document.getElementById(`contact-${key}`).value;
  const experience = document.getElementById(`experience-${key}`).value;
  const services = collectUpdatedServices(key, category);

  update(ref(db, `services/${category}/${key}`), { name, contact, experience, services })
    .then(() => location.reload())
    .catch((err) => alert("Update failed: " + err.message));
};

window.deleteProvider = (category, key) => {
  if (confirm("Delete this provider?")) {
    remove(ref(db, `services/${category}/${key}`))
      .then(() => location.reload())
      .catch((err) => alert("Delete failed: " + err.message));
  }
};

// Initial load
["electrician", "plumber"].forEach((category) => {
  const categoryRef = ref(db, `services/${category}`);
  onValue(categoryRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        allProviders.push({ category, key, value });
      });
      renderProviders();
    }
  });
});
