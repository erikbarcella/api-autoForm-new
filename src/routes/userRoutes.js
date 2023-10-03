const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require("../middleware/authStrategies"); // Importar o módulo que exportamos anteriormente
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
    //console.log(req.body)
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
routes.get('/users',passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (req.user.tokenExpired) {
            return res.status(401).json({ message: 'Token expirado' });
          }
        const users = await User.find(); // Obtém todos os usuários do banco de dados
        res.json({"users": users});
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ message: 'Erro ao buscar usuários' });
      }
});
// rota admin

// routes.post('/users', passport.authenticate('jwt', { session: false }),isAdmin ,(req, res) => {
// });



module.exports= routes;