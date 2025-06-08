// Neue API-Route für das globale Highlight-Word
const SUPABASE_URL = 'https://kuatsdzlonpjpddcgvnm.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1YXRzZHpsb25wanBkZGNndm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMzIyMDIsImV4cCI6MjA2NDkwODIwMn0.A-LrULN8IXTA1HMz0lD-f8-Dpu7fUnJckRsi26uU094';
const TABLE = 'choices';

async function getWord() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=value&key=eq.word`, {
    headers: {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${SUPABASE_API_KEY}`,
    },
  });
  const data = await res.json();
  if (data && data[0]) return data[0].value;
  // Wenn kein Eintrag existiert, initialisiere mit 'WORD'
  await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${SUPABASE_API_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ key: 'word', value: 'WORD' }),
  });
  return 'WORD';
}

async function setWord(newWord) {
  await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?key=eq.word`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${SUPABASE_API_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ value: newWord }),
  });
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const word = await getWord();
      res.status(200).json({ word });
    } else if (req.method === 'POST') {
      const { word } = req.body;
      if (!word || typeof word !== 'string') {
        res.status(400).json({ error: 'Invalid word' });
        return;
      }
      await setWord(word);
      res.status(200).json({ word });
    } else {
      res.status(405).end();
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.toString() });
  }
} 