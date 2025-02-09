const admin = require('firebase-admin');
const db = require('./../db/firebase');

async function authenticate(req, res, next) {
  const token = req.header('Authorization'); // Obtén el token de autenticación

  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
  }

  try {
    console.log('---- auth interceptor ---- ')
    // VERIFICACIÓN SI SE UTILIZARA FIREBASE AUTHENTICATION
    // const decodedToken = await admin.auth().verifyIdToken(token); 
    // req.user = decodedToken; // Agrega la información del usuario a la solicitud
    next(); // Continúa con la siguiente ruta
  } catch (error) {
    console.error('Error al autenticar usuario:', error);
    res.status(401).json({ message: 'Token de autenticación inválido' });
  }
}

module.exports = authenticate;