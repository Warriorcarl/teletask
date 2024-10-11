import { authenticateToken } from '../../lib/auth';
import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  await authenticateToken(req, res, async () => {
    const { db } = await connectToDatabase();
    const channels = await db.collection('channels').find().toArray();
    res.status(200).json({ channels });
  });
}
