const express = require('express');
const router = express.Router();
const db = require('./../db/firebase');


const User = require('../models/User');


router.get('/', async (req, res) => {
    try {
        const usersCollection = await db.collection('users').get(); // Obtiene la colección 'users'
        const users = usersCollection.docs.map(doc => {
          const userData = doc.data();
          const user = new User(userData.names, userData.lastNames, userData.email, userData.password);
          user.id = doc.id;
          return user;
        });
        res.json(users);
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
      }
  });


module.exports = router;