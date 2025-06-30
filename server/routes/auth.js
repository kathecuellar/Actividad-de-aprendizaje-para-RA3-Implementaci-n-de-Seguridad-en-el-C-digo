const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Ruta de inicio de sesión con Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback después de autenticarse con Google
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res
      .cookie('token', token, {
        httpOnly: true,
        sameSite: 'Lax',
        secure: false, // ⚠️ Usa true en producción con HTTPS
      })
      .redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

// Ruta para obtener el usuario autenticado
router.get('/user', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'No autorizado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = decoded;
    User.findById(id).then(user => {
      if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });
      res.json({ name: user.name, email: user.email });
    });
  } catch (err) {
    res.status(401).json({ message: 'Token inválido' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token').json({ message: 'Sesión cerrada' });
});

module.exports = router;