import { authenticateToken } from '../../lib/auth';
import { connectToDatabase } from '../../lib/mongodb';
import fetch from 'node-fetch'; // Untuk akses API Telegram

export default async function handler(req, res) {
  await authenticateToken(req, res, async () => {
    const { db } = await connectToDatabase();
    const { channelId } = req.query; // ID channel dari permintaan

    const channel = await db.collection('channels').findOne({ _id: channelId });
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Mengambil data pesan dari channel Telegram
    const messages = await fetchTelegramMessages(channel.telegramId);

    // Simpan pesan ke dalam database jika berhasil diambil
    if (messages) {
      await db.collection('messages').insertMany(messages.map(msg => ({
        title: msg.text.split('\n')[0], // Baris pertama sebagai judul
        content: msg.text,
        media: msg.media,
        messageLink: `https://t.me/${channel.url}/${msg.message_id}`,
        postedAt: new Date(msg.date * 1000), // Timestamp dari Telegram
        channelName: channel.name,
        isConfigured: false,
      })));

      return res.status(200).json({ message: 'Messages fetched successfully', messages });
    } else {
      return res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });
}

// Fungsi untuk mengambil pesan dari API Telegram
async function fetchTelegramMessages(channelId) {
  const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}/getUpdates?chat_id=${channelId}`);
  const data = await res.json();

  if (data.ok) {
    return data.result.map(update => update.message); // Mengembalikan pesan
  } else {
    return null; // Jika gagal mengambil data
  }
}
