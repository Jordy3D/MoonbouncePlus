// ==UserScript==
// @name         Moonbounce Plus
// @namespace    Bane
// @version      0.7.0
// @description  A few handy tools for Moonbounce
// @author       Bane
// @match        https://moonbounce.gg/u/@me/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=moonbounce.gg
// @grant        none
// ==/UserScript==

// ==Changelog==
//
// 0.1.0    - Initial release
//              - Stores some items and recipes (woefully incomplete)
//              - Adds an event listener to item images that copies the item's UUID to the clipboard
// 0.2.0    - Added the ability to copy the item's name and ID along with the UUID (ctrl + click)
// 0.2.1    - Better formatting for copied item info
// 0.3.0    - Deprecated the ability to copy just the item's UUID
//              - Replaced with a full item info copy
// 0.3.1    - Added a few more items
//          - Fixed recipes I forgot to fill in
//          - Added value to the item info copy
// 0.3.2    - Moved the data to a JSON file
//          - Added a notification when an item is copied to the clipboard
//          - Modified the script to load the data from the JSON file
//          - Modified the data extraction to extract as JSON rather than as a javascript object
//          - Code cleanup and reorganization
// 0.3.3    - Changed the Selected Item Window class to a new one (Moonbounce updated their site)
// 0.4.0    - Added a Ponder button to check if any recipes can be crafted with the items in the inventory (that aren't already in the inventory)
// 0.4.1    - Reduced Console spam
//          - Shifted data to new repository
//          - Fixed Pondering not taking into account the tools needed for crafting
//          - Code cleanup and commenting
// 0.5.0    - Added a highlight for items in the inventory that are not in the database
// 0.5.1    - ACTUALLY fixed the Pondering not taking into account the tools needed for crafting
// 0.6.0    - Added an Appraise button to evaluate the number of items in the inventory, and their total value
//          - Added spacing between the buttons in the inventory controls
// 0.6.1    - Fixed a bug with Appraisal breaking on unknown items
// 0.7.0    - Added a select element to choose a sorting method for the inventory
//              - Added sorting methods for Name, ID, Rarity, Type, Value, Quantity, Stack Value
//              - Added supporting CSS for the sorting select
//          - Modified the new button container slightly to avoid the layout looking weird
//
// ==/Changelog==

// ==TODO==
//
// - Add more items and recipes (endless task)
// - Add more classes to find elements on the page (endless task)
// - Add buttons to go to the Marketplace and Backpack on the Moonbounce Portal (whenever it's active on a page)
//
// ==/TODO==


// ██████╗  █████╗ ████████╗ █████╗ 
// ██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗
// ██║  ██║███████║   ██║   ███████║
// ██║  ██║██╔══██║   ██║   ██╔══██║
// ██████╔╝██║  ██║   ██║   ██║  ██║
// ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝

var items = null;
var recipes = null;

var inventoryData = null;

// define an inventory item object
class InventoryItem {
    constructor(id, name, uuid, rarity, type, value, quantity) {
        this.id = id;
        this.name = name;
        this.uuid = uuid;
        this.rarity = rarity;
        this.type = type;
        this.value = value;
        this.quantity = quantity;
    }
}

/**
 * Load the data from MoonbouncePlus.json file
 * @param {boolean} isLocal whether to load the data locally or from the web
 */
function loadData(isLocal = false) {
    console.log("Loading data...");

    if (isLocal) {
        var data = require('../data/MoonbouncePlus.json');
        items = data.items;
        recipes = data.recipes;

        return;
    }

    var url = 'https://raw.githack.com/Jordy3D/MoonbouncePlus/main/data/MoonbouncePlus.json';

    // use an XMLHttpRequest to get the data
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
            console.log(xhr.response);

            // get the items and recipes from the response json
            items = xhr.response.items;
            recipes = xhr.response.recipes || xhr.response.recipies;    // I misspelled recipes in the JSON file at first

            console.log("Data loaded successfully");
            console.log(`Items: ${items.length}`);
            console.log(`Recipes: ${recipes.length}`);

        } else {
            console.error('Failed to load data');
        }
    };
    xhr.send();
}

/**
 * Classes that are used to find elements on the page
 * name: the name of the class
 * class: the class name
 */
const targetClasses = [
    { name: "Inventory", class: ".cfWcg" },
    { name: "Inventory Controls", class: ".S-h7a" },
    { name: "Selected Item Window", class: "._base_adyd1_1" },
    { name: "Selected Item Details", class: "._base_awewl_1" },
    { name: "Moonbounce Portal Buttons", class: "._base_11wdf_1" },
    { name: "Source List Item", class: ".mSsVp" },
    { name: "Diffuse Value", class: ".WVOcs" },
    { name: "Stack Size", class: "._stack_count_16kzs_52" },
]
const getTargetClass = name => targetClasses.find(x => x.name == name).class;

const targetURLs = [
    { name: "Inventory", url: "https://moonbounce.gg/u/@me/backpack" },
]
const getTargetURL = name => targetURLs.find(x => x.name == name).url;



// ███╗   ███╗ █████╗ ██╗███╗   ██╗
// ████╗ ████║██╔══██╗██║████╗  ██║
// ██╔████╔██║███████║██║██╔██╗ ██║
// ██║╚██╔╝██║██╔══██║██║██║╚██╗██║
// ██║ ╚═╝ ██║██║  ██║██║██║ ╚████║
// ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝

var isWebDoc = typeof document !== 'undefined';

if (isWebDoc) {                 // Actual Web Script
    init();
}
else {                          // Local Debugging Script
    // import the local data/MoonbouncePlus.json file
    loadData(true);

    function displayIncompleteItems() {
        // get the items that are missing a value
        let missingValueItems = items.filter(x => !x.hasOwnProperty('value'));
        // sort the items by name
        missingValueItems.sort((a, b) => a.name.localeCompare(b.name));

        // display the items
        for (let item of missingValueItems)
            console.log(`#${item.id}: ${item.name}`);
    }

    // nicely print each item and a few of its properties
    function displayItems() {
        console.log(`Showing ${items.length} items\n`);

        var displayLog = "ID     Name                                               Rarity     Type           Value";

        for (let item of items) {
            var id = `#${item.id}`.padStart(5, ' ');
            var name = item.name.padEnd(50, ' ');
            var rarity = `[${item.rarity}]`.padEnd(10, ' ');
            var type = `[${item.type}]`.padEnd(13, ' ');

            var value = item.value == null ? "" : item.value.toString().padStart(5, ' ') + ' MP';

            var output = `${id}: ${name} ${rarity} ${type} ${value}`;

            output += `\n       Image URL: https://moonbounce.gg/images/fp/${item.uuid}/c/f/preview.png`;

            displayLog += `\n${output}`;
        }

        console.log(displayLog);
    }

    function printIDs() {
        for (let item of items)
            console.log(`${item.id}`);
    }

    // displayIncompleteItems();
    displayItems();
    // printIDs();
}




// ███████╗██╗   ██╗███╗   ██╗ ██████╗████████╗██╗ ██████╗ ███╗   ██╗███████╗
// ██╔════╝██║   ██║████╗  ██║██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝
// █████╗  ██║   ██║██╔██╗ ██║██║        ██║   ██║██║   ██║██╔██╗ ██║███████╗
// ██╔══╝  ██║   ██║██║╚██╗██║██║        ██║   ██║██║   ██║██║╚██╗██║╚════██║
// ██║     ╚██████╔╝██║ ╚████║╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║███████║
// ╚═╝      ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝

/**
 * Initialize the script and other initial functions
 */
function init() {
    // print Deathworlders Tweaks in large letters
    var textCSSMain = 'font-size: 30px; font-weight: bold; text-shadow: -3px 0px 0px rgba(255, 0, 0, 1),3px 0px 0px rgba(8, 0, 255, 1);';
    var textCSSSub = 'font-size: 15px; font-weight: bold;';
    console.log(`%cMoonbouncePlus%c${GM_info.script.version}\nby Bane`, textCSSMain, textCSSSub);

    loadData();

    setInterval(addCopyDetailstoItemImage, 1000);
    setInterval(addPonderButton, 1000);
    setInterval(addAppraiseButton, 1000);
    setInterval(highlightUnknownItems, 1000);

    setInterval(addSortInventorySelect, 1000);
}



/**
 * Refresh the inventory list
 */
function refreshInventoryArray() {
    inventoryData = [];

    let inventory = findInventory();
    if (inventory == null) return;

    let inventoryItems = inventory.querySelectorAll("img");

    for (let item of inventoryItems) {
        let uuid = getUUIDFromSrc(item.src);
        let resultItem = items.find(item => item.uuid == uuid);

        // find the stack size of the item
        let stackSize = item.parentElement.querySelector(getTargetClass("Stack Size"));
        if (stackSize == null) continue;

        // convert the stack size to a number
        let quantity = parseInt(stackSize.innerText);

        try {
            let inventoryItem = new InventoryItem(resultItem.id, resultItem.name, resultItem.uuid, resultItem.rarity, resultItem.type, resultItem.value, quantity);
            inventoryData.push(inventoryItem);
        }
        catch (e) {
            inventoryData.push(new InventoryItem(0, "Unknown", uuid, "Unknown", "Unknown", 0, quantity));
        }

    }
}




/**
 * Add an event listener to item images that copies the item's UUID to the clipboard
 * If ctrl is held, also copy the item's name and ID
 */
function addCopyDetailstoItemImage() {
    if (!isTargetURL(getTargetURL("Inventory"))) return;

    let itemWindow = findSelectedItemWindow();
    if (itemWindow == null) return;

    let items = itemWindow.querySelectorAll("img");
    if (items.length == 0) return;

    let details = itemWindow.querySelector(getTargetClass("Selected Item Details"));

    addSupportCSS();

    function addSupportCSS() {
        addCSS(`
._base_107fx_1 
{
  cursor: pointer;
  user-select: none;
  
  transition: transform 100ms ease-in-out;
  
  &:hover
  {
    transform: scale(1.05);
  }
  &:active
  {
    transform: scale(0.96);
  }
}
        `, "copyDetailsToItemCSS");
    }



    function getDetails(details) {
        let nameIdBlock = details.children[0];                                  // get the first child of the details element
        let name = nameIdBlock.children[0].innerText;                           // get the text of the first child (the name)
        let id = nameIdBlock.children[1].innerText;                             // get the text of the second child (the id)
        id = id.substring(1);                                                   // remove the # from the beginning of the id

        let info = details.children[1];                                         // get the second child of the details element
        let description = info.children[0].innerText;                           // get the text of the first child (the description)
        let rarity = info.children[1].children[0].innerText;                    // get the text of the first child of the second child (the rarity)
        let type = info.children[1].children[1].innerText;                      // get the text of the second child of the second child (the type)

        // get the value of the item
        let valueDiv = info.querySelector(getTargetClass("Diffuse Value"));     // get the element with the value
        let value = null;                                                       // set the value to 0 by default
        if (valueDiv != null) {
            value = valueDiv.innerText;                                         // get the text of the value
            value = value.replace("MP", "").trim();                             // clean up the value
        }

        let sources = details.children[2];                                      // get the third child of the details element
        let sourceObjects = sources.querySelectorAll(getTargetClass("Source List Item"));
        // get the p from each source object and add it to the source list
        let sourceList = [];
        for (let source of sourceObjects) {
            let p = source.querySelector("p");
            sourceList.push(p.innerText);
        }

        return { name: name, id: id, description: description, rarity: rarity, type: type, value: value, sources: sourceList };
    }

    function cleanJSONString(jsonString, id, value) {
        jsonString = jsonString.replace(/:/g, ": ");                        // replace all instances of ":" with ": "
        jsonString = jsonString.replace(/,/g, ", ");                        // replace all instances of "," with ", "
        jsonString = jsonString.replace(/{/g, "{ ");                        // replace all instances of "{" with "{ "
        jsonString = jsonString.replace(/}/g, " }");                        // replace all instances of "}" with " }"

        jsonString = jsonString.replace(`"${id}"`, id);                     // Replace the id string with just the id
        jsonString = jsonString.replace(`"${value}"`, value);               // Replace the value string with just the value

        return jsonString;
    }

    for (let item of items) {
        // If the item is not an item image, skip it
        if (item.alt != "item") continue;

        // if the item has an event listener, skip it
        if (item.classList.contains("item-uuid-event")) continue;

        console.log("Adding event listener to item");

        // add an event listener to the item's parent
        item.parentElement.addEventListener("click", function () {
            let img = this.querySelector("img");
            let uuid = getUUIDFromSrc(img.src);                             // get the item's UUID from the image source

            // also get the item name and id, and format it as
            // { id: "item id", name: "item name", uuid: "item uuid" }
            console.log("Copying item info to clipboard");

            let { name, id, description, rarity, type, value, sources } = getDetails(details);

            let itemInfo = { id: id, name: name, uuid: uuid, description: description, rarity: rarity, type: type, value: value, sources: sources };
            let jsonString = JSON.stringify(itemInfo);                  // convert the object to a JSON string

            jsonString = cleanJSONString(jsonString, id, value);        // Clean up the JSON string
            jsonString += ",";                                          // Add a comma to the end of the string

            copyToClipboard(jsonString);

            // Place a notification right below the item, centered directly below it
            let pos = img.getBoundingClientRect();
            let imgCenter = pos.left + (pos.width / 2);
            floatingNotification("Item info copied to clipboard", 1000, "background-color: #333; color: #fff; padding: 5px 10px; border-radius: 5px; transform: translateX(-50%);", { top: pos.bottom + 10 + "px", left: imgCenter + "px" });
        });

        // add a class to the item to show that it has an event listener
        item.classList.add("item-uuid-event");
    }
}

/**
 * Adds a container div above the inventory controls to hold new buttons
 */
function addInventoryControlBar() {
    // find the inventory controls div
    let inventoryControls = document.querySelector(getTargetClass("Inventory Controls"));
    if (inventoryControls == null) return;

    // if the inventory controls already have the bane-inventory-controls div, return
    let existingContainer = document.querySelector("#bane-inventory-controls");
    if (existingContainer != null) return existingContainer;

    // create a new container div before the inventory controls
    let container = document.createElement("div");
    container.style.display = "flex";
    container.id = "bane-inventory-controls";

    inventoryControls.parentElement.insertBefore(container, inventoryControls);

    // add some CSS to the button
    addCSS(`
#bane-inventory-controls
{
    gap: 8px;
    width: 100%;
    margin-bottom: 1em;

    button
    {
        background: white;
        border: 2px solid #E6E8EC;
        color: #141416;

        cursor: pointer;
            
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 8px 16px;
        gap: 8px;
        box-shadow: 0 1px 2px #1018280d;
        border-radius: 8px;
        transition: .2s;
        
        &:hover
        {
            background: #E6E8EC;
            border-color: #d2d5de;
        }
    }

    select {
        display: flex;
        padding: 8px;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
        border-radius: 8px;
        border: 2px solid var(--Neutrals-75, #E6E8EC);
        cursor: pointer;
        
        margin-left: auto !important;
    }
}`, "inventoryControlsCSS");

    return container;
}


/**
 * Add a Ponder button to the inventory controls that checks if any recipes can be crafted with the items in the inventory.
 * If there are any, it will display a notification with a random recipe that can be crafted.
 */
function addPonderButton() {
    // find the inventory controls div
    let inventoryControls = document.querySelector(getTargetClass("Inventory Controls"));
    if (inventoryControls == null) return;

    // if the inventory controls already have the bane-ponder-button, return
    let existingButton = document.querySelector("#bane-ponder-button");
    if (existingButton != null) return;

    // create a new container div after the inventory controls
    let container = addInventoryControlBar();

    // create a new button in the container
    let button = document.createElement("button");
    button.innerText = "Ponder";
    button.id = "bane-ponder-button";

    // add an event listener to the button
    button.addEventListener("click", function () {
        checkRecipes();
    });

    container.appendChild(button);
}

/**
 * Check if any recipes can be crafted with the items in the inventory.
 */
function checkRecipes() {
    // TODO: Use the inventoryData array to check for craftable recipes instead of getting the inventory items again
    let inventory = findInventory();
    if (inventory == null) return;

    console.log("Pondering...");

    let inventoryItems = inventory.querySelectorAll("img");

    let inventoryUUIDs = [];
    for (let item of inventoryItems) {
        let uuid = getUUIDFromSrc(item.src);
        inventoryUUIDs.push(uuid);
    }

    var craftableRecipes = [];
    for (let recipe of recipes) {
        let canCraft = true;
        let requiredItems = [...recipe.ingredients, ...recipe.tools];

        for (let ingredient of requiredItems) {
            let ingredientUUID = getUUIDFromItemName(ingredient);

            // Check if the ingredient is in the inventory
            if (!inventoryUUIDs.includes(ingredientUUID)) {
                canCraft = false;
                break;
            }
        }

        if (canCraft)
            craftableRecipes.push(recipe);
    }

    // check if there are any craftable recipes whose results are not in the inventory
    let craftableResults = [];
    for (let recipe of craftableRecipes) {
        let resultUUID = getUUIDFromItemName(recipe.result);

        if (!inventoryUUIDs.includes(resultUUID))
            craftableResults.push(recipe);
    }

    let message = '';
    // pick a craftable recipe at random and display a tooltip 
    if (craftableResults.length > 0) {
        let randomIndex = Math.floor(Math.random() * craftableResults.length);
        let randomRecipe = craftableResults[randomIndex];

        let article = ['a', 'e', 'i', 'o', 'u'].includes(randomRecipe.result[0].toLowerCase()) ? 'an' : 'a';
        message = `I have a feeling you can craft ${article} ${randomRecipe.result}...`;
    }
    else {
        message = `I don't think you can craft anything new right now...`;
    }

    // spawn a notification under the cursor position
    let pos = { top: event.clientY, left: event.clientX };              // get the current mouse position
    pos.top += 10;                                                      // offset the position down by 10 pixels

    floatingNotification(message, 3000, "background-color: #333; color: #fff; padding: 5px 10px; border-radius: 5px; transform: translateX(-50%);", { top: pos.top + "px", left: pos.left + "px" }, true);

}


/**
 * Highlight items in the inventory that are not in the database
 */
function highlightUnknownItems() {
    let inventory = findInventory();
    if (inventory == null) return;

    let inventoryItems = inventory.querySelectorAll("img");

    for (let item of inventoryItems) {
        let uuid = getUUIDFromSrc(item.src);
        let resultItem = items.find(item => item.uuid == uuid);

        // get the nearest button parent
        let buttonParent = item.closest("button");
        if (buttonParent == null) continue;

        buttonParent.classList.remove("unknown-item");

        if (resultItem == null)
            buttonParent.classList.add("unknown-item");
    }

    // add some CSS to highlight the unknown items
    addCSS(`
        .cfWcg
{
  overflow: visible;
    
  .unknown-item {
    background: linear-gradient(45deg, #f2be4470, #fff, #f2be4470) !important;
    
    & > div
    {
      background: inherit !important;
    }

    position: relative;
    
    [class*="_rarity_box"]
    {
      width: 40% !important;
    }
    
    &::before
    {
      content:"✨";
      position: absolute;
      top: -10px;
      left: -10px;
    }
  }
}
`, "highlightUnknownItemsCSS");
}


/**
 * Add an Appraise button to evaluate the number of items in the inventory, and their total value
 */
function addAppraiseButton() {
    // find the inventory controls div
    let inventoryControls = document.querySelector(getTargetClass("Inventory Controls"));
    if (inventoryControls == null) return;

    // if the inventory controls already have the bane-appraise-button, return
    let existingButton = document.querySelector("#bane-appraise-button");
    if (existingButton != null) return;

    // create a new container div after the inventory controls
    let container = addInventoryControlBar();

    // create a new button in the container
    let button = document.createElement("button");
    button.innerText = "Appraise";
    button.id = "bane-appraise-button";

    // add an event listener to the button
    button.addEventListener("click", function () {
        evaluateInventory();
    });

    container.appendChild(button);
}

/**
 * Evaluate the number of items in the inventory, and their total value
 */
function evaluateInventory() {
    console.log("Appraising...");

    refreshInventoryArray();

    // unique items is the number of items in the inventoryData array
    let totalItems = 0;
    let totalValue = 0;

    let unknownValueItems = [];

    for (let item of inventoryData) {
        totalItems += item.quantity;

        if (items.find(x => x.uuid == item.uuid) == null) {
            unknownValueItems.push(item);
            continue;
        }
        totalValue += item.value * item.quantity;
    }

    let appraisalMessage = "";
    appraisalMessage += `Unique Items: ${inventoryData.length}\n`;
    appraisalMessage += `Total Items: ${totalItems}\n`;
    appraisalMessage += `Total Value: ${totalValue} MP\n`;
    if (unknownValueItems.length > 0)
        appraisalMessage += `\nHowever, I couldn't find the value of ${unknownValueItems.length == 1 ? "an item" : "some items"}...\n`;

    // replace the newlines with <br> for the notification
    appraisalMessage = appraisalMessage.replace(/\n/g, "<br>");

    // spawn a notification under the cursor position
    let pos = { top: event.clientY, left: event.clientX };              // get the current mouse position
    pos.top += 10;                                                      // offset the position down by 10 pixels

    floatingNotification(appraisalMessage, 3000, "background-color: #333; color: #fff; padding: 5px 10px; border-radius: 5px; transform: translateX(-50%);", { top: pos.top + "px", left: pos.left + "px" }, true);
}

// Common > Uncommon > Rare > Epic > Legendary > Mythic
const rarityOrder = [
    { name: "COMMON", value: 0 },
    { name: "UNCOMMON", value: 1 },
    { name: "RARE", value: 2 },
    { name: "EPIC", value: 3 },
    { name: "LEGENDARY", value: 4 },
    { name: "MYTHIC", value: 5 },
]

const sortingMethods = [
    { name: "Name", method: (a, b) => a.name.localeCompare(b.name) },
    { name: "ID", method: (a, b) => sortId(a, b) },

    { name: "Rarity (Common > Mythic)", method: (a, b) => sortRarity(a, b) },
    { name: "Rarity (Mythic > Common)", method: (a, b) => sortRarity(b, a) },

    { name: "Type", method: (a, b) => sortType(a, b) },
    { name: "Value (High > Low)", method: (a, b) => sortValue(a, b) },
    { name: "Value (Low > High)", method: (a, b) => sortValue(b, a) },
    { name: "Quantity (High > Low)", method: (a, b) => sortQuantity(a, b) },
    { name: "Quantity (Low > High)", method: (a, b) => sortQuantity(b, a) },

    { name: "Stack Value (High > Low)", method: (a, b) => sortStackValue(b, a) },
    { name: "Stack Value (Low > High)", method: (a, b) => sortStackValue(a, b) },
]

function sortId(a, b) {
    return (a.id || 0) - (b.id || 0);
}

function getRarityValue(item) {
    return rarityOrder.find(x => x.name === item.rarity || x.name.toLowerCase() === "unknown").value;
}
function sortRarity(a, b) {
    return getRarityValue(a) - getRarityValue(b);
}

function sortType(a, b) {
    const defaultType = ""; // Assuming empty string as default for items with no type
    const typeA = a.type || defaultType;
    const typeB = b.type || defaultType;

    // Sort by type, then by name if types are the same
    if (typeA === typeB) {
        return a.name.localeCompare(b.name);
    }
    return typeA.localeCompare(typeB);
}

function sortValue(a, b) {
    // Handle "no value" by treating it as 0 for sorting
    const aValue = a.value || 0;
    const bValue = b.value || 0;

    // Sort by value, then by quantity if values are the same
    if (aValue == bValue)
        return b.quantity - a.quantity;
    return bValue - aValue;
}

function sortQuantity(a, b) {
    // sort by quantity, then by value
    if (a.quantity == b.quantity)
        return b.value - a.value;
    return b.quantity - a.quantity;
}

function sortStackValue(a, b) {
    // sort by stack value (value * quantity)
    return (a.value * a.quantity) - (b.value * b.quantity);
}

/**
 * Add a select element to choose a sorting method for the inventory
 */
function addSortInventorySelect() {
    // find the inventory controls div
    let inventoryControls = document.querySelector(getTargetClass("Inventory Controls"));
    if (inventoryControls == null) return;

    // if the inventory controls already have the bane-sort-inventory-select, return
    let existingSelect = document.querySelector("#bane-sort-inventory-select");
    if (existingSelect != null) return;

    // create a new container div after the inventory controls
    let container = addInventoryControlBar();

    // create a new select element in the container
    let select = document.createElement("select");
    select.id = "bane-sort-inventory-select";

    // add an event listener to the select element
    select.addEventListener("change", function () {
        sortInventory(this.value);
    });

    // add the sorting methods to the select element
    for (let method of sortingMethods) {
        let option = document.createElement("option");
        option.value = method.name;
        option.innerText = method.name;

        select.appendChild(option);
    }

    container.appendChild(select);
}

/**
 * Sort the inventory by the selected method
 */
function sortInventory(method) {
    console.log(`Sorting inventory by ${method}`);

    refreshInventoryArray();

    let sortMethod = sortingMethods.find(x => x.name == method).method;
    inventoryData.sort(sortMethod);

    let inventory = findInventory();
    if (inventory == null) return;

    let inventoryItems = inventory.querySelectorAll("img");

    // get the inventory items in the order of the inventoryData array by adding the sorted index to the item as an attribute
    for (let i = 0; i < inventoryItems.length; i++) {
        let item = inventoryItems[i];
        let uuid = getUUIDFromSrc(item.src);
        let inventoryItem = inventoryData.find(x => x.uuid == uuid);

        // set the item's flex order to the index of the inventoryData array (the nearest button parent)
        let buttonParent = item.closest("button");
        if (buttonParent == null) continue;

        buttonParent.style.order = inventoryData.indexOf(inventoryItem);
    }
}



// ██╗  ██╗███████╗██╗     ██████╗ ███████╗██████╗ 
// ██║  ██║██╔════╝██║     ██╔══██╗██╔════╝██╔══██╗
// ███████║█████╗  ██║     ██████╔╝█████╗  ██████╔╝
// ██╔══██║██╔══╝  ██║     ██╔═══╝ ██╔══╝  ██╔══██╗
// ██║  ██║███████╗███████╗██║     ███████╗██║  ██║
// ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝

/**
 * Finds the current page's URL
 */
function findCurrentURL() {
    return window.location.href;
}

/**
 * Checks if the current URL is the target URL
 */
function isTargetURL(targetURL) {
    let currentURL = findCurrentURL();
    return currentURL == targetURL;
}


/**
 * Find the inventory on the page
 * @returns the inventory div element | null
 */
function findInventory() {
    // find the inventory div
    let inventory = document.querySelector(getTargetClass("Inventory"));
    if (inventory == null) return;

    return inventory;
}

/**
 * Find the selected item window on the page
 * @returns the selected item window div | null
 */
function findSelectedItemWindow() {
    // find the selected item window
    let selectedItemWindow = document.querySelector(getTargetClass("Selected Item Window"));
    if (selectedItemWindow == null) return;

    return selectedItemWindow;
}


/**
 * Find the Moonbounce Portal on the page
 */
function findMoonbouncePortal() {
    // find #MOONBOUNCE.PORTAL
    let portal = document.querySelector("#MOONBOUNCE.PORTAL");
    if (portal == null) return;

    return portal;
}


function getUUIDFromSrc(src) {
    let start = src.indexOf("/fp/") + 4;                                // find the index of /fp/ and add 4 to get the start of the uuid
    let end = src.indexOf("/c/");                                       // find the index of /c/ to get the end of the uuid
    let uuid = src.substring(start, end);                               // get the substring between the start and end

    return uuid;
}

function getUUIDFromItemName(name) {
    let resultItem = items.find(item => item.name == name);
    let resultUUID = resultItem ? resultItem.uuid : null;

    return resultUUID;
}


/**
 * Find the Moonbounce Portal buttons on the page
 */
function findMoonbouncePortalButtons() {
    let portal = findMoonbouncePortal();
    if (portal == null) return;

    // find the buttons
    let buttons = portal.querySelector(getTargetClass("Moonbounce Portal Buttons"));
    if (buttons == null) return;

    return buttons;
}

/**
 * Copy text to the clipboard
 * @param {string} text the text to copy
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
}

/**
 * Add CSS to the header of the page
 * @param {string} css the CSS to add
 * @param {string} id the id of the CSS element
 */
function addCSS(css, id) {
    if (document.getElementById(id) != null) return;

    let style = document.createElement('style');
    style.id = id;
    style.innerHTML = css;
    document.head.appendChild(style);
}

/**
 * Floating notification that fades out after a few seconds
 * @param {string} message the message to display
 * @param {number} duration the duration of the notification in milliseconds
 * @param {string} css the CSS styles for the notification
 * @param {string} position the position of the notification (top, top-right, top-left, bottom, bottom-right, bottom-left, center, position: absolute)
 */
function floatingNotification(message, duration = 3000, css = "", position = "top", deleteExisting = false) {

    if (deleteExisting) {
        let existingNotifications = document.querySelectorAll(".floating-notification");
        for (let notification of existingNotifications)
            notification.remove();
    }

    let notification = document.createElement("div");
    notification.innerHTML = message;
    notification.style.cssText = css;
    notification.style.position = "fixed";
    notification.style.zIndex = 1000;
    notification.style.transition = "opacity 0.5s";
    notification.style.opacity = 1;
    notification.style.pointerEvents = "none";

    notification.classList.add("floating-notification");

    switch (position) {
        case "top":
            notification.style.top = "10px";
            notification.style.left = "50%";
            notification.style.transform = "translateX(-50%)";
            break;
        case "top-right":
            notification.style.top = "10px";
            notification.style.right = "10px";
            break;
        case "top-left":
            notification.style.top = "10px";
            notification.style.left = "10px";
            break;
        case "bottom":
            notification.style.bottom = "10px";
            notification.style.left = "50%";
            notification.style.transform = "translateX(-50%)";
            break;
        case "bottom-right":
            notification.style.bottom = "10px";
            notification.style.right = "10px";
            break;
        case "bottom-left":
            notification.style.bottom = "10px";
            notification.style.left = "10px";
            break;
        case "center":
            notification.style.top = "50%";
            notification.style.left = "50%";
            notification.style.transform = "translate(-50%, -50%)";
            break;
        default:
            notification.style.position = "absolute";
            notification.style.top = position.top;
            notification.style.left = position.left;
            break;
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = 0;
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, duration);
}