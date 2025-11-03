const cron = require('node-cron');
const Promotion = require('../models/Promotion');

/**
 * Cron job chạy mỗi phút để cập nhật promotion status
 * Schedule: '* * * * *' = Every minute
 * 
 * Format: second minute hour day month weekday
 * Examples:
 * - '* * * * *' = Every minute
 * - '0 * * * *' = Every hour
 * - '0 0 * * *' = Every day at midnight
 */
const startPromotionStatusUpdater = () => {
  // Chạy mỗi phút
  cron.schedule('* * * * *', async () => {
    try {
      const result = await Promotion.updateAllStatuses();
      
      if (result.updated > 0) {
        console.log(`[${new Date().toLocaleString()}] 🔄 Promotion Status Update: ${result.updated}/${result.total} updated`);
      }
    } catch (error) {
      console.error('[Cron Error] Failed to update promotion statuses:', error.message);
    }
  });

  console.log('✓ Promotion status updater started (runs every minute)');
};

module.exports = { startPromotionStatusUpdater };
