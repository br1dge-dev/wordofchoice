// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract WordOfChoice is ERC721, Ownable {
    using Strings for uint256;

    struct Expression {
        bool isBest; // true = best, false = worst
        string word; // max 8 chars, A-Z
    }

    uint256 public nextTokenId = 1;
    uint256 public mintPrice = 0.001 ether;
    mapping(uint256 => Expression) public expressions;

    event ExpressionMinted(address indexed minter, uint256 indexed tokenId, bool isBest, string word);
    event MintPriceChanged(uint256 newPrice);

    constructor() ERC721("WordOfChoice", "WOC") Ownable(msg.sender) {}

    function mintExpression(bool isBest, string memory word) external payable {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(_validateWord(word), "Invalid word");
        uint256 tokenId = nextTokenId++;
        expressions[tokenId] = Expression(isBest, word);
        _safeMint(msg.sender, tokenId);
        emit ExpressionMinted(msg.sender, tokenId, isBest, word);
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
        emit MintPriceChanged(newPrice);
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function _validateWord(string memory word) internal pure returns (bool) {
        bytes memory b = bytes(word);
        if (b.length == 0 || b.length > 8) return false;
        for (uint256 i = 0; i < b.length; i++) {
            if (b[i] < 0x41 || b[i] > 0x5A) return false; // A-Z
        }
        return true;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        // Existenzprüfung über ownerOf (Fallback)
        try this.ownerOf(tokenId) returns (address) {} catch { revert("Nonexistent token"); }
        Expression memory expr = expressions[tokenId];
        string memory mode = expr.isBest ? "best" : "worst";
        string memory colorBg = expr.isBest ? "#2C241B" : "#F5E9D4";
        string memory colorFg = expr.isBest ? "#F5E9D4" : "#2C241B";
        string memory headline = expr.isBest ? "The best thing about" : "The worst thing about";
        string memory svg = _generateSVG(tokenId, expr.isBest, expr.word, colorBg, colorFg, headline);
        string memory json = string(abi.encodePacked(
            '{"name":"word of CHOICE #', tokenId.toString(), 
            '","description":"Onchain NFT. Mood: ', mode, '. Word: ', expr.word, 
            '","image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '"}'
        ));
        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }

    function _generateSVG(
        uint256 tokenId,
        bool isBest,
        string memory word,
        string memory colorBg,
        string memory colorFg,
        string memory headline
    ) internal pure returns (string memory) {
        // SVG-Header und Filter (Grain)
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
        // Counter-Box
        string memory svg2 = string(abi.encodePacked(
            '<rect x="24" y="24" width="100" height="40" rx="11" fill="', colorFg, '"/>',
            '<text x="74" y="48" font-size="28" fill="', colorBg, '" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle" dominant-baseline="middle">#', tokenId.toString(), '</text>'
        ));
        // Headline
        string memory svg3 = string(abi.encodePacked(
            '<text x="250" y="220" font-size="40" fill="', colorFg, '" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">', headline, '</text>'
        ));
        // Zweite Zeile: life is + Box + Wort
        string memory svg4 = string(abi.encodePacked(
            '<g>',
            '<text x="130" y="312" font-size="40" fill="', colorFg, '" font-family="Arial, sans-serif" font-weight="bold" text-anchor="end">',
            '<tspan font-weight="bold" text-decoration="underline">life</tspan> is</text>',
            '<rect x="140" y="266" width="340" height="64" rx="11" fill="', colorFg, '"/>',
            '<text x="310" y="298" font-size="56" fill="', colorBg, '" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle" dominant-baseline="middle">', word, '</text>',
            '</g>'
        ));
        // Grain-Overlay
        string memory svg5 = '<rect width="500" height="500" filter="url(#grain)" fill="#000" fill-opacity="0" style="pointer-events:none"/>';
        return string(abi.encodePacked(svg1, svg2, svg3, svg4, svg5, '</svg>'));
    }
} 