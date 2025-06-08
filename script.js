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

    // Counter global von API laden
    async function fetchCounter() {
        try {
            const res = await fetch('/api/counter');
            const data = await res.json();
            count = data.count;
            clearInterval(loadingInterval);
            counter.textContent = `#${count}`;
        } catch (e) {
            clearInterval(loadingInterval);
            // Tier-Animation als Fallback weiterlaufen lassen
            loadingInterval = setInterval(() => {
                counter.textContent = '#' + animalFrames[animalIndex];
                animalIndex = (animalIndex + 1) % animalFrames.length;
            }, 400);
        }
    }
    async function incrementCounter() {
        try {
            const res = await fetch('/api/counter', { method: 'POST' });
            const data = await res.json();
            count = data.count;
            counter.textContent = `#${count}`;
        } catch (e) {
            counter.textContent = '#?';
        }
    }
    async function resetCounter() {
        try {
            const res = await fetch('/api/counter', { method: 'DELETE' });
            const data = await res.json();
            count = data.count;
            counter.textContent = `#${count}`;
        } catch (e) {
            counter.textContent = '#?';
        }
    }
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
            const res = await fetch('/api/word');
            const data = await res.json();
            clearInterval(wordInterval);
            wordInterval = null;
            highlight.textContent = data.word || 'WORD';
        } catch (e) {
            // Animation läuft weiter, bis fetchWord erneut erfolgreich ist
        }
    }
    // Highlight-Word global speichern
    async function saveWord(newWord) {
        try {
            await fetch('/api/word', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ word: newWord })
            });
        } catch (e) {}
    }

    // Edit/Save functionality für das Highlight-Word
    editBtn.addEventListener('click', async () => {
        if (!isEditing) {
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
            incrementCounter();
        }
    });

    // Beim Laden das aktuelle Highlight-Word holen
    fetchWord();

    // Idle-Animation für Infobox (chain/price/tweeter), wenn API nicht erreichbar
    const idleAnimals = [
        'ʕ◴ᴥ◴ʔ',
        'ʕ◷ᴥ◷ʔ',
        'ʕ◶ᴥ◶ʔ',
        'ʕ◵ᴥ◵ʔ'
    ];
    let idleIndex = 0;
    const idleSpans = document.querySelectorAll('.info-details-row .idle-animal');
    setInterval(() => {
        idleSpans.forEach((span, i) => {
            span.textContent = idleAnimals[(idleIndex + i) % idleAnimals.length];
        });
        idleIndex = (idleIndex + 1) % idleAnimals.length;
    }, 400);
}); 