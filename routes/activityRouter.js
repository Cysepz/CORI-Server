// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

// router.post('/showActList_D', activityController.showActList_D);
router.get('/showActList', activityController.showActList);
router.post('/searchAct', activityController.searchAct);
router.post('/postAct_D', activityController.postAct_D);
router.post('/postAct_P', activityController.postAct_P);
router.post('/joinAct_D', activityController.joinAct_D);
// router.post('/joinAct_P', activityController.joinAct_P);



module.exports = router;
