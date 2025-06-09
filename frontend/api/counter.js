// Nur natives fetch verwenden, keine node-fetch-Logik mehr!

const SUPABASE_URL = 'https://kuatsdzlonpjpddcgvnm.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1YXRzZHpsb25wanBkZGNndm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMzIyMDIsImV4cCI6MjA2NDkwODIwMn0.A-LrULN8IXTA1HMz0lD-f8-Dpu7fUnJckRsi26uU094';
const TABLE = 'choices';

async function getCounter() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=value&key=eq.counter`, {
    headers: {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${SUPABASE_API_KEY}`,
    },
  });
  const data = await res.json();
  if (data && data[0]) return parseInt(data[0].value, 10);
  // Wenn kein Eintrag existiert, initialisiere mit 1
  await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${SUPABASE_API_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ key: 'counter', value: '1' }),
  });
  return 1;
}

async function setCounter(newCount) {
  await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?key=eq.counter`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${SUPABASE_API_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ value: String(newCount) }),
  });
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const count = await getCounter();
      res.status(200).json({ count });
    } else if (req.method === 'POST') {
      let count = await getCounter();
      count++;
      await setCounter(count);
      res.status(200).json({ count });
    } else if (req.method === 'DELETE') {
      await setCounter(1);
      res.status(200).json({ count: 1 });
    } else {
      res.status(405).end();
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.toString() });
  }
} 