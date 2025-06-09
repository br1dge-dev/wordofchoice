document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const toggleButton = document.querySelector('.toggle-button');
    const toggleText = document.querySelector('.toggle-text');
    const highlight = document.getElementById('highlight-word');
    const editBtn = document.getElementById('edit-btn');
    const editIcon = document.getElementById('edit-icon');
    const counter = document.getElementById('counter');
    let isEditing = false;
    let input;
    let count;
    // Animierter Platzhalter für Counter (Tier-Emoji)
    const animalFrames = [
        'ʕ◴ᴥ◴ʔ',
        'ʕ◷ᴥ◷ʔ',
        'ʕ◶ᴥ◶ʔ',
        'ʕ◵ᴥ◵ʔ'
    ];
    let animalIndex = 0;
    let loadingInterval = setInterval(() => {
        counter.textContent = '#' + animalFrames[animalIndex];
        animalIndex = (animalIndex + 1) % animalFrames.length;
    }, 400);

    const editSVG = `<svg id=\"edit-svg\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"48\" height=\"48\" fill=\"currentColor\"><path d=\"M20 12H7M11 8l-4 4 4 4\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/></svg>`;
    const saveSVG = `<svg id=\"save-svg\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"48\" height=\"48\" fill=\"currentColor\"><rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><rect x=\"8\" y=\"16\" width=\"8\" height=\"2\" fill=\"currentColor\"/><rect x=\"8\" y=\"8\" width=\"8\" height=\"6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/></svg>`;

    // ===================== LOKALMODUS =====================
    // Alle API-Calls gehen direkt an Supabase, nicht an /api/word oder /api/counter
    const SUPABASE_URL = 'https://kuatsdzlonpjpddcgvnm.supabase.co';
    const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1YXRzZHpsb25wanBkZGNndm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMzIyMDIsImV4cCI6MjA2NDkwODIwMn0.A-LrULN8IXTA1HMz0lD-f8-Dpu7fUnJckRsi26uU094';
    const TABLE = 'choices';

    async function fetchCounter() {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=value&key=eq.counter`, {
                headers: {
                    apikey: SUPABASE_API_KEY,
                    Authorization: `Bearer ${SUPABASE_API_KEY}`,
                },
            });
            const data = await res.json();
            count = data && data[0] ? parseInt(data[0].value, 10) : 1;
            clearInterval(loadingInterval);
            counter.textContent = `#${count}`;
        } catch (e) {
            clearInterval(loadingInterval);
            loadingInterval = setInterval(() => {
                counter.textContent = '#' + animalFrames[animalIndex];
                animalIndex = (animalIndex + 1) % animalFrames.length;
            }, 400);
        }
    }
    async function incrementCounter() {
        try {
            // Counter holen
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=value&key=eq.counter`, {
                headers: {
                    apikey: SUPABASE_API_KEY,
                    Authorization: `Bearer ${SUPABASE_API_KEY}`,
                },
            });
            let data = await res.json();
            let newCount = data && data[0] ? parseInt(data[0].value, 10) + 1 : 1;
            // Counter setzen
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
            count = newCount;
            counter.textContent = `#${count}`;
        } catch (e) {
            counter.textContent = '#?';
        }
    }
    async function fetchWord() {
        if (wordInterval) clearInterval(wordInterval);
        let wordIndex = 0;
        const wordFrames = [
            'ʕ◴ᴥ◴ʔ',
            'ʕ◷ᴥ◷ʔ',
            'ʕ◶ᴥ◶ʔ',
            'ʕ◵ᴥ◵ʔ'
        ];
        highlight.textContent = wordFrames[wordIndex];
        wordInterval = setInterval(() => {
            highlight.textContent = wordFrames[wordIndex];
            wordIndex = (wordIndex + 1) % wordFrames.length;
        }, 400);
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=value&key=eq.word`, {
                headers: {
                    apikey: SUPABASE_API_KEY,
                    Authorization: `Bearer ${SUPABASE_API_KEY}`,
                },
            });
            const data = await res.json();
            clearInterval(wordInterval);
            wordInterval = null;
            highlight.textContent = data && data[0] ? data[0].value : 'WORD';
        } catch (e) {
            // Animation läuft weiter
        }
    }
    async function saveWord(newWord) {
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
                method: 'POST',
                headers: {
                    apikey: SUPABASE_API_KEY,
                    Authorization: `Bearer ${SUPABASE_API_KEY}`,
                    'Content-Type': 'application/json',
                    Prefer: 'return=representation',
                },
                body: JSON.stringify({ key: 'word', value: newWord }),
            });
        } catch (e) {}
    }
    // ===================== ENDE LOKALMODUS =====================

    fetchCounter();

    // Toggle dark/light mode
    toggleButton.addEventListener('click', () => {
        // Strikethrough-Animation für das schwindende Wort
        toggleText.classList.add('strikethrough');
        setTimeout(() => {
            body.classList.toggle('toggled');
            // Toggle the text between "worst" and "best"
            if (toggleText.textContent === 'worst') {
                toggleText.textContent = 'best';
            } else {
                toggleText.textContent = 'worst';
            }
            toggleText.classList.remove('strikethrough');
        }, 300);
    });

    // Highlight-Word global laden
    let wordInterval = null;
    fetchWord();

    // Mint-Button Funktionalität
    const mintBtn = document.querySelector('.mint-btn');
    const mintBar = document.querySelector('.mint-bar');
    let mintInfoBox = null;

    mintBtn.addEventListener('click', async () => {
        if (!mintInfoBox) {
            mintInfoBox = document.createElement('div');
            mintInfoBox.className = 'mint-info-box';
            mintInfoBox.innerHTML = '<div>word</div><div>is</div><div><span class="highlight info-highlight">GONE</span></div>';
            mintBar.appendChild(mintInfoBox);
            mintBtn.classList.add('mint-strikethrough');
        }
    });

    // Entferne Infobox und Strikethrough bei Editieren oder Speichern
    function clearMintBox() {
        if (mintInfoBox) {
            mintBar.removeChild(mintInfoBox);
            mintInfoBox = null;
        }
        mintBtn.classList.remove('mint-strikethrough');
    }

    // Edit/Save functionality für das Highlight-Word
    editBtn.addEventListener('click', async () => {
        if (!isEditing) {
            clearMintBox();
            isEditing = true;
            editIcon.innerHTML = saveSVG;
            // Input-Feld erzeugen
            input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 10;
            input.className = 'edit-input';
            input.value = '';
            input.placeholder = 'insert word';
            input.setAttribute('aria-label', 'Wort bearbeiten');
            input.style.textTransform = 'uppercase';
            // Animation: Highlight ausblenden, Input einblenden
            highlight.style.display = 'none';
            highlight.parentNode.insertBefore(input, editBtn);
            input.focus();
            // Validierung: Nur Buchstaben
            input.addEventListener('input', () => {
                input.value = input.value.replace(/[^a-zA-ZäöüÄÖÜß]/g, '').toUpperCase();
            });
        } else {
            // Speichern
            let newWord = input.value.trim().toUpperCase();
            if (newWord.length === 0) {
                newWord = 'PIZZA';
            }
            highlight.textContent = newWord;
            await saveWord(newWord);
            // Animation: Input ausblenden, Highlight einblenden
            input.classList.add('hide');
            setTimeout(() => {
                if (input && input.parentNode) input.parentNode.removeChild(input);
                highlight.style.display = '';
            }, 300);
            // Icon zurück zu "Edit"
            editIcon.innerHTML = editSVG;
            isEditing = false;
            clearMintBox();
        }
    });

    // Idle-Animation für alle .idle-animal in der Infobox
    const idleAnimals = [
        'ʕ◴ᴥ◴ʔ',
        'ʕ◷ᴥ◷ʔ',
        'ʕ◶ᴥ◶ʔ',
        'ʕ◵ᴥ◵ʔ'
    ];
    let idleIndex = 0;
    setInterval(() => {
        document.querySelectorAll('.idle-animal').forEach((span, i) => {
            span.textContent = idleAnimals[(idleIndex + i) % idleAnimals.length];
        });
        idleIndex = (idleIndex + 1) % idleAnimals.length;
    }, 400);

    // --- Subtiler, automatischer Wiggle-Loop für Toggle- und Edit-Button ---
    function triggerWiggle(element) {
        element.classList.remove('wiggle');
        void element.offsetWidth;
        element.classList.add('wiggle');
        setTimeout(() => {
            element.classList.remove('wiggle');
        }, 350); // Animation-Dauer + Puffer
    }

    function startWiggleLoop() {
        triggerWiggle(toggleButton);
        setTimeout(() => {
            triggerWiggle(editBtn);
            setTimeout(startWiggleLoop, 5250); // 5,25s Pause, dann wieder von vorne
        }, 2250);
    }
    setTimeout(startWiggleLoop, 1000); // Nach 1s Page-Load starten

    // --- Mobile Headline Logik: Edit und Highlight synchronisieren ---
    const highlightMobile = document.getElementById('highlight-word-mobile');
    const editBtnMobile = document.getElementById('edit-btn-mobile');
    const editIconMobile = document.getElementById('edit-icon-mobile');
    let isEditingMobile = false;
    let inputMobile;

    function syncHighlightWord(word) {
        if (highlight) highlight.textContent = word;
        if (highlightMobile) highlightMobile.textContent = word;
    }

    if (editBtnMobile) {
        editBtnMobile.addEventListener('click', async () => {
            if (!isEditingMobile) {
                clearMintBox();
                isEditingMobile = true;
                editIconMobile.innerHTML = saveSVG;
                // Input-Feld erzeugen
                inputMobile = document.createElement('input');
                inputMobile.type = 'text';
                inputMobile.maxLength = 10;
                inputMobile.className = 'edit-input';
                inputMobile.value = '';
                inputMobile.placeholder = 'insert word';
                inputMobile.setAttribute('aria-label', 'Wort bearbeiten');
                inputMobile.style.textTransform = 'uppercase';
                // Animation: Highlight ausblenden, Input einblenden
                highlightMobile.style.display = 'none';
                highlightMobile.parentNode.insertBefore(inputMobile, editBtnMobile);
                inputMobile.focus();
                // Validierung: Nur Buchstaben
                inputMobile.addEventListener('input', () => {
                    inputMobile.value = inputMobile.value.replace(/[^a-zA-ZäöüÄÖÜß]/g, '').toUpperCase();
                });
            } else {
                // Speichern
                let newWord = inputMobile.value.trim().toUpperCase();
                if (newWord.length === 0) {
                    newWord = 'PIZZA';
                }
                syncHighlightWord(newWord);
                await saveWord(newWord);
                // Animation: Input ausblenden, Highlight einblenden
                inputMobile.classList.add('hide');
                setTimeout(() => {
                    if (inputMobile && inputMobile.parentNode) inputMobile.parentNode.removeChild(inputMobile);
                    highlightMobile.style.display = '';
                }, 300);
                // Icon zurück zu "Edit"
                editIconMobile.innerHTML = editSVG;
                isEditingMobile = false;
                clearMintBox();
            }
        });
    }

    // Synchronisiere Highlight-Word initial
    if (highlight && highlightMobile) {
        highlightMobile.textContent = highlight.textContent;
    }

    // --- Supabase-API-Calls wieder aktivieren, Tieranimationen nur als Platzhalter beim Laden ---
    fetchCounter();
    fetchWord();
}); 