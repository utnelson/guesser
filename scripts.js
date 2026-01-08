// Funktion zum Laden der Daten aus der JSON-Datei
async function loadData() {
    const response = await fetch('data.json');
    const data = await response.json();
    return data;
}

// Funktion zum Filtern und Anzeigen der Länder
async function filterLänder() {
    const verkehr = document.getElementById('verkehr').value;
    const googlecar = document.getElementById('googlecar').value;

    // Lade die Daten
    const data = await loadData();

    const filteredCountries = Object.entries(data).filter(([land, details]) => {
        let matches = true;

        if (verkehr && details.verkehr !== verkehr) {
            matches = false;
        }

        if (googlecar !== "" && String(details.googlecar) !== googlecar) {
            matches = false;
        }

        return matches;
    });

    // Tabelle mit den gefilterten Ländern befüllen
    const tbody = document.querySelector('#countryTable tbody');
    tbody.innerHTML = ''; // Zuerst die Tabelle leeren

    filteredCountries.forEach(([land, details]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${land}</td>
            <td><img src="${details.flagge}" alt="${land} Flagge"></td>
            <td>${details.sprache}</td>
            <td>${details.verkehr}</td>
            <td>${details.googlecar ? 'Ja' : 'Nein'}</td>
            <td>${details.bollards.map(b => `<img src="${b.bild}" alt="${b.beschreibung}"><br>${b.beschreibung}`).join('')}</td>
            <td>${details.schilder.map(s => `<img src="${s.bild}" alt="${s.beschreibung}"><br>${s.beschreibung}`).join('')}</td>
        `;
        tbody.appendChild(row);
    });
}

// Initiales Laden der Länder ohne Filter
filterLänder();
