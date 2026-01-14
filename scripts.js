// ===============================
// Globale Konfiguration
// ===============================
const MEDIA_KEYS_ORDER = [
  "plates",
  "sprache",
  "googlecar",
  "bollards",
  "streets",
  "poles",
  "schilder",
  "taxi",
  "architcture",
];

// Hilfsfunktion: Media-Key schön formatieren (z.B. "googlecar" -> "Google Car")
function formatKey(key) {
  if (key === "architcture") return "Architecture"; // Tippfehler korrigieren
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

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

// Media-Key Filter (mehrfach auswählbar)
const activeMediaFilters = {};
MEDIA_KEYS_ORDER.forEach((key) => (activeMediaFilters[key] = new Set()));

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

// ===============================
// Daten laden
// ===============================
async function loadData() {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/utnelson/guesser/refs/heads/main/data.json"
    );
    if (!response.ok) throw new Error("Netzwerkfehler");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fehler beim Laden der Daten:", error);
  }
}

// ===============================
// Filter reset
// ===============================
function resetAllFilters() {
  activeKontinent = null;
  activeVerkehr = null;

  MEDIA_KEYS_ORDER.forEach(key => activeMediaFilters[key].clear());

  document.getElementById("land").value = "";

  // Toggle Buttons zurücksetzen
  document.querySelectorAll(".kontinent-btn, .verkehr-btn").forEach((btn) => {
    btn.classList.remove("border-2", "border-red-600");
    btn.classList.add("border", "border-gray-300");
  });

  // Aktive Badges unter Überschrift zurücksetzen
  document.querySelectorAll(".active-badges").forEach(c => c.innerHTML = "");

  // Tooltip-Badges in allen Spalten zurücksetzen
  document.querySelectorAll(".th-tooltip .tooltip-content span").forEach(b => {
    b.classList.remove("bg-blue-500", "text-white");
    b.classList.add("bg-gray-200", "text-black");
  });

  // Tabelle neu rendern
  filterLänder();
}


// ===============================
// Länder filtern & Tabelle füllen
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
      const domainMatch = (details.domain || "")
        .toLowerCase()
        .includes(inputLand);
      if (!landMatch && !domainMatch) matches = false;
    }

    // Kontinent
    if (activeKontinent && details.kontinent !== activeKontinent)
      matches = false;

    // Verkehr
    if (activeVerkehr && details.verkehr !== activeVerkehr) matches = false;

    // Media-Key Filter
    MEDIA_KEYS_ORDER.forEach((key) => {
      if (activeMediaFilters[key].size) {
        const hasTag = (details[key] || []).some((item) =>
          (item.tags || []).some((t) => activeMediaFilters[key].has(t))
        );
        if (!hasTag) matches = false;
      }
    });

    return matches;
  });

  const tbody = document.querySelector("#countryTable tbody");
  tbody.innerHTML = "";

  filteredCountries.forEach(([land, details]) => {
    const row = document.createElement("tr");
    row.classList.add("hover:bg-gray-100");

    row.innerHTML = `
    <td class="border px-2 py-2 text-center align-middle">
      <div class="flex flex-col items-center">
        <span>${details.kontinent || ""}</span>
        <span class="font-bold">${land}</span>
        <img src="${
          details.flagge || ""
        }" class="w-24 h-24 object-contain rounded cursor-pointer" data-caption="${land}">
        <span>${details.verkehr || ""}</span>
      </div>
    </td>

    ${MEDIA_KEYS_ORDER.map(
      (key) => `
      <td class="border px-4 py-2 text-center align-middle">
        <div class="flex justify-center items-center gap-2 flex-wrap">
          ${(details[key] || [])
            .map(
              (item) => `
            <img src="${item.bild}" class="w-36 h-24 object-contain rounded cursor-pointer" data-caption="${item.beschreibung}">
          `
            )
            .join("")}
        </div>
      </td>
    `
    ).join("")}
    `;

    tbody.appendChild(row);
  });

  // Modal Event für alle Bilder
  document.querySelectorAll("img[data-caption]").forEach((img) => {
    img.addEventListener("click", () =>
      openModal(img.src, img.dataset.caption)
    );
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

closeModal.addEventListener("click", () => modal.classList.add("hidden"));
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});

// ===============================
// Media-Key Badges + aktive Badges unter Überschrift
// ===============================
async function setupMediaKeyBadges() {
  const headerCells = document.querySelectorAll("#countryTable thead th");
  const data = await loadData();
  if (!data) return;

  for (let i = 1; i < headerCells.length; i++) {
    const key = MEDIA_KEYS_ORDER[i - 1];
    if (!key) continue;

    const th = headerCells[i];
    th.classList.add("th-tooltip");
    th.innerHTML = "";

    // Überschrift
    const title = document.createElement("div");
    title.textContent = formatKey(key);
    title.className = "font-semibold";

    // Container für aktive Badges
    const activeContainer = document.createElement("div");
    activeContainer.className = "active-badges";

    // Tooltip Container für alle möglichen Tags
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip-content";

    const badgeContainer = document.createElement("div");
    badgeContainer.className = "flex flex-wrap gap-1 justify-center";

    // Alle Tags sammeln
    const tags = new Set();
    Object.values(data).forEach((country) => {
      (country[key] || []).forEach((item) => {
        (item.tags || []).forEach((tag) => tags.add(tag));
      });
    });

    [...tags].sort().forEach((tag) => {
      const badge = document.createElement("span");
      badge.textContent = tag;
      badge.className =
        "cursor-pointer px-2 py-1 rounded text-sm bg-gray-200 hover:bg-blue-300 transition";

      const syncActiveBadges = () => {
        activeContainer.innerHTML = "";
        activeMediaFilters[key].forEach((activeTag) => {
          const activeBadge = document.createElement("span");
          activeBadge.textContent = activeTag;
          activeBadge.addEventListener("click", () => {
            activeMediaFilters[key].delete(activeTag);
            syncActiveBadges();
            badgeContainer.querySelectorAll("span").forEach((b) => {
              if (b.textContent === activeTag)
                b.classList.remove("bg-blue-500", "text-white");
            });
            filterLänder();
          });
          activeContainer.appendChild(activeBadge);
        });

        // Tooltip-Badges farblich markieren
        badgeContainer.querySelectorAll("span").forEach((b) => {
          if (activeMediaFilters[key].has(b.textContent)) {
            b.classList.add("bg-blue-500", "text-white");
            b.classList.remove("bg-gray-200", "text-black");
          } else {
            b.classList.remove("bg-blue-500", "text-white");
            b.classList.add("bg-gray-200", "text-black");
          }
        });
      };

      badge.addEventListener("click", (e) => {
        e.stopPropagation();
        if (activeMediaFilters[key].has(tag))
          activeMediaFilters[key].delete(tag);
        else activeMediaFilters[key].add(tag);
        syncActiveBadges();
        filterLänder();
      });

      badgeContainer.appendChild(badge);
    });

    tooltip.appendChild(badgeContainer);
    th.appendChild(title);
    th.appendChild(activeContainer);
    th.appendChild(tooltip);
  }
}

// ===============================
// Initial
// ===============================
filterLänder();
setupMediaKeyBadges();
document
  .getElementById("resetFilters")
  .addEventListener("click", resetAllFilters);
