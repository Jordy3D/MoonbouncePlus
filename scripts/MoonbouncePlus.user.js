// ==UserScript==
// @name         Moonbounce Plus
// @namespace    Bane
// @version      0.14.0
// @description  A few handy tools for Moonbounce
// @author       Bane
// @match        *://*/*
// @icon         https://i.imgur.com/KzKSn2S.png
// @grant        GM_notification
// @grant        window.focus
// @grant        GM_setValue
// @grant        GM_getValue
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
// 0.9.1    - Stop the script from downloading the data from the web when it's not needed
//          - Shift CSS injection on the Moonbounce Portal to a separate function
//          - Fixed quick access buttons not having the correct styling
//          - Fixed styles duping because Shadow DOMs weren't seen by the ID check
// 0.9.2    - Fix accidentally ignoring the main Moonbounce page
// 0.9.3    - Added a button to go to the Wiki page for the selected item in the inventory
//          - Added the ability to copy data from the Marketplace
//          - Improved script loading to minimise the need for refreshes
//          - Cleaned up the Regions in the script
// 0.9.4    - Fixed an issue that could cause the script to try to load things it shouldn't multiple times
// 0.9.5    - Try a few things to improve the script's performance by reducing the number of times it looks for things
//          - Prep work for normal selectors to be used on the Moonbounce Portal for styling
// 0.9.6    - Fix URL being too specific for targetURL check on Moonbounce site
// 0.9.7    - Update selected item source class to keep up with Moonbounce changes
// 0.10.0   - OSRS Effects in chat!
//              - Currently limited to the Chat Window (not the speech bubbles)
// 0.10.1   - More selectors added to Moonbounce Portal elements
//              - Prep work for Notification area when items are collected
//              - Each character element's root (name, button, etc)
//          - Custom name banner for little ol' me 
// 0.11.0   - Added a link to the MoonbouncePlus settings in the Moonbounce settings page
//          - Hijacked the Moonbounce settings page to add MoonbouncePlus settings
// 0.11.1   - Fixed the MoonbouncePlus settings link not being properly visible on light mode
//          - Gave the settings groups so that they're easier to manage
//          - Added a few more settings
//              - Auto-refresh on application error
//          - Renamed some of the settings to avoid them sounding samey
// 0.12.0   - Added chat notifications so you can keep up with the chat without having to keep an eye on it
//              - Only works while the chat is open
//              - Options to receive notifications from everyone, no one, or a whitelist or blacklist of users
// 0.12.1   - Stop a fast refresh rate causing a refresh loop on the Application Error page
//          - Fix the notification duration setting not being applied to Ponder, Appraise, etc
// 0.12.2   - Added replacing YouTube links with the video title in the chat (prepwork for other links)
//          - Adjusted Settings page formatting
//          - Assign usernames to Portal character elements so that they can be targetted later for whatever reason
//          - Add selectors to parts of the portal to target player-specific elements
// 0.12.3   - Update to match new Moonbounce class names
//              - Sorting should now be slightly more reliable going forward as it uses a less specific selector
// 0.13.0   - Added a custom CSS section to the settings
//              - Allows for custom CSS to be added to the Moonbounce site and portal
//              - Can make use of the custom selectors I introduce rather than the default Moonbounce classes
//                  - This will update at approximately the speed of the Update Refresh Rate setting
// 0.14.0   - Added YouTube video embedding in the chat
//          - Added messages getting parsed when the chat is opened
//
// ==/Changelog==

// ==TODO==
//
// - Add more items and recipes (endless task)
// - Add more classes to find elements on the page (endless task)
// - Provide common elements with custom selectors on the Moonbounce main site (endless task)
//      - Or otherwise find a way to get the elements more automatically
//
// ==/TODO==

//#region Settings

// create a settings object to store the settings
var userSettings = [
    // Inventory
    { name: "Sort", description: "Show the sort select in the inventory controls", type: "boolean", defaultValue: true, value: true, group: "Inventory" },
    { name: "Ponder", description: "Show the Ponder button in the inventory controls", type: "boolean", defaultValue: true, value: true, group: "Inventory" },
    { name: "Appraise", description: "Show the Appraise button in the inventory controls", type: "boolean", defaultValue: true, value: true, group: "Inventory" },
    { name: "Unknown Item Highlight", description: "Highlight items in the inventory that are not in the database", type: "boolean", defaultValue: true, value: true, group: "Inventory" },
    { name: "Wiki Button", description: "Show the Wiki button in the inventory controls", type: "boolean", defaultValue: true, value: true, group: "Inventory" },

    // Marketplace
    { name: "Copy Marketplace Data", description: "Show the Copy Marketplace Data button in the marketplace controls", type: "boolean", defaultValue: true, value: true, group: "Marketplace" },

    // Portal
    { name: "Moonbounce Portal Buttons", description: "Show the Moonbounce Portal quick-access buttons", type: "boolean", defaultValue: true, value: true, group: "Portal" },
    // { name: "Use Moonbounce Portal CSS", description: "Show the Moonbounce Portal CSS", type: "boolean", defaultValue: true, value: true },
    { name: "OSRS Text Effects", description: "Show the OSRS text effects in the chat window", type: "boolean", defaultValue: true, value: true, group: "Portal" },
    { name: "Chat Notifications", description: "Show notifications when a message is received in the chat", type: "boolean", defaultValue: true, value: true, group: "Portal" },
    { name: "Chat Notification Mode", description: "The users to receive chat notifications from", type: "select", defaultValue: "None", value: "None", options: ["None", "All", "Whitelist", "Blacklist"], group: "Portal" },
    { name: "Chat Users Whitelist", description: "The users to receive chat notifications from (Display Name, separated with commas)", type: "text", defaultValue: "", value: "", group: "Portal" },
    { name: "Chat Users Blacklist", description: "The users to not receive chat notifications from (Display Name, separated with commas)", type: "text", defaultValue: "", value: "", group: "Portal" },
    { name: "Embed YouTube Videos", description: "Embed YouTube videos in the chat", type: "boolean", defaultValue: true, value: true, group: "Portal" },

    // General
    { name: "Auto-Refresh on Application Error", description: "Automatically refresh the page when an application error occurs", type: "boolean", defaultValue: true, value: true, group: "General" },
    { name: "Update Refresh Rate", description: "The rate at which the script checks the current site (in milliseconds)", type: "number", defaultValue: 1000, value: 1000, min: 100, max: 10000, group: "General" },
    { name: "Notification Duration", description: "The duration of the floating notification (in milliseconds)", type: "number", defaultValue: 2000, value: 2000, min: 500, max: 10000, group: "General" },

    // Custom CSS
    { name: "Custom CSS", description: "Custom CSS for MoonbouncePlus", type: "textarea", defaultValue: "", value: "", group: "Custom" },
]
function getSetting(name) {
    return userSettings.find(x => x.name == name);
}
function setSetting(name, value) {
    let setting = getSetting(name);
    if (setting == null) return;

    setting.value = value;
}
function getSettingValue(name) {
    let setting = getSetting(name);
    if (setting == null) return setting.defaultValue;

    return setting.value;
}

function saveSettings() {
    // save to Greasemonkey/Tampermonkey storage
    for (let setting of userSettings) {
        GM_setValue(setting.name, setting.value);

        if (setting.name == "Update Refresh Rate") refreshRate = setting.value;
        if (setting.name == "Notification Duration") notificationDuration = setting.value;
    }

    log("Settings saved");

    // spawn a notification at the bottom right of the screen
    floatingNotification("Settings saved", notificationDuration, "background-color: #333; color: #fff; padding: 5px 10px; border-radius: 5px;", "bottom-right");
}

function loadSettings() {
    // load from Greasemonkey/Tampermonkey storage
    for (let setting of userSettings) {
        let value = GM_getValue(setting.name);
        if (value != null) {
            if (value === "on") value = true; // Adjust based on storage behavior in case the checkbox was saved before

            // cap the value between the min and max values if they exist
            if (setting.min != null && value < setting.min) value = setting.min;
            if (setting.max != null && value > setting.max) value = setting.max;

            setting.value = value;
        }
    }

    log("Settings loaded!");
}


//#endregion


//#region Data
// ██████╗  █████╗ ████████╗ █████╗ 
// ██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗
// ██║  ██║███████║   ██║   ███████║
// ██║  ██║██╔══██║   ██║   ██╔══██║
// ██████╔╝██║  ██║   ██║   ██║  ██║
// ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝

loadSettings();

var refreshRate = getSettingValue("Update Refresh Rate");
var notificationDuration = getSettingValue("Notification Duration");

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
    if (items != null && recipes != null) return;

    log("Loading data...");

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
            // console.log(xhr.response);

            // get the items and recipes from the response json
            items = xhr.response.items;
            recipes = xhr.response.recipes || xhr.response.recipies;    // I misspelled recipes in the JSON file at first

            let logMessage = `Data loaded successfully\nItems: ${items.length}\nRecipes: ${recipes.length}`;
            log(logMessage);
        } else {
            error('Failed to load data');
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
    { name: "Selected Item Window", selector: "._base_1xand_1" },
    { name: "Selected Item Details", selector: "._base_awewl_1" },
    { name: "Source List Item", selector: ".mSsVp" },
    { name: "Diffuse Value", selector: ".WVOcs" },
    { name: "Stack Size", selector: "[class^='_stack_count_'" },

    { name: "Marketplace Container", selector: ".BLrCt" },
    { name: "Marketplace Controls", selector: ".t-IQf" },
    { name: "Marketplace Section", selector: ".FJbq-" },
    { name: "Marketplace Section Header", selector: "._text-xl_128i6_229" },
    { name: "Marketplace Section Item", selector: "._base_1ti9u_1" },

    { name: "Marketplace Item Rarity", selector: "[class^='_rarity_box']" },
    { name: "Marketplace Item Type", selector: ".eMjIv" },
    { name: "Marketplace Item Details", selector: ".GPrFb" },

    { name: "Moonbounce Portal", selector: "[id='MOONBOUNCE.PORTAL']" },
    { name: "Moonbounce Portal Root Container", selector: "[id*='moonbounce-root-container']" },
    { name: "Moonbounce Portal Button Container", selector: "._base_11wdf_1" },
]
const getTargetSelector = name => targetSelector.find(x => x.name == name).selector;

const targetURLs = [
    { name: "Inventory", url: "https://moonbounce.gg/u/@me/backpack" },
    { name: "Marketplace", url: "https://moonbounce.gg/u/@me/marketplace" },
    { name: "Settings", url: "https://moonbounce.gg/u/@me/settings" },
    { name: "MoonbouncePlus Settings", url: "https://moonbounce.gg/u/@me/settings?moonbounceplus" },
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




/**
 * Initialize the script and other initial functions
 */
function init() {
    // print Deathworlders Tweaks in large letters
    var textCSSMain = 'font-size: 30px; font-weight: bold; text-shadow: -3px 0px 0px rgba(255, 0, 0, 1),3px 0px 0px rgba(8, 0, 255, 1);';
    var textCSSSub = 'font-size: 15px; font-weight: bold;';
    console.log(`%cMoonbouncePlus%c${GM_info.script.version}\nby Bane`, textCSSMain, textCSSSub);

    // check the current site every second and page to see what functions to run
    window.refreshInterval = setInterval(() => {
        checkSite();
    }, refreshRate);
}

var observer = null;

function checkSite() {
    var currentURL = window.location.href;
    var isOnMoonbounceSite = currentURL.includes("moonbounce.gg");

    // Stuff specifically for Moonbounce
    if (isOnMoonbounceSite) {
        if (getSettingValue("Auto-Refresh on Application Error")) checkForApplicationError();

        if (isTargetURL(getTargetURL("Inventory"), true)) {
            loadData();

            addCopyDetailstoItemImage();

            if (getSettingValue("Wiki Button")) addWikiButton();

            if (getSettingValue("Ponder")) addPonderButton();
            if (getSettingValue("Appraise")) addAppraiseButton();
            if (getSettingValue("Sort")) addSortInventorySelect();

            if (getSettingValue("Unknown Item Highlight")) highlightUnknownItems();

        } else if (isTargetURL(getTargetURL("Marketplace"), true)) {

            if (getSettingValue("Copy Marketplace Data")) addCopyMarketplaceDataButton();

        } else if (isTargetURL(getTargetURL("Settings"), true)) {
            addLinkToMoonbouncePlusSettings();
            hijackSettingsPage();
        }

        addCustomCSS();
    }

    // Stuff for the Moonbounce Portal, which can be on any site
    moonbouncePortal = findMoonbouncePortal();                      // Attempt to find the portal once
    if (moonbouncePortal != null) {                                 // If the portal's found, run the Moonbounce Portal functions

        if (getSettingValue("Moonbounce Portal Buttons")) addMoonbouncePortalButtons(moonbouncePortal);

        addMoonbouncePortalCSS(moonbouncePortal);
        assignCustomSelectorsToPortalElements(moonbouncePortal);

        if (getSettingValue("OSRS Text Effects")) {
            observer = addMessageChecker(moonbouncePortal);
        }

        addCustomCSS("portal", moonbouncePortal);
    }
}

//#endregion


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

        log("Adding event listener to item");

        // add an event listener to the item's parent
        item.parentElement.addEventListener("click", function () {
            let img = this.querySelector("img");
            let uuid = getUUIDFromSrc(img.src);                             // get the item's UUID from the image source

            // also get the item name and id, and format it as
            // { id: "item id", name: "item name", uuid: "item uuid" }
            log("Copying item info to clipboard");

            let { name, id, description, rarity, type, value, sources } = getDetails(details);

            let itemInfo = { id: id, name: name, uuid: uuid, description: description, rarity: rarity, type: type, value: value, sources: sources };
            let jsonString = JSON.stringify(itemInfo);                  // convert the object to a JSON string

            jsonString = cleanJSONString(jsonString, id, value);        // Clean up the JSON string
            jsonString += ",";                                          // Add a comma to the end of the string

            copyToClipboard(jsonString);

            // Place a notification right below the item, centered directly below it
            let pos = img.getBoundingClientRect();
            let imgCenter = pos.left + (pos.width / 2);
            floatingNotification("Item info copied to clipboard", notificationDuration, "background-color: #333; color: #fff; padding: 5px 10px; border-radius: 5px; transform: translateX(-50%);", { top: pos.bottom + 10 + "px", left: imgCenter + "px" });
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
                floatingNotification("Item image saved as file", notificationDuration, "background-color: #333; color: #fff; padding: 5px 10px; border-radius: 5px; transform: translateX(-50%);", { top: pos.bottom + 10 + "px", left: imgCenter + "px" });

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

    log("Pondering...");

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

    floatingNotification(message, notificationDuration, "background-color: #333; color: #fff; padding: 5px 10px; border-radius: 5px; transform: translateX(-50%);", { top: pos.top + "px", left: pos.left + "px" }, true);

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
    log("Appraising...");

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

    floatingNotification(appraisalMessage, notificationDuration, "background-color: #333; color: #fff; padding: 5px 10px; border-radius: 5px; transform: translateX(-50%);", { top: pos.top + "px", left: pos.left + "px" }, true);
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
    log(`Sorting inventory by ${method}`);

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

//#region Moonbounce Portal

/**
 * Add CSS to the Moonbounce Portal to style the buttons
 */
function addMoonbouncePortalCSS(portal) {
    addCSS(`
#moonbounce-plus-button-container {
    --background-color: white;
    --background-color-2: #F8F9FA;
    --background-color-3: #F1F3F5;
    --content-color: white;
    --text-color: #23262F;
    --border-color: #E6E8EC;
    --navbar-bg: white;
    --background-color-hover: #F8F9FA;

    --header-bg: white;
    --line-color: #E6E8EC;
    --top-nav-bg: #333;
    --top-nav-text: white;
}

@media (prefers-color-scheme: dark) {
    #moonbounce-plus-button-container {
        --background-color: #131317;
        --background-color-2: #23262f;
        --background-color-3: #1a1a22;
        --content-color: #131317;
        --text-color: #e0e0e0;
        --border-color: #353945;
        --navbar-bg: #2a2a2a;
        --background-color-hover: #23262f;

        --border-color-3: #353945;
        --fill-icon: #e0e0e0;
    }
}
`, "moonbouncePortalCSS", portal);

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
    }`, "moonbouncePortalButtonCSS", portal);

    addCSS(`
/* 

OSRS EFFECTS!!!!!!!

*/

#chat-window {
    --rs-red: red;
    --rs-cyan: cyan;
    --rs-yellow: yellow;
    --rs-green: lime;
    --rs-purple: magenta;
  
  
    --rs-blue: blue;
    --rs-dark-green: green;
}

.rs-red {
    color: var(--rs-red);
}
.rs-cyan {
    color: var(--rs-cyan);
}
.rs-yellow {
    color: var(--rs-yellow);
}
.rs-green {
    color: var(--rs-green);
}
.rs-purple {
    color: var(--rs-purple);
}

/* flash1: red/yellow flash */
/* flash2: cyan/blue flash */
/* flash3: light/dark green flash */

.rs-flash1 {
    animation: flash1 1s infinite;
}

/* flash1 */
@keyframes flash1 {
    0%, 50% {
        color: var(--rs-red);
    }
    50.1%, 100% {
        color: var(--rs-yellow);
    }
}

.rs-flash2 {
    animation: flash2 1s infinite;
}

/* flash2 */
@keyframes flash2 {
    0%, 50% {
        color: var(--rs-cyan);
    }
    50.1%, 100% {
        color: var(--rs-blue);
    }
}

.rs-flash3 {
    animation: flash3 1s infinite;
}

/* flash3 */
@keyframes flash3 {
    0%, 50% {
        color: var(--rs-green);
    }
    50.1%, 100% {
        color: var(--rs-dark-green);
    }
}
/* 
"glow1", // red/blue fade
"glow2", // red/purple/blue fade
"glow3", // white/green/blue fade */

.rs-glow1 {
    animation: glow1 1s infinite;
}
@keyframes glow1 {
    0%, 100%{
        color: var(--rs-red);
    }
    50%{
        color: var(--rs-blue);
    }
}

.rs-glow2 {
    animation: glow2 1s infinite;
}
@keyframes glow2 {
    0%, 100%{
        color: var(--rs-red);
    }
    33%{
        color: var(--rs-purple);
    }
    66%{
        color: var(--rs-blue);
    }
}

.rs-glow3 {
    animation: glow3 3s infinite;
}
@keyframes glow3 {
    0%, 100%{
        color: white;
    }
    33%{
        color: var(--rs-green);
    }
    66%{
        color: var(--rs-blue);
    }
}



/* in the .rs-wave element, animate the children up and down, offset from each other by 50ms */
.rs-wave1, .rs-wave2 {
    display: inline-block;
    position: relative;
  
  overflow-x: visible;
}

.rs-wave1 > * {
    position: relative;
    animation: wave1 1s infinite;
  
  display: inline-block;
}

.rs-wave1 > *:nth-child(5n) {
    animation-delay: -0.5s;
}
.rs-wave1 > *:nth-child(5n-1) {
    animation-delay: -0.4s;
}
.rs-wave1 > *:nth-child(5n-2) {
    animation-delay: -0.3s;
}
.rs-wave1 > *:nth-child(5n-3) {
    animation-delay: -0.2s;
}
.rs-wave1 > *:nth-child(5n-4) {
    animation-delay: -0.1s;
}


@keyframes wave1 {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-5px);
    }
}

.rs-wave2 > * {
    position: relative;
    animation: wave2 1s infinite linear;
  
  display: inline-block;
}

.rs-wave2 > *:nth-child(5n) {
    animation-delay: -0.5s;
}
.rs-wave2 > *:nth-child(5n-1) {
    animation-delay: -0.4s;
}
.rs-wave2 > *:nth-child(5n-2) {
    animation-delay: -0.3s;
}
.rs-wave2 > *:nth-child(5n-3) {
    animation-delay: -0.2s;
}
.rs-wave2 > *:nth-child(5n-4) {
    animation-delay: -0.1s;
}


@keyframes wave2 {
    0%, 100% {
        transform: translate(0,0);
    }
    50% {
        transform: translate(5px, 5px);
    }
}


.rs-scroll > span
{
    animation: scroll 3s infinite linear;
    display: inline-block;
}

/* scroll from the right to the left, stopping in the middle for a bit */
@keyframes scroll {
    0%, 10% {
        transform: translateX(110%);
    }
    30%, 70% {
        transform: translateX(0%);
    }
  
    90%, 100%{
      transform: translatex(-100%);
    }
}

.rs-slide > span
{
    animation: slide 3s infinite linear;
    display: inline-block;
}

/* scroll from the right to the left, stopping in the middle for a bit */
@keyframes slide {
    0%, 10% {
        transform: translateY(-100%);
    }
    30%, 70% {
        transform: translateY(0%);
    }
  
    90%, 100%{
      transform: translateY(100%);
    }
}

.checked {
    padding: 0;
}

.rs-rainbow {
    animation: rainbow 5s infinite linear;
}

@keyframes rainbow {
    0% {
        color: var(--rs-red);
    }
    16.666% {
        color: var(--rs-yellow);
    }
    33.333% {
        color: var(--rs-green);
    }
    50% {
        color: var(--rs-cyan);
    }
    66.666% {
        color: var(--rs-blue);
    }
    83.333% {
        color: var(--rs-purple);
    }
    100% {
        color: var(--rs-red);
    }
}


  `, "osrsEffectsCSS", portal);

    addCSS(`
.bane-banner {
    background: black;
    border-radius: 4px;
    border-left: 4px solid red;
    border-right: 4px solid #0095ff;

    p {
        display: flex;
        position: relative;
    }

    ::before,
    ::after {
        content: "Bane";
        font-size: inherit;
        line-height: inherit;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: -1;
    
        filter: blur(1px);
    }

    ::before {
        color: red;
        animation: redGlitch 1s infinite;
    }
    ::after {
        color: #0095ff;
        animation: blueGlitch 1s infinite;
        animation-delay: 0.5s;
    }
}

/* animate the before and after pseudoelements to look glitchy (moving left and right erratically) */
@keyframes redGlitch {
    0%   { transform: translateX(0); } 
    15%  { transform: translateX(-3px); } 
    35%  { transform: translateX(2px); } 
    55%  { transform: translateX(-4px); } 
    75%  { transform: translateX(1px); } 
    100% { transform: translateX(0); }
}

@keyframes blueGlitch {
    0%   { transform: translateX(0); }
    10%  { transform: translateX(4px); }
    30%  { transform: translateX(-2px); }
    50%  { transform: translateX(5px); }
    70%  { transform: translateX(-1px); }
    90%  { transform: translateX(3px); }
    100% { transform: translateX(0); }
}`, "baneBannerCSS", portal);
}


/**
 * Adds custom selectors to the Moonbounce Portal elements to allow for easier styling
 */
function assignCustomSelectorsToPortalElements(portal) {
    // if the portal already contains #classesAssigned, return
    // let existing = portal.querySelector("#classesAssigned");
    // if (existing != null) return;
    assignLabelsToPortalChildren(portal);

    var chatWindowFound = false;

    const classes = [
        { name: "Button Control Bar", selector: "._base_11wdf_1._nowrap_11wdf_12._justify_start_11wdf_21._align_center_11wdf_42._content_normal_11wdf_60", id: "button-control-bar", class: "" },
        { name: "Chat Container", selector: "._base_1jhq3_1", id: "chat-container", class: null },
        { name: "Chat Window", selector: "._base_1jhq3_1 ._content_1jhq3_13", id: "chat-window", class: null },
        { name: "Message Feed", selector: "#chat-window [class*='_middle_']", id: "message-feed", class: null },
        { name: "Message", selector: "#message-feed > div", id: null, class: "message", all: true },
        { name: "Message Content", selector: ".message .message_row", id: null, class: "message-content", all: true },
        { name: "Message Text", selector: ".message-content [class^='_message_'", id: null, class: "message-text", all: true },
        { name: "Pickup Notification Container", selector: "div:nth-child(1) ._base_1d537_1", id: "pickup-notification-container", class: null },
        { name: "Character Name Banner", selector: "[label='MBP.CHARACTER.NAME'] ._base_5l9jc_1", id: null, class: "character-name-banner", all: true },
    ]

    for (let item of classes) {
        if (item.all) {
            let elements = portal.querySelectorAll(item.selector);
            for (let element of elements) {
                if (element.id == item.id) continue;
                if (element.classList.contains(item.class)) continue;

                let idToAssign = item.id;
                let classToAdd = item.class;
                if (idToAssign != "" && idToAssign != null)
                    element.id = idToAssign;

                if (classToAdd != "" && classToAdd != null)
                    element.classList.add(classToAdd);
            }
            continue;
        }

        let element = portal.querySelector(item.selector);
        if (element == null) continue;
        if (element.id == item.id) continue;
        if (element.classList.contains(item.class)) continue;

        let idToAssign = item.id;
        let classToAdd = item.class;
        if (idToAssign != "" && idToAssign != null)
            element.id = idToAssign;

        if (classToAdd != "" && classToAdd != null)
            element.classList.add(classToAdd);

        // set a flag for if chat was found
        if (item.name == "Chat Window")
            chatWindowFound = true;
    }

    giveBaneSpecialBanner(portal);

    // if chat was found, force parse the messages
    if (chatWindowFound)
        parseChatMessages(portal);
}

function giveBaneSpecialBanner(portal) {
    // if bane already has a banner, return
    if (portal.querySelector(".bane-banner") != null) return;

    let banners = portal.querySelectorAll(".character-name-banner");
    if (banners == null) return;

    for (let banner of banners) {
        let name = banner.innerText;
        if (name == "Bane‎")
            banner.classList.add("bane-banner");
    }
}


function assignLabelsToPortalChildren(portal) {
    let children = portal.children;

    // create an array of the children of the portal, ignoring non-div elements
    children = Array.from(children).filter(x => x.tagName == "DIV");

    // check if all children have label and user attributes
    let allHaveLabels = true;
    let allHaveUsers = true;
    for (i = 0; i < children.length; i++) {
        let child = children[i];
        if (!child.hasAttribute("label")) allHaveLabels = false;
        if (i > 1 && !child.hasAttribute("user")) allHaveUsers = false;

        // If both are already false, break early to avoid unnecessary iterations
        if (!allHaveLabels && !allHaveUsers) break;
    }
    if (allHaveLabels && allHaveUsers) return;

    // create an array called controlChildren of just the first two children
    let controlChildren = children.slice(0, 2);
    // create an array called characterChildren of the rest of the children
    let characterChildren = children.slice(2);

    // if not all children have labels, assign labels to the control and character children
    if (!allHaveLabels) {
        // the character children containing the following selectors will be labelled as follows:
        let selectorAndLabels = [
            { selector: "button", label: "MBP.CHARACTER.BUTTON", class: "character-button" },
            { selector: "._base_5l9jc_1", label: "MBP.CHARACTER.NAME", class: "character-name" },
            { selector: "._base_1d537_1", label: "MBP.CHARACTER.SPEECH", class: "character-speech" }
        ];

        // assign the labels to the control children
        let controlLabels = ["MBP.NOTIFICATION", "MBP.CONTROLS"];
        for (let i = 0; i < controlChildren.length; i++)
            controlChildren[i].setAttribute("label", controlLabels[i]);

        // assign the labels to the character children
        for (let i = 0; i < characterChildren.length; i++) {
            if (characterChildren[i].hasAttribute("label")) continue;

            let element = characterChildren[i];
            // if the element contains the selector, assign the label to the element
            for (let item of selectorAndLabels) {
                let found = element.querySelector(item.selector);
                if (found != null) {
                    element.setAttribute("label", item.label);

                    // add the class to the element
                    if (item.class != null)
                        found.classList.add(item.class);
                    break;
                }
            }
        }
    }

    // if not all appropriate children have user names, assign user names to the character children
    if (!allHaveUsers) {
        // split the characteChildren into groups of 3
        let characterGroups = [];
        while (characterChildren.length > 0)
            characterGroups.push(characterChildren.splice(0, 3));

        function findUserDisplayNameInGroup(group) {
            for (let element of group) {
                let nameElement = element.querySelector("._base_5l9jc_1");
                if (nameElement != null)
                    return nameElement.innerText;
            }
            return null;
        }

        // in each group, find the character's name and assign the label to every element in the group as user=characterName
        for (let group of characterGroups) {
            let characterName = findUserDisplayNameInGroup(group);

            for (let element of group) {
                if (characterName == null) continue;
                element.setAttribute("user", characterName);
            }
        }
    }
}

//#region Moonbounce Portal Buttons

/**
 * Add buttons to the Moonbounce Portal to quickly access Moonbounce features
 */
function addMoonbouncePortalButtons(portal) {
    // add a button to go to the Moonbounce Plus GitHub Repository
    addMoonbouncePlusButton(portal);

    // quick access buttons
    addDirectoryButton(portal);
    addBackpackButton(portal);
    addMarketplaceButton(portal);
}

/**
 * Adds a button to the Moonbounce Portal 
 */
function addMoonbouncePortalButton(button, portal = null) {
    let buttons = findMoonbouncePortalButtons(portal);
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
}

/**
 * Add button to go to Moonbounce Plus GitHub Repository
 */
function addMoonbouncePlusButton(portal) {
    let button = document.createElement("div");
    // button.innerText = "Moonbounce Plus";
    button.id = "moonbounce-plus-button";

    // add an image inside the button
    let img = document.createElement("img");
    img.src = "https://i.imgur.com/KzKSn2S.png";
    button.appendChild(img);

    // add an event listener to the button
    button.addEventListener("click", function () {
        window.open("https://github.com/Jordy3D/MoonbouncePlus", "_blank");
    });

    addMoonbouncePortalButton(button, portal);
}

/**
 * Add a button to go straight to the backpack
 * https://moonbounce.gg/u/@me/backpack
 */
function addBackpackButton(portal) {
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

    addMoonbouncePortalButton(button, portal);
}

/**
 * Add a button to go straight to the directory
 * https://moonbounce.gg/u/@me/directory
 */
function addDirectoryButton(portal) {
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

    addMoonbouncePortalButton(button, portal);
}

/**
 * Add a button to go straight to the marketplace
 * https://moonbounce.gg/u/@me/marketplace
 */
function addMarketplaceButton(portal) {
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

    addMoonbouncePortalButton(button, portal);
}
//#endregion
//#endregion

//#region Chat Notifications and Effects

function parseChatMessages(portal) {
    // find the chat window
    let chatWindow = portal.querySelector("#chat-window");
    if (chatWindow == null) return;

    // find the message feed
    let messageFeed = chatWindow.querySelector("#message-feed");
    if (messageFeed == null) return;

    // find the messages
    let messages = messageFeed.querySelectorAll(".message-text");

    // for each message, parse the message
    for (let message of messages) {
        parseMessage(message);
    }
}

function parseMessage(messageText) {
    if (messageText.classList.contains("checked")) return;

    // add the class "checked" to the message
    messageText.classList.add("checked");

    // try and replace the YouTube link with the video title, and embed the video
    messageText = parseForYouTube(messageText);

    let parsedMessage = messageText.innerText;

    // try and parse the message to see if it has an effect tag
    parsedMessage = parseForOSRS(parsedMessage);
    if (parsedMessage != messageText.innerText) {
        messageText.innerHTML = parsedMessage;
    }
}

function handleNewMessage(messageTarget, messageTextElement, chatReload = false) {

    if (messageTextElement.classList.contains("checked")) return false;

    let messageAuthorElement = messageTarget.querySelector("[class^='_display_name_']");

    let newMessage = messageTextElement.innerText;
    // log(`New message by ${messageAuthorElement.innerText}: ${newMessage}`);

    // add the class "checked" to the message
    messageTextElement.classList.add("checked");

    // try and replace the YouTube link with the video title
    messageTextElement = parseForYouTube(messageTextElement);

    let parsedMessage = newMessage;

    // try and parse the message to see if it has an effect tag
    parsedMessage = parseForOSRS(parsedMessage);
    if (parsedMessage != newMessage) {
        messageTextElement.innerHTML = parsedMessage;
    }

    if (chatReload) return true;

    // send a notification with the message based on the user's settings
    let notificationMode = getSetting("Chat Notification Mode").value;

    switch (notificationMode) {
        case "None":
            break;
        case "All":
            notify(newMessage);
            break;
        case "Whitelist":
            let whitelist = getSetting("Chat Users Whitelist").value;
            if (whitelist.includes(messageAuthorElement.innerText))
                notify(newMessage);
            break;
        case "Blacklist":
            let blacklist = getSetting("Chat Users Blacklist").value;
            if (!blacklist.includes(messageAuthorElement.innerText))
                notify(newMessage);

            break;
    }

    return true;
}

function handleNewMessageSameAuthor(mutation) {
    // Define what element was changed
    let messageTarget = mutation.target;

    // Find the last message in the message feed
    let messageTextElement = messageTarget.querySelector("[class*='_message_']:last-child");
    if (messageTextElement == null) return;

    // handle the new message
    let newMessage = handleNewMessage(messageTarget, messageTextElement);
}

function handleNewMessageNewAuthor(mutation) {
    // Define what element was changed
    let messageTarget = mutation.target.children[mutation.target.children.length - 2];

    // Find the last message in the message feed
    let messageTextElement = messageTarget.querySelector("[class*='_message_'");
    if (messageTextElement == null) return;

    // handle the new message
    let newMessage = handleNewMessage(messageTarget, messageTextElement);
}

function handleNewMessageFromScratch(mutation) {
    // Define what element was changed
    let messageTarget = mutation.target;

    // Find the last message in the message feed
    let messageTextElement = messageTarget.querySelector("[class*='_message_']:last-child");
    if (messageTextElement == null) return;

    // handle the new message
    let newMessage = handleNewMessage(messageTarget, messageTextElement);
}

let messageObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        // log("New message detected");
        // this will either grab the parent message feed if the target is a child of it, or the message feed itself if that is what changed (such as on the first message sent)
        let messageFeed = mutation.target.closest("#message-feed") || mutation.target.querySelector("[class*='_middle_']");
        if (messageFeed == null) return;

        // if the mutation parent matches the selector [class*='_middle_'], handle the new message from a new author
        if (mutation.target.matches("[class*='_middle_']"))
            handleNewMessageNewAuthor(mutation);
        else if (mutation.target.matches("[class*='_message_']"))
            handleNewMessageSameAuthor(mutation);
        else
            handleNewMessageFromScratch(mutation);

        // add stale class to the message feed
        messageFeed.classList.remove("fresh");
    });
});


// add a checker on the #message-feed to check for new messages and log them
function addMessageChecker(portal) {
    let messageFeed = portal.querySelector("#message-feed");
    // if (returnMessage(messageFeed == null, "Message Feed not found")) return;
    if (messageFeed == null) return;

    messageFeed = messageFeed.parentElement;

    // if the messageFeed has the class "stale"
    if (!messageFeed.classList.contains("fresh")) {
        log("Adding fresh message observer to message feed");
        messageObserver.observe(messageFeed, { childList: true, subtree: true });
        // remove the class "stale" from the messageFeed
        messageFeed.classList.add("fresh");
    }
}


/**
 * Notification
 */

function notify(message) {
    // if the window is focused, return
    if (document.hasFocus()) return;

    log(`Notifying: ${message}`);

    let notificationDetails = {
        text: message,
        title: 'Moonbounce Plus',
        timeout: 5000,
        onclick: function () { window.focus(); },
    };
    GM_notification(notificationDetails);
}

const effectTags = [
    { name: "yellow", type: "colour" },
    { name: "red", type: "colour" },
    { name: "green", type: "colour" },
    { name: "cyan", type: "colour" },
    { name: "purple", type: "colour" },
    { name: "white", type: "colour" },
    { name: "rainbow", type: "colour" },

    { name: "flash1", type: "colour" }, // red/yellow flash
    { name: "flash2", type: "colour" }, // cyan/blue flash
    { name: "flash3", type: "colour" }, // light/dark green flash

    { name: "glow1", type: "colour" }, // red/blue fade
    { name: "glow2", type: "colour" }, // red/purple/blue fade
    { name: "glow3", type: "colour" }, // white/green/blue fade

    { name: "wave1", type: "character" }, // wave effect 1
    { name: "wave2", type: "character" }, // wave effect 2",
    // { name: "shake", type: "character" }, // shake effect

    { name: "scroll", type: "body" },   // scroll effect
    { name: "slide", type: "body" },    // slide effect
]

function parseForOSRS(message) {
    let parsedMessage = message;

    // check if message has tag by checking if it has a :
    let tagIndex = parsedMessage.indexOf(":");
    if (tagIndex == -1) return parsedMessage;

    // if the tag is the first character or last character, return
    if (tagIndex == 0 || tagIndex == parsedMessage.length - 1) return parsedMessage;

    // find every tag in the message
    let foundTags = parsedMessage.match(/(\w+):/g);
    if (foundTags == null) return parsedMessage;

    var realTags = [];

    // for each tag in the message, remove the tag and colon from the message
    for (let tag of foundTags) {

        // if the tag is a valid effect tag, add it to the realTags array
        let foundTag = effectTags.find(x => x.name == tag.replace(":", ""));
        if (foundTag != null) {
            realTags.push(foundTag);

            // remove the tag and colon from the message
            let fullTag = tag + ":";
            parsedMessage = parsedMessage.replace(fullTag, "");
        }
    }

    // if there are no real tags, return the parsed message
    if (realTags.length == 0) return parsedMessage;

    // remove the effect tags from the message
    for (let tag of effectTags) {
        let fullTag = tag.name + ":";
        parsedMessage = parsedMessage.replace(fullTag, "");
    }

    // trim the message
    parsedMessage = parsedMessage.trim();

    var hasColourTag = false;
    var hasCharacterTag = false;
    var hasBodyTag = false;

    classesToAdd = [];

    // if there are real tags, add the effect tags to the message
    for (let tag of realTags) {
        if (tag.type == "colour" && !hasColourTag) {
            hasColourTag = true;

            classesToAdd.push(`rs-${tag.name}`);
        }

        if (tag.type == "character" && !hasCharacterTag) {
            hasCharacterTag = true;

            let spans = splitTextIntoSpans(parsedMessage);
            parsedMessage = "";
            for (let span of spans) {
                parsedMessage += span.outerHTML;
            }

            classesToAdd.push(`rs-${tag.name}`);
        }

        if (tag.type == "body" && !hasBodyTag) {
            hasBodyTag = true;

            // wrap the message in a div with a span
            parsedMessage = `<span>${parsedMessage}</span>`;

            classesToAdd.push(`rs-${tag.name}`);
        }

    }

    // add a class called .rs-[tag] to the message as by surrounding it with an rs tag
    let wrappedMessage = `<rs class="${classesToAdd.join(" ")}">${parsedMessage}</rs>`;
    return wrappedMessage;
}

function parseForYouTube(messageTextElement) {

    // find all a tags in the message
    let links = messageTextElement.querySelectorAll("a");
    if (links == null) return messageTextElement;

    // check for any YouTube links in the message
    let youtubeLinks = [];
    for (let link of links) {
        if (link.href.includes("youtube.com"))
            youtubeLinks.push(link);
    }

    // if there are no YouTube links, return the message
    if (youtubeLinks.length == 0) return messageTextElement;

    function createEmbed(link) {
        let videoId = link.href.split("v=")[1];
        let embedLink = `https://www.youtube.com/embed/${videoId}?rel=0&controls=0`;

        let iframe = document.createElement("iframe");
        iframe.src = embedLink;
        iframe.width = "200";
        iframe.height = "110";
        iframe.frameborder = "0";
        iframe.style = "border: none;";
        // enable allowfullscreen
        iframe.setAttribute("allowfullscreen", "");

        return iframe;
    }

    // for each YouTube Link, get the video title and replace the link text with the title
    for (let link of youtubeLinks) {
        getPageTitle(link.href).then(title => {
            // set the text content of the link to the title
            link.textContent = title;
        }).catch(error => console.error(error));

        if (getSettingValue("Embed YouTube Videos")) {
            log("Embedding YouTube video");
            let embed = createEmbed(link);
            messageTextElement.appendChild(embed);
        }
    }

    return messageTextElement;
}

function splitTextIntoSpans(text) {
    let spans = [];
    // split the input text into an array of characters
    let characters = text.split("");

    // for each character in the array, create a rsc element with the character as the text content
    for (let character of characters) {
        let span = document.createElement("rsc");
        if (character == " ") character = " ";
        span.textContent = character;
        spans.push(span);
    }

    return spans;
}

//#endregion

//#region Copy Marketplace Data

/**
 * Add a button to copy the marketplace data to the clipboard
 */
function addCopyMarketplaceDataButton() {
    // find the marketplace container div
    let marketplaceData = document.querySelector(getTargetSelector("Marketplace Container"));
    if (marketplaceData == null) return;

    // if the marketplace container already has the bane-copy-marketplace-data-button, return
    let existingButton = document.querySelector("#bane-copy-marketplace-data-button");
    if (existingButton != null) return;

    // find the marketplace controls div
    let marketplaceControls = document.querySelector(getTargetSelector("Marketplace Controls"));
    if (marketplaceControls == null) return;

    // create a new button in the marketplace controls
    let button = document.createElement("button");
    button.innerText = "Copy Data";
    button.id = "bane-copy-marketplace-data-button";
    button.classList.add("bane-marketplace-button");

    // add an event listener to the button
    button.addEventListener("click", function () {
        copyMarketplaceData();
    });

    marketplaceControls.appendChild(button);

    // add some CSS to the button
    addCSS(`
.bane-marketplace-button {
    background-color: #353945;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 2em;
    cursor: pointer;

    font-size: .875rem;
    line-height: 1rem;
    font-weight: 600;

    margin-left: 16px;

    transition: .2s;

    &:hover {
        background-color: white;
        color: #353945;
    }
}
`, "copyMarketplaceDataButtonCSS");
}

/**
 * Copy the marketplace data to the clipboard
 */
function copyMarketplaceData() {
    let marketplaceData = document.querySelector(getTargetSelector("Marketplace Container"));
    if (marketplaceData == null) return;

    let items = [];

    // find all the sections in the marketplace data
    let sections = marketplaceData.querySelectorAll(getTargetSelector("Marketplace Section"));
    for (let section of sections) {
        // get the section name from the section header
        let sectionName = section.querySelector(getTargetSelector("Marketplace Section Header")).innerText;

        // find all the items in the section
        let sectionItems = section.querySelectorAll(getTargetSelector("Marketplace Section Item"));

        for (let item of sectionItems) {
            let rarity = item.querySelector(getTargetSelector("Marketplace Item Rarity")).innerText;        // May be used in the future
            let type = item.querySelector(getTargetSelector("Marketplace Item Type")).innerText;            // May be used in the future
            let details = item.querySelector(getTargetSelector("Marketplace Item Details"));
            // name is the text content of the first child of the item details, cost is the text content of the last child
            let name = details.children[0].textContent;
            let cost = details.children[details.children.length - 1].textContent;
            // remove the "MP" and commas from the cost
            cost = cost.replace(/,/g, "").replace("MP", "").trim();

            let itemObject = { name: name, section: sectionName, cost: cost, };
            items.push(itemObject);
        }
    }

    // convert the items array to a JSON string that is formatted with 4 spaces
    let data = JSON.stringify(items, null, 4);
    data = data.replace(/"cost": "(.*)"/g, '"cost": $1');

    // copy the data to the clipboard
    navigator.clipboard.writeText(data);

    // spawn a notification under the cursor position
    let pos = { top: event.clientY, left: event.clientX };              // get the current mouse position
    pos.top += 10;                                                      // offset the position down by 10 pixels

    floatingNotification("Marketplace data<br>copied to clipboard", notificationDuration, "background-color: #333; color: #fff; padding: 5px 10px; border-radius: 5px; transform: translateX(-50%);", { top: pos.top + "px", left: pos.left + "px" }, true);
}

//#endregion

//#region Wiki Button on Items

/**
 * Add a button to the selected item window to go to the Moonbounce Wiki page for the item
 */
function addWikiButton() {
    if (!isTargetURL(getTargetURL("Inventory"), true)) return;

    // find the selected item window
    let selectedItemWindow = findSelectedItemWindow();
    if (selectedItemWindow == null) return;

    // if the selected item window already has the bane-wiki-button, return
    let existingButton = selectedItemWindow.querySelector("#bane-wiki-button");
    if (existingButton != null) return;

    // find the item details div
    let itemDetails = selectedItemWindow.querySelector(getTargetSelector("Selected Item Details"));
    if (itemDetails == null) return;

    // get the container that will contain the button (the 2nd child of the 2nd child of the selected item details)
    let buttonContainer = itemDetails.children[1].children[1];
    if (buttonContainer == null) return;

    // create a new button in the button container
    let button = document.createElement("button");
    button.innerText = "Wiki";
    button.id = "bane-wiki-button";
    button.classList.add("bane-wiki-button");

    // add an event listener to the button after formatting the item name to be used in the URL
    button.addEventListener("click", function () {
        let details = getDetails();
        let itemName = details.name;

        let formattedName = itemName.replace(/ /g, "_");
        formattedName = formattedName.replace(/'/g, "%27");

        openWikiPage(formattedName);
    });

    buttonContainer.appendChild(button);

    // add some CSS to the button
    addCSS(`
.bane-wiki-button {
    --wikiColour: #B8D0FF;

    background-color: var(--background-color-2);
    color: var(--text-color);

    border: 2px solid var(--wikiColour);
    border-radius: 4px;

    padding: 6px 8px;
    cursor: pointer;

    transition: .2s;

    &:hover {
        background-color: var(--wikiColour);
        color: var(--background-color-2);
    }
}
`, "wikiButtonCSS");
}

/**
 * Open the Moonbounce Wiki page for the item
 */
function openWikiPage(itemName) {
    // https://moonbounce.wiki/w/ITEM_NAME
    let wikiURL = `https://moonbounce.wiki/w/${itemName}`;
    window.open(wikiURL, "_blank");
}



//#endregion

//#region Settings Page

function addLinkToMoonbouncePlusSettings() {
    // find the ._base_q8l18_1 div
    let settingsDiv = document.querySelector("._base_q8l18_1");
    if (settingsDiv == null) return;

    // if the settingsDiv already has the moonbounce-plus-settings-link, return
    let existingLink = settingsDiv.querySelector(".moonbounce-plus-settings-link");
    if (existingLink != null) return;

    // append a blank div with the class "line"
    let line = createElement("div", { class: "line" }, settingsDiv);

    // create an a element that links to the Moonbounce Plus settings page (https://moonbounce.gg/u/@me/settings?moonbounceplus)
    let link = createElement("a", { href: "https://moonbounce.gg/u/@me/settings?moonbounceplus", class: "moonbounce-plus-settings-link" }, settingsDiv);

    // create two divs inside the link, one for the icon and one for the text
    let iconDiv = createElement("div", { class: "icon" }, link);
    let textDiv = createElement("div", { class: "text" }, link);

    // create an img element inside the icon div
    let img = createElement("img", { src: "https://i.imgur.com/KzKSn2S.png" }, iconDiv);

    // create a span element inside the text div
    let span = createElement("span", { textContent: "Moonbounce Plus" }, textDiv);

    // add another line after the link
    let line2 = createElement("div", { class: "line" }, settingsDiv);

    // add some CSS to the link
    addCSS(`
.moonbounce-plus-settings-link {

    display: flex;
    gap: 24px;
    align-items: center;

    background-color: var(--background-color-3);
    text-decoration: none !important;
    padding: 24px;

    cursor: pointer;

    transition: .2s;

    &:hover {
        background-color: var(--background-color-hover);
    }

    .icon {
        width: 20px;
        height: 20px;

        filter: saturate(0) brightness(5);
    }

    &.active {
        .icon {
            filter: unset;
        }
    }

    .text {
        color: var(--text-color);
    }
}`, "moonbouncePlusSettingsLinkCSS");

    // If the current page is the Moonbounce Plus settings page, add the aria-current="page" attribute to the link and remove the aria-current="page" attribute from the other links
    if (isTargetURL(getTargetURL("MoonbouncePlus Settings"))) {

        // remove the aria-current="page" attribute from all other links
        let links = settingsDiv.querySelectorAll("a");
        for (let l of links) {
            if (!l.hasAttribute("aria-current")) continue;

            l.removeAttribute("aria-current");

            // find every path and set the fill to gray
            let paths = l.querySelectorAll("path");
            for (let p of paths) {
                p.style.fill = "gray";
            }

            // add https://moonbounce.gg/ to the start of the link
            let linkTarget = l.href;

            // remove the href and give the link a click event that opens the link instead in the same tab
            l.removeAttribute("href");
            l.addEventListener("click", function () {
                window.open(linkTarget, "_self");
            });

        }

        link.setAttribute("aria-current", "page");
        link.classList.add("active");
    }
}

function hijackSettingsPage() {
    // find the .content_area with_sidebar and empty it
    let contentArea = document.querySelector(".content_area.with_sidebar");
    if (contentArea == null) return;

    if (!isTargetURL(getTargetURL("MoonbouncePlus Settings"))) return;

    let baneSettings = document.querySelector("#bane-settings-page");
    if (baneSettings != null) return;

    contentArea.innerHTML = "";

    // create a new div with the id "bane-settings-page" and append it to the content area
    let settingsPage = createElement("div", { id: "bane-settings-page" }, contentArea);

    // create a span with the text "Coming Soon" and append it to the settings page
    // let comingSoon = createElement("span", { textContent: "Coming Soon" }, settingsPage);

    spawnSettings(settingsPage);

    // add some CSS to the settings page to center the text
    addCSS(`
#bane-settings-page {
    --background-color: white;
    --background-color-2: #d2d2d2;
    --background-color-3: #e5e5e5;
    --content-color: white;
    --text-color: #23262F;
    --border-color: #E6E8EC;
    --navbar-bg: white;
    --header-bg: white;
    --line-color: #E6E8EC;
    --top-nav-bg: #333;
    --top-nav-text: white;

    --switch-colour-off: gray;
    --switch-colour-on: #2566FE;

    @media (prefers-color-scheme: dark) {
        --background-color: #131317;
        --background-color-2: #23262f;
        --background-color-3: #1a1a22;
        --content-color: #131317;
        --text-color: #e0e0e0;
        --border-color: #353945;
        --navbar-bg: #2a2a2a;
        --background-color-hover: #23262f;
        --border-color-3: #353945;
        --fill-icon: #e0e0e0;

        --switch-colour-off: var(--background-color);
        --switch-colour-on: #2566FE;
    }

    display: flex;
    justify-content: center;
    align-items: center;
    
    color: var(--text-color);

    width: 100%;
    height: 100%;
    
    padding: 24px;
}

#bane-settings {
    width: 100%;
    max-width: 1000px;
    
    font-family: Inter, sans-serif;
    font-weight: 400;

    #bane-settings-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
    }
    
    #bane-settings-container
    {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .group {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
    
        .setting {
            padding: 24px;
            border: 2px solid var(--border-color-3);
            border-radius: 10px;
            
            display: flex;
            align-items: center;
            justify-content: space-between;
    
            width: 100%;
            gap: 1em;

            box-sizing: border-box;
            
            --switchHeight: 30px;
            --switchWidth: 60px;
            --switchPadding: 1px;
            
            --switchOffset: calc(var(--switchWidth) - var(--switchHeight));

            &:has(textarea) {
                flex-direction: column;

                > div {
                    width: 100%;
                }
            }

            .settingDetailsContainer {
                flex: 2;
            }

            .settingInputContainer {
                flex: 1;
               
                input, select, textarea {
                    border: 2px solid var(--border-color-3);
                    border-radius: 10px;
                    background-color: var(--background-color);
                    color: var(--text-color);
                    text-align: right;
                    padding: 10px;
                    font-size: 30px;

                    width: 100%;
                    box-sizing: border-box;
                    max-width: 300px;
                }

                input {
                    float: right;
                }
  
                select {
                    border: 2px solid var(--border-color-3);
                    border-radius: 10px;
                    background-color: var(--background-color);
                    color: var(--text-color);
                    text-align: right;
                    padding: 10px;
                    float: right;
                    font-size: 30px;
                }

                textarea {
                    text-align: left;
                    max-width: 100%;
                    min-width: 100%;
                    font-size: 20px;
                }

                .switchLabel { 
                    position : relative ;
                    display : inline-block;
                    width : var(--switchWidth);
                    height : var(--switchHeight);
                    background-color: var(--switch-colour-off);
                    border-radius: var(--switchHeight);
                    
                    float: right;
                }

                .switchLabel::after {
                    content: '';
                    position: absolute;
                    width: calc(var(--switchHeight) - (var(--switchPadding) * 2));
                    height: calc(var(--switchHeight) - (var(--switchPadding) * 2));
                    border-radius: 50%;
                    background-color: white;
                    top: var(--switchPadding);
                    left: var(--switchPadding);
                    transition: all 0.3s;
                }

                .switch:checked + .switchLabel::after {
                    left : calc(var(--switchOffset));
                }
                .switch:checked + .switchLabel {
                    background-color: var(--switch-colour-on);
                }

                .switch { 
                    display : none;
                }
            }
        }
    }
}
`, "settingsPageCSS");
}


function spawnSettings(parent) {

    // get script version
    let scriptVersion = GM_info.script.version;

    let settings = createElement("div", { id: "bane-settings" }, parent);

    let settingHeader = createElement("div", { id: "bane-settings-header" }, settings);

    let settingsTitle = createElement("h1", { textContent: "Moonbounce Plus Settings" }, settingHeader);
    let settingsVersion = createElement("h2", { textContent: `v${scriptVersion}` }, settingHeader);
    let settingsContainer = createElement("div", { id: "bane-settings-container" }, settings);

    let groups = [];
    // get every group in the settings
    for (let setting of userSettings) {
        if (!groups.includes(setting.group)) groups.push(setting.group);
    }

    // loop through all the groups and create a new group for each one
    for (let group of groups) {
        let groupDiv = createElement("div", { class: "group", id: `group-${group}` }, settingsContainer);
        let groupTitle = createElement("h2", { textContent: group }, groupDiv);
    }

    // loop through all the settings and create a new setting for each one based on the type
    for (let setting of userSettings) {
        // find the group div that the setting belongs to
        let groupDiv = document.querySelector(`#group-${setting.group}`);

        let settingDiv = createElement("div", { class: "setting" }, groupDiv);

        let settingDetailsContainer = createElement("div", { class: "settingDetailsContainer" }, settingDiv);
        let settingInputContainer = createElement("div", { class: "settingInputContainer" }, settingDiv);

        let settingTitle = createElement("h2", { textContent: setting.name }, settingDetailsContainer);
        let settingDescription = createElement("p", { textContent: setting.description }, settingDetailsContainer);

        let settingInput = null;

        switch (setting.type) {
            case "text":
                settingInput = createElement("input", { type: "text", value: setting.value }, settingInputContainer);
                break;
            case "number":
                settingInput = createElement("input", { type: "number", value: setting.value, min: setting.min, max: setting.max }, settingInputContainer);
                break;
            case "checkbox":
            case "boolean":
                settingInput = createElement("input", { id: setting.name, type: "checkbox", class: "switch", checked: setting.value }, settingInputContainer);
                settingLabel = createElement("label", { for: setting.name, class: "switchLabel" }, settingInputContainer);
                break;
            case "select":
                settingInput = createElement("select", {}, settingInputContainer);

                for (let option of setting.options) {
                    let optionElement = createElement("option", { textContent: option, value: option }, settingInput);
                    if (option == setting.value) optionElement.selected = true;
                }
                break;
            case "textarea":
                settingInput = createElement("textarea", { value: setting.value }, settingInputContainer);
                break;
            default:
                break;
        }

        settingInput.addEventListener("change", function () {
            setting.value = settingInput.value == "on" ? settingInput.checked : settingInput.value;
            saveSettings();
        });


    }

}

//#endregion

//#region Custom CSS

function addCustomCSS(name = "", parent = document.body) {
    let customCSS = getSetting("Custom CSS").value;

    // if the value is empty, delete the custom CSS if it exists
    if (customCSS == "") {
        let existingCSS = parent.querySelector(`#customCSS${name}`);
        if (existingCSS != null) existingCSS.remove();
        return;
    }

    addCSS(customCSS, `customCSS${name}`, parent);
}
//#endregion


// function to take a URL and get the <title> of the page at that URL
function getPageTitle(url) {

    const domainWhiteList = ["www.youtube.com"];

    function loadPage(url) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    let parser = new DOMParser();
                    let doc = parser.parseFromString(xhr.responseText, "text/html");
                    let titleElement = doc.querySelector("title");
                    if (titleElement) {
                        resolve(titleElement.innerText);
                    } else {
                        reject("Title element not found");
                    }
                } else {
                    reject("Error: " + xhr.status);
                }
            };
            xhr.onerror = function () {
                reject("Network error");
            };
            xhr.send();
        });
    }

    let urlDomain = new URL(url).hostname;
    if (!domainWhiteList.includes(urlDomain)) return Promise.reject("Domain not whitelisted");


    // if the current URL shares the same origin as the target URL
    if (new URL(url).origin == window.location.origin) {
        console.log("Same origin detected");
        return loadPage(url);
    }
    else {
        console.log("Cross-origin detected");
        // Prepend the CORS proxy URL to the target URL
        // const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        // const proxyUrl = `https://test.cors.workers.dev/?${url}`
        return loadPage(proxyUrl);
    }
}

// Usage
// getPageTitle("https://music.youtube.com/watch?v=LjBhDSgZPCo&si=7zqZ3C6juqVnPA8D").then(title => console.log(title)).catch(error => console.error(error));

//#region Refresh on Application Error

function checkForApplicationError() {
    // look for main > h1 with the text "Application Error"
    let error = document.querySelector("main > h1");
    if (error == null) return;

    // if the error is not "Application Error", return
    if (error.innerText != "Application Error") return;

    // cancel the interval
    clearInterval(window.refreshInterval);

    // refresh the page
    location.reload();
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

    // find if the targetURL is in the currentURL
    if (currentURL.includes(targetURL)) return true;

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
    // find all elements whose id starts with moonbounce-ext-container
    let containers = document.querySelectorAll("[id^='moonbounce-ext-container']");
    if (containers == null) return;

    // get the last container in the list, as it is the most recent
    let container = containers[containers.length - 1];
    if (container == null) return;

    clearOtherContainers(containers, container);

    return container;
}

/**
 * Clear all containers except the current container
 * @param {Array} containers - the list of all containers
 * @param {Element} currentContainer - the container to keep
 */
function clearOtherContainers(containers, currentContainer) {
    // remove all containers that are not the current container
    for (let c of containers) {
        if (c != currentContainer)
            c.remove();
    }
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

    portal = portal;

    return portal;
}

/**
 * Find the Moonbounce Portal buttons on the page
 */
function findMoonbouncePortalButtons(portal = null) {
    if (portal == null) portal = findMoonbouncePortal();
    if (portal == null) return;

    // set the button parent to the portal's second div child (the first few elements are styles, so find the second DIV
    let moonbouncePortalChildren = portal.children;
    if (moonbouncePortalChildren == null) return;
    // delete all non-div children from the list (not from the DOM)
    moonbouncePortalChildren = Array.from(moonbouncePortalChildren).filter(x => x.tagName == "DIV");
    // delete all divs with an id
    moonbouncePortalChildren = moonbouncePortalChildren.filter(x => x.id == "");
    // get the second div child
    let buttonParent = moonbouncePortalChildren[1];

    if (buttonParent == null) return;

    // find the buttons
    let buttons = buttonParent.querySelector(getTargetSelector("Moonbounce Portal Button Container"));
    if (returnMessage(buttons == null, "Could not find Moonbounce Portal buttons")) return;

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

function getDetails(details = null) {
    // if details is not set, find the details element
    if (details == null) {
        // find the selected item window
        let selectedItemWindow = findSelectedItemWindow();
        if (selectedItemWindow == null) return;

        // find the item details div
        details = selectedItemWindow.querySelector(getTargetSelector("Selected Item Details"));
        if (returnMessage(details == null, "Could not find Selected Item Details")) return;
    }

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
    // svg.setAttributeNS(null, "preserveAspectRatio", "meet");
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

/**
 * Create an element with options and append it to a parent
 * @param {string} type the type of element to create
 * @param {object} userOptions the options for the element
 * @param {Element} parent the parent element to append the new element to
 * @returns the new element
 * @example
 * createElement("div", { options: { text: "Hello, World!", class: "example" } }, document.body);
 */
function createElement(type, userOptions, parent = document.body) {
    if (parent == null) return error(`Parent element not found for ${type} element`);

    let element = document.createElement(type);

    const defaultOptions = {
        text: null,
        textContent: null,
        class: null,
        classList: null,
        id: null,
        src: null,
        href: null,
        onclick: null,
        type: null,
        placeholder: null,
        value: null,
        checked: null,
        name: null,
        for: null,
        min: null,
        max: null,
        style: null,
    };

    // Merge user-provided options with default options
    const options = { ...defaultOptions, ...userOptions };

    // set the text, class, id, src, href, onclick, type, placeholder, value, checked, and style of the element

    // set the class of the element, accepting both class and classList as an array or string
    let classList = [].concat(options.class || options.classList || []);
    classList.forEach(c => element.classList.add(c));

    let text = options.text || options.textContent;

    if (text) element.innerText = text;
    if (options.id) element.id = options.id;
    if (options.src) element.src = options.src;
    if (options.href) element.href = options.href;
    if (options.onclick) element.onclick = options.onclick;
    if (options.type) element.type = options.type;
    if (options.placeholder) element.placeholder = options.placeholder;
    if (options.value) element.value = options.value;
    if (options.checked) element.checked = options.checked;
    if (options.name) element.name = options.name;
    if (options.for) element.htmlFor = options.for;
    if (options.min) element.min = options.min;
    if (options.max) element.max = options.max;
    if (options.style) element.style = options.style;

    parent.appendChild(element);
    return element;
}

//#endregion

//#region Miscellaneous Support Functions

/**
 * Returns the result of an evaluation and logs a message based on the result
 */
function returnMessage(statement, trueMessage = "", falseMessage = "") {
    message = statement ? trueMessage : falseMessage;
    if (message != "") log(message);
    return statement;
}


function log(message) {
    // add a tag at the start of the message saying "MB+" in a div with white text, a black background, red left border and blue right border
    let tag = `%cMB+`;
    let tagStyle = "background-color: black; color: white; padding: 2px 4px; border-left: 4px solid red; border-right: 4px solid #0095ff;";

    // clear the style before the message
    console.log(tag, tagStyle, message);
}

function error(message) {
    // add a tag at the start of the message saying "MB+" in a div with white text, a black background, red left border and blue right border
    let tag = `%cMB+`;
    let tagStyle = "background-color: black; color: white; padding: 2px 4px; border-left: 4px solid red; border-right: 4px solid #0095ff;";

    // clear the style before the message
    console.error(tag, tagStyle, message);
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
    // search the head for an element with the id
    if (document.getElementById(id) != null) return;
    // search the parent for an element with the id
    if (parent.querySelector(`#${id}`) != null) return;


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
            notification.style.position = "fixed";
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

//#endregion