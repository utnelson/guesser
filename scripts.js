// Modal-Elemente
const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const caption = document.getElementById("caption");
const closeModal = document.getElementById("closeModal");

// Funktion zum Laden der Daten aus der `data.json`-Datei
async function loadData() {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/utnelson/guesser/refs/heads/main/data.json"
    );
    if (!response.ok) {
      throw new Error("Netzwerkantwort war nicht ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fehler beim Laden der Daten:", error);
  }
}

// Funktion zum Anzeigen der Länder und Filter
async function filterLänder() {
  const data = await loadData();
  const verkehr = document.getElementById("verkehr").value;
  const kontinent = document.getElementById("kontinent").value;
  const inputLand = document.getElementById("land").value.trim().toLowerCase();

  // Filtere die Länder nach den ausgewählten Kriterien
  const filteredCountries = Object.entries(data).filter(([land, details]) => {
    let matches = true;

    if (inputLand) {
      const landMatch = land.toLowerCase().startsWith(inputLand);
      const domainMatch = (details.land.domain || "")
        .toLowerCase()
        .includes(inputLand);

      if (!landMatch && !domainMatch) {
        matches = false;
      }
    }

    if (kontinent && details.kontinent !== kontinent) {
      matches = false;
    }

    if (verkehr && details.verkehr !== verkehr) {
      matches = false;
    }

    return matches;
  });

  // Tabelle mit den gefilterten Ländern befüllen
  const tbody = document.querySelector("#countryTable tbody");
  tbody.innerHTML = ""; // Zuerst die Tabelle leeren

  filteredCountries.forEach(([land, details]) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${land}<img src="${
      details.land.flagge
    }" alt="${land} Flagge" class="thumbnail"></td>
            <td>${details.kontinent}</td>
            <td>${details.verkehr}</td>
            <td>${details.plates
              .map(
                (b) =>
                  `<img src="${b.bild}" alt="${b.beschreibung}" class="thumbnail" data-caption="${b.beschreibung}">`
              )
              .join("")}</td>
            <td>${details.sprache
              .map(
                (b) =>
                  `<img src="${b.bild}" alt="${b.beschreibung}" class="thumbnail" data-caption="${b.beschreibung}">`
              )
              .join("")}</td>
            <td>${details.googlecar
              .map(
                (b) =>
                  `<img src="${b.bild}" alt="${b.beschreibung}" class="thumbnail" data-caption="${b.beschreibung}">`
              )
              .join("")}</td>
            <td>${details.bollards
              .map(
                (b) =>
                  `<img src="${b.bild}" alt="${b.beschreibung}" class="thumbnail" data-caption="${b.beschreibung}">`
              )
              .join("")}</td>
            <td>${details.poles
              .map(
                (s) =>
                  `<img src="${s.bild}" alt="${s.beschreibung}" class="thumbnail" data-caption="${s.beschreibung}">`
              )
              .join("")}</td>
            <td>${details.schilder
              .map(
                (s) =>
                  `<img src="${s.bild}" alt="${s.beschreibung}" class="thumbnail" data-caption="${s.beschreibung}">`
              )
              .join("")}</td>
            <td>${(details.taxi ?? [])
              .map(
                (s) => `
        <img src="${s.bild}" alt="${s.beschreibung}" class="thumbnail" data-caption="${s.beschreibung}">
    `
              )
              .join("")}</td>
           
        `;
    tbody.appendChild(row);
  });

  // Event-Listener für die Bilder
  document.querySelectorAll(".thumbnail").forEach((img) => {
    img.addEventListener("click", (e) => {
      const src = e.target.src;
      const captionText = e.target.getAttribute("data-caption");
      openModal(src, captionText);
    });
  });
}

// Funktion zum Öffnen des Modals
function openModal(src, captionText) {
  modal.style.display = "block";
  modalImage.src = src;
  caption.textContent = captionText;
}

// Event-Listener zum Schließen des Modals
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// Schließen des Modals, wenn außerhalb des Bildes geklickt wird
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Initiales Laden der Länder ohne Filter
filterLänder();
