// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract WordOfChoice is ERC721, Ownable {
    // Simple counter instead of Counters library
    uint256 private _nextTokenId;

    // Structure to store the expression details
    struct Expression {
        bool isBest;     // true for "best", false for "worst"
        string word;     // the user's chosen word
    }

    // Mapping from token ID to expression
    mapping(uint256 => Expression) private _expressions;
    
    // Minting price
    uint256 public mintPrice = 0.001 ether;

    // Events
    event ExpressionMinted(
        address indexed owner, 
        uint256 indexed tokenId, 
        bool isBest,
        string word
    );

    constructor() ERC721("WordOfChoice", "WOC") Ownable(msg.sender) {}

    /**
     * @dev Mints a new NFT with the given expression
     * @param isBest true for "best", false for "worst"
     * @param word the user's chosen word
     */
    function mintExpression(bool isBest, string memory word) public payable {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(bytes(word).length > 0, "Word cannot be empty");
        require(bytes(word).length <= 50, "Word too long");

        uint256 tokenId = _nextTokenId++;
        
        _expressions[tokenId] = Expression({
            isBest: isBest,
            word: word
        });
        
        _safeMint(msg.sender, tokenId);

        emit ExpressionMinted(msg.sender, tokenId, isBest, word);
    }

    /**
     * @dev Returns the expression associated with a token
     * @param tokenId The ID of the token
     */
    function getExpression(uint256 tokenId) public view returns (bool isBest, string memory word) {
        require(_exists(tokenId), "Token does not exist");
        Expression memory expr = _expressions[tokenId];
        return (expr.isBest, expr.word);
    }

    /**
     * @dev Returns the full sentence associated with a token
     * @param tokenId The ID of the token
     */
    function getFullSentence(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        Expression memory expr = _expressions[tokenId];
        if (expr.isBest) {
            return string(abi.encodePacked("The best thing about life is ", expr.word));
        } else {
            return string(abi.encodePacked("The worst thing about life is ", expr.word));
        }
    }

    /**
     * @dev Updates the minting price
     * @param newPrice The new price in wei
     */
    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
    }

    /**
     * @dev Withdraws the contract's balance to the owner
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Checks if a token exists
     * @param tokenId The ID of the token
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        Expression memory expr = _expressions[tokenId];
        string memory word = expr.word;
        bool isBest = expr.isBest;
        string memory bg = isBest ? "#F5E9D4" : "#2C241B";
        string memory fg = isBest ? "#2C241B" : "#F5E9D4";
        string memory boxBg = isBest ? "#2C241B" : "#F5E9D4";
        string memory boxFg = isBest ? "#F5E9D4" : "#2C241B";
        string memory bestworst = isBest ? "best" : "worst";
        // Schätzung: 32px pro Buchstabe, min 120, max 360
        uint256 wordLen = bytes(word).length;
        uint256 boxWidth = 120 + (wordLen > 3 ? (wordLen-3)*32 : 0);
        if (boxWidth > 360) boxWidth = 360;
        // SVG
        string memory svg = string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">',
            '<rect width="500" height="500" fill="', bg, '"/>',
            // Counter oben links
            '<g font-family="Arial, sans-serif" font-weight="bold">',
            '<rect x="20" y="20" width="80" height="40" rx="10" fill="', boxBg, '"/>',
            '<text x="60" y="50" font-size="28" fill="', boxFg, '" text-anchor="middle" dominant-baseline="middle">#', Strings.toString(tokenId+1), '</text>',
            '</g>',
            // Erste Zeile
            '<text x="250" y="180" font-size="40" fill="', fg, '" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">The ', bestworst, ' thing about</text>',
            // Zweite Zeile: life is [WORD]
            '<text x="250" y="260" font-size="40" fill="', fg, '" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">',
            '<tspan text-decoration="underline">life</tspan> is </text>',
            // Highlight-Box und Wort (rechtsbündig zur Zeile, Box dynamisch)
            '<g>',
            '<rect x="', Strings.toString(250 + 40), '" y="220" width="', Strings.toString(boxWidth), '" height="56" rx="14" fill="', boxBg, '"/>',
            '<text x="', Strings.toString(250 + 40 + boxWidth/2), '" y="260" font-size="40" fill="', boxFg, '" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle" dominant-baseline="middle">', word, '</text>',
            '</g>',
            '</svg>'
        ));
        string memory json = Base64.encode(bytes(string(abi.encodePacked(
            '{"name":"WordOfChoice #', Strings.toString(tokenId+1), '",',
            '"description":"The best/worst thing about life is ...",',
            '"image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '"}'
        ))));
        return string(abi.encodePacked('data:application/json;base64,', json));
    }
} 