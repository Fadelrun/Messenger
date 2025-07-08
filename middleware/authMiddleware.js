const User = require('../models/User');

module.exports = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login'); 
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/login'); 
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Ошибка в authMiddleware:', err);
    res.status(500).send('Ошибка сервера');
  }
};