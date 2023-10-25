const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require("../middleware/authStrategies"); 
const User = require("../models/user");
const expressSession = require("express-session");

const routes = express.Router();

routes.use(expressSession({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}));

routes.use(passport.initialize());
routes.use(passport.session());

routes.post('/login',(req,res,next)=>{
    passport.authenticate("local", (err, user, info) => {
        if (err) throw err;
        if (!user){
            return res.status(401).json({message: "Crendenciais de acesso invalidas"})
        } 
        if(!user.isApproved){
            return res.status(403).json({message: "Usuario nao aprovado pelo administrador"})
        }
        else {
          req.logIn(user, (err) => {
            const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '6h' });
            if (err) throw err;
            return res.status(200).json({
                user:{
                    id: user._id,
                    username: user.username,
                    name: user.name,
                    isAdmin: user.isAdmin,
                    isApproved: user.isApproved
                },
                token: token
            });
          });
        }
      })(req, res, next);
    });

routes.post("/register", (req, res) => {
    User.register(new User({username: req.body.username, name: req.body.name, email: req.body.email 
    }), req.body.password, (err, user) => {
        if(err){
            if(err.name === "UserExistsError")
            return res.status(401).json({message: "Usuario existente"})
        } else if(err){
            res.send("Erro ao registrar usuário");
        } else {
            passport.authenticate("local")(req, res, ()=>{
                return res.status(200).json({message: "Usuario registrado com sucesso"});
            });
        }
    })
});

// Rota que retorna os dados dos usuarios
routes.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.user.tokenExpired) {
      return res.status(401).json({ message: 'Token expirado' });
    }
    if (req.user.isAdmin === false) {
      return res.status(403).json({ message: 'Usuário não autorizado' });
    }
    if (req.user.isAdmin) {
      try {
        const users = await User.find({});
        return res.status(200).json({"users":users});
      } catch (err) {
        return res.status(500).json({ message: 'Erro ao buscar usuários' });
      }
    }
  });

// Rota para atualizar a senha de um usuário
routes.put('/users/:id/senha', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.params.id;
    const newPassword = req.body.newPassword;
    if (!req.user.isAdmin && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Você não tem permissão para alterar a senha deste usuário' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres' });
    }
    const user = await User.findById(userId);
    if (!user) {return res.status(404).json({ message: 'Usuário não encontrado' });}
    user.setPassword(newPassword, async () => {
      try {
        await user.save();
        return res.status(200).json({ message: 'Senha do usuário atualizada com sucesso' });
      } catch (err) {
        return res.status(500).json({ message: 'Erro ao salvar a nova senha' });
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao alterar a senha' });
  }
});
  

// Rota para deletar um usuário específico
routes.delete('/users/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (!req.user.isAdmin && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Você não tem permissão para excluir este usuário' });
    }
    if(req.user.isAdmin){
      let response = await User.deleteOne({"_id": req.params.id});
      if(response.deletedCount === 0)return res.status(404).json({ message: 'Usuário não encontrado' });
      return res.status(200).json({ message: 'Usuário excluído com sucesso' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao excluir o usuário' });
  }
});

// Rota para autorizar um usuário específico
routes.put('/users/:id/autorizar', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Você não tem permissão para autorizar usuários' });
    }
    if(req.user.isAdmin){
      await User.updateOne({_id: req.params.id}, {$set: {isApproved: true}})
      return res.status(200).json({ message: `Usuário autorizado com sucesso` });
    } 
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao autorizar o usuário' });
  }
});
// rota para bloquear o acesso de um usuario 
routes.put('/users/:id/bloquear', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Você não tem permissão para bloquear o acesso de usuários' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    user.isApproved = false;
    await user.save();
    return res.status(200).json({ message: 'Acesso do usuário bloqueado com sucesso' });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao bloquear o acesso do usuário' });
  }
});





module.exports= routes;