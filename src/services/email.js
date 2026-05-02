const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    const data = await resend.emails.send({
      from: "MediFlix24 <appointments@mediflix24.com>",
      reply_to: "jphealthtech@gmail.com",
      to,
      subject,
      html,
    });
    return data;
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
};

module.exports = sendEmail;