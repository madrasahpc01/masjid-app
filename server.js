const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const cron = require('node-cron');

const app = express();
app.use(bodyParser.json());

// In real use, store in DB
const subscriptions = [];

// Set your VAPID keys
const VAPID_PUBLIC_KEY = 'BKp_LndQ5lBZ5KHCtL62aB6ZLVA0u0LE6oEaXG61zTs_qW9ZhxLexLIMoLDbjgxYBHs22QYedlrL1gfpn41EXig';
const VAPID_PRIVATE_KEY = 'b7MCACUoBLWcTzbZzgkrCK3x4WMq4HmWYWayM84aqt0';

webpush.setVapidDetails(
  'mailto:you@example.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Save subscription from front-end
app.post('/api/save-subscription', (req, res) => {
  const sub = req.body;
  // Basic de-duplication
  if (!subscriptions.find(s => JSON.stringify(s) === JSON.stringify(sub))) {
    subscriptions.push(sub);
    console.log('New subscription saved:', sub);
  }
  res.status(201).json({ message: 'Subscription saved' });
});

// Util: get today's prayer times (simplified; you can use your existing logic)
function getTodayPrayerTimes() {
  // You can re-use CONFIG.manual, or call Aladhan on server-side.
  return {
    Fajr: '09:05',
    Dhuhr: '13:00',
    Asr: '14:30',
    Maghrib: '16:30',
    Isha: '19:00'
  };
}

// Cron job: runs every minute
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const hhmm = now.toTimeString().slice(0, 5);

  const times = getTodayPrayerTimes();
  const duePrayers = Object.entries(times)
    .filter(([name, time]) => time === hhmm)
    .map(([name]) => name);

  if (!duePrayers.length) return;

  console.log('Due prayers at', hhmm, ':', duePrayers);

  for (const sub of subscriptions) {
    for (const name of duePrayers) {
      const payload = JSON.stringify({
        title: `${name} Azan`,
        body: `It is now time for ${name}.`,
        tag: `azan-${name}`,
        url: 'https://YOUR_DOMAIN/index.html'
      });

      try {
        await webpush.sendNotification(sub, payload);
      } catch (err) {
        console.error('Push failed', err);
      }
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port', PORT);
  console.log('VAPID PUBLIC KEY:', VAPID_PUBLIC_KEY);
});