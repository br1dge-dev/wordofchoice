document.addEventListener('DOMContentLoaded', () => {
    // Zentrale Validierungslogik
    const ValidationState = {
        VALID: 'valid',
        INVALID: 'invalid',
        EMPTY: 'empty',
        INVALID_CHARS: 'invalid_chars',
        WORD_EXISTS: 'word_exists'
    };

    const ValidationFeedback = {
        [ValidationState.VALID]: { text: '', valid: true },
        [ValidationState.INVALID]: { text: 'INVALID', valid: false },
        [ValidationState.EMPTY]: { text: 'EMPTY', valid: false },
        [ValidationState.INVALID_CHARS]: { text: 'INVALID CHARS', valid: false },
        [ValidationState.WORD_EXISTS]: { text: 'GONE', valid: false }
    };

    // Zentrale Validierungsfunktion
    async function validateInput(word) {
        const trimmed = word.trim().toUpperCase();
        
        // Empty input
        if (trimmed.length === 0) {
            return { state: ValidationState.EMPTY, feedback: ValidationFeedback[ValidationState.EMPTY] };
        }

        // Invalid characters (only A-Z, no ÄÖÜß)
        if (!/^[A-Z]+$/.test(trimmed)) {
            return { state: ValidationState.INVALID_CHARS, feedback: ValidationFeedback[ValidationState.INVALID_CHARS] };
        }

        // Too long
        if (trimmed.length > 8) {
            return { state: ValidationState.INVALID, feedback: { text: 'TOO LONG', valid: false } };
        }

        // Word already exists
        try {
            const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
            const contract = new ethers.Contract(contractAddress, contractABI, provider);
            const exists = await contract.usedWords(trimmed);
            if (exists) {
                return { state: ValidationState.WORD_EXISTS, feedback: ValidationFeedback[ValidationState.WORD_EXISTS] };
            }
        } catch (e) {
            console.error('Error checking usedWords:', e);
            return { state: ValidationState.INVALID, feedback: ValidationFeedback[ValidationState.INVALID] };
        }

        // All valid
        return { state: ValidationState.VALID, feedback: ValidationFeedback[ValidationState.VALID] };
    }

    // UI Update Funktion für Validierungsfeedback
    function updateValidationUI(validationResult) {
        const { feedback } = validationResult;
        
        // Button-Text prüfen
        const isMint = mintBtn.textContent.trim().toUpperCase() === 'MINT';
        // Update Mint Button
        if (isMint) {
            mintBtn.disabled = !feedback.valid;
            if (feedback.valid) {
                mintBtn.classList.remove('mint-disabled', 'mint-strikethrough');
            } else {
                mintBtn.classList.add('mint-disabled', 'mint-strikethrough');
            }
        } else {
            // CONNECT darf nie deaktiviert oder durchgestrichen sein
            mintBtn.disabled = false;
            mintBtn.classList.remove('mint-disabled', 'mint-strikethrough');
        }

        // Update Info Box
        if (mintInfoBox) {
            mintBar.removeChild(mintInfoBox);
            mintInfoBox = null;
        }
        if (!feedback.valid && isMint) {
            mintInfoBox = document.createElement('div');
            mintInfoBox.className = 'mint-info-box';
            mintInfoBox.innerHTML = `
                <div>word</div>
                <div>is</div>
                <div><span class="highlight info-highlight">${feedback.text}</span></div>
            `;
            mintBar.appendChild(mintInfoBox);
        }
    }

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

    // Initial State merken
    let initialTendency = null;
    let initialExpression = null;
    let isIdle = false;
    function startIdleCounter() {
        if (loadingInterval) clearInterval(loadingInterval);
        isIdle = true;
        loadingInterval = setInterval(() => {
            counter.textContent = '#' + animalFrames[animalIndex];
            animalIndex = (animalIndex + 1) % animalFrames.length;
        }, 400);
    }
    function stopIdleCounter(tokenId) {
        if (loadingInterval) clearInterval(loadingInterval);
        isIdle = false;
        counter.textContent = `#${tokenId}`;
    }

    // Toggle dark/light mode
    toggleButton.addEventListener('click', () => {
        // Strikethrough animation for the fading word
        toggleText.classList.add('strikethrough');
        setTimeout(() => {
            // Theme-Logik: 'worst' = dark (kein toggled), 'best' = light (toggled)
            if (toggleText.textContent === 'worst') {
                toggleText.textContent = 'best';
                body.classList.add('toggled');
            } else {
                toggleText.textContent = 'worst';
                body.classList.remove('toggled');
            }
            // If in edit mode, also toggle the value in the input field
            if (isEditing && input) {
                if (input.value.trim().toUpperCase() === 'WORST') {
                    input.value = 'BEST';
                } else if (input.value.trim().toUpperCase() === 'BEST') {
                    input.value = 'WORST';
                }
            } else {
                // Toggle highlight word if not in edit mode
                if (highlight.textContent.trim().toUpperCase() === 'WORST') {
                    highlight.textContent = 'BEST';
                } else if (highlight.textContent.trim().toUpperCase() === 'BEST') {
                    highlight.textContent = 'WORST';
                }
            }
            toggleText.classList.remove('strikethrough');
        }, 300);
    });

    // Global highlight word loader
    let wordInterval = null;

    // Mint button functionality
    const mintBtn = document.querySelector('.mint-btn');
    const mintBar = document.querySelector('.mint-bar');
    let mintInfoBox = null;
    let mintClicked = false;
    let lastMintedWord = null;
    let isMinting = false;

    // --- Confirmation Modal ---
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmationSentence = document.getElementById('confirmationSentence');
    const confirmationPrice = document.getElementById('confirmationPrice');
    const confirmMintBtn = document.getElementById('confirmMintBtn');
    const cancelMintBtn = document.getElementById('cancelMintBtn');
    const closeConfirmation = document.getElementById('closeConfirmation');
    let pendingMint = null;

    function openConfirmationModal(sentence, price, mintParams) {
        confirmationSentence.textContent = sentence;
        confirmationPrice.textContent = price;
        confirmationModal.style.display = 'flex';
        pendingMint = mintParams;
    }
    function closeConfirmationModal() {
        confirmationModal.style.display = 'none';
        pendingMint = null;
    }
    closeConfirmation.addEventListener('click', closeConfirmationModal);
    cancelMintBtn.addEventListener('click', closeConfirmationModal);
    window.addEventListener('click', (event) => {
        if (event.target === confirmationModal) {
            closeConfirmationModal();
        }
    });
    confirmMintBtn.addEventListener('click', async () => {
        if (pendingMint) {
            // Werte merken, bevor das Modal geschlossen wird
            const mintParams = pendingMint;
            closeConfirmationModal(); // Modal schließen, pendingMint wird auf null gesetzt
            isMinting = true;

            // Starte Animationen
            startIdleCounter();
            let expressionInterval = setInterval(() => {
                if (highlight) highlight.textContent = animalFrames[animalIndex];
                if (highlightMobile) highlightMobile.textContent = animalFrames[animalIndex];
            }, 400);

            try {
                // Mint durchführen (inkl. Wallet-Interaktion)
                await mintExpression(mintParams.isBest, mintParams.word);

                // Nach erfolgreicher Bestätigung: Neue Werte anzeigen
                clearInterval(expressionInterval);
                isMinting = false;
                await fetchAndDisplayLatestTokenInfo();
            } catch (error) {
                clearInterval(expressionInterval);
                isMinting = false;
                console.error('Mint failed:', error);
            }
        }
    });

    // --- Mint button functionality (adapted) ---
    mintBtn.addEventListener('click', async () => {
        if (!isConnected) {
            openModal();
        } else {
            const isBest = (toggleText.textContent.trim().toLowerCase() === 'best');
            const word = highlight.textContent.trim();
            // Satz immer zweizeilig
            const headline = isBest ? 'The best thing in' : 'The worst thing in';
            const sentence = `${headline}\nlife is ${word}`;
            const price = '0.01';
            openConfirmationModal(sentence, price, { isBest, word });
        }
    });

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
            input.addEventListener('input', async () => {
                input.value = input.value.replace(/[^a-zA-ZäöüÄÖÜß]/g, '').toUpperCase();
                // Live-Validierung
                const validation = await validateInput(input.value);
                updateValidationUI(validation);
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
            const validation = await validateInput(newWord);
            if (!validation.feedback.valid) {
                highlight.style.display = '';
                if (validation.state === ValidationState.EMPTY) {
                    highlight.textContent = 'ʕ◔ϖ◔ʔ';
                } else {
                    highlight.textContent = newWord || 'ʕ◔ϖ◔ʔ';
                }
                updateValidationUI(validation);
            } else {
                highlight.textContent = newWord;
                mintClicked = false;
                lastMintedWord = null;
                updateValidationUI(validation);
            }
            // Entferne das Input-Feld komplett aus dem DOM
            if (input && input.parentNode) {
                input.parentNode.removeChild(input);
            }
            highlight.style.display = '';
            isEditing = false;
            setTimeout(() => {
                if (!isIdle && !isInitialState()) startIdleCounter();
                else if (isIdle && isInitialState()) stopIdleCounter(counter.textContent.replace('#',''));
            }, 350);
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

    // Initial wallet check
    async function checkWalletConnection() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    currentAccount = accounts[0];
                    isConnected = true;
                    mintBtn.textContent = 'MINT';
                    walletStatus.textContent = `Connected: ${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
                }
            } catch (error) {
                console.error('Error checking wallet connection:', error);
            }
        }
    }

    // Call initial check
    checkWalletConnection();

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
            closeModalFunc();
        } else {
            // Account changed
            currentAccount = accounts[0];
            isConnected = true;
            mintBtn.textContent = 'MINT';
            walletStatus.textContent = `Connected: ${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
            closeModalFunc();
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
            isConnected = true;
            mintBtn.textContent = 'MINT';
            walletStatus.textContent = '';
            closeModalFunc();
        }
    }

    connectWalletBtn.addEventListener('click', connectWallet);

    // 1. Contract address
    const contractAddress = "0x5a71c6FB3E1b3Fdbd5dE156bff230EFB12D07a31";

    // 2. Contract ABI (only relevant functions)
    const contractABI = [
        {
            "inputs": [
                { "internalType": "bool", "name": "isBest", "type": "bool" },
                { "internalType": "string", "name": "word", "type": "string" }
            ],
            "name": "express",
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
        },
        {
            "inputs": [],
            "name": "nextTokenId",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        // Getter für usedWords
        {
            "inputs": [
                { "internalType": "string", "name": "", "type": "string" }
            ],
            "name": "usedWords",
            "outputs": [
                { "internalType": "bool", "name": "", "type": "bool" }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    // Direkt beim Pageload: Token ID, Tendency und Expression anzeigen
    fetchAndDisplayLatestTokenInfo();

    async function fetchAndDisplayLatestTokenInfo() {
        try {
            const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
            const contract = new ethers.Contract(contractAddress, contractABI, provider);
            
            // Clear existing interval
            if (loadingInterval) {
                clearInterval(loadingInterval);
            }

            // Get next token ID
            const nextId = await contract.nextTokenId();
            console.log('nextTokenId:', nextId.toString());
            // Update counter
            if (nextId === 1n) {
                counter.textContent = '#0';
                if (toggleText) toggleText.textContent = '?';
                if (highlight) highlight.textContent = 'CHOICE';
                initialTendency = '?';
                initialExpression = 'CHOICE';
                return;
            } else {
                counter.textContent = `#${(nextId - 1n).toString()}`;
            }

            // Get latest token data if exists
            if (nextId > 1n) {
                const lastTokenId = nextId - 1n;
                const tokenUri = await contract.tokenURI(lastTokenId);
                console.log('lastTokenId:', lastTokenId.toString());
                console.log('tokenUri:', tokenUri);
                const json = atob(tokenUri.split(",")[1]);
                const meta = JSON.parse(json);
                console.log('meta:', meta);
                // Extract attributes
                let tendency = null, expression = null;
                if (meta.attributes && Array.isArray(meta.attributes)) {
                    for (const attr of meta.attributes) {
                        if (attr.trait_type === 'Tendency') tendency = attr.value;
                        if (attr.trait_type === 'Expression') expression = attr.value;
                    }
                }
                // Update UI
                if (tendency && toggleText) toggleText.textContent = tendency;
                if (expression && highlight) highlight.textContent = expression;
                initialTendency = tendency;
                initialExpression = expression;
                // Theme-Synchronisierung
                if (tendency) {
                    if (tendency.toLowerCase() === 'best') {
                        document.body.classList.add('toggled');
                    } else {
                        document.body.classList.remove('toggled');
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching token info:', error);
            // Keep the loading animation if there's an error
            if (!loadingInterval) {
                loadingInterval = setInterval(() => {
                    counter.textContent = '#' + animalFrames[animalIndex];
                    animalIndex = (animalIndex + 1) % animalFrames.length;
                }, 400);
            }
        }
    }

    // --- WordOfChoice Contract Integration ---

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
        const value = ethers.parseEther("0.01");
        try {
            const tx = await contract.express(isBest, word, { value });
            await tx.wait();
            alert("NFT successfully minted!");
            await fetchAndDisplayLatestTokenInfo();
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

    // --- Mobile Headline Support ---
    const mobileHeadline = document.querySelector('.mobile-headline');
    const highlightMobile = document.getElementById('highlight-word-mobile');
    const editBtnMobile = document.getElementById('edit-btn-mobile');
    const editIconMobile = document.getElementById('edit-icon-mobile');
    const toggleTextMobile = mobileHeadline ? mobileHeadline.querySelector('.toggle-text') : null;
    const toggleButtonMobile = mobileHeadline ? mobileHeadline.querySelector('.toggle-button') : null;

    // Toggle-Button für Mobile
    if (toggleButtonMobile && toggleTextMobile) {
        toggleButtonMobile.addEventListener('click', () => {
            toggleTextMobile.classList.add('strikethrough');
            setTimeout(() => {
                if (toggleTextMobile.textContent === 'worst') {
                    toggleTextMobile.textContent = 'best';
                    body.classList.add('toggled');
                } else {
                    toggleTextMobile.textContent = 'worst';
                    body.classList.remove('toggled');
                }
                toggleTextMobile.classList.remove('strikethrough');
            }, 300);
        });
    }

    // Edit/Save für Mobile
    if (editBtnMobile && highlightMobile && editIconMobile) {
        editIconMobile.innerHTML = editSVG; // Immer initial das Edit-Icon setzen
        editBtnMobile.addEventListener('click', async () => {
            if (isEditing) return;
            isEditing = true;
            editIconMobile.innerHTML = saveSVG;
            input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 8;
            input.className = 'edit-input';
            input.value = '';
            input.placeholder = 'insert word';
            input.setAttribute('aria-label', 'Edit word');
            input.style.textTransform = 'uppercase';
            highlightMobile.style.display = 'none';
            // Füge das Input-Feld nach dem Highlight ein
            highlightMobile.parentNode.insertBefore(input, highlightMobile.nextSibling);
            input.focus();
            input.addEventListener('input', async () => {
                input.value = input.value.replace(/[^a-zA-ZäöüÄÖÜß]/g, '').toUpperCase();
                const validation = await validateInput(input.value);
                updateValidationUI(validation);
            });
            input.addEventListener('keydown', async (e) => {
                if (e.key === 'Enter') {
                    await saveEditInputMobile();
                }
            });
            input.addEventListener('blur', async () => {
                await saveEditInputMobile();
            });
        });
        async function saveEditInputMobile() {
            let newWord = input.value.trim().toUpperCase();
            const validation = await validateInput(newWord);
            if (!validation.feedback.valid) {
                highlightMobile.style.display = '';
                if (validation.state === ValidationState.EMPTY) {
                    highlightMobile.textContent = 'ʕ◔ϖ◔ʔ';
                } else {
                    highlightMobile.textContent = newWord || 'ʕ◔ϖ◔ʔ';
                }
                updateValidationUI(validation);
            } else {
                highlightMobile.textContent = newWord;
                mintClicked = false;
                lastMintedWord = null;
                updateValidationUI(validation);
            }
            if (input && input.parentNode) {
                input.parentNode.removeChild(input);
            }
            highlightMobile.style.display = '';
            editIconMobile.innerHTML = editSVG; // Nach dem Speichern wieder das Edit-Icon anzeigen
            isEditing = false;
            setTimeout(() => {
                if (!isIdle && !isInitialState()) startIdleCounter();
                else if (isIdle && isInitialState()) stopIdleCounter(counter.textContent.replace('#',''));
            }, 350);
        }
    }

    // --- Music Player ---
    const musicFolder = './music/';
    const tracks = [
        { file: 'Choice is Crunch.mp3', title: 'Choice is Crunch' },
        { file: 'WAHL is Choice.mp3', title: 'WAHL is Choice' },
        { file: 'Night Drive.mp3', title: 'Night Drive' },
        { file: 'I chose DANCE.mp3', title: 'I chose DANCE' },
        { file: 'I chose CHILL.mp3', title: 'I chose CHILL' },
        { file: 'Duh Duh Duh.mp3', title: 'Duh Duh Duh' }
    ];
    // 'Choice is Crunch' immer zuerst, Rest random
    function shuffle(array) {
        let arr = array.slice(1);
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return [array[0], ...arr];
    }
    const shuffledTracks = shuffle(tracks);
    let currentTrackIndex = 0;
    let audio = null;
    let isPlaying = false;
    let isLoading = false;
    let loadedTracks = [false]; // Initial: nichts geladen

    // Buttons
    const playPauseBtn = document.getElementById('play-pause');
    const playPauseIcon = document.getElementById('play-pause-icon');
    const prevBtn = document.getElementById('prev-track');
    const nextBtn = document.getElementById('next-track');

    const playerContainer = document.getElementById('music-player-container');
    function updatePlayPauseIcon() {
        if (isPlaying) {
            playPauseIcon.innerHTML = '⏸';
            playerContainer.classList.add('music-playing');
        } else {
            playPauseIcon.innerHTML = '▶';
            playerContainer.classList.remove('music-playing');
        }
    }
    // Initial: Kein Audio laden, erst bei Play
    function ensureAudioLoaded(idx) {
        if (!audio) {
            audio = new Audio();
            audio.volume = 0.85;
            audio.preload = 'auto';
            audio.addEventListener('ended', () => {
                let nextIdx = currentTrackIndex + 1;
                if (nextIdx >= shuffledTracks.length) nextIdx = 0;
                playTrack(nextIdx);
            });
            audio.addEventListener('play', () => {
                isPlaying = true;
                updatePlayPauseIcon();
            });
            audio.addEventListener('pause', () => {
                isPlaying = false;
                updatePlayPauseIcon();
            });
        }
        // src IMMER setzen, wenn nicht gesetzt oder falscher Track
        if (!audio.src || !audio.src.includes(encodeURIComponent(shuffledTracks[idx].file))) {
            audio.src = musicFolder + shuffledTracks[idx].file;
        }
        loadedTracks[idx] = true;
    }
    async function playTrack(idx) {
        if (idx < 0 || idx >= shuffledTracks.length) return;
        ensureAudioLoaded(idx);
        currentTrackIndex = idx;
        if (!audio.paused && !audio.ended) {
            audio.pause();
            audio.currentTime = 0;
        }
        isLoading = true;
        try {
            await audio.play();
            isPlaying = true;
        } catch (e) {
            isPlaying = false;
        }
        isLoading = false;
        updatePlayPauseIcon();
    }
    playPauseBtn.addEventListener('click', async () => {
        if (isLoading) return;
        if (!audio) {
            try {
                await playTrack(currentTrackIndex);
            } catch (e) {
                console.error('Fehler beim Starten des Players:', e);
            }
        } else if (isPlaying && !audio.paused) {
            audio.pause();
            isPlaying = false;
            updatePlayPauseIcon();
        } else if (!isPlaying || audio.paused) {
            try {
                await audio.play();
                isPlaying = true;
            } catch (e) {
                isPlaying = false;
                console.error('Fehler beim Abspielen:', e);
            }
            updatePlayPauseIcon();
        }
    });
    prevBtn.addEventListener('click', () => {
        let idx = currentTrackIndex - 1;
        if (idx < 0) idx = shuffledTracks.length - 1;
        playTrack(idx);
    });
    nextBtn.addEventListener('click', () => {
        let idx = currentTrackIndex + 1;
        if (idx >= shuffledTracks.length) idx = 0;
        playTrack(idx);
    });
    // Initial Icon
    updatePlayPauseIcon();

    // Player periodisch wigglen, wenn keine Musik läuft
    function triggerPlayerWiggle() {
        if (!isPlaying && playerContainer) {
            playerContainer.classList.add('wiggle');
            setTimeout(() => playerContainer.classList.remove('wiggle'), 450);
        }
    }
    setInterval(triggerPlayerWiggle, 2500);

    // Helper: Prüfe, ob aktueller Zustand initial ist
    function isInitialState() {
        return (toggleText && toggleText.textContent === initialTendency) && (highlight && highlight.textContent === initialExpression);
    }
    // Toggle-Button: Idle-Animation triggern
    toggleButton.addEventListener('click', () => {
        setTimeout(() => {
            if (!isIdle && !isInitialState()) startIdleCounter();
            else if (isIdle && isInitialState()) stopIdleCounter(counter.textContent.replace('#',''));
        }, 350);
    });
    // Edit-Button: Idle-Animation triggern
    editBtn.addEventListener('click', () => {
        setTimeout(() => {
            if (!isIdle && !isInitialState()) startIdleCounter();
            else if (isIdle && isInitialState()) stopIdleCounter(counter.textContent.replace('#',''));
        }, 350);
    });
}); 