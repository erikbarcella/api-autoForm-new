const express = require('express');
const app = express();
const cors = require('cors');
const connectDatabase = require('./database/getConnection')
const userRoutes = require('./routes/userRoutes');
const methodOverride = require('method-override');
require('dotenv').config();
const fs = require('fs');
const dotenv = require('dotenv-safe');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(userRoutes);

if (fs.existsSync('.env.example')) {
    dotenv.config({
      example: '.env.example',
    });
  } else {
    console.warn('O arquivo .env.example não foi encontrado. Ignorando.');
  }

app.get('*', (req,res)=>{
    res.send('Server is running v1.0.0')
})

const APP_PORT = process.env.APP_PORT || 3031;
connectDatabase();

app.listen(APP_PORT, () =>{
    console.log("Server running ");
})