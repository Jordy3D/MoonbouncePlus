// ==UserScript==
// @name         Moonbounce Plus
// @namespace    Bane
// @version      0.25.1
// @description  A few handy tools for Moonbounce
// @author       Bane
// @match        *://*/*
// @icon         https://raw.githubusercontent.com/Jordy3D/MoonbouncePlus/main/assets/MoonbouncePlus.png
// @grant        GM_notification
// @grant        window.focus
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://cdnjs.cloudflare.com/ajax/libs/markdown-it/13.0.2/markdown-it.min.js
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
// 0.14.1   - Swap logo URL to a link on the MoonbouncePlus GitHub repository
// 0.14.2   - Improve the embed visuals and create a base for other embeds going forward
// 0.15.0   - Added the option to encode chat effects to reduce clutter for non-MoonbouncePlus users (on by default)
//              - Each character of the encoding takes up 8 characters in the message character limit, looking to reduce this in the future)
//          - Fixed scroll and slide effects not being cut off properly
//          - Improved performance of message parsing when the chat is opened and full of messages
//          - Updated Chat Notifications to display the username of the sender 
// 0.15.1   - Fixed the Wiki Button link breaking when the item name has a ? in it
// 0.16.0   - Halved the character usage for the chat effects encoding
// 0.16.1   - Apparently forgot to actually re-implement the message parsing improvement when I improved the encoding
// 0.16.2   - Improved the data gathering process to be bit more robust
//          - Added a button to gather the information of all items in the inventory at once (disabled by default)
// 0.17.0   - Added a link to the Moonbounce Wiki for each Source in the inventory
//          - Added the ability to download the Source image when the Source image element is clicked
// 0.17.1   - Add a speed setting for the Gather Inventory Information button for devices that can't handle the default speed
// 0.17.2   - Fixed URLs breaking in chat messages (for now, anyway)
// 0.17.3   - Added a button to gather the information of all recipes in the crafting page at once (disabled by default)
//          - Attempted to minimise the number of times the script tries to download the item data (it's still not perfect)
// 0.17.4   - Fixed an issue with Recipe Gathering not working properly when an item is not in the data
// 0.18.0   - Added hotkeys
//              - Open Chat Key
//              - Close Chat Key
//          - Added movement key remapping
//              - Up Key
//              - Down Key
//              - Left Key
//              - Right Key
//          - The above are still in testing and may not work as intended or may not work at all on some sites, browsers, or devices
// 0.18.1   - Fixed the Open Chat Key not being ignored when an input is focused
// 0.18.2   - Fixed the Marketplace data copy breaking for the Sponsored section
//              - Also updated the output of the Sponsored section to be a little clearer about who the sponsor is and what type of entry it is
// 0.19.0   - Added basic support for Markdown in the chat (limited to the Chat Window for now)
//              - Headers, Emphasis, and Code are supported (#, ##, ###, *, **, _, __, `, ~~)
// 0.19.1   - Minor fix on markdown causing inappropriate spacing in some cases
// 0.20.0   - Fix an issue with some sites blocking CSS injection (mostly affected YouTube, causing the extra buttons to break)
// 0.20.1   - Fix the Markdown styling adding a p tag to the end of the message when it shouldn't
// 0.21.0   - Added a highlight for the MB+ button when there's a new version available
//          - Added a tooltip to the quick buttons to show where they go
// 0.21.1   - For some reason the version check worked in testing but not live, so that should be fixed now
//          - Reduced the number of times the script checks for the version
//          - Reduced the number of times the script tries to create the Moonbounce Portal buttons
// 0.21.2   - Implemented a check for if the current version is newer than the remote version to avoid the highlight showing when it shouldn't
// 0.21.3   - Added a toggle for the Markdown support in the chat
//          - Updated a few settings descriptions
// 0.22.0   - Stopped version checking spam when the page is in an unexpected state
//          - Made the custom CSS textarea resize as the content grows (up to a point, may need to add a scroll bar at some point)
//          - Added basic support for controller input (disabled by default)
//              - Yes, really.
//              - Movement is mapped to the left stick and the D-Pad
//              - You can use the X button (Xbox) or Square button (PlayStation) to toggle the chat window
// 0.22.1   - Fixed some Markdown HTML causing unnecessary line breaks
// 0.22.2   - Update to catch up with Moonbounce changes
// 0.22.3   - Update to catch up with Moonbounce changes (forgot the Settings page)
// 0.22.4   - Added a toggle to disable the seasonal CSS effects on the Moonbounce site
// 0.22.5   - Update to catch up with Moonbounce changes
// 0.23.0   - Finally added the option for the vertical Moonbounce Portal buttons
//              - Toggleable in the settings
//          - Finally added the dark mode for the Chat Window
//              - Follows the user Prefers Color Scheme setting, override will be added later
//          - Added a character counter to the Chat Window
//              - Should auto-calculate based on used Markdown (OSRS effects are largely untested)
// 0.24.0   - Okay, I think I finally fixed the version check and highlight. I hope.
//              - Added a popup notification when the script is loaded and a new version is available
// 0.24.1   - Add hover text to the MoonbouncePlus button to show the current version of the script
// 0.24.2   - Fixed update popup breaking because I forgot YouTube (and other sites) are a pain and need their HTML Policy to be escaped
// 0.25.0   - Shuffled around a few variable definitions into the same block to make it easier to find them
//          - Stopped Markdownit, the HTML Policy, and the message observer from being loaded before proper initialization
//          - Stopped MB+ loading in some somepages where it shouldn't (such as YouTube Embeds, Recaptcha, etc)
//          - Stopped (I hope) the script from trying to load the data multiple times
// 0.25.1   - Fix chat hotkey not working on some sites
//          - Stopped logging to the console when chat is opened and closed
//
// ==/Changelog==

// ==TODO==
//
// - Add more items and recipes (endless task)
// - Add more classes to find elements on the page (endless task)
// - Provide common elements with custom selectors on the Moonbounce main site (endless task)
//      - Or otherwise find a way to get the elements more automatically
// - Improve the Markdown support in the chat so that OSRS effects don't override it
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
    { name: "Gather", description: "Show the Gather Inventory Information button in the inventory controls", type: "boolean", defaultValue: false, value: false, group: "Inventory" },
    { name: "Gather Speed", description: "The speed at which the script gathers the inventory data (in milliseconds)", type: "number", defaultValue: 20, value: 20, min: 5, max: 50, group: "Inventory" },

    // Crafting
    { name: "Gather Recipes", description: "Show the Gather Recipe Information button in the crafting controls", type: "boolean", defaultValue: false, value: false, group: "Crafting" },

    // Marketplace
    { name: "Copy Marketplace Data", description: "Show the Copy Marketplace Data button in the marketplace controls", type: "boolean", defaultValue: true, value: true, group: "Marketplace" },

    // Portal
    { name: "Moonbounce Portal Buttons", description: "Show the Moonbounce Portal quick-access buttons", type: "boolean", defaultValue: true, value: true, group: "Portal" },
    { name: "Vertical Portal Buttons", description: "Show the Moonbounce Portal quick-access buttons vertically", type: "boolean", defaultValue: false, value: false, group: "Portal" },
    // { name: "Use Moonbounce Portal CSS", description: "Show the Moonbounce Portal CSS", type: "boolean", defaultValue: true, value: true },
    { name: "OSRS Text Effects", description: "Show the OSRS text effects in the chat window", type: "boolean", defaultValue: true, value: true, group: "Portal" },
    { name: "Declutter Chat Effects", description: "Encrypt the chat effects to make them less cluttered for non-MoonbouncePlus users.\nNote, encryption takes up characters in message character limit.", type: "boolean", defaultValue: true, value: true, group: "Portal" },
    { name: "Chat Notifications", description: "Show notifications when a message is received in the chat", type: "boolean", defaultValue: true, value: true, group: "Portal" },
    { name: "Chat Notification Mode", description: "The users to receive chat notifications from", type: "select", defaultValue: "None", value: "None", options: ["None", "All", "Whitelist", "Blacklist"], group: "Portal" },
    { name: "Chat Users Whitelist", description: "The users to receive chat notifications from (Display Name, separated with commas)", type: "text", defaultValue: "", value: "", group: "Portal" },
    { name: "Chat Users Blacklist", description: "The users to not receive chat notifications from (Display Name, separated with commas)", type: "text", defaultValue: "", value: "", group: "Portal" },
    { name: "Embed YouTube Videos", description: "Embed YouTube videos in the chat", type: "boolean", defaultValue: true, value: true, group: "Portal" },
    { name: "Chat Markdown", description: "Enable Markdown conversion in the chat.\nNote, if your message is long enough it may cause your message to prematurely hit the character limit.", type: "boolean", defaultValue: true, value: true, group: "Portal" },

    // Hotkeys
    { name: "Enable Chat Hotkeys", description: "Enable hotkeys for the chat.\nNote, currently the character needs to be typed directly below", type: "boolean", defaultValue: true, value: true, group: "Hotkeys" },
    { name: "Open Chat Key", description: "The hotkey to open the chat", type: "text", defaultValue: "/", value: "/", group: "Hotkeys" },
    { name: "Close Chat Key", description: "The hotkey to close the chat", type: "text", defaultValue: "Escape", value: "Escape", group: "Hotkeys" },

    // Remap
    { name: "Enable Key Remap", description: "Enable movement key remapping. \nNote, currently the character needs to be typed directly below", type: "boolean", defaultValue: true, value: true, group: "Remap" },
    { name: "Up Key Remap", description: "Allows the chosen key to move the player up", type: "text", defaultValue: "W", value: "W", group: "Remap" },
    { name: "Down Key Remap", description: "Allows the chosen key to move the player down", type: "text", defaultValue: "S", value: "S", group: "Remap" },
    { name: "Left Key Remap", description: "Allows the chosen key to move the player left", type: "text", defaultValue: "A", value: "A", group: "Remap" },
    { name: "Right Key Remap", description: "Allows the chosen key to move the player right", type: "text", defaultValue: "D", value: "D", group: "Remap" },

    // Alternate Controls
    { name: "Enable Controller", description: "Enable controller support", type: "boolean", defaultValue: false, value: false, group: "Alternate" },
    // { name: "Enable On-Screen Controls", description: "Enable on-screen buttons for movement", type: "boolean", defaultValue: false, value: false, group: "Alternate Controls" },

    // General
    { name: "Auto-Refresh on Application Error", description: "Automatically refresh the page when an application error occurs", type: "boolean", defaultValue: true, value: true, group: "General" },
    { name: "Update Refresh Rate", description: "The rate at which the script checks the current site (in milliseconds)", type: "number", defaultValue: 1000, value: 1000, min: 100, max: 10000, group: "General" },
    { name: "Notification Duration", description: "The duration of the floating notification (in milliseconds)", type: "number", defaultValue: 2000, value: 2000, min: 500, max: 10000, group: "General" },

    // Moonbounce Site
    { name: "Disable Seasonal Effects", description: "Disable the seasonal effects on the Moonbounce site", type: "boolean", defaultValue: false, value: false, group: "Moonbounce" },

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

    refreshRate = getSettingValue("Update Refresh Rate");
    notificationDuration = getSettingValue("Notification Duration");

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

//#region Variables
// Logo
const mbpLogo = "https://raw.githubusercontent.com/Jordy3D/MoonbouncePlus/main/assets/MoonbouncePlus.png"

// States
var hasInitialized = false;
var loadingData = false;

// Settings
var refreshRate = null;
var notificationDuration = null;

// Data
var items = null;
var recipes = null;
var inventoryData = null;

// Elements
var moonbouncePortal = null;
var characterCountDisplay = null;

// Version Check
var checkedVersion = false;
var newVersionExists = false;
var currentVersion = null;
var remoteVersion = null;

// Support Elements
var escapeHTMLPolicy = null;
var messageObserver = null;
var observer = null; // This shouldn't be needed, testing for now

// "Constants"
var md;

// Blacklist
const siteBlacklist = [
    "https://www.google.com/recaptcha/api2/",
    "https://www.youtube.com/embed/",
]
//#endregion

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
    if (loadingData) return;
    loadingData = true;

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

    loadingData = false;
}

/**
 * Classes that are used to find elements on the page
 * name: the name of the class
 * class: the class name
 */
const targetSelector = [
    { name: "Inventory", selector: ".cfWcg" },
    { name: "Inventory Controls", selector: ".S-h7a" },
    { name: "Selected Item Window", selector: "._base_10lw2_1 " },
    { name: "Selected Item Details", selector: "._base_awewl_1" },
    { name: "Source List Item", selector: ".mSsVp" },
    { name: "Source Item Button", selector: "._base_z2tvu_1._xs_z2tvu_16" },
    { name: "Source Item Name", selector: "._base_buawu_1" },
    { name: "Diffuse Value", selector: ".WVOcs" },
    { name: "Stack Size", selector: "[class^='_stack_count_'" },

    { name: "Setting Link Area", selector: "._base_b2hhm_1" },

    { name: "Crafting Sidebar", selector: ".j-fTc" },
    { name: "Recipe Page Button Container", selector: "._base_11wdf_1._justify_center_11wdf_24" },
    { name: "Recipe List Item", selector: ".xPWJy" },
    { name: "Recipe Requirements Container", selector: ".WY4jc" },
    { name: "Recipe Requirement Image", selector: ".a9szA" },

    { name: "Marketplace Container", selector: ".BLrCt" },
    { name: "Marketplace Controls", selector: ".t-IQf" },
    { name: "Marketplace Section", selector: ".FJbq-" },
    { name: "Marketplace Section Header", selector: "._text-xl_128i6_229" },
    { name: "Marketplace Section Item", selector: "._base_18imw_1" },
    { name: "Marketplace Sponsored Section", selector: ".QpxP5" },
    { name: "Marketplace Sponsored Section Type", selector: "._text-md_128i6_111._semibold_128i6_30" },

    { name: "Marketplace Item Rarity", selector: "[class^='_rarity_box']" },
    { name: "Marketplace Item Type", selector: ".eMjIv" },
    { name: "Marketplace Item Details", selector: ".GPrFb" },

    { name: "Moonbounce Portal", selector: "[id='MOONBOUNCE.PORTAL']" },
    { name: "Moonbounce Extension Container", selector: "[id*='moonbounce-ext-container']" },
    { name: "Moonbounce Portal Root Container", selector: "[id*='moonbounce-root-container']" },
    { name: "Moonbounce Portal Button Container", selector: "._base_11wdf_1" },
]
const getTargetSelector = name => targetSelector.find(x => x.name == name).selector;

const targetURLs = [
    { name: "Inventory", url: "https://moonbounce.gg/u/@me/backpack" },
    { name: "Crafting", url: "https://moonbounce.gg/u/@me/backpack/crafting" },
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
    // check if the script is running on a site that is blacklisted (this will typically be a recaptcha page or other subpage)
    if (siteBlacklist.some(x => window.location.href.includes(x))) return;

    if (!hasInitialized) init();
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

    calculateBestValueCraft();
    // printIDs();
    // displayItems();
}





/**
 * Initialize the script and other initial functions
 */
function init() {
    // print Deathworlders Tweaks in large letters
    var textCSSMain = 'font-size: 30px; font-weight: bold; text-shadow: -3px 0px 0px rgba(255, 0, 0, 1),3px 0px 0px rgba(8, 0, 255, 1);';
    var textCSSSub = 'font-size: 15px; font-weight: bold;';
    console.log(`%cMoonbouncePlus%c${GM_info.script.version}\nby Bane`, textCSSMain, textCSSSub);

    loadSettings();

    currentVersion = GM_info.script.version.trim();

    md = markdownit({
        html: false, // Disable HTML tags in source
        // linkify: true, // Autoconvert URL-like text to links
        // typographer: true // Enable some language-neutral replacements + quotes beautification
    });

    // Enable only certain markdown tags
    md.enable([
        'heading', // #, ##, ###, etc.
        'emphasis', // *, **, _, __
        // 'blockquote', // >
        'code', // `code`
        // 'fence', // ```code```
        // 'list', // -, *, +, 1.
        // 'link', // [text](url)
        // 'image' // ![alt](url)
    ]);

    escapeHTMLPolicy = trustedTypes.createPolicy("forceInner", {
        createHTML: (to_escape) => to_escape
    })

    messageObserver = new MutationObserver(function (mutations) {
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

    // check the current site every second and page to see what functions to run
    window.refreshInterval = setInterval(() => {
        checkSite();
    }, refreshRate);

    hasInitialized = true;
}

function checkSite() {
    var currentURL = window.location.href;
    var isOnMoonbounceSite = currentURL.includes("moonbounce.gg");

    // Stuff specifically for Moonbounce
    if (isOnMoonbounceSite) {
        if (getSettingValue("Auto-Refresh on Application Error")) checkForApplicationError();

        if (getSettingValue("Disable Seasonal Effects")) disableSeasonalEffects();

        if (isTargetURL(getTargetURL("Inventory"), true)) {
            if (!loadingData) {
                loadData();
                loadingData = true;
            }

            addInventorySidebarFeatures();
            if (getSettingValue("Gather")) addGatherInventoryInformationButton();

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

        if (isTargetURL(getTargetURL("Crafting"), true)) {

            if (getSettingValue("Gather Recipes")) addGatherRecipeInformationButton();
        }

        addCustomCSS();
    }

    // Stuff for the Moonbounce Portal, which can be on any site
    moonbouncePortal = findMoonbouncePortal();                      // Attempt to find the portal once
    if (moonbouncePortal != null) {                                 // If the portal's found, run the Moonbounce Portal functions

        if (!checkedVersion) {
            log("Checking for new version");
            // checkNewVersionAvailable returns a promise, so we need to wait for it to resolve
            checkNewVersionAvailable().then(isNewVersionAvailable => {
                if (isNewVersionAvailable) {
                    newVersionExists = true;
                }
            });
            checkedVersion = true;
        }

        if (getSettingValue("Moonbounce Portal Buttons")) addMoonbouncePortalButtons(moonbouncePortal);
        if (getSettingValue("Vertical Portal Buttons")) addVerticalPortalButtons(moonbouncePortal);

        addMoonbouncePortalCSS(moonbouncePortal);
        assignCustomSelectorsToPortalElements(moonbouncePortal);

        if (getSettingValue("OSRS Text Effects")) {
            observer = addMessageChecker(moonbouncePortal);
        }

        if (getSettingValue("Enable Chat Hotkeys")) addChatHotkeys(moonbouncePortal);
        if (getSettingValue("Enable Key Remap")) remapControls(moonbouncePortal);

        if (getSettingValue("Enable Controller")) addControllerSupport(moonbouncePortal);

        interceptMessageSend(moonbouncePortal);
        addCharacterCount(moonbouncePortal);

        addCustomCSS("portal", moonbouncePortal);
    }
}

//#endregion


//#region Main Functions

//#region Data

class ItemDetails {
    constructor(id, name, uuid, description, rarity, type, value, sources) {
        this.id = id;
        this.name = name;
        this.uuid = uuid;
        this.description = description;
        this.rarity = rarity;
        this.type = type;
        this.value = value;
        this.sources = sources;
    }

    // function to clean the variables
    clean() {
        this.id = parseInt(this.id);
        this.value = parseInt(this.value);
    }

    // function to convert the object to a JSON string
    convertToJSON() {
        return JSON.stringify(this);
    }
}

/**
 * Master function that adds sidebar features to the inventory
 */
function addInventorySidebarFeatures() {
    addCopyDetailstoItemImage();
    if (getSettingValue("Wiki Button")) addWikiButton();

    addSourceWikiLinks();
    addSourceImageDownload();
}

/**
 * Add an event listener to item images that copies the item's data to the clipboard
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
    
    &:hover { transform: scale(1.05); }
    &:active { transform: scale(0.96); }
}
        `, "copyDetailsToItemCSS");
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

            let itemDetails = new ItemDetails(id, name, uuid, description, rarity, type, value, sources);
            itemDetails.clean();
            let itemDetailJSON = itemDetails.convertToJSON();
            itemDetailJSON += ",";

            copyToClipboard(itemDetailJSON);

            // Place a notification right below the item, centered directly below it
            let pos = img.getBoundingClientRect();
            let imgCenter = pos.left + (pos.width / 2);
            floatingNotification("Item info copied to clipboard", notificationDuration, "background-color: #333; color: #fff; padding: 5px 10px; border-radius: 5px; transform: translateX(-50%);", { top: pos.bottom + 10 + "px", left: imgCenter + "px" });

            return false;
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

/**
 * Add a link to the Wiki page for each Item source
 */
function addSourceWikiLinks() {
    let sources = document.querySelectorAll(getTargetSelector("Source List Item"));
    if (sources == null || sources.length == 0) return;

    // if all sources are already links, return
    if (sources[0].querySelector("a") != null) return;

    for (let source of sources) {
        // https://moonbounce.wiki/w/{name}
        let nameElement = source.querySelector(getTargetSelector("Source Item Name"));
        let name = nameElement.innerText;

        // replace spaces and # with _
        name = name.replace(" ", "_");
        name = name.replace("#", "_");

        // copy the element's class and replace it with an a element
        let link = document.createElement("a");
        link.href = `https://moonbounce.wiki/w/${name}`;
        link.target = "_blank"; // Open link in a new tab
        link.innerText = nameElement.innerText;
        link.classList = nameElement.classList;

        // set the text decoration to none
        link.style.textDecoration = "none";

        // replace the element with the link
        nameElement.replaceWith(link);
    }
}

/**
 * Add an event to download a source's image when the source item button is clicked
 */
function addSourceImageDownload() {
    let sources = document.querySelectorAll(getTargetSelector("Source List Item"));
    if (sources == null || sources.length == 0) return;

    // if all sources already have the download event, return
    if (sources[0].querySelector(getTargetSelector("Source Item Button")).classList.contains("source-image-download")) return;

    for (let source of sources) {
        let button = source.querySelector(getTargetSelector("Source Item Button"));
        if (button == null) continue;

        let nameElement = source.querySelector(getTargetSelector("Source Item Name"));
        let name = nameElement.innerText;

        // get the image URL from the button's child image
        let img = button.querySelector("img");
        let srcURL = img.src;
        // remove https://imagebucketmoonbounce-production.s3.amazonaws.com/sprites/ and /preview.png from the URL
        // to get the UUID of the item
        let uuid = srcURL.replace("https://imagebucketmoonbounce-production.s3.amazonaws.com/sprites/", "").replace("/preview.png", "");

        // https://moonbounce.gg/images/fp/${item.uuid}/c/f/preview.png
        let imgURL = `https://moonbounce.gg/images/fp/${uuid}/c/f/preview.png`;

        // add an event listener to the button
        button.addEventListener("click", function () {
            log(`Downloading image for ${name}`);

            // replace spaces with underscores in the name
            name = name.replace(" ", "_");

            downloadFile(imgURL, `${name}.png`, true);

            // Place a notification when the image is saved as a file
            floatingNotification("Source image saved as file", notificationDuration, "background-color: #333; color: #fff; padding: 5px 10px; border-radius: 5px;", "bottom-right");
        });

        // add a tooltip to the button
        button.title = "Download image";

        // add a class to the button to show that it has an event listener
        button.classList.add("source-image-download");

        // display the cursor as a pointer when hovering over the button
        button.style.cursor = "pointer";
    }
}

/**
 * Add a button that copies the data from all items in the inventory to the clipboard
 */
function addGatherInventoryInformationButton() {
    let inventoryControls = document.querySelector(getTargetSelector("Inventory Controls"));
    if (inventoryControls == null) return;

    let existingButton = document.querySelector("#bane-gather-inventory-info");
    if (existingButton != null) return;

    let container = addInventoryControlBar();

    let button = document.createElement("button");
    button.innerText = "Gather Inventory Info";
    button.id = "bane-gather-inventory-info";

    button.addEventListener("click", function () {
        gatherInventoryInformation();
    });

    container.appendChild(button);
}

/**
 * Go through every item in the inventory and gather the information about each item
 */
async function gatherInventoryInformation() {
    let inventory = findInventory();
    if (inventory == null) return;

    let inventoryItems = inventory.querySelectorAll("button");
    let inventoryData = [];

    let delay = getSettingValue("Gather Speed");

    for (let item of inventoryItems) {
        await processItem(item, inventoryData, delay);
    }

    log("Inventory information gathered");

    // sort the inventory data by item id
    inventoryData.sort((a, b) => a.id - b.id);

    let inventoryDataString = JSON.stringify(inventoryData, (key, value) => value);

    copyToClipboard(inventoryDataString);
}

function processItem(item, inventoryData, delay = 5) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let uuid = getUUIDFromSrc(item.querySelector("img").src);
            item.click();

            setTimeout(() => {
                let itemWindow = findSelectedItemWindow();
                if (itemWindow == null) return resolve();

                let img = itemWindow.querySelector("img");
                if (img == null) return resolve();

                let details = itemWindow.querySelector(getTargetSelector("Selected Item Details"));
                if (details == null) return resolve();

                let { name, id, description, rarity, type, value, sources } = getDetails(details);

                let itemInfo = new ItemDetails(id, name, uuid, description, rarity, type, value, sources);
                itemInfo.clean();
                // itemInfo = itemInfo.convertToJSON();

                inventoryData.push(itemInfo);
                resolve();
            }, delay); // Delay to ensure itemWindow is updated
        }, delay); // Delay for each item
    });
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

//#region Crafting

/**
 * Add a button to gather recipe information
 */
function addGatherRecipeInformationButton() {
    let craftingControls = document.querySelector(getTargetSelector("Crafting Sidebar"));
    if (craftingControls == null) return;

    let existingButton = document.querySelector("#bane-gather-recipe-info");
    if (existingButton != null) return;

    // check if the .UxlxP 's first child's text is "Recipes"
    let controlWindow = craftingControls.querySelector(".UxlxP");
    if (controlWindow == null || controlWindow.children[0].innerText != "Recipes") return;

    // find the Recipe Page Button Container
    let recipePageButtonContainer = craftingControls.querySelector(getTargetSelector("Recipe Page Button Container"));
    if (recipePageButtonContainer == null) return;

    // add a button to the Recipe Page Button Container
    let button = document.createElement("button");
    button.innerText = "Author";
    button.id = "bane-gather-recipe-info";

    button.addEventListener("click", function () {
        gatherRecipeInformation();
    });

    recipePageButtonContainer.appendChild(button);

    // add some CSS to the button
    addCSS(`
#bane-gather-recipe-info
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
  
  &:hover {
    background: var(--background-color-hover);
    border-color: var(--background-color-hover);
  }
}

._base_11wdf_1._justify_center_11wdf_24
{
  max-height: 44px;
  
  button {
    height: 100%;
    box-sizing: border-box;
  }
}
`, "gatherRecipeInformationButtonCSS");
}

/**
 * Gather information about the recipes available.
 */
function gatherRecipeInformation() {
    log("Gathering recipe information...");

    class Recipe {
        constructor(result, requirements) {
            this.result = result;
            this.requirements = requirements;
        }
    }

    function getRecipesFromRecipePage() {
        return new Promise((resolve) => {
            let recipeItems = document.querySelectorAll(getTargetSelector("Recipe List Item"));
            if (!recipeItems || recipeItems.length === 0) return resolve();

            recipeItems.forEach(recipe => {
                let result = recipe.children[0].children[1].children[0].innerText;
                let requirementsContainer = recipe.querySelector(getTargetSelector("Recipe Requirements Container"));
                if (!requirementsContainer) return;

                let requirements = Array.from(requirementsContainer.querySelectorAll(getTargetSelector("Recipe Requirement Image")))
                    .map(requirement => {
                        let uuid = getUUIDFromSrc(requirement.src);
                        let item = getItemFromUUID(uuid);

                        if (item == null) {
                            log(`Unknown item with UUID: ${uuid}`);
                            return "UNKNOWN ITEM";
                        }

                        return item.name;
                    });

                allRecipes.push(new Recipe(result, requirements));
            });

            resolve();
        });
    }

    let allRecipes = [];

    let craftingControls = document.querySelector(getTargetSelector("Crafting Sidebar"));
    if (!craftingControls) return;

    let recipePageButtonContainer = craftingControls.querySelector(getTargetSelector("Recipe Page Button Container"));
    if (!recipePageButtonContainer) return;

    let buttons = recipePageButtonContainer.querySelectorAll("button");
    if (buttons.length < 2) return;

    let nextButton = buttons[1];
    let firstButton = buttons[0];

    function goBackToStart() {
        return new Promise((resolve) => {
            function clickUntilDisabled() {
                if (!firstButton.disabled) {
                    firstButton.click();
                    setTimeout(clickUntilDisabled, 10); // Rapidly click every 10ms
                } else {
                    resolve();
                }
            }
            clickUntilDisabled();
        });
    }

    async function processRecipes() {
        while (!nextButton.disabled) {
            await getRecipesFromRecipePage();
            await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay before clicking the next button
            nextButton.click();
            await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay before processing the next page
        }
    }

    (async () => {
        await goBackToStart();

        if (!nextButton.disabled) {
            await processRecipes();
        }

        await getRecipesFromRecipePage();

        log("Recipe information gathered");

        let recipeDataString = JSON.stringify(allRecipes, null, 2);
        copyToClipboard(recipeDataString);

        // spawn a notification at the bottom right of the screen
        floatingNotification("Recipe information copied to clipboard", notificationDuration, "background-color: #333; color: #fff; padding: 5px 10px; border-radius: 5px;", "bottom-right", true);
    })();
}
//#endregion


//#region Moonbounce Portal

/**
 * Add CSS to the Moonbounce Portal to style the buttons
 */
function addMoonbouncePortalCSS(portal) {
    addCSS(`
[id*="moonbounce-root-container"], #moonbounce-plus-button-container {
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
    [id*="moonbounce-root-container"], #moonbounce-plus-button-container {
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

        .highlight {
            background: linear-gradient(45deg, #f2be4470, #fff, #f2be4470) !important;
        }
    }`, "moonbouncePortalButtonCSS", portal);

    addCSS(`
    .message-text {
        em, i, strong, b {
            margin: 0 0.25em;
            display: contents;
        }
    > *:has(+*:not(p))
    {
        margin-right: 0 !important;
    }

}`, "moonbouncePortalFixesCSS", portal);

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

.rs-scroll, .rs-slide {
    overflow: hidden;

    > span {
        display: inline-block;
    }
}

.rs-scroll > span
{
    animation: scroll 3s infinite linear;
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

    addCSS(`
.message-text
{
  max-height: unset;
  overflow: visible;
}

.mbp-embed
{
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border-left: 4px solid;
  margin-left: -8px;  
  
  background: var(--background-color);
 
  display: flex;
  flex-direction: column;
  gap: 0px;
  margin-bottom: 5px;
  
  .mbp-embed-header, .mbp-embed-header a
  {
    font-size: 12px;
    line-height: 16px;
    color: var(--text-color);
    opacity: 0.7;
    margin-bottom: 5px;
  }
  
  .mbp-embed-title, .mbp-embed-title a
  {
    font-size: 16px;
    line-height: 20px;
    letter-spacing: -.2px;
    margin-bottom: 5px;
  }
  
  .mbp-embed-subtitle, .mbp-embed-subtitle a
  {
    font-size: 14px;
    color: var(--text-color);
  }
}`, "mbpEmbedCSS", portal);


    addCSS(`
/* Dark Buttons */
._base_1htaw_1._secondary_1htaw_22._base_1htaw_1._secondary_1htaw_22,
._base_1isu7_1._show_1isu7_11 {
    background: var(--background-color-3);
    border-color: var(--text-color);
    box-shadow: none !important;
}

/* Dark Chat */
._base_1jhq3_1 {
    background: var(--background-color);
    opacity: 1;

    ::-webkit-scrollbar { width: 10px; border-radius: 0; }
    ::-webkit-scrollbar-track { background: var(--background-color); border-radius: 0; }
    ::-webkit-scrollbar-thumb { background: #E0E0E0; }
    ::-webkit-scrollbar-thumb:hover { background: #252525; }
    ::-webkit-scrollbar-corner { background: #0000; }

    ._line_18nkb_99 {
        height: 1px;
        opacity: 0.5;
    }

    [class*="_middle_"] {
        background: var(--background-color-3);
        color: var(--text-color);
        
        [class*="_message"] {
            color: var(--text-color);
        }
        
        ._base_1pfp4_1 {
            background: var(--background-color-2);
        }
    }

    [class*="display_name"],
    ._button_eftbh_1._quaternary_eftbh_53 {
        color: var(--text-color);
    }

    ._button_eftbh_1._tertiary_eftbh_36 {
        color: #2566FE;
        
        &:not(:has([class*="neutral"])) {
            background: var(--background-color-3);
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
        }
    }

    ._base_bkmm0_1 {
        background: var(--background-color);
        
        [class*="chat"] {
            background: var(--background-color-3);
            border: none;
        
            input {
                color: var(--text-color);
            }
        }
        
        ._base_1yb9m_1._secondary_1yb9m_16 {
            fill: var(--fill-icon);
        }
    }

    path[fill="#353945"] {
        fill: var(--fill-icon);
    }
}
`, "darkChatCSS", portal);

    addCSS(`
div[label="MBP.CONTROLS"].vertical {
    /* Vertical Portal Buttons */ 
    #button-control-bar
    {
        flex-direction: column;

        ._frame_1htaw_72 { order: -1; }

        #moonbounce-plus-button-container {
            order: 0;

            flex-direction: inherit;
            margin-bottom: 1em;
        }

        > div:first-child {
            order: 9000;

            overflow: hidden;

            transition: height 200ms ease-in-out;
            width: 50px;
            flex-direction: column;

            &:hover
            {
                height: 80px; 
                border-radius: 30px 30px 15px 15px;
            }
            
            div {
                display: block;
                text-align: center;
                padding: 0;
            }
        }
    }

    /* Position Chat Beside Buttons */
    > div
    {    
        #button-control-bar + div
        {
            top: 0px !important;
            left: 70px;
        }
    }
}
`, "verticalPortalButtonsCSS", portal);

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
        { name: "Chat Input Section", selector: "._base_l2cub_1._small_l2cub_14:has(._base_bkmm0_1)", id: "chat-input-section", class: null },
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
    // if the portal already contains the moonbounce-plus-button-container, return
    let existing = portal.querySelector("#moonbounce-plus-button-container");
    if (existing != null) return;

    // add a button to go to the Moonbounce Plus GitHub Repository
    addMoonbouncePlusButton(portal);

    // quick access buttons
    addDirectoryButton(portal);
    addBackpackButton(portal);
    addMarketplaceButton(portal);
}

/**
 * Add the .vertical class to div[label="MBP.CONTROLS"] to allow for vertical portal buttons
 */
function addVerticalPortalButtons(portal) {
    let controls = portal.querySelector("[label='MBP.CONTROLS']");
    if (controls == null) return;

    controls.classList.add("vertical");
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
var checked = false;

function addMoonbouncePlusButton(portal) {
    let button = document.createElement("div");
    // button.innerText = "Moonbounce Plus";
    button.id = "moonbounce-plus-button";

    // add an image inside the button
    let img = document.createElement("img");
    img.src = mbpLogo;
    button.appendChild(img);

    // add an event listener to the button
    button.addEventListener("click", function () {
        window.open("https://github.com/Jordy3D/MoonbouncePlus", "_blank");
    });

    button.title = "Moonbounce Plus v" + currentVersion;

    if (newVersionExists) {
        button.classList.add("highlight");
        button.title = "New version available!";

        // show a popup notification at the bottom right of the screen
        let mbStyle = "background-color: #000; color: #fff; padding: 5px 10px; border-radius: 5px;";
        mbStyle += "border-left: 5px solid #FF0000; border-right: 5px solid #0095FF;";

        floatingNotification("MoonbouncePlus update available!", 500, mbStyle, "bottom-right", true, portal);
    }

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

    button.title = "Backpack";

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

    button.title = "Directory";

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

    button.title = "Marketplace";

    addMoonbouncePortalButton(button, portal);
}
//#endregion


// Portal Hotkeys

function addChatHotkeys(portal) {
    if (portal.classList.contains("chat-hotkey-added")) return;

    log("Adding chat hotkeys");
    // add a class to the portal to show that the chat hotkey has been added
    portal.classList.add("chat-hotkey-added");

    // load the hotkey settings
    var openChatKey = getSetting("Open Chat Key").value.toUpperCase();
    var closeChatKey = getSetting("Close Chat Key").value.toUpperCase();

    document.addEventListener("keydown", function (e) {
        const key = e.key.toUpperCase();
        if (key == openChatKey) {
            // log("Opening chat window");

            if (document.activeElement.tagName === "INPUT") return;

            let chatWindowCheck = portal.querySelector("#chat-container");
            // if it's already there, it's open so return
            if (chatWindowCheck != null) return;

            let buttonContainer = findMoonbouncePortalButtons(portal);
            let chatButton = buttonContainer.children[1].querySelector("button");
            chatButton.click();

            setTimeout(() => {
                let chatWindow = portal.querySelector("#chat-container");

                let chatInput = chatWindow.querySelector("input");
                if (chatInput == null) return;

                // focus on the chat input
                chatInput.focus();
            }, 100); // 100ms delay
        }
    });

    document.addEventListener("keydown", function (e) {
        const key = e.key.toUpperCase();
        // if the escape key is pressed, close the chat window by clicking on the control bar's second child again
        if (key == closeChatKey) {
            // log("Closing chat window");

            // if there's no chat window, return
            let chatWindow = portal.querySelector("#chat-container");
            if (chatWindow == null) return;

            let buttonContainer = findMoonbouncePortalButtons(portal);

            let chatButton = buttonContainer.children[1].querySelector("button");
            chatButton.click();
        }
    }, true); // Use capture phase
}

// Portal Remap

function remapControls(portal) {
    // if the portal already contains .remapped, return
    if (portal.classList.contains("remapped")) return;

    // add a class to the portal to show that it has been remapped
    portal.classList.add("remapped");

    // object to contain the mapping of keys to buttons
    const keyMapping = {
        [getSetting("Up Key Remap").value.toUpperCase()]: "ArrowUp",
        [getSetting("Down Key Remap").value.toUpperCase()]: "ArrowDown",
        [getSetting("Left Key Remap").value.toUpperCase()]: "ArrowLeft",
        [getSetting("Right Key Remap").value.toUpperCase()]: "ArrowRight",
    };

    // common function to handle key events
    function handleKeyEvent(e, eventType) {
        const key = e.key.toUpperCase();

        if (!keyMapping[key]) return;

        // if the user is focused on an input field, don't remap the keys
        if (document.activeElement.tagName === "INPUT") return;

        // simulate the key event on the corresponding button
        const event = new KeyboardEvent(eventType, { key: keyMapping[key] });
        document.dispatchEvent(event);
    }

    // add event listeners to listen to the remap keys and press the corresponding button
    document.addEventListener("keydown", (e) => handleKeyEvent(e, "keydown"));
    document.addEventListener("keyup", (e) => handleKeyEvent(e, "keyup"));
}

// Controller Support

class ControllerInput {
    constructor() {
        this.buttonMappings = [
            "A", "B", "X", "Y", "Left Bumper", "Right Bumper", "Left Trigger", "Right Trigger",
            "Back", "Start", "Left Stick", "Right Stick", "D-Pad Up", "D-Pad Down", "D-Pad Left", "D-Pad Right",
            "Home", "Touchpad"
        ];
        this.onButtonPress = null;
        this.onButtonHeld = null;
        this.onAnalogMove = null;

        this.buttonStates = [];
        this.currentlyPressed = new Set();

        window.addEventListener("gamepadconnected", this.onGamepadConnected.bind(this));
        window.addEventListener("gamepaddisconnected", this.onGamepadDisconnected.bind(this));
    }

    onGamepadConnected = (event) => {
        this.gamepad = event.gamepad;
        this.update();
    }

    onGamepadDisconnected = (event) => { console.log("Gamepad disconnected:", event.gamepad); }

    setButtonPressCallback = (callback) => { this.onButtonPress = callback; }
    setButtonHeldCallback = (callback) => { this.onButtonHeld = callback; }
    setAnalogMoveCallback = (callback) => { this.onAnalogMove = callback; }

    update() {
        const gp = navigator.getGamepads()[this.gamepad.index];

        // Check button presses
        for (let i = 0; i < gp.buttons.length; i++) {
            const buttonName = this.buttonMappings[i] || `Button ${i}`;
            if (gp.buttons[i].pressed) {
                if (this.onButtonPress && !this.buttonStates[i]) {
                    this.onButtonPress(i, gp.buttons[i].value, buttonName);
                    this.mimicKeyPress(buttonName, "keydown");
                }
                if (this.onButtonHeld)
                    this.onButtonHeld(i, gp.buttons[i].value, buttonName);

                this.buttonStates[i] = gp.buttons[i].value;
            } else {
                if (this.buttonStates[i])
                    this.mimicKeyPress(buttonName, "keyup");

                this.buttonStates[i] = null;
            }
        }

        // Check analog stick movements
        for (let i = 0; i < gp.axes.length; i += 2) {
            const x = gp.axes[i].toFixed(2);
            const y = gp.axes[i + 1].toFixed(2);
            const stickName = i === 0 ? "Left Stick" : "Right Stick";
            if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
                if (this.onAnalogMove)
                    this.onAnalogMove(i, x, y, stickName);

                const horizontalDirection = x > 0.1 ? "ArrowRight" : x < -0.1 ? "ArrowLeft" : null;
                const verticalDirection = y > 0.1 ? "ArrowDown" : y < -0.1 ? "ArrowUp" : null;

                if (horizontalDirection && !this.currentlyPressed.has(horizontalDirection))
                    this.mimicKeyPress(horizontalDirection, "keydown");

                if (verticalDirection && !this.currentlyPressed.has(verticalDirection))
                    this.mimicKeyPress(verticalDirection, "keydown");

            } else {
                if (this.currentlyPressed.has("ArrowDown"))
                    this.mimicKeyPress("ArrowDown", "keyup");

                if (this.currentlyPressed.has("ArrowUp"))
                    this.mimicKeyPress("ArrowUp", "keyup");

                if (this.currentlyPressed.has("ArrowRight"))
                    this.mimicKeyPress("ArrowRight", "keyup");

                if (this.currentlyPressed.has("ArrowLeft"))
                    this.mimicKeyPress("ArrowLeft", "keyup");
            }
        }

        requestAnimationFrame(this.update.bind(this));
    }

    mimicKeyPress(key, type = "keydown") {
        const event = new KeyboardEvent(type, { key });
        document.dispatchEvent(event);

        if (type === "keydown")
            this.currentlyPressed.add(key);
        else if (type === "keyup")
            this.currentlyPressed.delete(key);
    }
}

function addControllerSupport(portal) {
    // if the portal already contains .controller-support, return
    if (portal.classList.contains("controller-support")) return;

    // add a class to the portal to show that it has controller support
    portal.classList.add("controller-support");

    log("Adding controller support");

    const controllerInput = new ControllerInput();

    // Example custom function to move the box with the left stick by mimicking arrow key presses
    controllerInput.setAnalogMoveCallback((index, x, y, name) => {
        if (name === "Left Stick") {
            const horizontalDirection = x > 0.1 ? "ArrowRight" : x < -0.1 ? "ArrowLeft" : null;
            const verticalDirection = y > 0.1 ? "ArrowDown" : y < -0.1 ? "ArrowUp" : null;

            if (horizontalDirection)
                setTimeout(() => { controllerInput.mimicKeyPress(horizontalDirection); }, 10);

            if (verticalDirection)
                setTimeout(() => { controllerInput.mimicKeyPress(verticalDirection); }, 10);

        }
    });

    // map the dpad to the arrow keys as well
    controllerInput.setButtonHeldCallback((index, value, name) => {
        const dPadMapping = { "D-Pad Up": "ArrowUp", "D-Pad Down": "ArrowDown", "D-Pad Left": "ArrowLeft", "D-Pad Right": "ArrowRight" };

        if (!dPadMapping[name]) return;

        setTimeout(() => { controllerInput.mimicKeyPress(dPadMapping[name]); }, 10);
    });


    // load the hotkey settings
    var openChatKey = getSetting("Open Chat Key").value.toUpperCase();
    var closeChatKey = getSetting("Close Chat Key").value.toUpperCase();

    // map the X button to open or close the chat window
    controllerInput.setButtonPressCallback((index, value, name) => {
        if (name === "X") {
            // The portal variable is accessible here
            let chatWindow = portal.querySelector("#chat-container");

            var event;
            if (chatWindow == null)
                event = new KeyboardEvent("keydown", { key: openChatKey });
            else
                event = new KeyboardEvent("keydown", { key: closeChatKey });

            if (event != null)
                document.dispatchEvent(event);

        }
    });
}

//#endregion

//#region Chat Notifications and Effects

//#region Character Count Display

function addCharacterCount(portal) {
    // if the portal already contains #character-count, return
    if (portal.querySelector("#character-count") != null) return;

    // create a new div for the character count
    let characterCount = document.createElement("div");
    characterCount.id = "character-count";
    characterCount.classList.add("empty");

    // add the character count to the chat input
    let chatWindow = portal.querySelector("#chat-window");
    if (chatWindow == null) return;

    let chatInputSection = chatWindow.querySelector("#chat-input-section");
    if (chatInputSection == null) return;

    let chatInput = chatWindow.querySelector("input");
    if (chatInput == null) return;

    chatInput.addEventListener("input", function () {
        let count = convertMessageToFinal(chatInput.value).length;
        characterCount.innerText = count + "/100";
        characterCount.classList.remove("empty");

        if (count > 100)
            characterCount.style.color = "red";
        else
            characterCount.style.color = "var(--text-color)";
    });

    chatInputSection.appendChild(characterCount);

    characterCountDisplay = characterCount;

    // add styling to the character count
    addCSS(`
#character-count {
    position: absolute;
    right: 0;
    background: var(--background-color);
    transform: translateY(-100%);
    /* border: 2px solid var(--content-text-color); */
    color: var(--text-color);
    border-bottom: none;
    border-radius: 10px 10px 0 0;
    padding: 0.25em 0.5em;
    width: fit-content;

    &.empty {
        display: none;
    }
}
`, "characterCountCSS", portal);
}

//#region Encrypt/Decrypt message effects 
function interceptMessageSend(portal) {
    let chatWindow = portal.querySelector("#chat-window");
    if (chatWindow == null) return;
    // find the form to send messages
    let messageForm = chatWindow.querySelector("form");
    if (messageForm == null) return;

    // if the form already has the class "intercepted", return
    if (messageForm.classList.contains("waitingToIntercept")) return;

    // find the input field to send messages and the submit button
    let messageInput = messageForm.querySelector("input");
    let submitButton = messageForm.querySelector("button");

    // add an event listener to the submit button to intercept the message send
    submitButton.addEventListener("click", function (e) {
        // if the input does not contain the class "intercepted"
        if (!messageInput.classList.contains("intercepted")) {
            // prevent the form from submitting
            e.preventDefault();
            e.stopPropagation();

            interception(e, messageInput);

            submitButton.click();
            setTimeout(() => submitButton.click(), 50);
        }
        else {
            messageInput.classList.remove("intercepted");
        }
    });

    // give the form a class of "intercepted" to show that it has been intercepted
    messageForm.classList.add("waitingToIntercept");
}

function interception(e, input) {
    let message = input.value;

    // check the setting for Declutter Chat Effects
    let declutter = getSetting("Declutter Chat Effects").value;
    if (declutter) {

        // encrypt the necessart parts of the message to whitespace
        // parse every effect tag and : in the message

        // find every effect tag in the message
        for (let effect of effectTags) {
            // find the effect name and : and replace it with the encrypted version
            // if the effect name is red, replace red: with the encrypted version
            let regex = new RegExp(`${effect.name}:`, "g");
            if (regex.test(message)) {
                message = message.replace(regex, encryptToWhitespace(effect.name + ":"));
            }
        }
    }

    let convertMarkdown = getSettingValue("Chat Markdown");

    if (convertMarkdown) {
        mdText = md.render(message).trim();                                 // convert the message from markdown to HTML
        mdText = mdText.replace(/^<p>/, "").replace(/<\/p>$/, "");          // remove the <p> tags from the start and end of the message

        input.value = mdText;
    }
    else {
        input.value = message;
    }

    // input.value = message;
    input.dispatchEvent(new Event("input", { bubbles: true }));

    // reset the character count
    if (characterCountDisplay != null) {
        characterCountDisplay.classList.add("empty");
        characterCountDisplay.innerText = "";
    }

    // mark the input as ready
    input.classList.add("intercepted");
}

function convertMessageToFinal(message) {
    let finalMessage = message;
    // check the setting for Declutter Chat Effects
    let declutter = getSetting("Declutter Chat Effects").value;
    if (declutter) {
        // decrypt the necessart parts of the message from whitespace
        // parse every effect tag and : in the message

        // find every effect tag in the message
        for (let effect of effectTags) {
            // find the effect name and : and replace it with the encrypted version
            // if the effect name is red, replace red: with the encrypted version
            let regex = new RegExp(encryptToWhitespace(effect.name + ":"), "g");
            if (regex.test(finalMessage)) {
                finalMessage = finalMessage.replace(regex, effect.name + ":");
            }
        }
    }

    let convertMarkdown = getSettingValue("Chat Markdown");

    if (convertMarkdown) {
        mdText = md.render(message).trim();                                 // convert the message from markdown to HTML
        mdText = mdText.replace(/^<p>/, "").replace(/<\/p>$/, "");          // remove the <p> tags from the start and end of the message

        finalMessage = mdText;
    }

    return finalMessage;
}

const whiteSpaceChars = [
    "​",
    '‌',
    '‍',
    '⁠',
]

/**
 * Converts a string to binary
 */
function toBinary(input) {
    return input.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
}

/**
 * Converts a binary string to a string, converting 8-bit chunks to characters and leaving the rest as is
 */
function fromBinary(input) {
    let output = '';
    const chunks = input.match(/.{1,8}/g) || [];
    chunks.forEach(chunk => {
        if (/^[01]{8}$/.test(chunk)) {
            output += String.fromCharCode(parseInt(chunk, 2));
        } else {
            output += chunk;
        }
    });
    return output;
}

/**
 * Converts a string to base-4 using whitespace characters
 */
function toBase4(input) {
    // convert to base-4
    let output = "";
    let binary = toBinary(input);
    let binaryLength = binary.length;
    let binaryIndex = 0;

    while (binaryIndex < binaryLength) {
        let binaryChunk = binary.substring(binaryIndex, binaryIndex + 2);
        let decimal = parseInt(binaryChunk, 2);
        let quotient = Math.floor(decimal / 4);
        let remainder = decimal % 4;
        output += whiteSpaceChars[remainder];
        binaryIndex += 2;
    }

    return output;
}

/**
 * Converts a white-space encoded base-4 string to a string
 */
function fromBase4(input) {
    // convert from base-4
    let output = "";
    let binary = "";

    for (let i = 0; i < input.length; i++) {
        let char = input[i];
        let charIndex = whiteSpaceChars.indexOf(char);
        if (charIndex === -1) {
            binary += char;
        }
        else {
            let binaryChunk = charIndex.toString(2).padStart(2, "0");
            binary += binaryChunk;
        }
    }

    output = fromBinary(binary);
    return output;
}

function encryptToWhitespace(input) {
    let output = "";
    output = toBase4(input);

    return output;
}

function decryptFromWhitespace(input) {
    let output = "";
    output = fromBase4(input);

    return output;
}
//#endregion

//#region Handle and parse messages
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

    // if the message contains no link, :, or any of the whitespace characters, return
    let needsParsing = messageText.innerText.includes(":") || messageText.innerText.includes("http") || whiteSpaceChars.some(char => messageText.innerText.includes(char));
    if (!needsParsing) return;

    // add the class "checked" to the message
    messageText.classList.add("checked");

    // try and replace the YouTube link with the video title, and embed the video
    messageText = parseForYouTube(messageText);

    let parsedMessage = messageText.innerText;

    // if the message contains any of the whitespace characters, decrypt it
    if (whiteSpaceChars.some(char => parsedMessage.includes(char)))
        parsedMessage = decryptFromWhitespace(parsedMessage);

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

    if (whiteSpaceChars.some(char => parsedMessage.includes(char)))
        parsedMessage = decryptFromWhitespace(parsedMessage);

    // try and parse the message to see if it has an effect tag
    parsedMessage = parseForOSRS(parsedMessage);
    if (parsedMessage != newMessage) {
        messageTextElement.innerHTML = parsedMessage;
    }

    if (chatReload) return true;

    // send a notification with the message based on the user's settings
    let notificationMode = getSetting("Chat Notification Mode").value;

    // get author
    let messageAuthor = messageAuthorElement.innerText;

    // clean message for notification
    let notificationMessage = messageTextElement.innerText;
    notificationMessage = `${messageAuthor}: ${notificationMessage}`;

    switch (notificationMode) {
        case "None":
            break;
        case "All":
            notify(notificationMessage);
            break;
        case "Whitelist":
            let whitelist = getSetting("Chat Users Whitelist").value;
            if (whitelist.includes(messageAuthor))
                notify(notificationMessage);
            break;
        case "Blacklist":
            let blacklist = getSetting("Chat Users Blacklist").value;
            if (!blacklist.includes(messageAuthor))
                notify(notificationMessage);
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

    // for each YouTube Link, get the video title and replace the link text with the title
    for (let link of youtubeLinks) {
        // get the video id from the link
        let videoId = link.href.split("v=")[1];
        if (videoId == null) continue;

        // replace the link text with https://youtu.be/[videoId]
        link.textContent = `https://youtu.be/${videoId}`;

        if (getSettingValue("Embed YouTube Videos")) {
            log(`Embedding YouTube video: ${link.href}`);

            getPageMetas(link).then(metas => {
                let title = metas.find(x => x.property == "og:title");
                let title_url = metas.find(x => x.property == "og:url");
                let domain = metas.find(x => x.property == "og:site_name");
                // get the domain url by removing the last part of the link
                let domainUrl = link.href.split("/").slice(0, -1).join("/");
                let subtitle = metas.find(x => x.property == "author_name");
                let subtitleUrl = metas.find(x => x.property == "author_url");
                let borderColor = "red";

                let videoId = link.href.split("v=")[1];
                let embedLink = `https://www.youtube.com/embed/${videoId}?rel=0&controls=0`;

                let options = {
                    embedLink: embedLink,
                    title: title.content,
                    title_url: title_url.content,
                    domain: domain.content,
                    domainUrl: domainUrl,
                    subtitle: subtitle.content,
                    subtitleUrl: subtitleUrl.content,
                    borderColor: borderColor
                };

                let embed = createEmbed(options);
                messageTextElement.appendChild(embed);
            });
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
    let marketplaceSections = marketplaceData.querySelectorAll(getTargetSelector("Marketplace Section"));
    let sponsoredMarketplaceSectons = marketplaceData.querySelectorAll(getTargetSelector("Marketplace Sponsored Section"));
    let sections = [...marketplaceSections, ...sponsoredMarketplaceSectons];
    for (let section of sections) {
        // get the section name from the section header
        console.log(section);
        let sectionName = section.querySelector(getTargetSelector("Marketplace Section Header"))?.innerText;
        if (sectionName == null) continue;

        // if there's a Marketplace Sponsored Section Type
        let sponsoredSectionType = section.querySelector(getTargetSelector("Marketplace Sponsored Section Type"));
        if (sponsoredSectionType != null) {
            // add the type to the name like "Sponsored TYPE (sectionName)"
            // this looks like: "Sponsored Items (Soup)"
            sectionName = `Sponsored ${sponsoredSectionType.innerText} (${sectionName})`;
        }

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

        // format the item name to be used in the URL
        let formattedName = itemName.replace(/ /g, "_");        // replace spaces with underscores
        formattedName = formattedName.replace(/'/g, "%27");     // replace apostrophes with %27
        formattedName = formattedName.replace(/\?/g, "%3F");     // replace question marks with %3F

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
    let settingsDiv = document.querySelector(getTargetSelector("Setting Link Area"));
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
    let img = createElement("img", { src: mbpLogo }, iconDiv);

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

                // update the height of the textarea based on the content, to a maximum of 300px and a minimum of 100px
                settingInput.addEventListener("input", function () {
                    settingInput.style.height = "auto";
                    settingInput.style.height = Math.min(settingInput.scrollHeight, 300) + "px";
                });
                settingInput.style.height = Math.min(settingInput.scrollHeight, 300) + "px";

                if (setting.name == "Custom CSS") settingInput.style.fontFamily = "monospace";

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

// function to take a URL and return an array of meta elements and other relevant information
function getPageMetas(url) {
    function loadPage(url) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    let parser = new DOMParser();
                    let doc = parser.parseFromString(xhr.responseText, "text/html");

                    let metaElements = doc.querySelectorAll("meta");
                    // get every <link> element with an itemprop attribute and a content attribute or an itemprop attribute and a href attribute
                    let linkProps = doc.querySelectorAll("link[itemprop][content], link[itemprop][href]");
                    let titleElement = doc.querySelector("title");

                    let metaArray = [];

                    if (metaElements) {
                        for (let meta of metaElements) {
                            // if the meta element has a name or property attribute, add it to the metaArray as an object with the name and content
                            let propertyName = meta.getAttribute("name") || meta.getAttribute("property");
                            if (propertyName) {
                                let propertyContent = meta.getAttribute("content");
                                metaArray.push({ property: propertyName, content: propertyContent });
                            }
                        }
                    }
                    if (linkProps) {
                        for (let linkProp of linkProps) {
                            let propName = linkProp.getAttribute("itemprop");

                            // check if the property has a parent element with the itemprop attribute
                            let itemPropParent = linkProp.parentElement;
                            if (itemPropParent.getAttribute("itemprop")) {
                                parentPropName = itemPropParent.getAttribute("itemprop");
                                propName = `${parentPropName}_${propName}`;
                            }

                            if (propName) {
                                let propContent = linkProp.getAttribute("content") || linkProp.getAttribute("href");
                                metaArray.push({ property: propName, content: propContent });
                            }
                        }
                    }
                    if (titleElement) {
                        metaArray.push({ property: "page_title", content: titleElement.innerText });
                    }

                    if (metaArray.length > 0) {
                        resolve(metaArray);
                    } else {
                        reject("Meta elements not found");
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
// getPageMetas("https://music.youtube.com/watch?v=LjBhDSgZPCo&si=7zqZ3C6juqVnPA8D").then(metas => console.log(metas)).catch(error => console.error(error));

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

//#region Disable Seasonal Effects

function disableSeasonalEffects() {
    // if the body has any class, remove it. If the body has no class, do nothing
    if (document.body.classList.length > 0) document.body.classList = "";
}

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
    // if (returnMessage(buttons == null, "Could not find Moonbounce Portal buttons")) return;

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
        let p = source.querySelector("p") || source.querySelector("a");
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
        width: null,
        height: null,
        frameborder: null,
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
    if (options.width) element.width = options.width;
    if (options.height) element.height = options.height;
    if (options.frameborder) element.frameborder = options.frameborder;
    if (options.style) element.style = options.style;

    parent.appendChild(element);
    return element;
}

/**
 * Create an embed to display in the chat
 * @param {object} options the options for the embed
 * @returns the embed element
 * @example
 * createEmbed({
 *   header: "Moonbounce",
 *   headerUrl: "https://www.getmoonbounce.com/",
 *   borderColor: " #2566FE",
 *   title: "Moonbounce",
 *   title_url: "https://www.getmoonbounce.com/",
 *   description: "A browser extension designed to make the internet more fun. Hang with friends, collect loot, and customize your own digital spaces. Anywhere online.",
 */
function createEmbed(options = {}) {

    // define options
    let defaultOptions = {
        embedLink: "",
        domain: "",
        domainUrl: "",
        header: "",
        headerUrl: "",
        borderColor: " #0095ff",
        title: "",
        title_url: "",
        subtitle: "",
        subtitleUrl: "",
        description: "",
    }

    options = { ...defaultOptions, ...options };

    // create the embed container
    let embedContainer = createElement("div", { class: "mbp-embed" });
    // style the left border of the embed container
    embedContainer.style.borderColor = `${options.borderColor}`;

    // create the embed header
    if (options.domain != "" || options.header != "") {
        let headerContent = options.header != "" ? options.header : options.domain;
        let headerUrl = options.headerUrl != "" ? options.headerUrl : options.domainUrl;

        let embedHeader = createElement("div", { class: "mbp-embed-header" }, embedContainer);
        if (headerUrl != "")
            embedHeader = createElement("a", { class: "mbp-embed-header-link", href: headerUrl, target: "_blank" }, embedHeader);
        embedHeader.innerText = headerContent;
    }

    // create the embed subtitle
    if (options.subtitle != "") {
        let embedSubtitle = createElement("div", { class: "mbp-embed-subtitle" }, embedContainer);
        if (options.subtitleUrl != "")
            embedSubtitle = createElement("a", { class: "mbp-embed-subtitle-link", href: options.subtitleUrl, target: "_blank" }, embedSubtitle);
        embedSubtitle.innerText = options.subtitle;
    }
    // create the embed title as a link
    if (options.title_url != "") {
        let embedTitle = createElement("div", { class: "mbp-embed-title" }, embedContainer);
        if (options.title_url != "")
            embedTitle = createElement("a", { class: "mbp-embed-title-link", href: options.title_url, target: "_blank" }, embedTitle);
        embedTitle.innerText = options.title;
    }

    // create the embed description
    if (options.description != "") {
        let embedDescription = createElement("div", { class: "mbp-embed-description" }, embedContainer);
        embedDescription.innerText = options.description;
    }

    if (options.embedLink == "") return embedContainer;

    // create the embed iframe
    let iframe = createElement("iframe", {
        src: options.embedLink,
        width: "200",
        height: "110",
        frameborder: "0",
        style: "border: none;",
    }, embedContainer);

    // enable allowfullscreen
    iframe.setAttribute("allowfullscreen", "");

    return embedContainer;
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

/**
 * Logs a message with a tag at the start
 * @param {string} message the message to log
 */
function log(message) {
    // add a tag at the start of the message saying "MB+" in a div with white text, a black background, red left border and blue right border
    let tag = `%cMB+`;
    let tagStyle = "background-color: black; color: white; padding: 2px 4px; border-left: 4px solid red; border-right: 4px solid #0095ff;";

    // clear the style before the message
    console.log(tag, tagStyle, message);
}

/**
 * Logs an error message with a tag at the start
 * @param {string} message the message to log
 */
function error(message) {
    // add a tag at the start of the message saying "MB+" in a div with white text, a black background, red left border and blue right border
    let tag = `%cMB+`;
    let tagStyle = "background-color: black; color: white; padding: 2px 4px; border-left: 4px solid red; border-right: 4px solid #0095ff;";

    // clear the style before the message
    console.error(tag, tagStyle, message);
}


/**
 * Check the version of the script loaded and compare it to the version in the repository
 */
async function getRemoteVersion() {
    const url = "https://raw.githubusercontent.com/Jordy3D/MoonbouncePlus/main/scripts/MoonbouncePlus.user.js";
    const response = await fetch(url);
    const text = await response.text();
    const lines = text.split("\n").slice(0, 20);

    const versionLine = lines.find(line => line.includes("@version"));
    return versionLine ? versionLine.split(" ").pop() : null;
}

/**
 * Check if the current version is higher than the remote version
 * @param {string} current the current version
 * @param {string} remote the remote version
 * @returns a boolean if the current version is higher than the remote version
 * 
 * @example
 * isVersionHigher("1.0.0", "0.9.9") // true
 * isVersionHigher("1.0.0", "1.0.0") // false
 * isVersionHigher("0.9.9", "1.0.0") // false
 */
function isVersionHigher(current, remote) {
    const currentParts = current.split('.').map(Number);
    const remoteParts = remote.split('.').map(Number);

    for (let i = 0; i < Math.max(currentParts.length, remoteParts.length); i++) {
        const currentPart = currentParts[i] || 0;
        const remotePart = remoteParts[i] || 0;

        if (currentPart !== remotePart) {
            return currentPart < remotePart;
        }
    }

    return false;
}

/**
 * Check if a new version of the script is available and return a boolean if it is
 */
async function checkNewVersionAvailable() {
    let latestVersion = (remoteVersion == null ? await getRemoteVersion() : remoteVersion).trim();

    // console.log(`Current ${currentVersion} | Latest ${latestVersion} | Same? ${currentVersion == latestVersion}`);

    remoteVersion = latestVersion;

    return isVersionHigher(currentVersion, latestVersion);
}


/**
 * Download a file from a URL
 */
function downloadFile(url, filename, logMessage = false) {
    if (logMessage) log(`Downloading ${filename} from ${url}`);

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
    style.innerHTML = escapeHTMLPolicy.createHTML(css);
    parent.appendChild(style);
}

/**
 * Floating notification that fades out after a few seconds
 * @param {string} message the message to display
 * @param {number} duration the duration of the notification in milliseconds
 * @param {string} css the CSS styles for the notification
 * @param {string} position the position of the notification (top, top-right, top-left, bottom, bottom-right, bottom-left, center, position: absolute)
 */
function floatingNotification(message, duration = 3000, css = "", position = "top", deleteExisting = false, parent = document.body) {

    if (deleteExisting) {
        let existingNotifications = document.querySelectorAll(".floating-notification");
        for (let notification of existingNotifications)
            notification.remove();
    }

    let notification = document.createElement("div");
    notification.innerHTML = escapeHTMLPolicy.createHTML(message);
    notification.style.cssText = css;
    notification.style.position = "fixed";
    notification.style.zIndex = 100000;
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

    parent.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = 0;
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, duration);
}

//#endregion

//#endregion