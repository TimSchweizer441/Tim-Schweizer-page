# Tim Schweizer – Portfolio

Persönliches, responsives Portfolio für meine Projekte, Fähigkeiten und technischen Interessen. Die Website ist auf Deutsch und Englisch verfügbar und bietet einen Hell-/Dunkelmodus.

## Funktionen

- Responsive Navigation und Darstellung für Mobilgeräte und Desktop
- Sprachumschalter Deutsch/Englisch mit gespeicherter Auswahl
- Hell-/Dunkelmodus und Animationen beim Scrollen
- Projekt- und Fähigkeitenübersicht sowie Einblicke in Beispielcode
- Aktuelle öffentliche GitHub-Repositories und Reddit-Beiträge
- Kontaktformular mit E-Mail-Versand über Gmail SMTP

## Technologie

- Angular und TypeScript
- Node.js API für GitHub-, Reddit- und Kontaktformular-Anfragen
- RxJS

## Lokal starten

Voraussetzungen: Node.js und npm.

```powershell
cd local-app
npm install
Copy-Item .env.example .env
npm start
```

Öffne danach <http://localhost:4200/>.

Die Website und der lokale API-Server werden gemeinsam gestartet. GitHub-Repositories können ohne Token geladen werden. Für Reddit-Beiträge und den E-Mail-Versand müssen die entsprechenden Variablen in `local-app/.env` gesetzt werden:

- `REDDIT_CLIENT_ID` und `REDDIT_CLIENT_SECRET`: Zugangsdaten einer Reddit-App
- `SMTP_USER` und `SMTP_APP_PASSWORD`: Gmail-Konto und zugehöriges Google-App-Passwort
- `REDDIT_USERNAME`, `REDDIT_USER_AGENT` und `GITHUB_USERNAME` sind konfigurierbare Kontodaten; Standardwerte stehen in `.env.example`.

Verwende für SMTP ein Google-App-Passwort, nicht dein reguläres Gmail-Passwort. Die Datei `.env` enthält private Zugangsdaten: niemals committen oder veröffentlichen. Nach Änderungen an der Datei den Server neu starten.

## Build und Tests

```powershell
npm run build
npm test
```

## Projektstruktur

```text
.
├── local-app/       Ausführbare Angular-Anwendung und API-Server
└── webpage-CV.ts    Separate Portfolio-Quellvorlage
```
