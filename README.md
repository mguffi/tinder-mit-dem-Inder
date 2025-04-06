Tinder mit dem Inder

1. Dokumentation der Endpoints:

Diese Sektion beschreibt die API-Endpunkte der Webanwendung.

/ (GET):
Funktion: Zeigt die Anmeldeseite an.
HTTP-Methode: GET
Erwartete Daten: Keine (oder optional Fehlermeldungen vom Server)
Antwort: HTML-Seite (login.ejs)
/register (GET):
Funktion: Zeigt die Registrierungsseite an.
HTTP-Methode: GET
Erwartete Daten: Keine (oder optional Fehlermeldungen vom Server)
Antwort: HTML-Seite (register.ejs)
/register (POST):
Funktion: Verarbeitet die Benutzerregistrierung.
HTTP-Methode: POST
Erwartete Daten:
username (string, erforderlich): Benutzername des neuen Benutzers.
password (string, erforderlich): Passwort des neuen Benutzers.
gender (string, erforderlich): Geschlecht des neuen Benutzers.
birthday (date, erforderlich): Geburtsdatum des neuen Benutzers (Format: YYYY-MM-DD).
image (string, erforderlich): URL oder Pfad zum Profilbild des neuen Benutzers.
Antwort:
Bei Erfolg: Weiterleitung (Statuscode 302) zur Anmeldeseite (/).
Bei Fehler: HTML-Seite (register.ejs) mit Fehlermeldung.
/login (POST):
Funktion: Verarbeitet die Benutzeranmeldung.
HTTP-Methode: POST
Erwartete Daten:
username (string, erforderlich): Benutzername des Benutzers.
password (string, erforderlich): Passwort des Benutzers.
Antwort:
Bei Erfolg: Weiterleitung (Statuscode 302) zur Dashboard-Seite (/dashboard).
Bei Fehler: HTML-Seite (login.ejs) mit Fehlermeldung.
/dashboard (GET):
Funktion: Zeigt die Dashboard-Seite an (erfordert Authentifizierung).
HTTP-Methode: GET
Erwartete Daten: Keine
Antwort: HTML-Seite (dashboard.ejs)
/profile (GET):
Funktion: Zeigt die Profilseite des angemeldeten Benutzers an (erfordert Authentifizierung).
HTTP-Methode: GET
Erwartete Daten: Keine
Antwort: HTML-Seite (profile.ejs) mit Benutzerdaten.
/people (GET):
Funktion: Zeigt die Liste der Benutzer an (erfordert Authentifizierung).
HTTP-Methode: GET
Erwartete Daten: Keine
Antwort: HTML-Seite (people.ejs) mit Benutzerliste.
/filter (GET):
Funktion: Zeigt die Seite mit den Filteroptionen an.
HTTP-Methode: GET
Erwartete Daten: Keine
Antwort: HTML-Seite (filter.ejs) mit Filterformular.
/filter-results (GET):
Funktion: Ruft die gefilterten Benutzer ab.
HTTP-Methode: GET
Erwartete Daten:
gender (string, optional): Geschlecht für die Filterung.
ageMin (number, optional): Mindestalter für die Filterung.
ageMax (number, optional): Höchstalter für die Filterung.
Antwort: JSON-Array mit den gefilterten Benutzerdaten.
/like (POST):
Funktion: Speichert einen Like von einem Benutzer für einen anderen.
HTTP-Methode: POST
Erwartete Daten:
likedId (number, erforderlich): ID des Benutzers, der geliked wird.
Antwort: JSON-Objekt mit Erfolgs- oder Fehlermeldung.
/dislike (POST/DELETE):
Funktion: Entfernt einen Like von einem Benutzer für einen anderen.
HTTP-Methode: POST oder DELETE (je nach Implementierung)
Erwartete Daten:
likedId (number, erforderlich): ID des Benutzers, dessen Like entfernt wird.
Antwort: JSON-Objekt mit Erfolgs- oder Fehlermeldung.
/matches (GET):
Funktion: Ruft die Liste der gegenseitigen Likes (Matches) des angemeldeten Benutzers ab.
HTTP-Methode: GET
Erwartete Daten: Keine
Antwort: HTML-Seite (matches.ejs) mit der Liste der Matches.
/chat/:otherUserId/:myUserId (GET):
Funktion: Zeigt die Chatseite für eine Konversation zwischen zwei Benutzern an.
HTTP-Methode: GET
Erwartete Daten:
otherUserId (number, erforderlich): ID des anderen Benutzers im Chat.
myUserId (number, erforderlich): ID des angemeldeten Benutzers.
Antwort: HTML-Seite (chat.ejs) mit der Chat-Historie.
/my-chats (GET):
Funktion: Zeigt eine Übersicht der aktuellen Chats des Benutzers an.
HTTP-Methode: GET
Erwartete Daten: Keine
Antwort: HTML-Seite (my-chats.ejs)


2. Erläuterung der Verzeichnisstruktur:

Hier ist eine typische Verzeichnisstruktur für eine Node.js Webanwendung mit Express.js und EJS:

.
├── server.js          // Hauptdatei des Node.js Servers
├── package.json       // Node.js Projektkonfiguration
├── package-lock.json  // Genaue Versionen der Abhängigkeiten
├── node_modules/      // Installierte Node.js Pakete
├── public/            // Ordner für statische Dateien (CSS, JavaScript, Bilder)
│   └── style.css      // CSS-Datei für die Anwendung
├── views/             // Ordner für EJS-Vorlagen
│   ├── login.ejs      // Anmeldeseite
│   ├── register.ejs   // Registrierungsseite
│   ├── dashboard.ejs  // Dashboard
│   ├── profile.ejs    // Profilseite
│   ├── people.ejs     // Benutzerliste
│   ├── filter.ejs     // Filterseite
│   ├── matches.ejs    // Matches-Seite
│   └── chat.ejs       // Chatseite
│   └── my-chats.ejs   // Chat-Übersicht


3. Erläuterung der Umsetzung:

Technologien:
Node.js: Serverseitige JavaScript-Laufzeitumgebung.
Express.js: Node.js Web Application Framework.
EJS (Embedded JavaScript templates): Template-Engine für die Generierung von HTML.
MySQL: Relationales Datenbankmanagementsystem.
mysql2/promise: Node.js MySQL-Treiber mit Promise-Unterstützung.
bcrypt: Bibliothek zum sicheren Hashen von Passwörtern.
express-session: Middleware für Session-Management.
body-parser: Middleware zum Parsen von Request Bodies.
Socket.IO: Bibliothek für die Echtzeitkommunikation über WebSockets (für Chat).
Architektur:
Die Anwendung folgt einer klassischen Client-Server-Architektur.
Der Server (Node.js mit Express.js) nimmt Anfragen von Clients (Webbrowser) entgegen, verarbeitet sie (z.B. Datenbankabfragen, Benutzerauthentifizierung) und sendet Antworten (z.B. HTML-Seiten, JSON-Daten).
EJS wird verwendet, um dynamisch HTML-Seiten auf dem Server zu generieren.
AJAX (über fetch API) wird für asynchrone Kommunikation zwischen Client und Server verwendet (z.B. für das Abrufen der gefilterten Benutzer).
WebSockets (mit Socket.IO) werden für die Echtzeit-Chatfunktionalität verwendet.
Entwicklungsprozess:
(Hier müsstest du deinen spezifischen Entwicklungsprozess beschreiben, z.B. agil, iterativ, etc.)
Typischerweise würde man mit der Definition der Anforderungen, dem Entwurf des Datenmodells, der Implementierung der Backend-Logik (Node.js, Express.js, Datenbankinteraktion), der Erstellung der Frontend-Oberfläche (HTML, CSS, JavaScript) und dem Testen beginnen.


4. ERM-Modell (Entity-Relationship-Modell):

Hier ist ein vereinfachtes ERM-Modell für die Datenbankstruktur:

+----------+        +-----------------+      +-----------------+
|  users   |        |  likes          |      | messages        |
+----------+        +-----------------+      +-----------------+
| id (PK)  |        | liker_id (PK,FK)|      | id (PK)         |
| username |        | liked_id (PK,FK)|      | sender_id (FK)  |
| password |        | created_at      |      | receiver_id (FK)|
| gender   |        +-----------------+      | message         |
| birthday |                                 | created_at      |
| image    |                                 | conversation_id |
+----------+                                 +-----------------+
     |                                       |
     | 1:N                                   | N:M
     |                                       |
+----------+                               +----------+
| messages |<----------------------------->|  users   |
+----------+                               +----------+

users: Tabelle zur Speicherung der Benutzerprofile.
likes: Tabelle zur Speicherung der Beziehungen zwischen Benutzern (wer wen geliked hat).
messages: Tabelle zur Speicherung der Chatnachrichten.
PK: Primärschlüssel (eindeutiger Identifikator).
FK: Fremdschlüssel (verweist auf den Primärschlüssel einer anderen Tabelle).
1:N: Eins-zu-Viele-Beziehung.
N:M: Viele-zu-Viele-Beziehung (hier simuliert durch die likes-Tabelle).


5. Test-Dokumentation:

Durchgeführte Tests:
Integrationstests:
Benutzerregistrierung und -anmeldung.
Anzeigen der Benutzerliste.
Filtern von Benutzern.
Anzeigen der Matches.
Chatfunktionalität (Senden und Empfangen von Nachrichten).
Navigationsflüsse zwischen den Seiten.
Fehlerbehandlung (z.B. ungültige Eingaben).
Manuelle Tests:
Funktionalität in verschiedenen Browsern.
Responsives Design auf verschiedenen Bildschirmgrößen.
Mögliche weitere Tests:
Lasttests (um die Leistung bei vielen Benutzern zu testen).
Sicherheitstests (um Schwachstellen zu finden).
Automatisierte Tests (z.B. mit Selenium oder Cypress).


6. Benutzerdokumentation:

Anmeldung:
Besuchen Sie die Startseite der Anwendung.
Geben Sie Ihren Benutzernamen und Ihr Passwort in die entsprechenden Felder ein.
Klicken Sie auf "Anmelden".
Registrierung:
Klicken Sie auf den "Registrieren"-Link auf der Anmeldeseite.
Füllen Sie das Registrierungsformular mit Ihren Daten aus (Benutzername, Passwort, Geschlecht, Geburtstag, Profilbild).
Klicken Sie auf "Registrieren".
Profil anzeigen:
Nach der Anmeldung gelangen Sie zum Dashboard.
Klicken Sie auf den "Profil"-Link in der Navigation.
Ihre Profilinformationen werden angezeigt.
Benutzer durchsuchen:
Klicken Sie auf den "People"-Link im Dashboard.
Eine Liste von Benutzern wird angezeigt.
Benutzer filtern:
Klicken Sie auf den "Filter"-Link im Dashboard.
Wählen Sie die gewünschten Filteroptionen aus (Geschlecht, Alter).
Klicken Sie auf "Filtern".
Matches anzeigen:
Klicken Sie auf den "Matches"-Link im Dashboard.
Eine Liste Ihrer Matches wird angezeigt.
Chatten:
Klicken Sie auf den "Chat starten"-Link auf der Matches-Seite.
Geben Sie Ihre Nachrichten in das Eingabefeld ein und klicken Sie auf "Senden".
Abmelden:
Klicken Sie auf den "Abmelden"-Button im Dashboard.





PS: für schönes Design müsste ich Webdesigner sein. Kann ich nicht ich bin Netzwerker ich liebe Console das ist schön für mich...