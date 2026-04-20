const opdModel = require('../models/opd.model');
const ipdModel = require('../models/IPD.model')
const mongoose = require("mongoose");

async function getTodayRevenue(req, res) {
  try {

    const hospitalId = new mongoose.Types.ObjectId(req.user.hospitalId);

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    // OPD revenue
    const opdRevenue = await opdModel.aggregate([
      {
        $match: {
          hospitalId,
          visitDate: { $gte: start, $lte: end },
          feePaid: "PAID",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$consulationFee" },
        },
      },
    ]);

    // IPD revenue (only discharged)
    const ipdRevenue = await ipdModel.aggregate([
      {
        $match: {
          hospitalId,
          status: "DISCHARGED",
          dischargeDate: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const total =
      (opdRevenue[0]?.total || 0) +
      (ipdRevenue[0]?.total || 0);

    res.json({ total });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getLast30DaysRevenue(req, res) {
  try {

    const hospitalId = new mongoose.Types.ObjectId(req.user.hospitalId);

    const start = new Date();
    start.setDate(start.getDate() - 30);

    const opdRevenue = await opdModel.aggregate([
      {
        $match: {
          hospitalId,
          visitDate: { $gte: start },
          feePaid: "PAID",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$consulationFee" },
        },
      },
    ]);

    const ipdRevenue = await ipdModel.aggregate([
      {
        $match: {
          hospitalId,
          status: "DISCHARGED",
          dischargeDate: { $gte: start },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const total =
      (opdRevenue[0]?.total || 0) +
      (ipdRevenue[0]?.total || 0);

    res.json({ total });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getDailyRevenue(req, res) {
  try {
    const hospitalId = new mongoose.Types.ObjectId(req.user.hospitalId);

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const opd = await opdModel.aggregate([
      {
        $match: {
          hospitalId,
          visitDate: { $gte: last30Days },
          feePaid: "PAID",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$visitDate" },
          },
          total: { $sum: "$consulationFee" },
        },
      },
    ]);

    const ipd = await ipdModel.aggregate([
      {
        $match: {
          hospitalId,
          status: "DISCHARGED",
          dischargeDate: { $gte: last30Days },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$dischargeDate" },
          },
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    // 🔥 merge both
    const map = {};

    opd.forEach((item) => {
      map[item._id] = (map[item._id] || 0) + item.total;
    });

    ipd.forEach((item) => {
      map[item._id] = (map[item._id] || 0) + item.total;
    });

    const result = Object.keys(map).map((date) => ({
      date,
      total: map[date],
    }));

    res.json({ data: result });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


module.exports = {
    getDailyRevenue,
    getLast30DaysRevenue,
    getTodayRevenue
}