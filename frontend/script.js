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
            await mintExpression(pendingMint.isBest, pendingMint.word);
            closeConfirmationModal();
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
            const headline = isBest ? 'The best thing about' : 'The worst thing about';
            const sentence = `${headline}\nlife is ${word}`;
            const price = '0.01';
            openConfirmationModal(sentence, price, { isBest, word });
        }
    });

    // Central validation function for the highlight word
    async function validateWord(word) {
        const trimmed = word.trim().toUpperCase();
        if (trimmed.length === 0) {
            return { valid: false, reason: 'empty' };
        }
        if (!/^[A-ZÄÖÜß]+$/.test(trimmed)) {
            return { valid: false, reason: 'invalid_chars' };
        }
        return { valid: true };
    }

    // --- Wort-Existenz-Check am Contract ---
    async function checkWordExists(word) {
        try {
            const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
            const contract = new ethers.Contract(contractAddress, contractABI, provider);
            // usedWords ist public, daher automatisch ein Getter
            return await contract.usedWords(word);
        } catch (e) {
            console.error('Fehler beim Check auf usedWords:', e);
            return false;
        }
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
            let wordExists = false;
            if (validation.valid) {
                wordExists = await checkWordExists(newWord);
            }
            if (!validation.valid || wordExists) {
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
                if (validation.reason === 'invalid_chars') reasonText = 'has INVALID CHARS';
                if (validation.reason === 'exists' || wordExists) reasonText = 'GONE';
                mintInfoBox.innerHTML = `<div>word</div><div>is</div><div><span class="highlight info-highlight">${reasonText}</span></div>`;
                mintBar.appendChild(mintInfoBox);
                mintBtn.classList.add('mint-strikethrough');
            } else {
                highlight.textContent = newWord;
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
    const contractAddress = "0x2e9B36d96Fb9Aa9aB2820b7D290bBDAC1E82BA51";

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
            
            // Update counter
            if (nextId === 1n) {
                counter.textContent = '#0';
                if (toggleText) toggleText.textContent = 'NOWORD';
                if (highlight) highlight.textContent = 'NOWORD';
                return;
            } else {
                counter.textContent = `#${(nextId - 1n).toString()}`;
            }

            // Get latest token data if exists
            if (nextId > 1n) {
                const lastTokenId = nextId - 1n;
                const tokenUri = await contract.tokenURI(lastTokenId);
                const json = atob(tokenUri.split(",")[1]);
                const meta = JSON.parse(json);
                
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
}); 