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
    let count = 1;
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



    // async function fetchCounter() {
    //     try {
    //         const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=value&key=eq.counter`, {
    //             headers: {
    //                 apikey: SUPABASE_API_KEY,
    //                 Authorization: `Bearer ${SUPABASE_API_KEY}`,
    //             },
    //         });
    //         const data = await res.json();
    //         count = data && data[0] ? parseInt(data[0].value, 10) : 1;
    //         clearInterval(loadingInterval);
    //         counter.textContent = `#${count}`;
    //     } catch (e) {
    //         clearInterval(loadingInterval);
    //         loadingInterval = setInterval(() => {
    //             counter.textContent = '#' + animalFrames[animalIndex];
    //             animalIndex = (animalIndex + 1) % animalFrames.length;
    //         }, 400);
    //     }
    // }
    // async function incrementCounter() {
    //     try {
    //         // Fetch counter
    //         const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=value&key=eq.counter`, {
    //             headers: {
    //                 apikey: SUPABASE_API_KEY,
    //                 Authorization: `Bearer ${SUPABASE_API_KEY}`,
    //             },
    //         });
    //         let data = await res.json();
    //         let newCount = data && data[0] ? parseInt(data[0].value, 10) + 1 : 1;
    //         // Set counter
    //         await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?key=eq.counter`, {
    //             method: 'PATCH',
    //             headers: {
    //                 apikey: SUPABASE_API_KEY,
    //                 Authorization: `Bearer ${SUPABASE_API_KEY}`,
    //                 'Content-Type': 'application/json',
    //                 Prefer: 'return=representation',
    //             },
    //             body: JSON.stringify({ value: String(newCount) }),
    //         });
    //         count = newCount;
    //         counter.textContent = `#${count}`;
    //     } catch (e) {
    //         counter.textContent = '#?';
    //     }
    // }
    // async function fetchWord() {
    //     if (wordInterval) clearInterval(wordInterval);
    //     let wordIndex = 0;
    //     const wordFrames = [
    //         'ʕ◴ᴥ◴ʔ',
    //         'ʕ◷ᴥ◷ʔ',
    //         'ʕ◶ᴥ◶ʔ',
    //         'ʕ◵ᴥ◵ʔ'
    //     ];
    //     highlight.textContent = wordFrames[wordIndex];
    //     if (highlightMobile) highlightMobile.textContent = wordFrames[wordIndex];
    //     wordInterval = setInterval(() => {
    //         highlight.textContent = wordFrames[wordIndex];
    //         if (highlightMobile) highlightMobile.textContent = wordFrames[wordIndex];
    //         wordIndex = (wordIndex + 1) % wordFrames.length;
    //     }, 400);
    //     try {
    //         const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=value&key=eq.word`, {
    //             headers: {
    //                 apikey: SUPABASE_API_KEY,
    //                 Authorization: `Bearer ${SUPABASE_API_KEY}`,
    //             },
    //         });
    //         const data = await res.json();
    //         clearInterval(wordInterval);
    //         wordInterval = null;
    //         const loadedWord = data && data[0] ? data[0].value : 'WORD';
    //         highlight.textContent = loadedWord;
    //         if (highlightMobile) highlightMobile.textContent = loadedWord;
    //     } catch (e) {
    //         // Animation continues
    //     }
    // }
    // async function saveWord(newWord) {
    //     try {
    //         await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?key=eq.word`, {
    //             method: 'PATCH',
    //             headers: {
    //                 apikey: SUPABASE_API_KEY,
    //                 Authorization: `Bearer ${SUPABASE_API_KEY}`,
    //                 'Content-Type': 'application/json',
    //                 Prefer: 'return=representation',
    //             },
    //             body: JSON.stringify({ value: newWord }),
    //         });
    //     } catch (e) {}
    // }
    // ===================== END LOCAL MODE =====================

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
    // fetchWord();

    // Mint-Button Funktionalität
    const mintBtn = document.querySelector('.mint-btn');
    const mintBar = document.querySelector('.mint-bar');
    let mintInfoBox = null;
    let mintClicked = false;
    let lastMintedWord = null;

    mintBtn.addEventListener('click', async () => {
        if (!isConnected) {
            openModal();
        } else {
            // --- Mint-Logik: Hole Toggle und Wort, führe Mint aus ---
            const isBest = (toggleText.textContent.trim().toLowerCase() === 'best');
            const word = highlight.textContent.trim();
            await mintExpression(isBest, word);
        }
    });

    // Zentrale Validierungsfunktion für das Highlight-Wort
    async function validateWord(word) {
        const trimmed = word.trim().toUpperCase();
        if (trimmed.length === 0) {
            return { valid: false, reason: 'empty' };
        }
        if (!/^[A-ZÄÖÜß]+$/.test(trimmed)) {
            return { valid: false, reason: 'invalid_chars' };
        }
        // Prüfe, ob das Wort bereits existiert (API-Call)
        // try {
        //     const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=value&key=eq.word`, {
        //         headers: {
        //             apikey: SUPABASE_API_KEY,
        //             Authorization: `Bearer ${SUPABASE_API_KEY}`,
        //         },
        //     });
        //     const data = await res.json();
        //     if (data && data[0] && data[0].value === trimmed) {
        //         return { valid: false, reason: 'exists' };
        //     }
        // } catch (e) {}
        return { valid: true };
    }

    // Edit/Save functionality for Desktop
    editBtn.addEventListener('click', async () => {
        if (!isEditing) {
            isEditing = true;
            editIcon.innerHTML = saveSVG;
            input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 8;
            input.className = 'edit-input';
            input.value = '';
            input.placeholder = 'insert word';
            input.setAttribute('aria-label', 'Edit word');
            input.style.textTransform = 'uppercase';
            highlight.style.display = 'none';
            highlight.parentNode.insertBefore(input, editBtn);
            input.focus();
            input.addEventListener('input', () => {
                input.value = input.value.replace(/[^a-zA-ZäöüÄÖÜß]/g, '').toUpperCase();
            });
            input.addEventListener('keydown', async (e) => {
                if (e.key === 'Enter') {
                    await saveEditInput();
                }
            });
            input.addEventListener('blur', async () => {
                await saveEditInput();
            });
        }
        async function saveEditInput() {
            let newWord = input.value.trim().toUpperCase();
            const validation = await validateWord(newWord);
            if (!validation.valid) {
                highlight.style.display = '';
                highlight.textContent = 'ʕ◔ϖ◔ʔ';
                mintBtn.disabled = true;
                mintBtn.classList.add('mint-disabled');
                if (mintInfoBox) {
                    mintBar.removeChild(mintInfoBox);
                    mintInfoBox = null;
                }
                mintInfoBox = document.createElement('div');
                mintInfoBox.className = 'mint-info-box';
                let reasonText = 'INVALID';
                if (validation.reason === 'empty') reasonText = 'INVALID';
                if (validation.reason === 'invalid_chars') reasonText = 'INVALID CHARS';
                if (validation.reason === 'exists') reasonText = 'ALREADY EXISTS';
                mintInfoBox.innerHTML = `<div>word</div><div>is</div><div><span class="highlight info-highlight">${reasonText}</span></div>`;
                mintBar.appendChild(mintInfoBox);
                mintBtn.classList.add('mint-strikethrough');
            } else {
                highlight.textContent = newWord;
                // await saveWord(newWord);
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
            input.classList.add('hide');
            input.addEventListener('transitionend', function handler() {
                if (input && input.parentNode) input.parentNode.removeChild(input);
                highlight.style.display = '';
                input.removeEventListener('transitionend', handler);
            });
            editIcon.innerHTML = editSVG;
            isEditing = false;
        }
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
        }, 350); // Animation duration + buffer
    }

    function startWiggleLoop() {
        triggerWiggle(toggleButton);
        setTimeout(() => {
            triggerWiggle(editBtn);
            setTimeout(startWiggleLoop, 5250); // 5.25s pause, then repeat
        }, 2250);
    }
    setTimeout(startWiggleLoop, 1000); // Start after 1s page load

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
                inputMobile = document.createElement('input');
                inputMobile.type = 'text';
                inputMobile.maxLength = 8;
                inputMobile.className = 'edit-input';
                inputMobile.value = '';
                inputMobile.placeholder = 'insert word';
                inputMobile.setAttribute('aria-label', 'Edit word');
                inputMobile.style.textTransform = 'uppercase';
                highlightMobile.style.display = 'none';
                highlightMobile.parentNode.insertBefore(inputMobile, editBtnMobile);
                inputMobile.focus();
                inputMobile.addEventListener('input', () => {
                    inputMobile.value = inputMobile.value.replace(/[^a-zA-ZäöüÄÖÜß]/g, '').toUpperCase();
                });
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
                const validation = await validateWord(newWord);
                if (!validation.valid) {
                    syncHighlightWord('ʕ◔ϖ◔ʔ');
                    mintBtn.disabled = true;
                    mintBtn.classList.add('mint-disabled');
                    if (mintInfoBox) {
                        mintBar.removeChild(mintInfoBox);
                        mintInfoBox = null;
                    }
                    mintInfoBox = document.createElement('div');
                    mintInfoBox.className = 'mint-info-box';
                    let reasonText = 'INVALID';
                    if (validation.reason === 'empty') reasonText = 'INVALID';
                    if (validation.reason === 'invalid_chars') reasonText = 'INVALID CHARS';
                    if (validation.reason === 'exists') reasonText = 'ALREADY EXISTS';
                    mintInfoBox.innerHTML = `<div>word</div><div>is</div><div><span class=\"highlight info-highlight\">${reasonText}</span></div>`;
                    mintBar.appendChild(mintInfoBox);
                    mintBtn.classList.add('mint-strikethrough');
                } else {
                    syncHighlightWord(newWord);
                    // await saveWord(newWord);
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
                inputMobile.classList.add('hide');
                setTimeout(() => {
                    if (inputMobile && inputMobile.parentNode) inputMobile.parentNode.removeChild(inputMobile);
                    highlightMobile.style.display = '';
                }, 300);
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
    // fetchCounter();
    // fetchWord();

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
                if (error && (error.code === 4001 || error.message?.includes('User rejected'))) {
                    walletStatus.textContent = 'Connection cancelled. Please try again.';
                } else {
                    console.error('Error connecting to wallet:', error);
                    walletStatus.textContent = 'Please install an EVM-compatible wallet!';
                }
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

    async function checkInitialWalletConnection() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                if (accounts.length > 0 && chainId === BASE_SEPOLIA_PARAMS.chainId) {
                    isConnected = true;
                    currentAccount = accounts[0];
                    mintBtn.textContent = 'MINT';
                } else {
                    isConnected = false;
                    currentAccount = null;
                    mintBtn.textContent = 'CONNECT';
                }
            } catch (e) {
                // Ignorieren
            }
        }
    }

    checkInitialWalletConnection();

    // --- WordOfChoice Contract Integration ---

    // 1. Contract address
    const contractAddress = "0xD8d4871716884B4846457618627E514f1a2355c6";

    // 2. Contract ABI (only relevant functions)
    const contractABI = [
        {
            "inputs": [
                { "internalType": "bool", "name": "isBest", "type": "bool" },
                { "internalType": "string", "name": "word", "type": "string" }
            ],
            "name": "mintExpression",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
            ],
            "name": "tokenURI",
            "outputs": [
                { "internalType": "string", "name": "", "type": "string" }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    // 3. Mint-Funktion
    async function mintExpression(isBest, word) {
        if (!window.ethereum) {
            alert("Bitte installiere MetaMask!");
            return;
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
        );
        const value = ethers.parseEther("0.001");
        try {
            const tx = await contract.mintExpression(isBest, word, { value });
            await tx.wait();
            alert("NFT successfully minted!");
        } catch (err) {
            alert("Error minting: " + (err.info?.error?.message || err.message));
        }
    }

    // 4. Event Listener for UI Elements
    window.addEventListener('DOMContentLoaded', function() {
        const mintButton = document.getElementById("mintButton");
        if (!mintButton) return;
        mintButton.onclick = async function() {
            // Toggle: checked = best, unchecked = worst
            const isBest = document.getElementById("toggleBestWorst").checked;
            const word = document.getElementById("inputWord").value;
            if (!word || word.length === 0) {
                alert("Bitte gib ein Wort ein!");
                return;
            }
            await mintExpression(isBest, word);
        };
    });
    // --- Ende Integration ---

    // Platzhalter für Counter und Wort (ohne Supabase)
    function fetchCounterPlaceholder() {
        clearInterval(loadingInterval);
        count = 1; // Default
        counter.textContent = `#${count}`;
    }
    function fetchWordPlaceholder() {
        if (wordInterval) clearInterval(wordInterval);
        highlight.textContent = 'WORD';
        if (highlightMobile) highlightMobile.textContent = 'WORD';
    }
    fetchCounterPlaceholder();
    fetchWordPlaceholder();
}); 