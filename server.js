require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');

const documentRoutes = require('./routes/documents');
const authRoutes = require('./routes/auth');

const app = express();

app.set('trust proxy', 1);

// 1. CORS SETTING — Разрешаем Origin без пути GitHub Pages
const allowedOrigins = [
    'https://lomkaka1ff.github.io',
    'http://localhost:3000'
];

if (process.env.FRONTEND_URL) {
    // Удаляем слэши и пути, оставляем только домен для Origin
    try {
        const url = new URL(process.env.FRONTEND_URL);
        allowedOrigins.push(url.origin);
    } catch (e) {
        allowedOrigins.push(process.env.FRONTEND_URL);
    }
}

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Blocked by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. PARSING JSON — Увеличиваем лимит тела запроса до 10MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 2. PARSING JSON
app.use(express.json());

// 3. SESSION SETTINGS
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 день
    }
}));

// 4. API CONNECTIONS
app.use('/api/documents', documentRoutes);
app.use('/api/auth', authRoutes);

// 5. MongoDB CONNECTION AND SERVER START
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ss14_paperwork';

// Отслеживание состояния соединения с MongoDB
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected! Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err.message);
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected!');
});

mongoose.connect(MONGO_URI, {autoIndex: false})
    .then(() => {
        console.log('Successful connection to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err.message);
    });