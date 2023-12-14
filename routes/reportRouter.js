// routes/userRoutes.js
const express = require('express');
const router = express.Router();
//const userController = require('../controllers/userController'); 
const reportController = require('../controllers/reportController');


router.post('/addReport', reportController.addReport);
router.post('/showMyReport', reportController.showMyReport);
router.post('/showAllReport', reportController.showAllReport);
//router.post('/checkReport', reportController.checkReport);
router.post('/reportPass', reportController.reportPass);
router.post('/reportUnpass', reportController.reportUnpass);
//router.post('/recoverUser', reportController.recoverUser);

// router.get('/getAll', todoController.getAll);


module.exports = router;
