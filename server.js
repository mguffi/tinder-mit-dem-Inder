const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const mysql = require('mysql2/promise'); // Verwende die Promise-API von mysql2
const http = require('http'); // Node.js HTTP-Server
const { Server } = require('socket.io'); // Socket.IO
const moment = require('moment');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Markus1996',
    database: 'name'
});



console.log('Datenbank-Pool erstellt!');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Erlaube alle Ursprünge (für Entwicklung)
        methods: ['GET', 'POST']
    }
});
const port = process.env.PORT || 3000;

// Middleware
app.use(session({
    secret: 'dein_geheimes_schluessel', // Ersetze dies durch einen sicheren Schlüssel
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Für Entwicklung: false; in Produktion: true (HTTPS!)
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); // Für Formulardaten
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
server.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});



// Routen
io.on('connection', (socket) => {
    // ...

    socket.on('chat message', async (msg) => {
        try {
            // Generiere die conversation_id (wichtig: konsistente Reihenfolge!)
            const conversationId = [Math.min(msg.senderId, msg.receiverId), Math.max(msg.senderId, msg.receiverId)].join('_');

            // Nachricht in der Datenbank speichern
            await db.execute(
                'INSERT INTO messages (sender_id, receiver_id, message, conversation_id) VALUES (?, ?, ?, ?)',
                [msg.senderId, msg.receiverId, msg.message, conversationId]
            );

            // Nachricht an die entsprechenden Clients senden
            io.to(`user_${msg.senderId}`).emit('chat message', msg);
            console.log(`Server: Nachricht gesendet an user_${msg.senderId}:`, msg);
            io.to(`user_${msg.receiverId}`).emit('chat message', msg);
            console.log(`Server: Nachricht gesendet an user_${msg.receiverId}:`, msg);


        } catch (error) {
            console.error('Fehler beim Speichern/Senden der Nachricht:', error);
        }
    });

    // ...
});

app.get('/chat/:otherUserId/:myUserId', async (req, res) => {
    const otherUserId = parseInt(req.params.otherUserId);
    const myUserId = req.session.userId;

    console.log('/chat route: myUserId =', myUserId); // Protokolliere myUserId

    if (!req.session.userId) {
        return res.redirect('/'); // Benutzer nicht angemeldet
    }

    try {
        // Generiere die conversation_id (wichtig: konsistente Reihenfolge!)
        const conversationId = [Math.min(myUserId, otherUserId), Math.max(myUserId, otherUserId)].join('_');

        // Abrufen der Chat-Historie aus der Datenbank
        const [rows] = await db.execute(
            'SELECT sender_id, message, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
            [conversationId]
        );
        const chatHistory = rows.map(row => ({
            ...row,
            formattedCreatedAt: moment(row.created_at).format('YYYY-MM-DD HH:mm')
        }));
        // Abrufen der Benutzernamen für Anzeige
        const [otherUserRows] = await db.execute('SELECT username FROM users WHERE id = ?', [otherUserId]);
        const otherUsername = otherUserRows[0] ? otherUserRows[0].username : 'Unbekannt';

        res.render('chat', {
            otherUserId: otherUserId,
            myUserId: myUserId,
            otherUsername: otherUsername,
            chatHistory: chatHistory
        });

    } catch (error) {
        console.error('Fehler beim Abrufen der Chat-Historie:', error);
        res.status(500).send('Fehler beim Abrufen der Chat-Historie.');
    }
});



app.get('/my-chats', async (req, res) => {
    const likerId = req.session.userId;

    if (!likerId) {
        return res.redirect('/');
    }

    try {
        const [rows] = await db.execute(`
            SELECT
                u.id AS otherUserId,
                u.username AS otherUsername,
                m.message AS lastMessage,
                m.created_at AS lastMessageCreatedAt
            FROM users u
            JOIN messages m ON (
                (m.sender_id = u.id AND m.receiver_id = ?) OR (m.receiver_id = u.id AND m.sender_id = ?)
            )
            WHERE (m.conversation_id IN (
                SELECT DISTINCT conversation_id
                FROM messages
                WHERE sender_id = ? OR receiver_id = ?
            )) AND u.id != ?
            ORDER BY m.created_at DESC
        `, [likerId, likerId, likerId, likerId, likerId]);

        const chats = rows;

        res.render('my-chats', { chats: chats, myUserId: likerId });
    } catch (error) {
        console.error('Fehler beim Abrufen der Chat-Übersicht:', error);
        console.error(error);
        res.status(500).send('Fehler beim Abrufen der Chat-Übersicht.');
    }
});



// Startseite / Anmeldeseite
app.get('/', (req, res) => {
    res.render('login', { error: null });
});

// Registrierungsseite anzeigen
app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

// People-Seite
app.get('/people', async (req, res) => {
    const likerId = req.session.userId;
    if (!likerId) {
        return res.redirect('/');
    }

    try {
        const [users] = await db.execute('SELECT id, username, gender, birthday, image FROM users WHERE id != ?', [likerId]);
        const [likedUsers] = await db.execute('SELECT liked_id FROM likes WHERE liker_id = ?', [likerId]);

        const likedUserIds = new Set(likedUsers.map(like => like.liked_id));
        console.log('/people: Server-seitiges likedUserIds:', likedUserIds); // Protokollierung
        console.log('/people: typeof likedUserIds:', typeof likedUserIds);
        console.log('/people: likedUserIds:', likedUserIds);
        
        // **Korrekte Datumsformatierung für alle Benutzer**
        users.forEach(user => {
            if (user.birthday) {
                user.birthday = new Date(user.birthday);
            }
        });
            res.render('people', { users: users, likedUserIds: likedUserIds });
        console.log('Benutzerdaten für People-Seite:', users); // Protokolliere die Benutzerdaten

    } catch (error) {
        console.error('Fehler beim Abrufen der Benutzer:', error);
        res.status(500).send('Fehler beim Abrufen der Benutzer.');
    }
});

app.get('/matches', async (req, res) => {
    const userId = req.session.userId; // ID des angemeldeten Benutzers

    if (!userId) {
        return res.redirect('/'); // Leite zur Anmeldeseite weiter, wenn nicht angemeldet
    }

    try {
        // Abfrage für gegenseitige Likes
        const [rows] = await db.execute(
            'SELECT u.id, u.username, u.gender, u.birthday, u.image FROM users u WHERE u.id IN (SELECT likes.liker_id FROM likes WHERE likes.liked_id = ?) AND u.id IN (SELECT likes.liked_id FROM likes WHERE likes.liker_id = ?)',
            [userId, userId]
        );
        const matches = rows;

        // Konvertiere das Datum explizit
        matches.forEach(match => {
            if (match.birthday) {
                match.birthday = new Date(match.birthday);
            }
        });

        res.render('matches', { matches: matches, myUserId: userId }); // Übergebe 'myUserId' an die View
    } catch (error) {
        console.error('Fehler beim Abrufen der Matches:', error);
        res.status(500).send('Fehler beim Abrufen der Matches.');
    }
});

app.get('/profile', async (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect('/');
    }

    try {
        const [rows] = await db.execute(
            'SELECT id, username, gender, birthday, image FROM users WHERE id = ?',
            [userId]
        );
        const user = rows[0];

        if (!user) {
            return res.send('Benutzer nicht gefunden.');
        }

        console.log('user:', user); // Protokolliere das gesamte user-Objekt
        console.log('typeof user.birthday:', typeof user.birthday);
        console.log('user.birthday:', user.birthday);
        if (user.birthday) {
            user.birthday = new Date(user.birthday);
        }
        res.render('profile', { user: user });
    } catch (error) {
        console.error('Fehler beim Abrufen des Profils:', error);
        res.send('Fehler beim Abrufen des Profils.');
    }
});

app.get('/dashboard', async (req, res) => { // Füge 'async' hinzu
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect('/');
    }

    try {
        // Datenbankabfrage: Benutzerdaten abrufen (z.B. Benutzername)
        const [rows] = await db.execute('SELECT username FROM users WHERE id = ?', [userId]);
        const user = rows[0];

        if (!user) {
            return res.send('Benutzer nicht gefunden.'); // Oder leite zu einer Fehlerseite weiter
        }

        res.render('dashboard', { username: user.username }); // Übergib den Benutzernamen
    } catch (error) {
        console.error('Fehler beim Abrufen des Dashboards:', error);
        res.send('Fehler beim Abrufen des Dashboards.');
    }
});

// Like-Route
app.post('/like', async (req, res) => {
    const { likedId } = req.body;
    const likerId = req.session.userId;

    console.log('/like: req.body =', req.body); // Hinzugefügte Protokollierung
    console.log('/like: req.session:', req.session);
    console.log('/like: req.session.userId:', req.session.userId);
    console.log('/like: likerId =', likerId, ', likedId =', likedId);
    console.log('/like: req.session.userId =', req.session.userId); // Hinzugefügte Protokollierung


    if (!likerId) return res.status(401).json({ message: 'Nicht authentifiziert' });
    if (!likedId) return res.status(400).json({ message: 'Fehlende likedId' });
    if (likerId === likedId) return res.status(400).json({ message: 'Kann sich nicht selbst liken' });

    try {
        // Überprüfe, ob der Like bereits existiert
        const [existingLike] = await db.execute('SELECT * FROM likes WHERE liker_id = ? AND liked_id = ?', [likerId, likedId]);
        console.log('/like: SQL Query: SELECT * FROM likes WHERE liker_id = ? AND liked_id = ?', [likerId, likedId]);
        console.log('/like: SQL Result: ', existingLike);

        console.log('/like: existingLike =', existingLike);

        if (existingLike.length === 0) {
            // Like existiert nicht, also füge ihn hinzu
            await db.execute('INSERT INTO likes (liker_id, liked_id) VALUES (?, ?)', [likerId, likedId]);
            console.log('/like: SQL Query: INSERT INTO likes (liker_id, liked_id) VALUES (?, ?)', [likerId, likedId]);
            console.log('/like: Like added');
            res.json({ message: 'Benutzer geliked' });
        } else {
            // Like existiert bereits, tue nichts (oder sende eine andere Nachricht)
            console.log('/like: Like already exists');
            res.json({ message: 'Benutzer bereits geliked' });
        }
    } catch (error) {
        console.error('Fehler beim Liken des Benutzers:', error);
        console.error(error); // Protokolliere den gesamten Fehler-Objekt
        res.status(500).json({ message: 'Fehler beim Liken des Benutzers' });     
    }
});

app.delete('/dislike', async (req, res) => { // Korrekte Methode: app.delete
    const { likedId } = req.body;
    const likerId = req.session.userId;

    console.log('/dislike: likerId =', likerId, ', likedId =', likedId);

    if (!likerId) return res.status(401).json({ message: 'Nicht authentifiziert' });
    if (!likedId) return res.status(400).json({ message: 'Fehlende likedId' });

    try {
        await db.execute('DELETE FROM likes WHERE liker_id = ? AND liked_id = ?', [likerId, likedId]);
        console.log('/dislike: Like removed');
        res.json({ message: 'Benutzer entliked' });
    } catch (error) {
        console.error('Fehler beim Entliken des Benutzers:', error);
        res.status(500).json({ message: 'Fehler beim Entliken des Benutzers' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Fehler beim Zerstören der Session:', err);
            // Fehlerbehandlung
        }
        res.redirect('/'); // Leite zur Anmeldeseite weiter
    });
});

app.get('/filter', (req, res) => {
    // Diese Route zeigt die Seite mit den Filteroptionen an
    res.render('filter');
});

app.get('/filter-results', async (req, res) => {
    try {
        const { gender, ageMin, ageMax } = req.query;
        const whereClauses = [];
        const queryParams = [];

        if (gender) {
            whereClauses.push('gender = ?');
            queryParams.push(gender);
        }

        if (ageMin) {
            whereClauses.push('YEAR(CURDATE()) - YEAR(birthday) >= ?');
            queryParams.push(ageMin);
        }

        if (ageMax) {
            whereClauses.push('YEAR(CURDATE()) - YEAR(birthday) <= ?');
            queryParams.push(ageMax);
        }

        let query = 'SELECT id, username, gender, birthday, image FROM users';
        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        const [users] = await db.execute(query, queryParams);

        // Holen der IDs der Benutzer, die der aktuelle Benutzer geliked hat
        const likerId = req.session.userId; // ID des angemeldeten Benutzers
        const [likedUsersRows] = await db.execute('SELECT liked_id FROM likes WHERE liker_id = ?', [likerId]);
        const likedUserIds = new Set(likedUsersRows.map(like => like.liked_id));

        res.json({ users: users, likedUserIds: Array.from(likedUserIds) }); // Sende likedUserIds mit den Benutzerdaten
    } catch (error) {
        console.error('Fehler beim Abrufen der gefilterten Benutzer:', error);
        res.status(500).json({ message: 'Fehler beim Abrufen der gefilterten Benutzer.' });
    }
});

// Registrierung verarbeiten
app.post('/register', async (req, res) => {
    const { username, password, gender, birthday, image } = req.body; // Daten aus dem Formular holen

    try {
        // Datenbankabfrage: Überprüfen, ob der Benutzername bereits existiert
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        const existingUser = rows[0];

        if (existingUser) {
            return res.render('register', { error: 'Benutzername bereits vergeben.' });
        }

        // Passwort hashen
        const hashedPassword = await bcrypt.hash(password, 10);

        // Datenbankeintrag: Neuen Benutzer in die Datenbank speichern
        await db.execute(
            'INSERT INTO users (username, password, gender, birthday, image) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, gender, birthday, image]
        );

        res.redirect('/'); // Nach der Registrierung zur Anmeldeseite weiterleiten
    } catch (error) {
        console.error('Fehler bei der Registrierung:', error);
        res.render('register', { error: 'Fehler bei der Registrierung.' });
    }
});
// Ähnlich für die Anmelderoute

// Anmeldung verarbeiten
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (!user) {
            return res.render('login', { error: 'Ungültiger Benutzername oder Passwort.' });
        }

        let passwordMatch = false;

        // Überprüfe, ob das gespeicherte Passwort gehasht ist
        if (user.password.startsWith('$2b$')) { // Typisches Präfix für bcrypt-Hashes
            passwordMatch = await bcrypt.compare(password, user.password);
        } else {
            // Wenn nicht gehasht, vergleiche Klartext (NICHT SICHER!)
            passwordMatch = (password === user.password);
        }

        if (passwordMatch) {
            req.session.userId = user.id; // Session-Management
            res.redirect('/dashboard');
        } else {
            res.render('login', { error: 'Ungültiger Benutzername oder Passwort.' });
        }

    } catch (error) {
        console.error('Fehler bei der Anmeldung:', error);
        res.render('login', { error: 'Fehler bei der Anmeldung.' });
    }
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});