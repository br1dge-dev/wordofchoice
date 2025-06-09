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
    // Animated placeholder for counter (animal emoji)
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
        if (highlightMobile) highlightMobile.textContent = wordFrames[wordIndex];
        wordInterval = setInterval(() => {
            highlight.textContent = wordFrames[wordIndex];
            if (highlightMobile) highlightMobile.textContent = wordFrames[wordIndex];
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
            const loadedWord = data && data[0] ? data[0].value : 'WORD';
            highlight.textContent = loadedWord;
            if (highlightMobile) highlightMobile.textContent = loadedWord;
        } catch (e) {
            // Animation läuft weiter
        }
    }
    async function saveWord(newWord) {
        try {
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
        } catch (e) {}
    }
    // ===================== ENDE LOKALMODUS =====================

    fetchCounter();

    // Toggle dark/light mode
    toggleButton.addEventListener('click', () => {
        // Strikethrough animation for the fading word
        toggleText.classList.add('strikethrough');
        setTimeout(() => {
            body.classList.toggle('toggled');
            // Toggle the text between "worst" and "best"
            if (toggleText.textContent === 'worst') {
                toggleText.textContent = 'best';
            } else {
                toggleText.textContent = 'worst';
            }
            // Wenn im Edit-Modus, auch den Wert im Input-Feld togglen
            if (isEditing && input) {
                if (input.value.trim().toUpperCase() === 'WORST') {
                    input.value = 'BEST';
                } else if (input.value.trim().toUpperCase() === 'BEST') {
                    input.value = 'WORST';
                }
            } else {
                // Highlight-Word togglen, falls nicht im Edit-Modus
                if (highlight.textContent.trim().toUpperCase() === 'WORST') {
                    highlight.textContent = 'BEST';
                } else if (highlight.textContent.trim().toUpperCase() === 'BEST') {
                    highlight.textContent = 'WORST';
                }
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
    let mintClicked = false;
    let lastMintedWord = null;

    mintBtn.addEventListener('click', async () => {
        const currentWord = highlight.textContent;
        if (!mintClicked || lastMintedWord !== currentWord) {
            // First click or word changed: Increment counter, no infobox
            await incrementCounter();
            mintClicked = true;
            lastMintedWord = currentWord;
            // Infobox entfernen, falls noch sichtbar
            if (mintInfoBox) {
                mintBar.removeChild(mintInfoBox);
                mintInfoBox = null;
                mintBtn.classList.remove('mint-strikethrough');
            }
        } else {
            // Second click (without word change): Show infobox
            if (!mintInfoBox) {
                mintInfoBox = document.createElement('div');
                mintInfoBox.className = 'mint-info-box';
                mintInfoBox.innerHTML = '<div>word</div><div>is</div><div><span class="highlight info-highlight">GONE</span></div>';
                mintBar.appendChild(mintInfoBox);
                mintBtn.classList.add('mint-strikethrough');
            } else {
                // Infobox erneut "shaken"
                mintInfoBox.classList.remove('shake');
                void mintInfoBox.offsetWidth;
                mintInfoBox.classList.add('shake');
            }
        }
    });

    // Edit/Save functionality for the highlight word
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
        }
        // Speichern
        let newWord = input.value.trim().toUpperCase();
        if (newWord.length === 0) {
            // Leerer Input: ASCII-Gesicht, Mint deaktivieren, Warnung anzeigen
            highlight.style.display = '';
            highlight.textContent = 'ʕ◔ϖ◔ʔ';
            mintBtn.disabled = true;
            mintBtn.classList.add('mint-disabled');
            // Infobox anzeigen
            if (mintInfoBox) {
                mintBar.removeChild(mintInfoBox);
                mintInfoBox = null;
            }
            mintInfoBox = document.createElement('div');
            mintInfoBox.className = 'mint-info-box';
            mintInfoBox.innerHTML = '<div>word</div><div>is</div><div><span class="highlight info-highlight">INVALID</span></div>';
            mintBar.appendChild(mintInfoBox);
            mintBtn.classList.add('mint-strikethrough');
        } else {
            highlight.textContent = newWord;
            await saveWord(newWord);
            // Reset mint button and infobox
            mintClicked = false;
            lastMintedWord = null;
            if (mintInfoBox) {
                mintBar.removeChild(mintInfoBox);
                mintInfoBox = null;
            }
            mintBtn.classList.remove('mint-strikethrough');
            mintBtn.disabled = false;
            mintBtn.classList.remove('mint-disabled');
        }
        // Animation: Input ausblenden, Highlight einblenden
        input.classList.add('hide');
        setTimeout(() => {
            if (input && input.parentNode) input.parentNode.removeChild(input);
            highlight.style.display = '';
        }, 300);
        // Icon back to "Edit"
        editIcon.innerHTML = editSVG;
        isEditing = false;
    });

    // Idle animation for all .idle-animal in the infobox
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

    // --- Subtle, automatic wiggle loop for toggle and edit buttons ---
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
                // Toggle-Button auch im Edit-Modus für Mobile
                const toggleButtonMobile = document.querySelector('.mobile-headline .toggle-button');
                if (toggleButtonMobile) {
                    toggleButtonMobile.onclick = () => {
                        toggleText.classList.add('strikethrough');
                        setTimeout(() => {
                            body.classList.toggle('toggled');
                            if (toggleText.textContent === 'worst') {
                                toggleText.textContent = 'best';
                            } else {
                                toggleText.textContent = 'worst';
                            }
                            if (isEditingMobile && inputMobile) {
                                if (inputMobile.value.trim().toUpperCase() === 'WORST') {
                                    inputMobile.value = 'BEST';
                                } else if (inputMobile.value.trim().toUpperCase() === 'BEST') {
                                    inputMobile.value = 'WORST';
                                }
                            } else {
                                if (highlightMobile.textContent.trim().toUpperCase() === 'WORST') {
                                    highlightMobile.textContent = 'BEST';
                                } else if (highlightMobile.textContent.trim().toUpperCase() === 'BEST') {
                                    highlightMobile.textContent = 'WORST';
                                }
                            }
                            toggleText.classList.remove('strikethrough');
                        }, 300);
                    };
                }
            } else {
                // Speichern
                let newWord = inputMobile.value.trim().toUpperCase();
                if (newWord.length === 0) {
                    newWord = 'PIZZA';
                }
                syncHighlightWord(newWord);
                await saveWord(newWord);
                // Reset mint button and infobox (Mobile)
                mintClicked = false;
                lastMintedWord = null;
                if (mintInfoBox) {
                    mintBar.removeChild(mintInfoBox);
                    mintInfoBox = null;
                }
                mintBtn.classList.remove('mint-strikethrough');
                // Animation: Input ausblenden, Highlight einblenden
                inputMobile.classList.add('hide');
                setTimeout(() => {
                    if (inputMobile && inputMobile.parentNode) inputMobile.parentNode.removeChild(inputMobile);
                    highlightMobile.style.display = '';
                }, 300);
                // Icon back to "Edit"
                editIconMobile.innerHTML = editSVG;
                isEditingMobile = false;
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

    // Wallet Connection State
    let isConnected = false;
    let currentAccount = null;

    // DOM Elements
    const walletModal = document.getElementById('walletModal');
    const closeModal = document.querySelector('.close-modal');
    const connectWalletBtn = document.getElementById('connectWallet');
    const walletStatus = document.getElementById('walletStatus');

    // BASE Sepolia Testnet Daten
    const BASE_SEPOLIA_PARAMS = {
        chainId: '0x14a34',
        chainName: 'Base Sepolia Testnet',
        nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['https://sepolia.base.org'],
        blockExplorerUrls: ['https://sepolia.basescan.org']
    };

    // Modal Functions
    function openModal() {
        walletModal.style.display = 'block';
    }

    function closeModalFunc() {
        walletModal.style.display = 'none';
    }

    // Event Listeners
    mintBtn.addEventListener('click', () => {
        if (!isConnected) {
            openModal();
        } else {
            // Hier kommt später die Mint-Funktionalität
            console.log('Mint functionality will be implemented here');
        }
    });

    closeModal.addEventListener('click', closeModalFunc);

    window.addEventListener('click', (event) => {
        if (event.target === walletModal) {
            closeModalFunc();
        }
    });

    // MetaMask Connection
    async function connectWallet() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Prüfe Netzwerk
                let chainId = await window.ethereum.request({ method: 'eth_chainId' });
                if (chainId !== BASE_SEPOLIA_PARAMS.chainId) {
                    // Versuche automatischen Switch
                    try {
                        await window.ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: BASE_SEPOLIA_PARAMS.chainId }]
                        });
                        chainId = BASE_SEPOLIA_PARAMS.chainId;
                    } catch (switchError) {
                        // Falls das Netzwerk nicht existiert, versuche es hinzuzufügen
                        if (switchError.code === 4902) {
                            try {
                                await window.ethereum.request({
                                    method: 'wallet_addEthereumChain',
                                    params: [BASE_SEPOLIA_PARAMS]
                                });
                                chainId = BASE_SEPOLIA_PARAMS.chainId;
                            } catch (addError) {
                                walletStatus.textContent = 'Please add BASE Sepolia Testnet to your wallet.';
                                return;
                            }
                        } else {
                            walletStatus.textContent = 'Please switch to BASE Sepolia Testnet in your wallet.';
                            return;
                        }
                    }
                }
                // Request account access
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                currentAccount = accounts[0];
                isConnected = true;
                // Update UI
                mintBtn.textContent = 'MINT';
                walletStatus.textContent = `Connected: ${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
                closeModalFunc();
                // Listen for account changes
                window.ethereum.on('accountsChanged', handleAccountsChanged);
                window.ethereum.on('chainChanged', handleChainChanged);
            } catch (error) {
                console.error('Error connecting to wallet:', error);
                walletStatus.textContent = 'Please install an EVM-compatible wallet!';
            }
        } else {
            walletStatus.textContent = 'Please install an EVM-compatible wallet!';
        }
    }

    function handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            // User disconnected
            isConnected = false;
            currentAccount = null;
            mintBtn.textContent = 'CONNECT';
            walletStatus.textContent = '';
        } else {
            // Account changed
            currentAccount = accounts[0];
            walletStatus.textContent = `Connected: ${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
        }
    }

    function handleChainChanged(_chainId) {
        if (_chainId !== BASE_SEPOLIA_PARAMS.chainId) {
            isConnected = false;
            currentAccount = null;
            mintBtn.textContent = 'CONNECT';
            walletStatus.textContent = 'Please switch to BASE Sepolia Testnet in your wallet.';
            openModal();
        } else {
            walletStatus.textContent = '';
        }
    }

    connectWalletBtn.addEventListener('click', connectWallet);
}); 