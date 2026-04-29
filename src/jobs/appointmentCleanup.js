const cron = require("node-cron");
const Appointment = require("../models/appointmentRequest.model");

cron.schedule("0 0 * * *", async () => {
  const today = new Date();
  today.setHours(0,0,0,0);

  await Appointment.updateMany(
    {
      status: "PENDING",
      appointmentDate: { $lt: today }
    },
    {
      status: "EXPIRED"
    }
  );

  console.log("Expired old appointments");
});