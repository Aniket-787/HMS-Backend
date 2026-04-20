const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const controller = require("../controller/dischargeSummery.controller")

const router = express.Router();


router.post(
  "/discharge-summary",
  authMiddleware,
  roleMiddleware.roleMiddleware("DOCTOR"),
  controller.createDischargeSummary
);

router.get(
  "/discharge-summary/:ipdId",
  authMiddleware,
  controller.getDischargeSummary
);

router.get(
  "/discharge-summary",
  authMiddleware,
  controller.getAllDischargeSummaries
);

module.exports = router;