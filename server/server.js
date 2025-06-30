// ==================== 1. CARGAR VARIABLES DE ENTORNO ====================
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

// Debug: Verificar carga de variables
console.log('[DEBUG] Variables cargadas:', {
  PORT: process.env.PORT,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '*' : 'UNDEFINED',
  MONGO_URI: process.env.MONGO_URI ? '*' : 'UNDEFINED'
});

// ==================== 2. CARGAR DEPENDENCIAS PRINCIPALES ====================
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport'); // ← Única declaración de passport
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');

// ==================== 3. CONFIGURACIÓN DE PASSPORT ====================
require('./config/passport')(passport); // Pasamos passport como argumento

// ==================== 4. INICIALIZAR EXPRESS ====================
const app = express();
const PORT = process.env.PORT || 5000;

// ==================== 5. MIDDLEWARES (ORDEN CRÍTICO) ====================
// Configuración CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser
app.use(express.json());

// Cookies
app.use(cookieParser());

// Sesiones (requeridas para passport)
app.use(
  session({
    secret: process.env.JWT_SECRET || 'secret_backup',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  })
);

// Inicializar passport (después de session)
app.use(passport.initialize());
app.use(passport.session());

// ==================== 6. RUTAS ====================
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// ↓↓↓ Añade estas rutas JUSTO AQUÍ ↓↓↓

// Ruta de inicio de autenticación Google
app.get('/auth/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

// Ruta de callback de Google
app.get('/auth/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false 
  }),
  (req, res) => {
    // Genera token JWT (asegúrate que tu estrategia de Passport lo añade a req.user)
    const token = req.user.token;
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth-success?token=${token}`);
  }
);

// ==================== 7. CONEXIÓN A MONGODB ====================
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    
    // Iniciar servidor solo si MongoDB conecta
    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
      console.log(`🔑 Google Client ID: ${process.env.GOOGLE_CLIENT_ID ? 'Configurado' : 'NO CONFIGURADO'}`);
    });
  })
  .catch(err => {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    process.exit(1); // Salir si no hay conexión a DB
  });

// ==================== 8. MANEJO DE ERRORES ====================
process.on('unhandledRejection', (err) => {
  console.error('⚠️ Error no manejado:', err);
});

// Exportar app para testing (opcional)
module.exports = app;