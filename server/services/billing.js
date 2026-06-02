const cron = require('node-cron');
const Institution = require('../models/Institution');

/**
 * Runs daily at midnight.
 * On the 10th of every month: disconnect all active institutions that haven't
 * paid their monthly fee for the PREVIOUS month.
 */
function startBillingJobs() {
  // Every day at 00:00
  cron.schedule('0 0 * * *', async () => {
    const now = new Date();
    if (now.getDate() !== 10) return; // Only act on the 10th

    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    try {
      // Find active institutions whose last paid month is NOT the previous month
      const toDisconnect = await Institution.find({
        role: 'institution',
        serviceActive: true,
        registrationFeePaid: true,
        $or: [
          { currentMonth: null },
          { currentMonth: { $ne: prevMonth } }
        ]
      });

      if (toDisconnect.length === 0) return;

      const ids = toDisconnect.map(i => i._id);
      await Institution.updateMany(
        { _id: { $in: ids } },
        {
          serviceActive: false,
          monthlyFeePaid: false,
          needsReconnection: true,
          reconnectionFeePaid: false,
          disconnectedAt: now,
        }
      );

      console.log(`[Billing] Auto-disconnected ${ids.length} institutions for unpaid ${prevMonth} bills.`);
    } catch (err) {
      console.error('[Billing] Auto-disconnect error:', err.message);
    }
  });

  // Also: on the 1st of every month, reset monthlyFeePaid for all active institutions
  cron.schedule('0 0 1 * *', async () => {
    try {
      await Institution.updateMany(
        { role: 'institution', serviceActive: true },
        { monthlyFeePaid: false }
      );
      console.log('[Billing] Monthly fee status reset for all active institutions.');
    } catch (err) {
      console.error('[Billing] Monthly reset error:', err.message);
    }
  });

  console.log('[Billing] Scheduled jobs started.');
}

module.exports = { startBillingJobs };
