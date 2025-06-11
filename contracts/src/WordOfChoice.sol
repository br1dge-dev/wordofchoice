// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title WordOfChoice
 * @dev ERC721 token contract for minting expressions with words
 * @custom:security-contact security@wordofchoice.xyz
 */
contract WordOfChoice is ERC721, Ownable {
    using Strings for uint256;

    // Struct to store expression data
    struct Expression {
        bool isBest;     // true = best, false = worst
        string word;     // max 8 chars, A-Z
        uint256 timestamp; // When the expression was minted
    }

    // State variables
    uint256 public nextTokenId = 1;
    uint256 public mintPrice = 0.001 ether;
    mapping(uint256 => Expression) public expressions;
    mapping(string => bool) public usedWords; // Track used words to prevent duplicates

    // Events
    event ExpressionMinted(address indexed minter, uint256 indexed tokenId, bool isBest, string word, uint256 timestamp);
    event MintPriceChanged(uint256 newPrice);

    // Errors
    error InvalidWord();
    error WordAlreadyUsed();
    error InsufficientPayment();
    error InvalidTokenId();

    /**
     * @dev Constructor sets the initial owner and token details
     */
    constructor() ERC721("WordOfChoice", "WOC") Ownable(msg.sender) {}

    /**
     * @dev Mints a new expression token
     * @param isBest Whether the expression is "best" or "worst"
     * @param word The word to be used in the expression (max 8 chars, A-Z)
     */
    function express(bool isBest, string memory word) external payable {
        if (msg.value < mintPrice) revert InsufficientPayment();
        if (!_validateWord(word)) revert InvalidWord();
        if (usedWords[word]) revert WordAlreadyUsed();

        uint256 tokenId = nextTokenId++;
        uint256 timestamp = block.timestamp;
        
        expressions[tokenId] = Expression(isBest, word, timestamp);
        usedWords[word] = true;
        
        _safeMint(msg.sender, tokenId);
        emit ExpressionMinted(msg.sender, tokenId, isBest, word, timestamp);
    }

    /**
     * @dev Updates the mint price
     * @param newPrice The new price in wei
     */
    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
        emit MintPriceChanged(newPrice);
    }

    /**
     * @dev Withdraws contract balance to owner
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev Validates a word (8 chars max, A-Z only)
     * @param word The word to validate
     * @return bool Whether the word is valid
     */
    function _validateWord(string memory word) internal pure returns (bool) {
        bytes memory b = bytes(word);
        if (b.length == 0 || b.length > 8) return false;
        for (uint256 i = 0; i < b.length; i++) {
            if (b[i] < 0x41 || b[i] > 0x5A) return false; // A-Z
        }
        return true;
    }

    /**
     * @dev Returns the token URI for a given token ID
     * @param tokenId The token ID
     * @return string The token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        Expression memory expr = expressions[tokenId];
        string memory mode = expr.isBest ? "best" : "worst";
        string memory colorBg = expr.isBest ? "#F5E9D4" : "#2C241B";
        string memory colorFg = expr.isBest ? "#2C241B" : "#F5E9D4";
        string memory headline = expr.isBest ? "The best thing about" : "The worst thing about";
        
        string memory svg = _generateSVG(tokenId, expr.isBest, expr.word, colorBg, colorFg, headline);
        string memory json = string(abi.encodePacked(
            '{"name":"word of CHOICE #', tokenId.toString(), 
            '","description":"Onchain NFT. Mood: ', mode, '. Word: ', expr.word,
            '. Minted: ', _formatTimestamp(expr.timestamp),
            '","image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '"}'
        ));
        
        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }

    /**
     * @dev Generates the SVG for a token
     */
    function _generateSVG(
        uint256 tokenId,
        bool isBest,
        string memory word,
        string memory colorBg,
        string memory colorFg,
        string memory headline
    ) internal pure returns (string memory) {
        // SVG header and filter (grain)
        string memory svg1 = string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">',
            '<defs>',
            '<filter id="grain" x="0" y="0" width="100%" height="100%">',
            '<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise"/>',
            '<feColorMatrix type="saturate" values="0"/>',
            '<feComponentTransfer><feFuncA type="linear" slope="0.12"/></feComponentTransfer>',
            '</filter></defs>',
            '<rect width="500" height="500" fill="', colorBg, '"/>'
        ));
        
        // Counter box
        string memory svg2 = string(abi.encodePacked(
            '<rect x="24" y="24" width="100" height="40" rx="11" fill="', colorFg, '"/>',
            '<text x="74" y="48" font-size="28" fill="', colorBg, '" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle" dominant-baseline="middle">#', tokenId.toString(), '</text>'
        ));
        
        // Headline (ohne ⟳-Symbol)
        string memory svg3 = string(abi.encodePacked(
            '<text x="250" y="220" font-size="40" fill="', colorFg, '" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">', headline, '</text>'
        ));
        
        // Second line: life is + box + word (ohne Pfeil)
        string memory svg4 = string(abi.encodePacked(
            '<g>',
            '<text x="130" y="312" font-size="40" fill="', colorFg, '" font-family="Arial, sans-serif" font-weight="bold" text-anchor="end">',
            '<tspan font-weight="bold" text-decoration="underline">life</tspan> is</text>',
            '<rect x="140" y="266" width="340" height="64" rx="11" fill="', colorFg, '"/>',
            '<text x="310" y="298" font-size="56" fill="', colorBg, '" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle" dominant-baseline="middle">', word, '</text>',
            '</g>'
        ));
        
        // Grain overlay
        string memory svg5 = '<rect width="500" height="500" filter="url(#grain)" fill="#000" fill-opacity="0" style="pointer-events:none"/>';
        
        return string(abi.encodePacked(svg1, svg2, svg3, svg4, svg5, '</svg>'));
    }

    /**
     * @dev Formats a timestamp into a readable date string
     */
    function _formatTimestamp(uint256 timestamp) internal pure returns (string memory) {
        // Simple date formatting (can be expanded if needed)
        return string(abi.encodePacked(
            (timestamp / 86400 + 1).toString(), // Days since epoch
            " days since genesis"
        ));
    }
} 