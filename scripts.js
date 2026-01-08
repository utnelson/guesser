// Hier wird die Datenstruktur geladen und die Filterung der Länder durchgeführt

// Beispiel-Datenstruktur (normalerweise in einer separaten Datei gespeichert)
const data = {
    "USA": {
        "flagge": "https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg",
        "sprache": "Englisch",
        "verkehr": "Rechts",
        "googlecar": true,
        "bollards": [
            { "bild": "https://example.com/usa-bollard.jpg", "beschreibung": "USA-Bollard" }
        ],
        "schilder": [
            { "bild": "https://example.com/usa-sign.jpg", "beschreibung": "Stoppschild USA" }
        ]
    },
    "Deutschland": {
        "flagge": "https://upload.wikimedia.org/wikipedia/commons/5/5f/Flag_of_Germany.svg",
        "sprache": "Deutsch",
        "verkehr": "Rechts",
        "googlecar": true,
        "bollards": [
            { "bild": "https://example.com/de-bollard.jpg", "beschreibung": "Deutscher Bollard" }
        ],
        "schilder": [
            { "bild": "https://example.com/de-sign.jpg", "beschreibung": "Vorfahrt gewähren" }
        ]
    }
};

// Funktion zum Laden und Filtern der Länder
function filterLänder() {
    const verkehr = document.getElementById('verkehr').value;
    const googlecar = document.getElementById('googlecar').value;
    
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
