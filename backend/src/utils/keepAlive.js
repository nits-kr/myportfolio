import cron from "node-cron";
import https from "https";
import logger from "./logger.js";

// Render spins down free-tier services after 15 minutes of inactivity.
// We ping our own server every 14 minutes to keep it awake.
export const startKeepAlive = () => {
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
    "https://portfolio-backend-sjlz.onrender.com";
  
  const pingUrl = `${backendUrl}/api/ping`;

  // Provide a simple agent so we don't hold connections open unnecessarily
  const agent = new https.Agent({ keepAlive: false });

  cron.schedule("*/14 * * * *", () => {
    logger.info(`Sending keep-alive ping to ${pingUrl}`);
    
    https.get(pingUrl, { agent }, (res) => {
      if (res.statusCode === 200) {
        logger.info("Keep-alive ping successful.");
      } else {
        logger.error(`Keep-alive ping failed with status code: ${res.statusCode}`);
      }
    }).on("error", (err) => {
      logger.error(`Keep-alive ping error: ${err.message}`);
    });
  });

  logger.info("✅ Keep-alive scheduler initialized (runs every 14 minutes)");
};
