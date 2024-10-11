import { authenticateToken } from '../../lib/auth';
import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  await authenticateToken(req, res, async () => {
    const { db } = await connectToDatabase();

    if (req.method === 'GET') {
      // Menampilkan data baru yang belum dikonfigurasi
      const newMessages = await db.collection('messages').find({ isConfigured: false }).toArray();
      return res.status(200).json({ messages: newMessages });
      
    } else if (req.method === 'POST') {
      // Konfigurasi data baru
      const { messageId, category, type, page } = req.body;

      await db.collection('messages').updateOne(
        { _id: messageId },
        { $set: { isConfigured: true, category, type, page } }
      );

      return res.status(200).json({ message: 'Message configured successfully' });
    }
  });
}
