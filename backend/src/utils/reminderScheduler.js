import cron from "node-cron";
import Subscriber from "../models/Subscriber.js";
import sendEmail from "./sendEmail.js";

// Send reminder emails to unverified subscribers
export const sendVerificationReminders = async () => {
  try {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    const fortyHoursAgo = now - 40 * 60 * 60 * 1000;

    // Find unverified subscribers who need reminders
    const subscribers = await Subscriber.find({
      isVerified: false,
      verificationTokenExpire: { $gt: now }, // Token still valid
      $or: [
        // First reminder: 24 hours after creation
        {
          createdAt: {
            $gte: new Date(twentyFourHoursAgo - 60 * 60 * 1000), // 23-24 hours ago
            $lte: new Date(twentyFourHoursAgo),
          },
        },
        // Final reminder: 40 hours after creation (8 hours before expiration)
        {
          createdAt: {
            $gte: new Date(fortyHoursAgo - 60 * 60 * 1000), // 39-40 hours ago
            $lte: new Date(fortyHoursAgo),
          },
        },
      ],
    });

    console.log(`Found ${subscribers.length} subscribers to send reminders to`);

    for (const subscriber of subscribers) {
      const hoursElapsed = Math.floor(
        (now - subscriber.createdAt.getTime()) / (60 * 60 * 1000),
      );
      const hoursRemaining = Math.floor(
        (subscriber.verificationTokenExpire - now) / (60 * 60 * 1000),
      );

      // Generate verification URL (need to regenerate token for security)
      const verifyUrl = `${process.env.FRONTEND_URL}/verify/${subscriber.verificationToken}`;

      let subject, message, html;

      if (hoursElapsed >= 39 && hoursElapsed <= 41) {
        // Final reminder
        subject = "⏰ Final Reminder: Verify Your Email - Expires Soon!";
        message = `Hi${subscriber.name ? " " + subscriber.name : ""},\n\nThis is a final reminder to verify your email for MyPortfolio.\n\nYour verification link will expire in approximately ${hoursRemaining} hours.\n\nPlease verify your email by clicking the link below:\n${verifyUrl}\n\nIf you didn't subscribe, you can safely ignore this email.\n\nBest regards,\nMyPortfolio Team`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e74c3c;">⏰ Final Reminder: Verify Your Email</h2>
            <p>Hi${subscriber.name ? " " + subscriber.name : ""},</p>
            <p>This is a <strong>final reminder</strong> to verify your email for MyPortfolio.</p>
            <p style="color: #e74c3c; font-weight: bold;">Your verification link will expire in approximately ${hoursRemaining} hours.</p>
            <p>Please verify your email by clicking the button below:</p>
            <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #e74c3c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email Now</a>
            <p style="color: #666; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:<br>${verifyUrl}</p>
            <p style="color: #999; font-size: 11px; margin-top: 30px;">If you didn't subscribe, you can safely ignore this email.</p>
          </div>
        `;
      } else {
        // First reminder (24 hours)
        subject = "📧 Reminder: Please Verify Your Email";
        message = `Hi${subscriber.name ? " " + subscriber.name : ""},\n\nWe noticed you haven't verified your email yet for MyPortfolio.\n\nYour verification link will expire in approximately ${hoursRemaining} hours.\n\nPlease verify your email by clicking the link below:\n${verifyUrl}\n\nIf you didn't subscribe, you can safely ignore this email.\n\nBest regards,\nMyPortfolio Team`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3498db;">📧 Reminder: Please Verify Your Email</h2>
            <p>Hi${subscriber.name ? " " + subscriber.name : ""},</p>
            <p>We noticed you haven't verified your email yet for MyPortfolio.</p>
            <p>Your verification link will expire in approximately <strong>${hoursRemaining} hours</strong>.</p>
            <p>Please verify your email by clicking the button below:</p>
            <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
            <p style="color: #666; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:<br>${verifyUrl}</p>
            <p style="color: #999; font-size: 11px; margin-top: 30px;">If you didn't subscribe, you can safely ignore this email.</p>
          </div>
        `;
      }

      try {
        await sendEmail({
          email: subscriber.email,
          subject,
          message,
          html,
        });
        console.log(`Reminder sent to ${subscriber.email}`);
      } catch (error) {
        console.error(`Failed to send reminder to ${subscriber.email}:`, error);
      }
    }

    return {
      success: true,
      count: subscribers.length,
      message: `Sent ${subscribers.length} reminder emails`,
    };
  } catch (error) {
    console.error("Error in sendVerificationReminders:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

// Schedule the reminder job to run every hour
export const scheduleReminderJob = () => {
  // Run every hour
  cron.schedule("0 * * * *", async () => {
    console.log("Running verification reminder job...");
    await sendVerificationReminders();
  });

  console.log(
    "✅ Verification reminder scheduler initialized (runs every hour)",
  );
};
