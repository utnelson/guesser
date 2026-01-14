/* ===========================
   Schema
=========================== */
const TEMPLATE = {
  kontinent: "",
  verkehr: "",
  domain: "",
  flagge: "",
  plates: [],
  sprache: [],
  googlecar: [],
  bollards: [],
  streets: [],
  poles: [],
  schilder: [],
  taxi: [],
  architcture: [],
};

const MEDIA_KEYS = [
  "plates","sprache","googlecar","bollards",
  "streets","poles","schilder","taxi","architcture"
];

let data = {};
let current = null;

/* ===========================
   Load
=========================== */
function loadJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      data = normalizeAll(JSON.parse(e.target.result));
      current = Object.keys(data)[0] || null;

      // === Neue Logik: Tags nach Key & Kontinente ===
      const tagsByKey = {};
      const allContinents = new Set();

      MEDIA_KEYS.forEach(key => tagsByKey[key] = new Set());

      for (const countryName in data) {
        const country = data[countryName];

        // Kontinent hinzufügen
        if (country.kontinent) allContinents.add(country.kontinent);

        // Tags pro Media-Key sammeln
        MEDIA_KEYS.forEach(key => {
          country[key].forEach(item => {
            item.tags.forEach(tag => tagsByKey[key].add(tag));
          });
        });
      }

      // Sets in Arrays umwandeln & sortieren
      const tagsByKeySorted = {};
      for (const key in tagsByKey) {
        tagsByKeySorted[key] = Array.from(tagsByKey[key]).sort();
      }

      console.log("Tags nach Media-Key:", tagsByKeySorted);
      console.log("Alle Kontinente:", Array.from(allContinents).sort());
      // === Ende neue Logik ===

      renderCountrySelect();
      renderEditor();
    } catch {
      alert("Ungültige JSON-Datei");
    }
  };
  reader.readAsText(file);
}

/* ===========================
   Normalize
=========================== */
function normalizeAll(obj) {
  const out = {};
  for (const key in obj) out[key] = normalizeCountry(obj[key]);
  return out;
}

function normalizeCountry(c) {
  const r = structuredClone(TEMPLATE);
  r.kontinent = c.kontinent || "";
  r.verkehr = c.verkehr || "";
  r.domain = c.domain || "";
  r.flagge = c.flagge || "";

  MEDIA_KEYS.forEach(k => {
    r[k] = Array.isArray(c[k])
      ? c[k].map(i => ({
          bild: i.bild || "",
          beschreibung: i.beschreibung || "",
          tags: Array.isArray(i.tags) ? i.tags : [],
        }))
      : [];
  });

  return r;
}

/* ===========================
   Country Select
=========================== */
function renderCountrySelect() {
  countrySelect.innerHTML = `<option value="">Land wählen…</option>`;

  Object.keys(data)
    .sort((a,b)=>a.localeCompare(b,"de",{sensitivity:"base"}))
    .forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      if (name === current) opt.selected = true;
      countrySelect.appendChild(opt);
    });
}

function changeCountry(name) {
  current = name || null;
  renderEditor();
}

/* ===========================
   Add Country
=========================== */
function addCountry() {
  const name = prompt("Name des Landes:");
  if (!name || data[name]) return;

  data[name] = structuredClone(TEMPLATE);
  current = name;

  renderCountrySelect();
  renderEditor();
}

/* ===========================
   Editor
=========================== */
function renderEditor() {
  if (!current) {
    editor.innerHTML =
      `<p class="text-slate-500 text-sm">Bitte ein Land auswählen.</p>`;
    return;
  }

  const c = data[current];
  editor.innerHTML = `<h2 class="text-xl font-semibold mb-4">${current}</h2>`;

  // Hauptinfos Div: feste Breite, nebeneinander
  const mainDiv = document.createElement("div");
  mainDiv.className = "flex flex-wrap gap-4 mb-6";

  ["kontinent", "verkehr", "domain", "flagge"].forEach(key => {
    mainDiv.appendChild(input(key, c, key === "flagge"));
  });

  editor.appendChild(mainDiv);

  // Media keys Divs: nebeneinander mit fester Breite
  const mediaContainer = document.createElement("div");
  mediaContainer.className = "flex flex-wrap gap-4";

  MEDIA_KEYS.forEach(k => {
    const fs = section(k, () => renderArray(c[k]));
    fs.className += " w-80"; // feste Breite für jedes Media-Fieldset
    mediaContainer.appendChild(fs);
  });

  editor.appendChild(mediaContainer);
}

// input liefert jetzt das Element zurück
function input(key, obj, isImage) {
  const wrap = document.createElement("div");
  wrap.className = "w-60 flex flex-col"; // feste Breite

  wrap.innerHTML = `
    <label class="block text-xs text-slate-500 mb-1">${key}</label>
    <input
      class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      value="${obj[key] || ""}">
  `;

  const inp = wrap.querySelector("input");
  inp.oninput = e => {
    obj[key] = e.target.value;
    if (isImage && img) img.src = obj[key];
  };

  if (isImage) {
    var img = document.createElement("img");
    img.className = "mt-2 max-h-40 object-contain border rounded-lg";
    img.src = obj[key];
    img.onerror = () => img.src = "";
    wrap.appendChild(img);
  }

  return wrap; // Rückgabe, damit es in flex-Container eingefügt werden kann
}

function section(title, fn) {
  const fs = document.createElement("fieldset");
  fs.className = "border rounded-xl p-3 mb-4";
  fs.innerHTML = `<legend class="px-2 font-semibold text-sm">${title}</legend>`;

  const div = document.createElement("div");
  fs.appendChild(div);

  const old = editor;
  editor = div;
  fn();
  editor = old;

  return fs;
}

function renderArray(arr) {
  arr.forEach((item,i) => {
    const box = document.createElement("div");
    box.className = "border border-dashed rounded-lg p-3 mb-3";

    ["bild","beschreibung","tags"].forEach(f => {
      const wrap = document.createElement("div");
      wrap.className = "mb-2";

      if(f === "beschreibung") {
        wrap.innerHTML = `
          <label class="block text-xs text-slate-500 mb-1">${f}</label>
          <textarea
            rows="4"
            class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          ></textarea>
        `;
      } else {
        wrap.innerHTML = `
          <label class="block text-xs text-slate-500 mb-1">${f}</label>
          <input class="w-full px-3 py-2 border rounded-lg text-sm">
        `;
      }

      const inp = wrap.querySelector(f === "beschreibung" ? "textarea" : "input");
      inp.value = f === "tags" ? item.tags.join(", ") : item[f] || "";

      inp.oninput = e => {
        if (f === "tags") {
          item.tags = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
        } else {
          item[f] = e.target.value;
          if(f==="bild" && img) img.src = item[f];
        }
      };

      box.appendChild(wrap);

      if (f==="bild") {
        var img = document.createElement("img");
        img.className = "mt-2 max-h-32 object-contain border rounded-lg";
        img.src = item.bild || "";
        img.onerror = () => img.src = "";
        box.appendChild(img);
      }
    });

    const del = document.createElement("button");
    del.className = "text-sm text-red-600 hover:underline";
    del.textContent = "🗑 Entfernen";
    del.onclick = () => {
      arr.splice(i,1);
      renderEditor();
    };
    box.appendChild(del);

    editor.appendChild(box);
  });

  const add = document.createElement("button");
  add.className = "text-sm text-primary hover:underline";
  add.textContent = "➕ Eintrag hinzufügen";
  add.onclick = () => {
    arr.push({ bild:"", beschreibung:"", tags:[] });
    renderEditor();
  };
  editor.appendChild(add);
}

/* ===========================
   Export
=========================== */
function download() {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "data.json";
  a.click();
  URL.revokeObjectURL(a.href);
}
