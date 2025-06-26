document.addEventListener('DOMContentLoaded', () => {
    // --- Declare ALL DOM elements at the top ---
    const body = document.body;
    const toggleButton = document.querySelector('.toggle-button');
    const toggleText = document.querySelector('.toggle-text');
    const highlight = document.getElementById('highlight-word');
    const editBtn = document.getElementById('edit-btn');
    const editIcon = document.getElementById('edit-icon');
    const counter = document.getElementById('counter');
    const mintBtn = document.querySelector('.mint-btn');
    const mintBar = document.querySelector('.mint-bar');
    // Mobile elements
    const toggleButtonMobile = document.querySelector('.mobile-headline .toggle-button');
    const toggleTextMobile = document.querySelector('.mobile-headline .toggle-text');
    const highlightMobile = document.getElementById('highlight-word-mobile');
    const editBtnMobile = document.getElementById('edit-btn-mobile');
    const editIconMobile = document.getElementById('edit-icon-mobile');
    // Buttons array after all declarations
    const allButtons = [toggleButton, editBtn, mintBtn];
    if (toggleButtonMobile) allButtons.push(toggleButtonMobile);
    if (editBtnMobile) allButtons.push(editBtnMobile);

    // Central validation logic
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

    let usedWordsSet = new Set();

    // Central validation function
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

        // Word already exists - Optimierte Prüfung
        if (usedWordsSet.has(trimmed)) {
            // Sofortige UI-Aktualisierung
            updateValidationUI({ state: ValidationState.WORD_EXISTS, feedback: ValidationFeedback[ValidationState.WORD_EXISTS] });
            return { state: ValidationState.WORD_EXISTS, feedback: ValidationFeedback[ValidationState.WORD_EXISTS] };
        }

        // All valid
        return { state: ValidationState.VALID, feedback: ValidationFeedback[ValidationState.VALID] };
    }

    // UI update function for validation feedback
    function updateValidationUI(validationResult) {
        const { feedback } = validationResult;
        
        // Check button text
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
            // CONNECT must never be disabled or strikethrough
            mintBtn.disabled = false;
            mintBtn.classList.remove('mint-disabled', 'mint-strikethrough');
        }

        // Update Info Box - Optimierte Aktualisierung
        if (mintInfoBox) {
            if (mintBar.contains(mintInfoBox)) {
                mintBar.removeChild(mintInfoBox);
            }
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
            // Sofortiges Hinzufügen zur UI
            requestAnimationFrame(() => {
                mintBar.appendChild(mintInfoBox);
            });
        }
    }

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

    const editSVG = `<svg id=\"edit-svg\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"48\" height=\"48\" fill=\"currentColor\"><path d=\"M20 12H7M11 8l-4 4 4 4\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/></svg>`;
    const saveSVG = `<svg id=\"save-svg\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"48\" height=\"48\" fill=\"currentColor\"><rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><rect x=\"8\" y=\"16\" width=\"8\" height=\"2\" fill=\"currentColor\"/><rect x=\"8\" y=\"8\" width=\"8\" height=\"6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/></svg>`;

    // Initial state variables
    let initialTendency = null;
    let initialExpression = null;
    let isIdle = false;
    let loadingInterval = null; // Idle interval for counter declared globally
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

    // Helper function to get nextTokenId from contract and set counter
    async function showNextTokenIdPlusOne() {
        counter.innerHTML = '<span class="counter-hash">#</span><span class="counter-arrow"><svg class="counter-arrow-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none"><path d="M20 12H7M11 8l-4 4 4 4" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
    }

    // --- Central validation and UI update logic for both Desktop and Mobile ---
    function validateAndUpdateUI(expression) {
        validateInput(expression).then(validationResult => {
            updateValidationUI(validationResult);
            // Update both highlights
            if (highlight) highlight.textContent = expression;
            if (highlightMobile) highlightMobile.textContent = expression;
        });
    }

    // --- Set Edit-Icon for Desktop and Mobile (identical, no rotation needed anymore) ---
    function setEditIcons() {
        if (editIcon) {
            editIcon.innerHTML = editSVG;
        }
        if (editIconMobile) {
            editIconMobile.innerHTML = editSVG;
        }
    }
    setEditIcons();
    window.addEventListener('resize', setEditIcons);
    window.addEventListener('orientationchange', setEditIcons);

    // --- Make highlight boxes clickable ---
    function setupHighlightClickHandlers() {
        // Desktop highlight click handler
        if (highlight) {
            highlight.style.cursor = 'pointer';
            highlight.addEventListener('click', () => {
                if (!isEditing && editBtn) {
                    editBtn.click();
                }
            });
        }
        
        // Mobile highlight click handler
        if (highlightMobile) {
            highlightMobile.style.cursor = 'pointer';
            highlightMobile.addEventListener('click', () => {
                if (!isEditing && editBtnMobile) {
                    editBtnMobile.click();
                }
            });
        }
    }
    setupHighlightClickHandlers();

    // --- Edit/Save functionality for Desktop and Mobile ---
    function setupEditButton(btn, icon, isMobile) {
        if (!btn) return;
        btn.addEventListener('click', async () => {
            if (!isEditing) {
                isEditing = true;
                icon.innerHTML = saveSVG;
                input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 8;
                input.className = 'edit-input';
                input.value = '';
                input.placeholder = 'insert word';
                input.setAttribute('aria-label', 'Edit word');
                input.style.textTransform = 'uppercase';
                if (isMobile) {
                    highlightMobile.style.display = 'none';
                    highlightMobile.parentNode.insertBefore(input, btn);
                } else {
                    highlight.style.display = 'none';
                    highlight.parentNode.insertBefore(input, btn);
                }
                input.focus();
                showNextTokenIdPlusOne();
                input.addEventListener('input', async () => {
                    input.value = input.value.replace(/[^a-zA-ZäöüÄÖÜß]/g, '').toUpperCase();
                    validateAndUpdateUI(input.value);
                });
                input.addEventListener('keydown', async (e) => {
                    if (e.key === 'Enter') {
                        await saveEditInput();
                    }
                });
                input.addEventListener('blur', async () => {
                    await saveEditInput();
                });
            } else {
                // When in edit mode and button is clicked
                await saveEditInput();
            }
            async function saveEditInput() {
                let newWord = input.value.trim().toUpperCase();
                const validation = await validateInput(newWord);
                
                // Remove input field first
                if (input && input.parentNode) {
                    input.parentNode.removeChild(input);
                }
                
                // Restore display
                if (isMobile) highlightMobile.style.display = '';
                else highlight.style.display = '';
                
                // Update text based on validation
                if (!validation.feedback.valid) {
                    if (validation.state === ValidationState.EMPTY) {
                        if (isMobile) highlightMobile.textContent = 'EMPTY';
                        else highlight.textContent = 'EMPTY';
                    } else {
                        if (isMobile) highlightMobile.textContent = newWord || 'ʕ◔ϖ◔ʔ';
                        else highlight.textContent = newWord || 'ʕ◔ϖ◔ʔ';
                    }
                } else {
                    if (isMobile) highlightMobile.textContent = newWord;
                    else highlight.textContent = newWord;
                    mintClicked = false;
                    lastMintedWord = null;
                }
                
                updateValidationUI(validation);
                isEditing = false;
                icon.innerHTML = editSVG; // Reset to edit icon
            }
        });
    }
    setupEditButton(editBtn, editIcon, false);
    setupEditButton(editBtnMobile, editIconMobile, true);

    // --- Toggle button logic for Desktop and Mobile ---
    function setupToggleButton(btn, textEl, isMobile) {
        if (!btn) return;
        btn.addEventListener('click', () => {
            textEl.classList.add('strikethrough');
            setTimeout(() => {
                let newState;
                if (textEl.textContent === 'worst') {
                    newState = 'best';
                    body.classList.add('toggled');
                } else {
                    newState = 'worst';
                    body.classList.remove('toggled');
                }
                // Synchronize both toggle text elements
                if (toggleText) toggleText.textContent = newState;
                if (toggleTextMobile) toggleTextMobile.textContent = newState;
                showNextTokenIdPlusOne();
                textEl.classList.remove('strikethrough');
                // After toggle: validate both highlights
                if (highlight) validateAndUpdateUI(highlight.textContent);
                if (highlightMobile) validateAndUpdateUI(highlightMobile.textContent);
            }, 300);
        });
    }
    setupToggleButton(toggleButton, toggleText, false);
    setupToggleButton(toggleButtonMobile, toggleTextMobile, true);

    // --- After every UI update: synchronize and validate both highlights ---
    function updateUIWithTokenInfo(tokenInfo) {
        if (!tokenInfo) return;
        const { tokenId, tendency, expression } = tokenInfo;
        counter.textContent = `#${tokenId}`;
        if (toggleText) toggleText.textContent = tendency;
        if (toggleTextMobile) toggleTextMobile.textContent = tendency;
        if (highlight) highlight.textContent = expression;
        if (highlightMobile) highlightMobile.textContent = expression;
        initialTendency = tendency;
        initialExpression = expression;
        if (tendency) {
            if (tendency.toLowerCase() === 'best') {
                document.body.classList.add('toggled');
            } else {
                document.body.classList.remove('toggled');
            }
        }
        if (tokenId !== undefined) {
            stopIdleCounter(tokenId);
        }
        // Validation for both highlights
        if (mintBtn.textContent.trim().toUpperCase() === 'MINT') {
            if (highlight) validateAndUpdateUI(expression);
            if (highlightMobile) validateAndUpdateUI(expression);
        }
        // Immediately update marquee
        updateExpressionsMarquee();
    }

    // Global highlight word loader
    let wordInterval = null;

    // Mint button functionality
    let mintInfoBox = null;
    let mintClicked = false;
    let lastMintedWord = null;
    let isMinting = false;

    // --- Confirmation Modal ---
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmMintBtn = document.getElementById('confirmMintBtn');
    const closeConfirmation = document.getElementById('closeConfirmation');
    let pendingMint = null;

    function openConfirmationModal(sentence, price, mintParams) {
        // SVG Preview erzeugen
        const svg = generateSVGPreview(mintParams.isBest, mintParams.word);
        const previewDiv = document.getElementById('confirmationSVGPreview');
        previewDiv.innerHTML = svg;
        previewDiv.firstChild.style.maxWidth = '280px';
        previewDiv.firstChild.style.width = '70%';
        previewDiv.firstChild.style.height = 'auto';
        // Preis-Block entfernen
        const priceBox = document.getElementById('confirmationPriceBox');
        if (priceBox) priceBox.style.display = 'none';
        // Confirm-Button umbenennen und größer machen
        const confirmBtn = document.getElementById('confirmMintBtn');
        if (confirmBtn) {
            confirmBtn.textContent = 'Mint for 0.0069 Ξ';
            confirmBtn.style.fontSize = '1.35em';
            confirmBtn.style.padding = '0.45em 0.7em';
        }
        confirmationModal.style.display = 'flex';
        pendingMint = mintParams;
    }

    // SVG-Preview-Generator (angepasst an Smart Contract Logik)
    function generateSVGPreview(isBest, word) {
        const colorBg = isBest ? '#F5E9D4' : '#2C241B';
        const colorFg = isBest ? '#2C241B' : '#F5E9D4';
        const headline = isBest ? 'The best thing in' : 'The worst thing in';
        // Counter-Box und Unterstreichung wie im echten NFT
        return `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 500 500' style='border-radius:24px;'>
          <rect width='500' height='500' fill='${colorBg}'/>
          <rect x='24' y='24' width='100' height='40' rx='11' fill='${colorFg}'/>
          <text x='74' y='48' font-size='28' fill='${colorBg}' font-family='Arial, sans-serif' font-weight='bold' text-anchor='middle' dominant-baseline='middle'>#?</text>
          <text x='250' y='220' font-size='40' fill='${colorFg}' font-family='Arial, sans-serif' font-weight='bold' text-anchor='middle'>${headline}</text>
          <g>
            <text x='130' y='312' font-size='40' fill='${colorFg}' font-family='Arial, sans-serif' font-weight='bold' text-anchor='end'>
              <tspan font-weight='bold' text-decoration='underline'>life</tspan> is
            </text>
            <rect x='135' y='266' width='350' height='64' rx='11' fill='${colorFg}'/>
            <text x='310' y='298' font-size='56' fill='${colorBg}' font-family='Arial, sans-serif' font-weight='bold' text-anchor='middle' dominant-baseline='middle'>${word}</text>
          </g>
        </svg>`;
    }

    function closeConfirmationModal() {
        confirmationModal.style.display = 'none';
        pendingMint = null;
    }
    closeConfirmation.addEventListener('click', closeConfirmationModal);
    window.addEventListener('click', (event) => {
        if (event.target === confirmationModal) {
            closeConfirmationModal();
        }
    });
    confirmMintBtn.addEventListener('click', async () => {
        if (pendingMint) {
            // Store values before closing modal
            const mintParams = pendingMint;
            closeConfirmationModal(); // Close modal, pendingMint is set to null
            isMinting = true;

            // Start animations
            startIdleCounter();
            let expressionInterval = setInterval(() => {
                if (highlight) highlight.textContent = animalFrames[animalIndex];
                if (highlightMobile) highlightMobile.textContent = animalFrames[animalIndex];
            }, 400);

            try {
                // Mint process (including wallet interaction)
                await mintExpression(mintParams.isBest, mintParams.word);

                // After successful confirmation: show new values
                clearInterval(expressionInterval);
                isMinting = false;
                const tokenInfo = await fetchLatestTokenInfo();
                updateUIWithTokenInfo(tokenInfo);
                // --- Guaranteed stop of idle animation after mint ---
                if (tokenInfo && tokenInfo.tokenId !== undefined) {
                    stopIdleCounter(tokenInfo.tokenId);
                }
            } catch (error) {
                clearInterval(expressionInterval);
                isMinting = false;
                console.error('Mint failed:', error);
            }
        }
    });

    // --- Mint button functionality (adapted) ---
    mintBtn.addEventListener('click', async () => {
        if (mintBtn.disabled) return;
        const word = highlight.textContent.trim();
        // Synchronously check if the word is already taken
        const validationResult = await validateInput(word);
        if (validationResult.state === 'WORD_EXISTS') {
            updateValidationUI(validationResult);
            return; // Do NOT open modal
        }
        if (!isConnected) {
            openModal();
        } else {
            const isBest = (toggleText.textContent.trim().toLowerCase() === 'best');
            // Sentence always two lines
            const headline = isBest ? 'The best thing in' : 'The worst thing in';
            const sentence = `${headline}\nlife is ${word}`;
            const price = '0.0069';
            openConfirmationModal(sentence, price, { isBest, word });
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

    // BASE Sepolia Testnet data
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
                // Check network
                let chainId = await window.ethereum.request({ method: 'eth_chainId' });
                if (chainId !== BASE_SEPOLIA_PARAMS.chainId) {
                    // Try automatic switch
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
                // --- NEW: After successful connect, validate current expression ---
                const validationResult = await validateInput(highlight.textContent);
                updateValidationUI(validationResult);
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

    // Contract address (Sepolia, Stand Januar 2025)
    const CONTRACT_ADDRESS = "0x58c8fE3763872757c78929a125c9125a1fFef85A";

    // Contract ABI (nur relevante Funktionen)
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
        // Getter for usedWords
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
        },
        "function getExpressionsInRange(uint256 start, uint256 end) public view returns (tuple(bool isBest, string word, uint256 timestamp)[] memory, uint256[] memory)",
    ];

    // Optimierte Aktualisierung der usedWordsSet
    async function fetchAllExpressionsBatched(batchSize = 200) {
        const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
        const allExpressions = [];
        const allIds = [];
        const nextTokenId = await contract.nextTokenId();
        
        // Optimierte Batch-Verarbeitung
        const batches = [];
        for (let start = 1n; start < nextTokenId; start += BigInt(batchSize)) {
            let end = nextTokenId - 1n;
            if (start + BigInt(batchSize) - 1n < end) {
                end = start + BigInt(batchSize) - 1n;
            }
            batches.push([start, end]);
        }
        
        // Parallele Verarbeitung der Batches
        const results = await Promise.all(
            batches.map(([start, end]) => contract.getExpressionsInRange(start, end))
        );
        
        results.forEach(([expressions, ids]) => {
            allExpressions.push(...expressions);
            allIds.push(...ids);
        });
        
        // Sofortige Aktualisierung des usedWordsSet
        const newUsedWordsSet = new Set(allExpressions.map(expr => (expr.word || expr[1] || '').toUpperCase()));
        usedWordsSet = newUsedWordsSet;
        
        return allExpressions.map((expr, i) => ({
            ...expr,
            tokenId: Number(allIds[i])
        }));
    }

    // Pause-Funktion für Benutzerinteraktionen
    let isPaused = false;
    let pauseTimeout = null;
    let updateInterval = null;

    function pauseInteractions() {
        isPaused = true;
        if (pauseTimeout) clearTimeout(pauseTimeout);
        if (updateInterval) clearInterval(updateInterval);
        
        pauseTimeout = setTimeout(() => {
            isPaused = false;
            // Restart interval after pause
            startUpdateInterval();
        }, 20000); // 20 seconds pause
    }

    function startUpdateInterval() {
        if (updateInterval) clearInterval(updateInterval);
        updateInterval = setInterval(async () => {
            if (!isPaused) {
                // Aktualisiere alle dynamischen Elemente
                const tokenInfo = await fetchLatestTokenInfo();
                updateUIWithTokenInfo(tokenInfo);
                updateExpressionsMarquee();
            }
        }, 10000); // Alle 10 Sekunden aktualisieren
    }

    // Event-Listener für Benutzerinteraktionen
    document.addEventListener('mousemove', pauseInteractions);
    document.addEventListener('click', pauseInteractions);
    document.addEventListener('keydown', pauseInteractions);
    document.addEventListener('touchstart', pauseInteractions);

    // Modifiziere updateExpressionsMarquee um Pause zu berücksichtigen
    async function updateExpressionsMarquee() {
        if (isPaused) return;
        const expressions = await fetchAllExpressionsBatched();
        const marqueeContent = document.querySelector('.expressions-content');
        const marqueeContainer = document.querySelector('.expressions-marquee');
        if (marqueeContent && expressions.length > 0 && marqueeContainer) {
            const wordHTML = expressions.map(expr => 
                `<span>${expr.word || expr[1] || expr.expression || JSON.stringify(expr)}</span>`
            ).join('<span class="dot">&nbsp;&middot;&nbsp;</span>');
            marqueeContent.innerHTML = wordHTML;
            let repeat = 1;
            while (marqueeContent.scrollWidth < marqueeContainer.offsetWidth * 2.5 && repeat < 30) {
                marqueeContent.innerHTML += wordHTML;
                repeat++;
            }
        }
    }

    // Initialisiere das Update-Intervall
    startUpdateInterval();

    // Update marquee on load
    updateExpressionsMarquee();

    // React to toggle change (central state)
    const observer = new MutationObserver(() => updateExpressionsMarquee());
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Helper function to enable/disable all interactive buttons (desktop & mobile)
    function setAllButtonsEnabled(enabled) {
        document.querySelectorAll('.toggle-button, .edit-button, .mint-btn').forEach(btn => {
            btn.disabled = !enabled;
            btn.style.opacity = enabled ? '1' : '0.45';
        });
    }

    // After page load: 4s idle animation for counter & expression, disable and gray out buttons
    setAllButtonsEnabled(false);
    pageloadIdleIndex = 0;
    pageloadIdleInterval = setInterval(() => {
        counter.textContent = '#' + animalFrames[pageloadIdleIndex];
        if (highlight) highlight.textContent = animalFrames[pageloadIdleIndex];
        if (highlightMobile) highlightMobile.textContent = animalFrames[pageloadIdleIndex];
        pageloadIdleIndex = (pageloadIdleIndex + 1) % animalFrames.length;
    }, 400);
    setTimeout(async () => {
        clearInterval(pageloadIdleInterval);
        isIdle = false; // After animation: counter is in real mode
        const tokenInfo = await fetchLatestTokenInfo();
        updateUIWithTokenInfo(tokenInfo);
        setAllButtonsEnabled(true);
    }, 2500);

    // Optional: On resize/orientation change, re-enable buttons
    window.addEventListener('resize', () => setAllButtonsEnabled(true));
    window.addEventListener('orientationchange', () => setAllButtonsEnabled(true));

    // Event handler for toggle and edit: idle animation only if explicitly desired
    toggleButton.addEventListener('click', () => {
        setTimeout(() => {
            // Idle animation only if explicitly desired (e.g. after edit)
            if (isIdle && !isInitialState()) startIdleCounter();
            else if (isIdle && isInitialState()) stopIdleCounter(counter.textContent.replace('#',''));
        }, 350);
    });
    editBtn.addEventListener('click', () => {
        setTimeout(() => {
            if (isIdle && !isInitialState()) startIdleCounter();
            else if (isIdle && isInitialState()) stopIdleCounter(counter.textContent.replace('#',''));
        }, 350);
    });

    // Toast notification
    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        // Apply theme-dependent styling
        if (body.classList.contains('toggled')) {
            toast.classList.add('toggled');
        } else {
            toast.classList.remove('toggled');
        }
        toast.className = 'toast show' + (body.classList.contains('toggled') ? ' toggled' : '');
        setTimeout(() => {
            toast.className = 'toast' + (body.classList.contains('toggled') ? ' toggled' : '');
        }, 4000); // Show for 4 seconds
    }

    // Mint function
    async function mintExpression(isBest, word) {
        if (!window.ethereum) {
            alert("Please install MetaMask!");
            return;
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            contractABI,
            signer
        );
        const value = ethers.parseEther("0.0069");
        try {
            const tx = await contract.express(isBest, word, { value });
            await tx.wait();
            // Success message after mint
            showToast("Expression successfully minted!");
            const tokenInfo = await fetchLatestTokenInfo();
            updateUIWithTokenInfo(tokenInfo);
        } catch (err) {
            alert("Error minting: " + (err.info?.error?.message || err.message));
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
    // 'Choice is Crunch' always first, Rest random
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
    let loadedTracks = [false]; // Initial: nothing loaded

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
            playPauseIcon.innerHTML = '♬';
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
        // src ALWAYS set, when not set or wrong track
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
                console.error('Error starting player:', e);
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
                console.error('Error playing:', e);
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

    // Player periodically wiggle when no music is playing
    function triggerPlayerWiggle() {
        if (!isPlaying && playerContainer) {
            playerContainer.classList.add('wiggle');
            setTimeout(() => playerContainer.classList.remove('wiggle'), 450);
        }
    }
    setInterval(triggerPlayerWiggle, 2500);

    // Helper: Check if current state is initial
    function isInitialState() {
        return (toggleText && toggleText.textContent === initialTendency) && (highlight && highlight.textContent === initialExpression);
    }

    document.body.classList.add('toggled');

    // --- Automatisches Chain-Update for the marquee ---
    function checkForChainUpdates() {
        fetchAllExpressionsBatched();
    }
    // Check every 30 seconds for updates
    setInterval(checkForChainUpdates, 30000);
    // Immediately run on first load
    checkForChainUpdates();

    // Fetch latest token info using the new batched contract logic
    async function fetchLatestTokenInfo() {
        const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
        const nextTokenId = await contract.nextTokenId();
        for (let i = nextTokenId - 1n; i >= 1n; i--) {
            const [expressions, ids] = await contract.getExpressionsInRange(i, i);
            if (ids.length > 0) {
                const expr = expressions[0];
                return {
                    tokenId: Number(ids[0]),
                    tendency: expr.isBest ? "best" : "worst",
                    expression: expr.word
                };
            }
        }
        // Fallback, if no token exists
        return {
            tokenId: 0,
            tendency: "?",
            expression: "CHOICE"
        };
    }

    // ASCII Bär Animation für die Infobox
    const bearFrames = [
        'ʕ◴ᴥ◴ʔ',
        'ʕ◷ᴥ◷ʔ',
        'ʕ◶ᴥ◶ʔ',
        'ʕ◵ᴥ◵ʔ'
    ];
    let bearIndex = 0;
    let bearInterval = null;

    function startBearAnimation() {
        if (bearInterval) clearInterval(bearInterval);
        bearInterval = setInterval(() => {
            const bearElement = document.querySelector('.bear-animation');
            if (bearElement) {
                bearElement.textContent = bearFrames[bearIndex];
                bearIndex = (bearIndex + 1) % bearFrames.length;
            }
        }, 400);
    }

    // Starte die Animation nach dem Laden
    startBearAnimation();
}); 