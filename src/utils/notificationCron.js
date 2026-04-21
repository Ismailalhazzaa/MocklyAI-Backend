const cron = require("node-cron");
const User = require("../models/Users");
const { sendNotificationToUser } = require("../utils/notificationService");

cron.schedule("0 12 * * *", async () => {
    console.log("⏰ Running inactive users check...");

    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const inactiveUsers = await User.find({
        lastLogin: { $lt: twoDaysAgo },
        fcmToken: { $exists: true }
    });

    for (const user of inactiveUsers) {
        await sendNotificationToUser(
        user._id,
        "اشتقنالك 👀",
        "منذ فترة طويلة لم تزرنا, هيا بنا نستعد للمقابلة القادمة 🔥"
        );
    }
});