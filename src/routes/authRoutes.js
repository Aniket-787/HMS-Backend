const express = require('express');
const authController = require('../controller/auth.controller')
 


const router = express.Router();


//POST: Login API for All type of USER
router.post('/login',authController.loginUser);



module.exports = router;