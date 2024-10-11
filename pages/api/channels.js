import { authenticateToken } from '../../lib/auth';
import { connectToDatabase } from '../../lib/mongodb';
import Channel from '../../lib/models/Channel';
import fetch from 'node-fetch'; // Untuk Telegram API

export default async function handler(req, res) {
  await authenticateToken(req, res, async () => {
    const { db } = await connectToDatabase();

    if (req.method === 'POST') {
      // Tambah channel baru
      const { usernameOrUrl } = req.body;
      const telegramData = await fetchTelegramData(usernameOrUrl);
      if (!telegramData) {
        return res.status(400).json({ message: 'Invalid Telegram channel' });
      }

      const newChannel = new Channel({
        name: telegramData.title,
        url: usernameOrUrl,
        telegramId: telegramData.id,
      });

      await db.collection('channels').insertOne(newChannel);
      return res.status(201).json({ message: 'Channel added successfully', channel: newChannel });

    } else if (req.method === 'PUT') {
      // Edit channel
      const { id, usernameOrUrl } = req.body;
      const telegramData = await fetchTelegramData(usernameOrUrl);
      if (!telegramData) {
        return res.status(400).json({ message: 'Invalid Telegram channel' });
      }

      await db.collection('channels').updateOne(
        { _id: id },
        { $set: { name: telegramData.title, url: usernameOrUrl, telegramId: telegramData.id } }
      );

      return res.status(200).json({ message: 'Channel updated successfully' });

    } else if (req.method === 'DELETE') {
      // Hapus channel
      const { id } = req.body;
      await db.collection('channels').deleteOne({ _id: id });
      return res.status(200).json({ message: 'Channel deleted successfully' });

    } else if (req.method === 'GET') {
      // Ambil daftar channel
      const channels = await db.collection('channels').find().toArray();
      return res.status(200).json({ channels });
    }
  });
}

// Fungsi untuk mengambil data Telegram dari API
async function fetchTelegramData(usernameOrUrl) {
  const username = usernameOrUrl.replace('https://t.me/', ''); // Mengambil username dari URL
  const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}/getChat?chat_id=@${username}`);
  const data = await res.json();

  if (data.ok) {
    return data.result; // Mengembalikan data channel
  } else {
    return null; // Jika tidak valid
  }
}
