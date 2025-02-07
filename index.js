const express = require('express');
const app = express();
const port = 3000;

const userRoutes = require('./routes/userRoutes');


app.use('/user', userRoutes);


/* app.get('/', (req, res) => {
  res.send('¡Hola, mundo!');
}); */

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});