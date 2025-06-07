import { promises as fs } from 'fs';
const COUNTER_FILE = './counter.json';

export default async function handler(req, res) {
  let count = 1;
  try {
    const data = await fs.readFile(COUNTER_FILE, 'utf-8');
    count = JSON.parse(data).count;
  } catch (e) {
    // Datei existiert nicht, starte mit 1
  }

  if (req.method === 'GET') {
    res.status(200).json({ count });
  } else if (req.method === 'POST') {
    count++;
    await fs.writeFile(COUNTER_FILE, JSON.stringify({ count }), 'utf-8');
    res.status(200).json({ count });
  } else if (req.method === 'DELETE') {
    count = 1;
    await fs.writeFile(COUNTER_FILE, JSON.stringify({ count }), 'utf-8');
    res.status(200).json({ count });
  } else {
    res.status(405).end();
  }
} 