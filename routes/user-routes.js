const express = require('express');
const userControllers = require('../controllers/usercontroller');
const { authenticate } = require('../middleware/auth-middleware');
const router = express.Router();



 router.post('/register',userControllers.register);
 router.post('/login',userControllers.login);

 router.get('/profile',authenticate, userControllers.profile)

 module.exports = router;