import { authenticateToken } from '../../lib/auth';
import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  await authenticateToken(req, res, async () => {
    const { db } = await connectToDatabase();

    if (req.method === 'GET') {
      const categories = await db.collection('categories').find().toArray();
      const types = await db.collection('types').find().toArray();
      const menus = await db.collection('menus').find().toArray();
      
      return res.status(200).json({ categories, types, menus });

    } else if (req.method === 'POST') {
      const { type, name } = req.body;

      if (type === 'category') {
        await db.collection('categories').insertOne({ name });
      } else if (type === 'type') {
        await db.collection('types').insertOne({ name });
      } else if (type === 'menu') {
        await db.collection('menus').insertOne({ name });
      }

      return res.status(201).json({ message: `${type} added successfully` });
    } else if (req.method === 'DELETE') {
      const { id, type } = req.body;

      await db.collection(`${type}s`).deleteOne({ _id: id });
      return res.status(200).json({ message: `${type} deleted successfully` });
    }
  });
}
