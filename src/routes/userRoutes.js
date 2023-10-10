const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require("../middleware/authStrategies"); 
const User = require("../models/user");
const expressSession = require("express-session");
const isAdmin = require("../middleware/checkAdmin")

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
            //console.log(token)
            if (err) throw err;
            return res.status(200).json({
                user:{
                    id: user._id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
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
            // console.log(err.name);
            return res.status(401).json({message: "Usuario existente"})
        } else if(err){
            // console.log(err);
            res.send("Erro ao registrar usuário");
        } else {
            passport.authenticate("local")(req, res, ()=>{
                // console.log("Usuário registrado com sucesso");
                return res.status(200).json({message: "Usuario registrado com sucesso"});
            });
        }
    })
});

// Rota protegida
routes.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if (req.user.tokenExpired) {
      return res.status(401).json({ message: 'Token expirado' });
    }
    console.log(req.user.isAdmin)
    if (req.user.isAdmin === false) {
      return res.status(403).json({ message: 'Usuário não autorizado' });
    }
    if (req.user.isAdmin) {
      try {
        console.log("buscando users ")
        const users = await User.find({});
        return res.status(200).json({"users":users});
      } catch (err) {
        return res.status(500).json({ message: 'Erro ao buscar usuários' });
      }
    }
  });

  // Rota para alterar a senha de um usuário específico
  routes.put('/users/:id/senha', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
      if (!req.user.isAdmin && req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Você não tem permissão para alterar a senha deste usuário' });
      }
      if (req.body.newPassword.length < 6) {
        return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres' });
      }
      
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      // Atualize o hash e salt da senha do usuário para a nova senha fornecida
      user.setPassword(req.body.newPassword, async () => {
        try {
          await user.save();
          return res.status(200).json({ message: 'Senha do usuário atualizada com sucesso' });
        } catch (err) {
          console.error(err);
          return res.status(500).json({ message: 'Erro ao salvar a nova senha' });
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro ao alterar a senha' });
    }
  });
  

// Rota para deletar um usuário específico
routes.delete('/users/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  console.log(req.params.id)
  try {
    if (!req.user.isAdmin && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Você não tem permissão para excluir este usuário' });
    }
    if(req.user.isAdmin){
      let res = await User.deleteOne({"_id": req.params.id});
      if(res.deletedCount === 0)return res.status(404).json({ message: 'Usuário não encontrado' });
      return res.status(200).json({ message: 'Usuário excluído com sucesso' });
    }
  } catch (err) {
    console.log(err);
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
    console.log(err);
    return res.status(500).json({ message: 'Erro ao autorizar o usuário' });
  }
});

// rota admin
// routes.post('/users', passport.authenticate('jwt', { session: false }),isAdmin ,(req, res) => {
//     console.log(req.user)

//     if (req.user.tokenExpired) {
//         return res.status(401).json({ message: 'Token expirado' });
//       }
//     if(req.user.isAdmin==false){
//         return res.status(403).json({message: "Usuario nao autorizado"});
//     } if(req.user.isAdmin){
//         User.find(({}), (err, users)=>{
//             if(err){
//                 return res.status(500).json({message: "Erro ao buscar usuarios"});
//             } else {
//                 return res.status(200).json(users);
//             }
//         })
//     }
   

// });



module.exports= routes;