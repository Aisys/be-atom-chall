const express = require('express');
const cors = require('cors'); // Importa el middleware cors
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const userRoutes = require('./routes/userRoutes');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/users', userRoutes);


app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});