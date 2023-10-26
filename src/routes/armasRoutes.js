const express = require('express');
const passport = require("../middleware/authStrategies"); 
const expressSession = require("express-session");
const Arma = require("../models/arma");

const routes = express.Router();

routes.use(expressSession({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}));

routes.use(passport.initialize());
routes.use(passport.session());

routes.get('/armas', passport.authenticate('jwt', { session: false }), async (req, res) => {
      try {
        const armas = await Arma.find({});
        return res.status(200).json({"armas":armas});
      } catch (err) {
        return res.status(500).json({ message: 'Erro ao buscar armas' });
      }
  });


routes.post('/arma/new', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
      const novaArma = new Arma(req.body);
      await novaArma.save(); 
      res.status(201).json("Arma criada com sucesso");
    } catch (err) {
      res.status(500).json({ message: 'Erro ao criar uma nova arma', error: err.message });
    }
  });

  routes.delete('/arma/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
      const armaId = req.params.id;
      const resultado = await Arma.deleteOne({ _id: armaId });
  
      if (resultado.deletedCount === 1) {
        res.status(200).json("Arma excluída com sucesso");
      } else {
        res.status(404).json("Arma não encontrada");
      }
    } catch (err) {
      res.status(500).json({ message: 'Erro ao excluir a arma', error: err.message });
    }
  });

routes.put('/arma/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
      const arma = await Arma.findById(req.params.id);
  
      if (!arma) {
        return res.status(404).json({ message: 'Arma não encontrada' });
      }
      // spread operator
      arma.set({ ...req.body });
      // Salvar as alterações
      await arma.save();
      res.status(200).json('Arma alterada com sucesso');
    } catch (err) {
      res.status(500).json({ message: 'Erro ao alterar a arma', error: err.message });
    }
  });
  
  

module.exports = routes;