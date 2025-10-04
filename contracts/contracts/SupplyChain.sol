// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title SupplyChain
 * @dev A comprehensive supply chain traceability contract for Rich's Frozen Pizza
 * Implements role-based access control and tracks items from farm to fork
 */
contract SupplyChain is AccessControl, ReentrancyGuard, Pausable {
    
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant LOGISTICS_ROLE = keccak256("LOGISTICS_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    
    // Enums
    enum ItemStatus { 
        CREATED, 
        IN_TRANSIT, 
        RECEIVED, 
        CONSUMED, 
        RECALLED 
    }
    
    // Structs
    struct Item {
        bytes32 itemId;
        string productId;
        string lotCode;
        address currentOwner;
        uint256 creationDate;
        ItemStatus status;
        bytes32[] parentItems;
    }
    
    struct ItemHistoryEntry {
        ItemStatus status;
        address actor;
        uint256 timestamp;
        string location;
        int256 temperature; // Temperature in Celsius * 100 (e.g., -18.50°C = -1850)
    }
    
    // State variables
    mapping(bytes32 => Item) public items;
    mapping(bytes32 => ItemHistoryEntry[]) public itemHistory;
    mapping(string => bytes32) public lotCodeToItemId;
    
    // Events
    event ItemCreated(
        bytes32 indexed itemId,
        address indexed owner,
        string productId,
        string lotCode,
        uint256 timestamp
    );
    
    event ItemStateChanged(
        bytes32 indexed itemId,
        ItemStatus indexed newStatus,
        address indexed actor,
        string location,
        int256 temperature,
        uint256 timestamp
    );
    
    event ItemsConsumed(
        bytes32[] itemIds,
        bytes32 indexed newItemId,
        address indexed actor,
        uint256 timestamp
    );
    
    event ItemOwnershipTransferred(
        bytes32 indexed itemId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 timestamp
    );
    
    /**
     * @dev Contract constructor
     * @param admin Address to be granted ADMIN_ROLE
     */
    constructor(address admin) {
        require(admin != address(0), "Admin address cannot be zero");
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        
        // Set ADMIN_ROLE as the admin role for all other roles
        _setRoleAdmin(FARMER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(MANUFACTURER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(LOGISTICS_ROLE, ADMIN_ROLE);
        _setRoleAdmin(RETAILER_ROLE, ADMIN_ROLE);
    }
    
    /**
     * @dev Creates a new raw ingredient item
     * @param productId Unique product identifier (e.g., GTIN)
     * @param lotCode 8-digit lot code for the batch
     * @param location Physical location where the item was created
     */
    function createIngredient(
        string memory productId,
        string memory lotCode,
        string memory location
    ) external onlyRole(FARMER_ROLE) whenNotPaused nonReentrant {
        require(bytes(productId).length > 0, "Product ID cannot be empty");
        require(bytes(lotCode).length > 0, "Lot code cannot be empty");
        require(lotCodeToItemId[lotCode] == bytes32(0), "Lot code already exists");
        
        bytes32 itemId = keccak256(abi.encodePacked(productId, lotCode, block.timestamp));
        
        // Create new item
        Item storage newItem = items[itemId];
        newItem.itemId = itemId;
        newItem.productId = productId;
        newItem.lotCode = lotCode;
        newItem.currentOwner = msg.sender;
        newItem.creationDate = block.timestamp;
        newItem.status = ItemStatus.CREATED;
        
        // Map lot code to item ID
        lotCodeToItemId[lotCode] = itemId;
        
        // Add to history
        _addHistoryEntry(itemId, ItemStatus.CREATED, location, 0);
        
        emit ItemCreated(itemId, msg.sender, productId, lotCode, block.timestamp);
    }
    
    /**
     * @dev Creates a new product by combining existing ingredients
     * @param newProductId Product ID for the new item
     * @param newLotCode Lot code for the new item
     * @param parentItemIds Array of item IDs used as ingredients
     * @param location Location where the combination occurred
     */
    function combineItems(
        string memory newProductId,
        string memory newLotCode,
        bytes32[] memory parentItemIds,
        string memory location
    ) external onlyRole(MANUFACTURER_ROLE) whenNotPaused nonReentrant {
        require(bytes(newProductId).length > 0, "Product ID cannot be empty");
        require(bytes(newLotCode).length > 0, "Lot code cannot be empty");
        require(parentItemIds.length > 0, "Must have at least one parent item");
        require(lotCodeToItemId[newLotCode] == bytes32(0), "Lot code already exists");
        
        // Verify ownership and status of parent items
        for (uint256 i = 0; i < parentItemIds.length; i++) {
            require(items[parentItemIds[i]].itemId != bytes32(0), "Parent item does not exist");
            require(
                items[parentItemIds[i]].status == ItemStatus.CREATED || 
                items[parentItemIds[i]].status == ItemStatus.RECEIVED,
                "Parent item not available for consumption"
            );
        }
        
        bytes32 newItemId = keccak256(abi.encodePacked(newProductId, newLotCode, block.timestamp));
        
        // Create new combined item
        Item storage newItem = items[newItemId];
        newItem.itemId = newItemId;
        newItem.productId = newProductId;
        newItem.lotCode = newLotCode;
        newItem.currentOwner = msg.sender;
        newItem.creationDate = block.timestamp;
        newItem.status = ItemStatus.CREATED;
        newItem.parentItems = parentItemIds;
        
        // Map lot code to item ID
        lotCodeToItemId[newLotCode] = newItemId;
        
        // Mark parent items as consumed
        for (uint256 i = 0; i < parentItemIds.length; i++) {
            items[parentItemIds[i]].status = ItemStatus.CONSUMED;
            _addHistoryEntry(parentItemIds[i], ItemStatus.CONSUMED, location, 0);
        }
        
        // Add to history
        _addHistoryEntry(newItemId, ItemStatus.CREATED, location, 0);
        
        emit ItemCreated(newItemId, msg.sender, newProductId, newLotCode, block.timestamp);
        emit ItemsConsumed(parentItemIds, newItemId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Ships an item to a new owner
     * @param itemId ID of the item to ship
     * @param receiver Address of the receiving party
     * @param location Location where shipment originated
     * @param temperature Temperature during shipment (Celsius * 100)
     */
    function shipItem(
        bytes32 itemId,
        address receiver,
        string memory location,
        int256 temperature
    ) external onlyRole(LOGISTICS_ROLE) whenNotPaused nonReentrant {
        require(items[itemId].itemId != bytes32(0), "Item does not exist");
        require(receiver != address(0), "Receiver address cannot be zero");
        require(
            items[itemId].status == ItemStatus.CREATED || 
            items[itemId].status == ItemStatus.RECEIVED,
            "Item not available for shipment"
        );
        
        address previousOwner = items[itemId].currentOwner;
        
        // Update item status and ownership
        items[itemId].status = ItemStatus.IN_TRANSIT;
        items[itemId].currentOwner = receiver;
        
        // Add to history
        _addHistoryEntry(itemId, ItemStatus.IN_TRANSIT, location, temperature);
        
        emit ItemStateChanged(itemId, ItemStatus.IN_TRANSIT, msg.sender, location, temperature, block.timestamp);
        emit ItemOwnershipTransferred(itemId, previousOwner, receiver, block.timestamp);
    }
    
    /**
     * @dev Confirms receipt of an item
     * @param itemId ID of the item being received
     * @param location Location where item was received
     * @param temperature Temperature upon receipt (Celsius * 100)
     */
    function receiveItem(
        bytes32 itemId,
        string memory location,
        int256 temperature
    ) external whenNotPaused nonReentrant {
        require(items[itemId].itemId != bytes32(0), "Item does not exist");
        require(items[itemId].status == ItemStatus.IN_TRANSIT, "Item is not in transit");
        require(items[itemId].currentOwner == msg.sender, "Only the designated receiver can confirm receipt");
        
        // Update item status
        items[itemId].status = ItemStatus.RECEIVED;
        
        // Add to history
        _addHistoryEntry(itemId, ItemStatus.RECEIVED, location, temperature);
        
        emit ItemStateChanged(itemId, ItemStatus.RECEIVED, msg.sender, location, temperature, block.timestamp);
    }
    
    /**
     * @dev Recalls an item (ADMIN only)
     * @param itemId ID of the item to recall
     * @param location Location where recall was initiated
     */
    function recallItem(
        bytes32 itemId,
        string memory location
    ) external onlyRole(ADMIN_ROLE) whenNotPaused nonReentrant {
        require(items[itemId].itemId != bytes32(0), "Item does not exist");
        require(items[itemId].status != ItemStatus.RECALLED, "Item already recalled");
        
        // Update item status
        items[itemId].status = ItemStatus.RECALLED;
        
        // Add to history
        _addHistoryEntry(itemId, ItemStatus.RECALLED, location, 0);
        
        emit ItemStateChanged(itemId, ItemStatus.RECALLED, msg.sender, location, 0, block.timestamp);
    }
    
    /**
     * @dev Gets item details
     * @param itemId ID of the item
     * @return Item struct
     */
    function getItem(bytes32 itemId) external view returns (Item memory) {
        require(items[itemId].itemId != bytes32(0), "Item does not exist");
        return items[itemId];
    }
    
    /**
     * @dev Gets item ID from lot code
     * @param lotCode Lot code to lookup
     * @return Item ID
     */
    function getItemIdByLotCode(string memory lotCode) external view returns (bytes32) {
        return lotCodeToItemId[lotCode];
    }
    
    /**
     * @dev Gets complete history for an item
     * @param itemId ID of the item
     * @return Array of ItemHistoryEntry structs
     */
    function getItemHistory(bytes32 itemId) external view returns (ItemHistoryEntry[] memory) {
        require(items[itemId].itemId != bytes32(0), "Item does not exist");
        return itemHistory[itemId];
    }
    
    /**
     * @dev Gets parent items for a given item
     * @param itemId ID of the item
     * @return Array of parent item IDs
     */
    function getParentItems(bytes32 itemId) external view returns (bytes32[] memory) {
        require(items[itemId].itemId != bytes32(0), "Item does not exist");
        return items[itemId].parentItems;
    }
    
    /**
     * @dev Emergency pause function
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause function
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Internal function to add history entry
     */
    function _addHistoryEntry(
        bytes32 itemId,
        ItemStatus status,
        string memory location,
        int256 temperature
    ) internal {
        itemHistory[itemId].push(ItemHistoryEntry({
            status: status,
            actor: msg.sender,
            timestamp: block.timestamp,
            location: location,
            temperature: temperature
        }));
    }
}