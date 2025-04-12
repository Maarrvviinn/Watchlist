# Watchlist Web App (v1.4) 🇩🇪

Eine einfache, aber leistungsstarke Webanwendung zur Verwaltung deiner persönlichen Watchlist für Filme und Serien. Organisiere, was du sehen möchtest, passe das Aussehen an und behalte den Überblick – alles direkt in deinem Browser.

[Watchlist Screenshot](https://i.imgur.com/eKdInHb.png)

---

## ✨ Funktionen

*   **Listen-Verwaltung:**
    *   Separate Listen für "Serien", "Filme" und "Upcoming".
    *   Einträge hinzufügen, bearbeiten und löschen.
    *   Jedem Eintrag Details zuweisen: Titel, Typ (Serie/Film), Tags (z.B. Genres), Dauer (z.B. "3 Staffeln", "120 min").
    *   Einträge als "Upcoming" markieren, um zukünftige Veröffentlichungen zu verfolgen.
*   **Interaktive Bedienung:**
    *   **Drag & Drop:** Einträge innerhalb der "Serien"- und "Filme"-Listen einfach per Drag & Drop neu anordnen.
    *   **Auto-Scroll:** Die Liste scrollt automatisch, wenn beim Ziehen eines Eintrags der obere oder untere Rand erreicht wird.
*   **Suche & Filter:**
    *   **Schnellsuche:** Suche nach Titeln direkt im Hauptbereich.
    *   **Erweiterte Suche:** Filtere Einträge nach Typ (Serie/Film) und/oder mehreren Tags gleichzeitig.
*   **Anpassbare Darstellung:** 🎨
    *   **Theme:** Wähle zwischen einem hellen und einem dunklen Design.
    *   **Akzentfarbe:** Passe die primäre Farbe der Benutzeroberfläche an deinen Geschmack an (funktioniert für beide Themes).
    *   **Textgröße:** Ändere die globale Schriftgröße für bessere Lesbarkeit.
    *   **Listenhöhe:** Stelle ein, wie viele Einträge maximal angezeigt werden, bevor ein Scrollbalken erscheint.
*   **Datenverwaltung & Persistenz:**
    *   **LocalStorage:** Alle deine Daten und Einstellungen werden lokal im Browser gespeichert.
    *   **Import/Export:** Exportiere deine gesamte Watchlist als JSON-Datei zur Sicherung oder zum Teilen. Importiere eine zuvor exportierte JSON-Datei, um deine Liste wiederherzustellen.
    *   **AI Format Hilfe:** Kopiere einen Prompt für eine AI (wie ChatGPT), um eine unformatierte Liste in das korrekte JSON-Format für den Import umzuwandeln.
*   **Einstellungen:** Zentrales Einstellungsmenü für alle Anpassungen und Datenaktionen.

---

## 🚀 Technologie-Stack

*   **HTML5:** Struktur der Anwendung.
*   **CSS3:** Styling, Layout (Flexbox) und Theming (CSS Variablen).
*   **Vanilla JavaScript (ES6+):** Komplette Anwendungslogik, DOM-Manipulation, Event Handling, Drag & Drop, LocalStorage-Interaktion.
*   **LocalStorage:** Clientseitige Speicherung der Watchlist-Daten und Benutzereinstellungen.

---

## 💻 Setup & Ausführung

Diese Anwendung ist rein clientseitig und benötigt keinen Server.

1.  Klone das Repository oder lade die Dateien `index.html`, `style.css` und `script.js` in denselben Ordner herunter.
2.  Öffne die Datei `index.html` in einem modernen Webbrowser (wie Chrome, Firefox, Edge, Safari).

Das war's! Deine Watchlist ist einsatzbereit.

---

## 🖱️ Benutzung

*   **Tabs:** Klicke auf "Serien", "Filme" oder "Upcoming", um die entsprechende Liste anzuzeigen.
*   **Hinzufügen:** Klicke auf "Hinzufügen", fülle die Details im Modal aus und speichere.
*   **Bearbeiten/Löschen:** Fahre über einen Listeneintrag und klicke auf das Stift-Symbol (✏️) zum Bearbeiten oder das Mülleimer-Symbol (🗑️) zum Löschen.
*   **Sortieren:** Klicke und halte einen Eintrag in der "Serien"- oder "Filme"-Liste, ziehe ihn an die gewünschte Position und lasse ihn los.
*   **Suchen:** Gib einen Suchbegriff in das Suchfeld oben ein. Die Liste aktualisiert sich automatisch.
*   **Filtern:** Klicke auf das Lupen-Symbol (🔍) neben der Suche, um die erweiterte Suche zu öffnen. Wähle Typen und/oder Tags aus und klicke auf "Anwenden & Schließen".
*   **Einstellungen:** Klicke auf das Zahnrad-Symbol (⚙️) oben rechts, um das Einstellungsmenü zu öffnen.

---

## ⚙️ Einstellungen erklärt

Im Einstellungsmenü (Zugriff über ⚙️) kannst du Folgendes anpassen:

*   **Theme (☀️/🌙):** Schaltet zwischen hellem und dunklem Design um.
*   **Akzentfarbe:** Wähle eine beliebige Farbe, die als Hauptfarbe für Buttons, Links, Tabs etc. verwendet wird. Die gewählte Farbe wird für das aktuell aktive Theme gespeichert.
*   **Textgröße:** Passe die allgemeine Schriftgröße über den Schieberegler an.
*   **Max. Einträge:** Lege fest, wie viele Einträge in einer Liste sichtbar sind, bevor gescrollt werden muss.
*   **Zurücksetzen (↩️):** Setzt *nur* die Darstellungseinstellungen (Theme, Akzentfarbe, Textgröße, Max. Einträge) auf die Standardwerte zurück. Deine Watchlist-Daten bleiben erhalten.
*   **Daten Exportieren:** Lädt deine aktuelle Watchlist als `watchlist_export_DATUM_ZEIT.json`-Datei herunter.
*   **Daten Importieren:** Erlaubt dir, eine zuvor exportierte JSON-Datei auszuwählen, um deine Watchlist zu ersetzen (fragt zur Sicherheit nach).
*   **Format Hilfe (?):** Kopiert einen detaillierten Prompt in die Zwischenablage, den du einer AI geben kannst, um eine Textliste in das korrekte JSON-Format für den Import zu konvertieren.

---

## 💾 Datenformat (für Import/Export)

Die Anwendung verwendet das folgende JSON-Format für den Import und Export:

```json
{
  "serien": [
    {
      "id": "1700000000001-0.456",
      "type": "serien",
      "title": "Stranger Things",
      "tags": ["Drama", "Fantasy", "Horror"],
      "duration": "4 Staffeln",
      "isUpcoming": false
    }
    // ... weitere Serien
  ],
  "filme": [
    {
      "id": "1700000000000-0.123",
      "type": "filme",
      "title": "Inception",
      "tags": ["Action", "Sci-Fi", "Thriller"],
      "duration": "148 min",
      "isUpcoming": false
    },
    {
      "id": "1700000000002-0.789",
      "type": "filme",
      "title": "Dune: Part Two",
      "tags": ["Sci-Fi", "Adventure"],
      "duration": "166 min",
      "isUpcoming": true
    }
    // ... weitere Filme
  ]
}
```
**Wichtige Felder:**
*   `id`: Eindeutiger String (wird automatisch generiert).
*   `type`: Muss `"serien"` oder `"filme"` sein.
*   `title`: Titel (String).
*   `tags`: Array von Strings (leeres Array `[]` wenn keine Tags).
*   `duration`: Beschreibung der Dauer (String, z.B. "120 min", "3 Staffeln", "N/A").
*   `isUpcoming`: `true` oder `false` (Boolean).

---

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe die [LICENSE](LICENSE)-Datei für Details.

---

## ❤️ Credits

Erstellt von Marvin mit ❤️