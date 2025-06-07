// Kompatibles fetch für Vercel (Node 18+) und lokal (ältere Node-Versionen)
let fetchFn;
if (typeof fetch === 'function') {
  fetchFn = fetch;
} else {
  fetchFn = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
}

const SUPABASE_URL = 'https://kuatsdzlonpjpddcgvnm.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1YXRzZHpsb25wanBkZGNndm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMzIyMDIsImV4cCI6MjA2NDkwODIwMn0.A-LrULN8IXTA1HMz0lD-f8-Dpu7fUnJckRsi26uU094';
const TABLE = 'counter';

async function getCounter() {
  const res = await fetchFn(`${SUPABASE_URL}/rest/v1/${TABLE}?select=count&id=eq.1`, {
    headers: {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${SUPABASE_API_KEY}`,
    },
  });
  const data = await res.json();
  if (data && data[0]) return data[0].count;
  // Wenn kein Eintrag existiert, initialisiere mit 1
  await fetchFn(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${SUPABASE_API_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ id: 1, count: 1 }),
  });
  return 1;
}

async function setCounter(newCount) {
  await fetchFn(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.1`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${SUPABASE_API_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ count: newCount }),
  });
}

export default async function handler(req, res) {
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
} 