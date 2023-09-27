// middleware/checkAdmin.js
const User = require('../models/user');

const checkAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ message: 'Usuário não autorizado.' });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Acesso negado. Você não é um administrador.' });
    }
    next(); // Se for um administrador, avance para a próxima rota.
  } catch (err) {
    return res.status(500).json({ message: 'Erro no servidor.' });
  }
};

module.exports = checkAdmin;
