// ==UserScript==
// @name         Moonbounce Plus
// @namespace    Bane
// @version      0.9.0
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
// 0.7.1    - Added a right-click option to save the item image as a file with the item name formatted to Wiki standards
//          - Enabled normal right-click on the image to save the image as a file (Ctrl + right-click to save as item name)
//          - Added a notification when an item image is saved as a file
//          - Code cleanup and commenting
// 0.7.2    - Add a line break in the Ponder notification message
// 0.7.3    - Fixed the sorting methods not working correctly on the Crafting page
//          - Fixed sorting breaking on Unknown items
//          - Fixed the Backpack page not being properly detected if the URL has a query string
// 0.8.0    - Update to match version 0.25 of Moonbounce
// 0.9.0    - Added a slew of Moonbounce Portal buttons
//              - Added a button to go to the Marketplace on the Moonbounce Portal
//              - Added a button to go to the Backpack on the Moonbounce Portal
//              - Added a button to go to the Directory on the Moonbounce Portal
//              - Added a button to go to the Moonbounce Plus GitHub Repository
//          - Reworked some of the code to be more efficient or more generic
//          - Fixed the box sizing on the inventory controls being too large
//          - Preparation for more CSS injection into the Moonbounce Portal
//
// ==/Changelog==

// ==TODO==
//
// - Add more items and recipes (endless task)
// - Add more classes to find elements on the page (endless task)
// - Add buttons to go to the Marketplace and Backpack on the Moonbounce Portal (whenever it's active on a page)
//
// ==/TODO==

//#region Data
// ██████╗  █████╗ ████████╗ █████╗ 
// ██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗
// ██║  ██║███████║   ██║   ███████║
// ██║  ██║██╔══██║   ██║   ██╔══██║
// ██████╔╝██║  ██║   ██║   ██║  ██║
// ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝

var items = null;
var recipes = null;

var inventoryData = null;

var moonbouncePortal = null;

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
const targetSelector = [
    { name: "Inventory", selector: ".cfWcg" },
    { name: "Inventory Controls", selector: ".S-h7a" },
    { name: "Selected Item Window", selector: "._base_7aiat_1" },
    { name: "Selected Item Details", selector: "._base_awewl_1" },
    { name: "Moonbounce Portal Button Container", selector: "._base_11wdf_1" },
    { name: "Source List Item", selector: ".gf3oJ" },
    { name: "Diffuse Value", selector: ".WVOcs" },
    { name: "Stack Size", selector: "._stack_count_252dr_52" },

    { name: "Moonbounce Portal", selector: "[id='MOONBOUNCE.PORTAL']" },
]
const getTargetSelector = name => targetSelector.find(x => x.name == name).selector;

const targetURLs = [
    { name: "Inventory", url: "https://moonbounce.gg/u/@me/backpack" },
]
const getTargetURL = name => targetURLs.find(x => x.name == name).url;

//#endregion


//#region Entry Point
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

    /**
     * Display the items in the console with a few details
     */
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

    /**
     * Print the IDs of each item into the console
     */
    function printIDs() {
        for (let item of items)
            console.log(`${item.id}`);
    }

    /**
     * Calculate the best value recipe based on the value of the ingredients
     */
    function calculateBestValueCraft() {
        // calculate the best value recipe based on the value of the ingredients
        // if the ingredients are more valuable than the result, it's not worth crafting

        let bestValue = 0;
        let bestRecipe = null;

        let bestValueItems = [];

        for (let recipe of recipes) {
            // tools can be ignored for this calculation as they are not consumed
            let requiredItems = recipe.ingredients;

            let valueOfIngredients = 0;
            for (let ingredient of requiredItems) {
                let item = items.find(x => x.name == ingredient);
                if (item == null) continue;

                valueOfIngredients += item.value;
            }

            let resultItem = items.find(x => x.name == recipe.result);
            if (resultItem == null) continue;

            actualValue = resultItem.value - valueOfIngredients;

            if (actualValue > bestValue) {
                bestValue = resultItem.value;
                bestRecipe = recipe;
                bestValueItems = requiredItems;
            }
        }

        let message = `Best Value Recipe: ${bestRecipe.result} (${bestValue} MP)`;
        // list the ingredients, their values, and the total value of the ingredients
        let ingredientList = [];
        let ingredientValue = 0;
        for (let ingredient of bestValueItems) {
            let item = items.find(x => x.name == ingredient);
            if (item == null) continue;

            ingredientList.push(`${item.name} (${item.value} MP)`);
            ingredientValue += item.value;
        }
        let ingredientString = ingredientList.join(", ");
        ingredientString += ` | Total Value (${ingredientValue} MP), for a profit of ${bestValue - ingredientValue} MP`;


        console.log(message);
        console.log(ingredientString);
    }

    // calculateBestValueCraft();
    // printIDs();
    displayItems();
}


//#endregion


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

    setInterval(() => {
        addCopyDetailstoItemImage();
        addPonderButton();
        addAppraiseButton();
        highlightUnknownItems();

        addSortInventorySelect();

        addMoonbouncePortalButtons();
    }, 1000);
}

//#region Main Functions

//#region Data
/**
 * Add an event listener to item images that copies the item's UUID to the clipboard
 * If ctrl is held, also copy the item's name and ID
 */
function addCopyDetailstoItemImage() {
    if (!isTargetURL(getTargetURL("Inventory"), true)) return;

    let itemWindow = findSelectedItemWindow();
    if (itemWindow == null) return;

    let items = itemWindow.querySelectorAll("img");
    if (items.length == 0) return;

    let details = itemWindow.querySelector(getTargetSelector("Selected Item Details"));
    if (details == null) return;

    addSupportCSS();

    function addSupportCSS() {
        addCSS(`
.item-uuid-event
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
        let valueDiv = info.querySelector(getTargetSelector("Diffuse Value"));     // get the element with the value
        let value = null;                                                       // set the value to 0 by default
        if (valueDiv != null) {
            value = valueDiv.innerText;                                         // get the text of the value
            value = value.replace("MP", "").trim();                             // clean up the value
        }

        let sources = details.children[2];                                      // get the third child of the details element
        let sourceObjects = sources.querySelectorAll(getTargetSelector("Source List Item"));
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
        item.style.pointerEvents = "unset";

        // enable right-click on the image to save the image as a file
        item.addEventListener("contextmenu", function (e) {
            // if ctrl is held, save the image as a file with the name of the item with the space replaced with an underscore
            if (e.ctrlKey) {
                e.preventDefault();

                let img = this;
                let uuid = getUUIDFromSrc(img.src);
                let itemObject = getItemFromUUID(uuid);
                let name = itemObject.name;

                downloadFile(img.src, `${name.replace(" ", "_")}.png`);

                // Place a notification right below the item, centered directly below it
                let pos = img.getBoundingClientRect();
                let imgCenter = pos.left + (pos.width / 2);
                floatingNotification("Item image saved as file", 1000, "background-color: #333; color: #fff; padding: 5px 10px; border-radius: 5px; transform: translateX(-50%);", { top: pos.bottom + 10 + "px", left: imgCenter + "px" });

                return false;
            }
        });
    }
}
//#endregion

//#region Control Bar
/**
 * Adds a container div above the inventory controls to hold new buttons
 */
function addInventoryControlBar() {
    // find the inventory controls div
    let inventoryControls = document.querySelector(getTargetSelector("Inventory Controls"));
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
    box-sizing: border-box;

    button
    {
        background-color: var(--background-color);
        border: 2px solid var(--border-color);
        color: var(--text-color);

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
            background: var(--background-color-hover);
            border-color: var(--background-color-hover);
        }
    }

    select {
        
        background-color: var(--background-color);
        border: 2px solid var(--border-color);
        color: var(--text-color);

        display: flex;
        padding: 8px;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
        border-radius: 8px;
        cursor: pointer;
        
        margin-left: auto !important;
    }
}`, "inventoryControlsCSS");

    return container;
}
//#endregion

//#region Pondering
/**
 * Add a Ponder button to the inventory controls that checks if any recipes can be crafted with the items in the inventory.
 * If there are any, it will display a notification with a random recipe that can be crafted.
 */
function addPonderButton() {
    // find the inventory controls div
    let inventoryControls = document.querySelector(getTargetSelector("Inventory Controls"));
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
        message = `I have a feeling you can craft<br> ${article} ${randomRecipe.result}...`;
    }
    else {
        message = `I don't think you can craft<br> anything new right now...`;
    }

    // spawn a notification under the cursor position
    let pos = { top: event.clientY, left: event.clientX };              // get the current mouse position
    pos.top += 10;                                                      // offset the position down by 10 pixels

    floatingNotification(message, 3000, "background-color: #333; color: #fff; padding: 5px 10px; border-radius: 5px; transform: translateX(-50%);", { top: pos.top + "px", left: pos.left + "px" }, true);

}
//#endregion

//#region Unknown Items
/**
 * Highlight items in the inventory that are not in the database
 */
function highlightUnknownItems() {
    let inventory = findInventory();
    if (inventory == null) return;

    let inventoryItems = inventory.querySelectorAll("img");

    if (items == null) return;

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
//#endregion

//#region Appraisal
/**
 * Add an Appraise button to evaluate the number of items in the inventory, and their total value
 */
function addAppraiseButton() {
    // find the inventory controls div
    let inventoryControls = document.querySelector(getTargetSelector("Inventory Controls"));
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
//#endregion

//#region Sorting Inventory

// Common > Uncommon > Rare > Epic > Legendary > Mythic
const rarityOrder = [
    { name: "COMMON", value: 0 },
    { name: "UNCOMMON", value: 1 },
    { name: "RARE", value: 2 },
    { name: "EPIC", value: 3 },
    { name: "LEGENDARY", value: 4 },
    { name: "MYTHIC", value: 5 },
    { name: "UNKNOWN", value: 6 },
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
    try {
        return rarityOrder.find(x => x.name == (item.rarity || "UNKNOWN")).value;
    }
    catch (e) {
        console.error(`Error getting rarity value for item: ${item.name}`);
        console.error(item);
    }
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
    let inventoryControls = document.querySelector(getTargetSelector("Inventory Controls"));
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
        // if the parent of buttonParent has [draggable="true"], use that as the parent instead
        if (buttonParent.parentElement.hasAttribute("draggable"))
            buttonParent = buttonParent.parentElement;

        buttonParent.style.order = inventoryData.indexOf(inventoryItem);
    }
}
//#endregion

//#region Moonbounce Portal Buttons
/**
 * Add buttons to the Moonbounce Portal to quickly access Moonbounce features
 */
function addMoonbouncePortalButtons() {
    // add a button to go to the Moonbounce Plus GitHub Repository
    addMoonbouncePlusButton();

    // quick access buttons
    addDirectoryButton();
    addBackpackButton();
    addMarketplaceButton();
}

/**
 * Adds a button to the Moonbounce Portal 
 */
function addMoonbouncePortalButton(button) {
    let buttons = findMoonbouncePortalButtons();
    if (buttons == null) return;

    let moonbouncePlusButtonContainer = buttons.querySelector("#moonbounce-plus-button-container");
    if (moonbouncePlusButtonContainer == null) {
        // create a new button container for the Moonbounce Plus buttons
        moonbouncePlusButtonContainer = document.createElement("div");
        moonbouncePlusButtonContainer.id = "moonbounce-plus-button-container";

        buttons.appendChild(moonbouncePlusButtonContainer);
    }

    // check if the container already contains the button with the id
    let newId = button.id;
    let existingButton = moonbouncePlusButtonContainer.querySelector(`#${newId}`);
    if (existingButton != null) return;

    button.classList.add("moonbounce-plus-button");

    moonbouncePlusButtonContainer.appendChild(button);

    // add some CSS to the button
    addCSS(`
#moonbounce-plus-button-container
{
    display: flex;
    gap: 8px;
    /* margin-bottom: 1em; */

    .moonbounce-plus-button
    {
        width: 54px;
        height: 54px;
        border-radius: 50%;

        outline: none;

        cursor: pointer;

        background: var(--background-color-3);
        border: 2px solid var(--text-color);
        box-shadow: none !important;

        display: flex;
        justify-content: center;
        align-items: center;

        padding: 10px;
        box-sizing: border-box;

        user-select: none;

        img {
            width: 100%;
            height: 100%;
            object-fit: contain;

            pointer-events: none;
        }

        svg {
            /*width: 100%;
            height: 100%;*/
            object-fit: contain;

            pointer-events: none;
        }
    }
}`, "moonbouncePortalButtonCSS", moonbouncePortal);
}

/**
 * Add button to go to Moonbounce Plus GitHub Repository
 */
function addMoonbouncePlusButton() {
    let button = document.createElement("div");
    // button.innerText = "Moonbounce Plus";
    button.id = "moonbounce-plus-button";

    // add an image inside the button https://i.imgur.com/5sie5Oq.png
    let img = document.createElement("img");
    img.src = "https://i.imgur.com/5sie5Oq.png";
    button.appendChild(img);

    // add an event listener to the button
    button.addEventListener("click", function () {
        window.open("https://github.com/Jordy3D/MoonbouncePlus", "_blank");
    });

    addMoonbouncePortalButton(button);
}

/**
 * Add a button to go straight to the backpack
 * https://moonbounce.gg/u/@me/backpack
 */
function addBackpackButton() {
    let button = document.createElement("div");
    button.id = "backpack-button";

    // add the backpack icon to the button
    let path = "M16 6V18C16 19.1 15.1 20 14 20H2C0.9 20 0 19.1 0 18V6C0 4.14 1.28 2.59 3 2.14V0H6V2H10V0H13V2.14C14.72 2.59 16 4.14 16 6ZM2 10V12H12V14H14V10H2Z";
    let fill = "#808080";

    let offset = { x: 2, y: 0 };

    let svg = createSvgElement(20, 18, path, fill, offset);
    button.appendChild(svg);

    // add an event listener to the button
    button.addEventListener("click", function () {
        window.open("https://moonbounce.gg/u/@me/backpack", "_blank");
    });

    addMoonbouncePortalButton(button);
}

/**
 * Add a button to go straight to the directory
 * https://moonbounce.gg/u/@me/directory
 */
function addDirectoryButton() {
    let button = document.createElement("div");
    button.id = "directory-button";

    // add the directory icon to the button
    let path = "M10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20ZM14.5 5.5L8 8L5.5 14.5L12 12L14.5 5.5ZM10 11C9.73478 11 9.48043 10.8946 9.29289 10.7071C9.10536 10.5196 9 10.2652 9 10C9 9.73478 9.10536 9.48043 9.29289 9.29289C9.48043 9.10536 9.73478 9 10 9C10.2652 9 10.5196 9.10536 10.7071 9.29289C10.8946 9.48043 11 9.73478 11 10C11 10.2652 10.8946 10.5196 10.7071 10.7071C10.5196 10.8946 10.2652 11 10 11Z";
    let fill = "#808080";

    let svg = createSvgElement(20, 20, path, fill);
    button.appendChild(svg);

    // add an event listener to the button
    button.addEventListener("click", function () {
        window.open("https://moonbounce.gg/u/@me/directory", "_blank");
    });

    addMoonbouncePortalButton(button);
}

/**
 * Add a button to go straight to the marketplace
 * https://moonbounce.gg/u/@me/marketplace
 */
function addMarketplaceButton() {
    let button = document.createElement("div");
    button.id = "marketplace-button";

    // add the marketplace icon to the button
    let path = "M4 7H17.938L18.438 5H6V3H19.72C19.872 3 20.022 3.03466 20.1586 3.10134C20.2952 3.16801 20.4148 3.26495 20.5083 3.38479C20.6019 3.50462 20.6668 3.6442 20.6983 3.79291C20.7298 3.94162 20.7269 4.09555 20.69 4.243L18.19 14.243C18.1358 14.4592 18.011 14.6512 17.8352 14.7883C17.6595 14.9255 17.4429 15 17.22 15H3C2.73478 15 2.48043 14.8946 2.29289 14.7071C2.10536 14.5196 2 14.2652 2 14V2H0V0H3C3.26522 0 3.51957 0.105357 3.70711 0.292893C3.89464 0.48043 4 0.734784 4 1V7ZM4 21C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19C2 18.4696 2.21071 17.9609 2.58579 17.5858C2.96086 17.2107 3.46957 17 4 17C4.53043 17 5.03914 17.2107 5.41421 17.5858C5.78929 17.9609 6 18.4696 6 19C6 19.5304 5.78929 20.0391 5.41421 20.4142C5.03914 20.7893 4.53043 21 4 21ZM16 21C15.4696 21 14.9609 20.7893 14.5858 20.4142C14.2107 20.0391 14 19.5304 14 19C14 18.4696 14.2107 17.9609 14.5858 17.5858C14.9609 17.2107 15.4696 17 16 17C16.5304 17 17.0391 17.2107 17.4142 17.5858C17.7893 17.9609 18 18.4696 18 19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21Z";
    let fill = "#808080";

    let svg = createSvgElement(20, 20, path, fill);
    button.appendChild(svg);

    // add an event listener to the button
    button.addEventListener("click", function () {
        window.open("https://moonbounce.gg/u/@me/marketplace", "_blank");
    });

    addMoonbouncePortalButton(button);
}
//#endregion

//#endregion

//#region Helper Functions
// ██╗  ██╗███████╗██╗     ██████╗ ███████╗██████╗ 
// ██║  ██║██╔════╝██║     ██╔══██╗██╔════╝██╔══██╗
// ███████║█████╗  ██║     ██████╔╝█████╗  ██████╔╝
// ██╔══██║██╔══╝  ██║     ██╔═══╝ ██╔══╝  ██╔══██╗
// ██║  ██║███████╗███████╗██║     ███████╗██║  ██║
// ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝

//#region HTML and Web Functions

/**
 * Finds the current page's URL
 */
function findCurrentURL() {
    return window.location.href;
}

/**
 * Checks if the current URL is the target URL
 */
function isTargetURL(targetURL, skipQuery = false) {
    let currentURL = findCurrentURL();
    // remove anything after the ? in the URL
    if (skipQuery) {
        currentURL = currentURL.split("?")[0];
        targetURL = targetURL.split("?")[0];
    }

    return currentURL == targetURL;
}

/**
 * Find the inventory on the page
 * @returns the inventory div element | null
 */
function findInventory() {
    // find the inventory div
    let inventory = document.querySelector(getTargetSelector("Inventory"));
    if (inventory == null) return;

    return inventory;
}

/**
 * Find the selected item window on the page
 * @returns the selected item window div | null
 */
function findSelectedItemWindow() {
    // find the selected item window
    let selectedItemWindow = document.querySelector(getTargetSelector("Selected Item Window"));
    if (selectedItemWindow == null) return;

    return selectedItemWindow;
}

/**
 * Find Moonbounce Container
 */
function findMoonbounceContainer() {

    // id starts with moonbounce-ext-container
    let container = document.querySelector("[id^='moonbounce-ext-container']");
    if (container == null) return;

    return container;
}

/**
 * Find the Moonbounce Portal on the page
 */
function findMoonbouncePortal() {
    let container = findMoonbounceContainer();
    if (container == null) return;

    let shadowRoot = container.shadowRoot;
    if (shadowRoot == null) return;

    let portal = shadowRoot.querySelector(getTargetSelector("Moonbounce Portal"));
    if (portal == null) return;

    moonbouncePortal = portal;

    return portal;
}

/**
 * Find the Moonbounce Portal buttons on the page
 */
function findMoonbouncePortalButtons() {
    let portal = findMoonbouncePortal();
    if (portal == null) return;

    // set the button parent to the portal's second child
    let buttonParent = portal.children[1];
    if (buttonParent == null) return;

    // find the buttons
    let buttons = buttonParent.querySelector(getTargetSelector("Moonbounce Portal Button Container"));
    if (buttons == null) return;

    return buttons;
}
//#endregion

//#region Data and Information Functions

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

function getItemFromUUID(uuid) {
    let resultItem = items.find(item => item.uuid == uuid);
    return resultItem;
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
        let stackSize = item.parentElement.querySelector(getTargetSelector("Stack Size"));
        if (stackSize == null) continue;

        // convert the stack size to a number
        let quantity = parseInt(stackSize.innerText);

        try {
            let inventoryItem = new InventoryItem(resultItem.id, resultItem.name, resultItem.uuid, resultItem.rarity, resultItem.type, resultItem.value, quantity);
            inventoryData.push(inventoryItem);
        }
        catch (e) {
            inventoryData.push(new InventoryItem(0, "Unknown", uuid, "UNKNOWN", "UNKNOWN", 0, quantity));
        }

    }
}

//#endregion

//#region Create Elements

/**
 * Create an SVG element, with a path, fill, and optional offset
 */
function createSvgElement(width, height, pathData, fill, offset = { x: 0, y: 0 }) {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttributeNS(null, "width", width)
    svg.setAttributeNS(null, "height", height)
    svg.setAttributeNS(null, "preserveAspectRatio", "meet");
    svg.setAttributeNS(null, "fill", "none");
    // calculate the viewbox based on the width and height
    svg.setAttributeNS(null, "viewBox", `0 0 ${width} ${height}`);

    let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttributeNS(null, "fill-rule", "evenodd");
    path.setAttributeNS(null, "clip-rule", "evenodd");
    path.setAttributeNS(null, "d", pathData);
    path.setAttributeNS(null, "fill", fill);

    // offset the path
    path.style.transform = `translate(${offset.x}px, ${offset.y}px)`;

    svg.appendChild(path);

    return svg;
}

//#endregion

//#region Miscellaneous Support Functions

/**
 * Returns the result of an evaluation and logs a message based on the result
 */
function returnMessage(statement, trueMessage, falseMessage) {
    if (statement) {
        console.log(trueMessage);
        return true;
    }
    else {
        console.log(falseMessage);
        return false;
    }
}

/**
 * Download a file from a URL
 */
function downloadFile(url, filename) {
    let a = document.createElement("a");            // create a new link element
    a.href = url;                                   // set the href of the link to the URL
    if (filename)                                   // if a filename is provided
        a.download = filename;                      //  set the download attribute to the filename
    else                                            // otherwise
        a.download = url.split("/").pop();          //  set the download attribute to the last part of the URL
    a.click();                                      // simulate a click on the link
    a.remove();                                     // remove the link from the document
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
function addCSS(css, id, parent = document.head) {
    if (document.getElementById(id) != null) return;

    let style = document.createElement('style');
    style.id = id;
    style.innerHTML = css;
    parent.appendChild(style);
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

//#endregion