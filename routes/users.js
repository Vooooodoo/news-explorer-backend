const router = require('express').Router();
const { getUser } = require('../controllers/users');

router.get('/me', getUser); //! исправить айдишник как то

module.exports = router;
