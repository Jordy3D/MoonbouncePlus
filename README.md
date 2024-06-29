<div align="center">
  <h1>Moonbounce Plus</h1>
  <img src="https://github.com/Jordy3D/MoonbouncePlus/assets/19144524/65fb6083-77cd-422b-abf1-c9bec3d3ac00" height=100>
  <p>A userscript that adds a few features to the Moonbounce website and experience.</p>
</div>

## Features

- Ponder for potential new crafting opportunities based on your inventory  
  ![chrome_DU5zjnsLiU](https://github.com/Jordy3D/MoonbouncePlus/assets/19144524/3a386947-a633-405b-9ed4-5e3432abe4c2)
- Appraise the value of your inventory, as well as how many items are contained within (both total and unique)  
  ![chrome_FPrdEws6If](https://github.com/Jordy3D/MoonbouncePlus/assets/19144524/1efd6494-434b-4bbd-90bc-7b6aad0e6916)
- Sort your inventory by name, id, rarity, type, item value, quantity, stack value
- Copy the info from the currently selected item to your clipboard (for data collection, such as for the [Moonbounce Wiki](https://moonbounce.wiki))
  - Click on the item's image to copy the item data
  - Ctrl+Right Click on the item's image download the image with its name formatted for the wiki
- Quick access buttons to the Marketplace, Inventory, and Directory pages

## Installation

1. Install a userscript manager for your browser. I recommend [Tampermonkey](https://www.tampermonkey.net/).
2. Install the script by clicking [here](https://github.com/Jordy3D/MoonbouncePlus/raw/main/scripts/MoonbouncePlus.user.js).
3. The script should now be active on the Moonbounce website!

## Side Features

This repo also contains a Python script to help generate wiki page template code. It will output a .txt file for every item in the data file into a newly created `wiki` folder, organised by type.

## Known Issues

- Sometimes the script fails to download the data file before you click on something, causing the script to not work properly. If this happens, simply refresh the page and try again.

## To-Do

- [ ] Add a toggle for horizontal/vertical Moonbounce Portal button layout
- [ ] Add transparent mode to the Moonbounce Portal (ie: buttons and chat)
- [ ] Add transparency and/or size options to the item drop notification
- [ ] Add links to the Wiki for each item in the inventory

## Changelog

Check the top of the script for the latest version and changes.
