const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');
const User = require("../models/user");
require('dotenv').config()

// Configuração da estratégia local
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Configuração da estratégia JWT
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY, 
};

passport.use(new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      const user = await User.findById(jwtPayload.id);
      if (!user) {
        return done(null, false, { message: 'Nome de usuario incorreto' });
      }
      const currentTime = Date.now() / 1000;
      if (jwtPayload.exp <= currentTime) {
        // Token expirado
        return done(null, false, { message: "Token expirado" }); // Adicionando uma propriedade para indicar token expirado
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
}));

module.exports = passport;
