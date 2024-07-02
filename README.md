<div align="center">
  <h1>Moonbounce Plus</h1>
  <img src="https://github.com/Jordy3D/MoonbouncePlus/assets/19144524/65fb6083-77cd-422b-abf1-c9bec3d3ac00" height=100>
  <p>A userscript that adds a few features to the Moonbounce website and experience.</p>
</div>

## Features

- OSRS chat effects! Use most of the chat effects you're familiar with from OldSchool RuneScape!
  ![chrome_OL53FAc6ib](https://github.com/Jordy3D/MoonbouncePlus/assets/19144524/33e1a56b-4c4f-462e-a7fd-794786b892f3)
- Ponder for potential new crafting opportunities based on your inventory  
  ![chrome_DU5zjnsLiU](https://github.com/Jordy3D/MoonbouncePlus/assets/19144524/3a386947-a633-405b-9ed4-5e3432abe4c2)
- Appraise the value of your inventory, as well as how many items are contained within (both total and unique)  
  ![chrome_FPrdEws6If](https://github.com/Jordy3D/MoonbouncePlus/assets/19144524/1efd6494-434b-4bbd-90bc-7b6aad0e6916)
- Sort your inventory by name, id, rarity, type, item value, quantity, stack value
- Copy the info from the currently selected item to your clipboard (for data collection, such as for the [Moonbounce Wiki](https://moonbounce.wiki))
  - Click on the item's image to copy the item data
  - Ctrl+Right Click on the item's image download the image with its name formatted for the wiki
- Copy the info for the Marketplace page you're currently on to your clipboard
- Quick access buttons to the Marketplace, Inventory, and Directory pages
- A link to the Moonbounce Wiki page for the currently selected item in your inventory

## Installation

1. Install a userscript manager for your browser. I recommend [Tampermonkey](https://www.tampermonkey.net/).
2. Install the script by clicking [here](https://github.com/Jordy3D/MoonbouncePlus/raw/main/scripts/MoonbouncePlus.user.js).
3. The script should now be active on the Moonbounce website!

## Side Features

This repo also contains a Python script to help generate wiki page template code. It will output a .txt file for every item in the data file into a newly created `wiki` folder, organised by type.

## Known Issues

- Sometimes the script fails to download the data file before you click on something, causing the script to not work properly. If this happens, simply refresh the page and try again.
- The script may not work properly if the Moonbounce website is updated and the script is not updated to match it. If this happens, please open an issue on this repo.
- If you open chat after an OSRS-styled message has been sent, it won't be styled. It's only on new message while the window is open.

## To-Do

- [ ] Add a toggle for horizontal/vertical Moonbounce Portal button layout
- [ ] Add transparent mode to the Moonbounce Portal (ie: buttons and chat)
- [ ] Add transparency and/or size options to the item drop notification
- [ ] Add settings to toggle features on and off

## Changelog

Check the top of the script for the latest version and changes.
