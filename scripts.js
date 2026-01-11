// ===============================
// Modal-Elemente
// ===============================
const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const caption = document.getElementById("caption");
const closeModal = document.getElementById("closeModal");

// ===============================
// Aktive Filter
// ===============================
let activeKontinent = null;
let activeVerkehr = null;
let activePlates = null;
let activeGooglecar = null;

// ===============================
// Helper: Toggle Button Gruppe
// ===============================
function setupToggleButtons(selector, getter, setter) {
  document.querySelectorAll(selector).forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = getter(btn);

      if (setter.get() === value) {
        // DEAKTIVIEREN
        setter.set(null);
        btn.classList.remove("border-2", "border-red-600");
        btn.classList.add("border", "border-gray-300");
      } else {
        // AKTIVIEREN
        setter.set(value);
        document.querySelectorAll(selector).forEach((b) => {
          b.classList.remove("border-2", "border-red-600");
          b.classList.add("border", "border-gray-300");
        });
        btn.classList.add("border-2", "border-red-600");
        btn.classList.remove("border-gray-300");
      }

      filterLänder();
    });
  });
}

// ===============================
// Filter-Buttons initialisieren
// ===============================
setupToggleButtons(".kontinent-btn", (btn) => btn.dataset.kontinent, {
  get: () => activeKontinent,
  set: (v) => (activeKontinent = v),
});

setupToggleButtons(".verkehr-btn", (btn) => btn.dataset.verkehr, {
  get: () => activeVerkehr,
  set: (v) => (activeVerkehr = v),
});

setupToggleButtons(".plates-btn", (btn) => btn.dataset.plates, {
  get: () => activePlates,
  set: (v) => (activePlates = v),
});

setupToggleButtons(".googlecar-btn", (btn) => btn.dataset.googlecar, {
  get: () => activeGooglecar,
  set: (v) => (activeGooglecar = v),
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
// Filter reset
// ===============================
function resetAllFilters() {
  // Filter-States zurücksetzen
  activeKontinent = null;
  activeVerkehr = null;
  activePlates = null;
  activeGooglecar = null;

  // Textfeld leeren
  document.getElementById("land").value = "";

  // Alle Toggle-Buttons zurücksetzen
  document
    .querySelectorAll(
      ".kontinent-btn, .verkehr-btn, .plates-btn, .googlecar-btn"
    )
    .forEach((btn) => {
      btn.classList.remove("border-2", "border-red-600");
      btn.classList.add("border", "border-gray-300");
    });

  // Tabelle neu rendern
  filterLänder();
}

// ===============================
// Länder filtern & anzeigen
// ===============================
async function filterLänder() {
  const data = await loadData();
  if (!data) return;

  const inputLand = document.getElementById("land").value.trim().toLowerCase();

  const filteredCountries = Object.entries(data).filter(([land, details]) => {
    let matches = true;

    // Land / Domain
    if (inputLand) {
      const landMatch = land.toLowerCase().startsWith(inputLand);
      const domainMatch = (details.land.domain || "")
        .toLowerCase()
        .includes(inputLand);
      if (!landMatch && !domainMatch) matches = false;
    }

    // Kontinent
    if (activeKontinent && details.kontinent !== activeKontinent)
      matches = false;

    // Verkehr
    if (activeVerkehr && details.verkehr !== activeVerkehr) matches = false;

    // Plates
    if (activePlates) {
      const hasPlate = (details.plates || []).some((p) =>
        p.beschreibung?.toLowerCase().includes(activePlates.toLowerCase())
      );
      if (!hasPlate) matches = false;
    }

    // Googlecar
    if (activeGooglecar) {
      const hasCar = (details.googlecar || []).some((g) =>
        g.beschreibung?.toLowerCase().includes(activeGooglecar.toLowerCase())
      );
      if (!hasCar) matches = false;
    }

    return matches;
  });

  // ===============================
  // Tabelle füllen
  // ===============================
  const tbody = document.querySelector("#countryTable tbody");
  tbody.innerHTML = "";

  filteredCountries.forEach(([land, details]) => {
    const row = document.createElement("tr");
    row.classList.add("hover:bg-gray-100");

    row.innerHTML = `
    <td class="border px-2 py-2 text-center align-middle">
      <div class="flex flex-col items-center">
      <span>${details.kontinent}</span>
        <span class="font-bold">${land}</span>
        <img src="${details.land.flagge}"
             class="w-24 h-24 object-contain rounded cursor-pointer"
             data-caption="${land}">
             <span>${details.verkehr}</span>
      </div>
    </td>

    <td class="border px-4 py-2 text-center align-middle">
      <div class="flex justify-center items-center gap-2 flex-wrap">
        ${(details.plates || [])
          .map(
            (p) =>
              `<img src="${p.bild}" class="w-36 h-24 object-contain rounded cursor-pointer"
                data-caption="${p.beschreibung}">`
          )
          .join("")}
      </div>
    </td>

    <td class="border px-4 py-2 text-center align-middle">
      <div class="flex justify-center items-center gap-2 flex-wrap">
        ${(details.sprache || [])
          .map(
            (s) =>
              `<img src="${s.bild}" class="w-36 h-24 object-contain rounded cursor-pointer"
                data-caption="${s.beschreibung}">`
          )
          .join("")}
      </div>
    </td>

    <td class="border px-4 py-2 text-center align-middle">
      <div class="flex justify-center items-center gap-2 flex-wrap">
        ${(details.googlecar || [])
          .map(
            (g) =>
              `<img src="${g.bild}" class="w-36 h-24 object-contain rounded cursor-pointer"
                data-caption="${g.beschreibung}">`
          )
          .join("")}
      </div>
    </td>

    <td class="border px-4 py-2 text-center align-middle">
      <div class="flex justify-center items-center gap-2 flex-wrap">
        ${(details.bollards || [])
          .map(
            (b) =>
              `<img src="${b.bild}" class="w-36 h-24 object-contain rounded cursor-pointer"
                data-caption="${b.beschreibung}">`
          )
          .join("")}
      </div>
    </td>

    <td class="border px-4 py-2 text-center align-middle">
      <div class="flex justify-center items-center gap-2 flex-wrap">
        ${(details.poles || [])
          .map(
            (p) =>
              `<img src="${p.bild}" class="w-36 h-24 object-contain rounded cursor-pointer"
                data-caption="${p.beschreibung}">`
          )
          .join("")}
      </div>
    </td>

    <td class="border px-4 py-2 text-center align-middle">
      <div class="flex justify-center items-center gap-2 flex-wrap">
        ${(details.schilder || [])
          .map(
            (s) =>
              `<img src="${s.bild}" class="w-36 h-24 object-contain rounded cursor-pointer"
                data-caption="${s.beschreibung}">`
          )
          .join("")}
      </div>
    </td>

    <td class="border px-4 py-2 text-center align-middle">
      <div class="flex justify-center items-center gap-2 flex-wrap">
        ${(details.taxi || [])
          .map(
            (t) =>
              `<img src="${t.bild}" class="w-36 h-24 object-contain rounded cursor-pointer"
                data-caption="${t.beschreibung}">`
          )
          .join("")}
      </div>
    </td>

    <td class="border px-4 py-2 text-center align-middle">
      <div class="flex justify-center items-center gap-2 flex-wrap">
        ${(details.streets || [])
          .map(
            (s) =>
              `<img src="${s.bild}" class="w-36 h-24 object-contain rounded cursor-pointer"
                data-caption="${s.beschreibung}">`
          )
          .join("")}
      </div>
    </td>
  `;

    tbody.appendChild(row);
  });

  document.querySelectorAll("img[data-caption]").forEach((img) => {
    img.addEventListener("click", () => {
      openModal(img.src, img.dataset.caption);
    });
  });
}

// ===============================
// Modal
// ===============================
function openModal(src, text) {
  modal.classList.remove("hidden");
  modalImage.src = src;
  caption.textContent = text || "";
}

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

window.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});

// ===============================
// Initial
// ===============================
filterLänder();
document
  .getElementById("resetFilters")
  .addEventListener("click", resetAllFilters);
