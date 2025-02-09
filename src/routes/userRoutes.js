const express = require('express');
const router = express.Router();
const db = require('./../db/firebase');
const admin = require('firebase-admin');
const authenticate = require('./../middleware/auth');

const User = require('../models/User');

router.post('/login', async (req, res) => {
  console.log('------- users/login: [START] ');
  const { email, password } = req.body;

  try {
    const userDoc = await db.collection('users').where('email', '==', email).get();
    if (userDoc.empty) {
      return res.status(401).json({ message: 'No existe ese correo' });
    }

    const user = userDoc.docs[0].data();
    if (user.password !== password) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = await admin.auth().createCustomToken(userDoc.docs[0].id);
    console.log('------- users/login: [END] ');
    return res.json({ token });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

router.post('/signup', async (req, res) => {
  console.log('------- users/signup: [START] ');
  const { names, lastNames, email, password } = req.body;
  try {
    if (!names || !lastNames || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Verificación de email
    const userDoc = await db.collection('users').where('email', '==', email).get();
    if (!userDoc.empty) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    const docRef = await db.collection('users').add({names, lastNames, email, password});
    const newUserDoc = await db.collection('users').where('email', '==', email).get();
    const token = await admin.auth().createCustomToken(newUserDoc.docs[0].id);

    console.log('------- users/signup: [END] ');
    return res.status(201).json({ 
      token, 
      user: { 
        id: docRef.id, 
        names, 
        lastNames, 
        email 
      } 
    });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

router.get('/', authenticate, async (req, res) => {
  console.log('------- users: [START] ');
  try {
    const usersCollection = await db.collection('users').get();
    const users = usersCollection.docs.map(doc => {
      const userData = doc.data();
      const user = new User(userData.names, userData.lastNames, userData.email, userData.password);
      user.id = doc.id;
      return user;
    });
    console.log('------- users: [END] ');
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

router.get('/:email', async (req, res) => {
  const { email } = req.params;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Se requiere un email' });
    }

    const userDoc = await db.collection('users').where('email', '==', email).get();
    if (userDoc.empty) {
      return res.status(404).json({ message: 'No se encontró ningún usuario con ese email' });
    }

    const userData = userDoc.docs[0].data();
    const user = new User(
      userData.names,
      userData.lastNames,
      userData.email,
    );
    user.id = userDoc.docs[0].id;

    res.json(user);
  } catch (error) {
    console.error('Error al buscar usuario por email:', error);
    res.status(500).json({ message: 'Error al buscar usuario por email' });
  }
});


module.exports = router;