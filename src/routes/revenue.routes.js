const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const revenueController = require('../controller/revenue.controller')

const router = express.Router();


router.get("/revenue/today", authMiddleware, revenueController.getTodayRevenue);
router.get("/revenue/last-30-days", authMiddleware, revenueController.getLast30DaysRevenue);
router.get("/revenue/daily", authMiddleware, revenueController.getDailyRevenue);


module.exports = router;