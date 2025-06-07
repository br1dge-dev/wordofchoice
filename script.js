document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const toggleButton = document.querySelector('.toggle-button');
    const toggleText = document.querySelector('.toggle-text');
    const highlight = document.getElementById('highlight-word');
    const editBtn = document.getElementById('edit-btn');
    const editIcon = document.getElementById('edit-icon');
    const counter = document.getElementById('counter');
    const resetCounterBtn = document.getElementById('reset-counter');
    let isEditing = false;
    let input;
    // Counter global von API laden
    let count = parseInt(localStorage.getItem('wordofchoice_counter') || '1', 10);
    counter.textContent = `#${count}`;

    const editSVG = `<svg id=\"edit-svg\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"48\" height=\"48\" fill=\"currentColor\"><path d=\"M20 12H7M11 8l-4 4 4 4\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/></svg>`;
    const saveSVG = `<svg id=\"save-svg\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"48\" height=\"48\" fill=\"currentColor\"><rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><rect x=\"8\" y=\"16\" width=\"8\" height=\"2\" fill=\"currentColor\"/><rect x=\"8\" y=\"8\" width=\"8\" height=\"6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/></svg>`;

    // Counter global von API laden
    async function fetchCounter() {
        try {
            const res = await fetch('/api/counter');
            const data = await res.json();
            count = data.count;
            counter.textContent = `#${count}`;
        } catch (e) {
            counter.textContent = '#?';
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
    resetCounterBtn.addEventListener('click', resetCounter);
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

    // Edit/Save functionality for the last word
    editBtn.addEventListener('click', () => {
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

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === 'Return') {
            e.preventDefault();
            editBtn.click();
        }
    });
}); 