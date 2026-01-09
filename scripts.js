// ===============================
// Modal-Elemente
// ===============================
const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const caption = document.getElementById("caption");
const closeModal = document.getElementById("closeModal");

// ===============================
// Aktive Filter (Buttons)
// ===============================
let activeKontinent = null;
let activeVerkehr = null;

// ===============================
// Kontinent-Buttons (Toggle)
// ===============================
document.querySelectorAll(".kontinent-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const kontinent = btn.dataset.kontinent;

    if (activeKontinent === kontinent) {
      activeKontinent = null;
      btn.classList.remove("bg-blue-600", "text-white");
      btn.classList.add("bg-gray-200");
    } else {
      activeKontinent = kontinent;
      document.querySelectorAll(".kontinent-btn").forEach((b) => {
        b.classList.remove("bg-blue-600", "text-white");
        b.classList.add("bg-gray-200");
      });
      btn.classList.add("bg-blue-600", "text-white");
      btn.classList.remove("bg-gray-200");
    }

    filterLänder();
  });
});

// ===============================
// Verkehr-Buttons (Toggle)
// ===============================
document.querySelectorAll(".verkehr-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const verkehr = btn.dataset.verkehr;

    if (activeVerkehr === verkehr) {
      activeVerkehr = null;
      btn.classList.remove("bg-blue-600", "text-white");
      btn.classList.add("bg-gray-200");
    } else {
      activeVerkehr = verkehr;
      document.querySelectorAll(".verkehr-btn").forEach((b) => {
        b.classList.remove("bg-blue-600", "text-white");
        b.classList.add("bg-gray-200");
      });
      btn.classList.add("bg-blue-600", "text-white");
      btn.classList.remove("bg-gray-200");
    }

    filterLänder();
  });
});

// ===============================
// Daten laden
// ===============================
async function loadData() {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/utnelson/guesser/refs/heads/main/data.json"
    );
    if (!response.ok) throw new Error("Netzwerkfehler");
    return await response.json();
  } catch (error) {
    console.error("Fehler beim Laden der Daten:", error);
  }
}

// ===============================
// Länder filtern & anzeigen
// ===============================
async function filterLänder() {
  const data = await loadData();
  if (!data) return;

  const inputLand = document.getElementById("land").value.trim().toLowerCase();
  const kontinent = activeKontinent;
  const verkehr = activeVerkehr;

  const filteredCountries = Object.entries(data).filter(([land, details]) => {
    let matches = true;

    // Land-Filter
    if (inputLand) {
      const landMatch = land.toLowerCase().startsWith(inputLand);
      const domainMatch = (details.land.domain || "").toLowerCase().includes(inputLand);
      if (!landMatch && !domainMatch) matches = false;
    }

    // Kontinent-Filter
    if (kontinent && details.kontinent !== kontinent) matches = false;

    // Verkehr-Filter
    if (verkehr && details.verkehr !== verkehr) matches = false;

    return matches;
  });

  // ===============================
  // Tabelle befüllen
  // ===============================
  const tbody = document.querySelector("#countryTable tbody");
  tbody.innerHTML = "";

  filteredCountries.forEach(([land, details]) => {
    const row = document.createElement("tr");
    row.classList.add("hover:bg-gray-100");

    row.innerHTML = `
      <td class="border border-gray-300 px-4 py-2">
        ${land}
        <img src="${details.land.flagge}" 
             class="w-36 h-24 object-contain rounded cursor-pointer transform transition-transform duration-200 hover:scale-110"
             data-caption="${land}" />
      </td>
      <td class="border border-gray-300 px-4 py-2">${details.kontinent}</td>
      <td class="border border-gray-300 px-4 py-2">${details.verkehr}</td>
      <td class="border border-gray-300 px-4 py-2">
        ${details.plates.map(
          (b) => `<img src="${b.bild}" 
                      class="w-36 h-24 object-contain rounded cursor-pointer transform transition-transform duration-200 hover:scale-110"
                      data-caption="${b.beschreibung}" />`
        ).join("")}
      </td>
      <td class="border border-gray-300 px-4 py-2">
        ${details.sprache.map(
          (b) => `<img src="${b.bild}" 
                      class="w-36 h-24 object-contain rounded cursor-pointer transform transition-transform duration-200 hover:scale-110"
                      data-caption="${b.beschreibung}" />`
        ).join("")}
      </td>
      <td class="border border-gray-300 px-4 py-2">
        ${details.googlecar.map(
          (b) => `<img src="${b.bild}" 
                      class="w-36 h-24 object-contain rounded cursor-pointer transform transition-transform duration-200 hover:scale-110"
                      data-caption="${b.beschreibung}" />`
        ).join("")}
      </td>
      <td class="border border-gray-300 px-4 py-2">
        ${details.bollards.map(
          (b) => `<img src="${b.bild}" 
                      class="w-36 h-24 object-contain rounded cursor-pointer transform transition-transform duration-200 hover:scale-110"
                      data-caption="${b.beschreibung}" />`
        ).join("")}
      </td>
      <td class="border border-gray-300 px-4 py-2">
        ${details.poles.map(
          (s) => `<img src="${s.bild}" 
                      class="w-36 h-24 object-contain rounded cursor-pointer transform transition-transform duration-200 hover:scale-110"
                      data-caption="${s.beschreibung}" />`
        ).join("")}
      </td>
      <td class="border border-gray-300 px-4 py-2">
        ${details.schilder.map(
          (s) => `<img src="${s.bild}" 
                      class="w-36 h-24 object-contain rounded cursor-pointer transform transition-transform duration-200 hover:scale-110"
                      data-caption="${s.beschreibung}" />`
        ).join("")}
      </td>
      <td class="border border-gray-300 px-4 py-2">
        ${(details.taxi ?? []).map(
          (s) => `<img src="${s.bild}" 
                      class="w-36 h-24 object-contain rounded cursor-pointer transform transition-transform duration-200 hover:scale-110"
                      data-caption="${s.beschreibung}" />`
        ).join("")}
      </td>
    `;

    tbody.appendChild(row);
  });

  // ===============================
  // Modal-Events für alle Bilder
  // ===============================
  document.querySelectorAll("img[data-caption]").forEach((img) => {
    img.addEventListener("click", (e) => {
      openModal(e.target.src, e.target.getAttribute("data-caption"));
    });
  });
}

// ===============================
// Modal-Funktion (Tailwind hidden)
// ===============================
function openModal(src, captionText) {
  modal.classList.remove("hidden");      // Tailwind sichtbar
  modalImage.src = src;
  caption.textContent = captionText || "";
}

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");         // Tailwind wieder verstecken
});

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.add("hidden");
  }
});

// ===============================
// Initial laden
// ===============================
filterLänder();
