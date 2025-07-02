# Radioaktivität Lernspiel

Ein interaktives Lernspiel für Schüler*innen der Jahrgangsstufen 9-10 zum Thema Radioaktivität. Das System kombiniert spielerische Elemente mit fundiertem Fachwissen und bietet eine sichere Lernumgebung mit sofortigem Feedback.

## 🎯 Spielprinzip

Das Lernspiel simuliert den Umgang mit radioaktiven Materialien in einer sicheren virtuellen Umgebung:

- **Wissenspoints sammeln**: Richtige Antworten bringen Punkte
- **Strahlendosis beachten**: Falsche Entscheidungen erhöhen die virtuelle Strahlenbelastung
- **Level-System**: Progressiver Aufbau vom Grundwissen zu komplexeren Themen
- **Sofortiges Feedback**: Jede Antwort wird direkt bewertet und erklärt

## 🚀 Features

### Für Schüler*innen
- **Interaktive Aufgaben**: Multiple-Choice und Freitextfragen
- **Fortschrittsverfolgung**: Persönliche Statistiken und Achievements
- **Sicherheitssystem**: Virtuelle Dosimetrie mit Ampel-System (grün/gelb/rot)
- **Responsive Design**: Funktioniert auf Desktop, Tablet und Smartphone

### Für Lehrkräfte (Admin)
- **Content Management**: Einfache Verwaltung von Leveln und Aufgaben
- **Statistiken**: Detaillierte Auswertungen des Lernfortschritts
- **Drag & Drop**: Intuitive Neuordnung von Inhalten
- **CSV-Export**: Datenexport für weitere Analysen

### Technische Features
- **Modular**: Einfacher Themenwechsel durch Datenaustausch
- **Sicher**: Passwort-Hashing, CSRF-Schutz, DSGVO-konform
- **Skalierbar**: SQLite für einfache Deployments, erweiterbar auf PostgreSQL
- **Modern**: React Frontend mit Node.js Backend

## 🛠️ Installation & Setup

### Voraussetzungen
- Node.js (Version 16 oder höher)
- npm oder yarn

### Lokale Installation

1. **Repository klonen**
```bash
git clone <repository-url>
cd radioactivity-learning-game
```

2. **Dependencies installieren**
```bash
npm run setup
```

3. **Datenbank initialisieren**
```bash
npm run setup:db
```

4. **Entwicklungsserver starten**
```bash
npm run dev
```

Die Anwendung ist dann unter `http://localhost:3000` erreichbar.

### Docker Setup (Optional)

```bash
docker-compose up -d
```

## 🎮 Erste Schritte

### Demo-Zugangsdaten

**Administrator:**
- Benutzername: `admin`
- Passwort: `admin123`

**Schüler:**
- Benutzername: `student1`
- Passwort: `admin123`

### Für Schüler*innen
1. Registriere dich mit einem Benutzernamen
2. Wähle ein Level aus der Übersicht
3. Lies die Einführung aufmerksam
4. Beantworte die Aufgaben
5. Achte auf deine Strahlendosis!

### Für Lehrkräfte
1. Melde dich als Administrator an
2. Gehe zum Admin-Bereich
3. Verwalte Level und Aufgaben
4. Überwache den Fortschritt der Schüler*innen

## 📚 Level und Themen anpassen

### Neues Thema erstellen

Das System ist vollständig modular aufgebaut. Um ein neues Thema zu erstellen:

1. **Admin-Interface nutzen**:
   - Melde dich als Administrator an
   - Gehe zu "Level-Verwaltung"
   - Klicke auf "Neues Level"

2. **Level-Struktur**:
   ```
   Level
   ├── Titel und Einführungstext
   ├── Aufgaben
   │   ├── Multiple Choice (mit Punkten und Dosis-Werten)
   │   └── Freitext (KI-bewertete Antworten)
   └── Reihenfolge und Aktivierung
   ```

3. **Aufgaben erstellen**:
   - **Multiple Choice**: Definiere Optionen mit Punktwerten und Dosis-Auswirkungen
   - **Freitext**: Stelle offene Fragen für ausführliche Antworten

4. **Bewertungssystem anpassen**:
   - Punkte: 0-8 für richtige Antworten
   - Dosis: 0-5 mSv für falsche/gefährliche Entscheidungen

### Themenwechsel

Für einen kompletten Themenwechsel:

1. **Datenbank-Backup erstellen**
2. **Neue Inhalte über Admin-Interface eingeben**
3. **Alte Level deaktivieren oder löschen**
4. **Farbschema anpassen** (optional, in `frontend/src/index.css`)

## 🔧 Technische Architektur

### Backend (Node.js + Express)
```
backend/
├── src/
│   ├── routes/          # API-Endpunkte
│   ├── middleware/      # Authentifizierung & Sicherheit
│   └── config/          # Datenbank-Konfiguration
├── database/
│   ├── schema.sql       # Datenbankschema
│   └── seed.sql         # Beispieldaten
└── scripts/
    └── initDatabase.js  # DB-Initialisierung
```

### Frontend (React + TypeScript)
```
frontend/src/
├── components/          # Wiederverwendbare Komponenten
├── pages/              # Hauptseiten
├── contexts/           # State Management
└── styles/             # CSS und Styling
```

### Datenbank (SQLite)
- **users**: Benutzerkonten und Fortschritt
- **levels**: Lerneinheiten und Themen
- **tasks**: Einzelne Aufgaben
- **options**: Multiple-Choice-Antworten
- **attempts**: Antwortversuche und Bewertungen

## 🔒 Sicherheit & Datenschutz

- **Passwort-Sicherheit**: bcrypt mit 12 Runden
- **JWT-Tokens**: Sichere Authentifizierung
- **Rate Limiting**: Schutz vor Brute-Force-Angriffen
- **DSGVO-konform**: Automatische Löschung von Freitexten nach Bewertung
- **XSS/CSRF-Schutz**: Helmet.js und sichere Headers

## 📊 Bewertungssystem

### Multiple Choice
- Sofortige Bewertung basierend auf vordefinierter Korrektheit
- Punkte: 0-8 je nach Antwortqualität
- Dosis: 0-5 mSv je nach Gefährlichkeit der Wahl

### Freitext (KI-Bewertung)
Bewertungskriterien:
1. **Fachliche Korrektheit** (0-3 Punkte)
2. **Plausibilität & Tiefe** (0-2 Punkte)  
3. **Fachsprachliche Klarheit** (0-2 Punkte)
4. **Struktur & Logik** (0-1 Punkt)

**Mapping auf Spielwerte:**
- 7-8 Punkte: +8 Knowledge, +0 mSv
- 4-6 Punkte: +5 Knowledge, +0.5 mSv  
- 0-3 Punkte: +2 Knowledge, +1 mSv

## 🤝 Beitragen

Beiträge sind willkommen! Bitte:

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Erstelle einen Pull Request

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe `LICENSE` Datei für Details.

## 🆘 Support

Bei Fragen oder Problemen:

1. Prüfe die [Issues](../../issues) auf GitHub
2. Erstelle ein neues Issue mit detaillierter Beschreibung
3. Kontaktiere das Entwicklungsteam

## 🔄 Updates & Wartung

### Regelmäßige Aufgaben
- **Datenbank-Backups**: Wöchentlich
- **Dependency-Updates**: Monatlich  
- **Sicherheits-Patches**: Bei Bedarf
- **Content-Reviews**: Semesterweise

### Monitoring
- Server-Logs überwachen
- Benutzer-Feedback sammeln
- Performance-Metriken verfolgen
- Fehlerberichte analysieren

---

**Entwickelt für moderne Bildung - Sicher, interaktiv und effektiv! 🎓⚛️**