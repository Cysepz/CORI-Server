// routes/userRoutes.js
const express = require('express');
const router = express.Router();
//const userController = require('../controllers/userController'); 
const permissionController = require('../controllers/permissionController');


router.post('/showAllBlacklist', permissionController.showAllBlacklist);
router.post('/recoverUser', permissionController.recoverUser);

// router.get('/getAll', todoController.getAll);


module.exports = router;
