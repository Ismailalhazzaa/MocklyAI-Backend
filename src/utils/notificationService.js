const admin = require("firebase-admin");
const User = require("../models/Users");

async function sendNotificationToUser(userId, title, body) {
  try {
    const user = await User.findById(userId);

    if (!user || !user.fcmToken) {
      return;
    }

    const message = {
      notification: {
        title,
        body,
      },
      token: user.fcmToken,
    };
    const response = await admin.messaging().send(message);
    console.log("✅ Notification sent:", response);

    return response;
  } catch (error) {
    console.error("❌ Error sending notification:", error.message);
    throw error;
  }
}

module.exports = { sendNotificationToUser };
