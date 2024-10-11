import { authenticateToken } from '../../lib/auth';
import { connectToDatabase } from '../../lib/mongodb';
import fetch from 'node-fetch'; // Untuk akses API Telegram

export default async function handler(req, res) {
  await authenticateToken(req, res, async () => {
    const { db } = await connectToDatabase();
    const { channelId, startDate, endDate } = req.body;

    const channel = await db.collection('channels').findOne({ _id: channelId });
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const messages = await fetchTelegramMessagesManual(channel.telegramId, startDate, endDate);
    if (messages) {
      await db.collection('messages').insertMany(messages.map(msg => ({
        title: msg.text.split('\n')[0], // Baris pertama sebagai judul
        content: msg.text,
        media: msg.media,
        messageLink: `https://t.me/${channel.url}/${msg.message_id}`,
        postedAt: new Date(msg.date * 1000),
        channelName: channel.name,
        isConfigured: false,
      })));

      return res.status(200).json({ message: 'Messages fetched manually', messages });
    } else {
      return res.status(500).json({ message: 'Failed to fetch messages manually' });
    }
  });
}

// Fungsi untuk mengambil pesan manual dari API Telegram berdasarkan rentang tanggal
async function fetchTelegramMessagesManual(channelId, startDate, endDate) {
  const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}/getUpdates?chat_id=${channelId}&date=${startDate}&end_date=${endDate}`);
  const data = await res.json();

  if (data.ok) {
    return data.result.map(update => update.message); // Mengembalikan pesan
  } else {
    return null;
  }
}
