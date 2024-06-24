<div align="center">
  <h1>Moonbounce Plus</h1>
  <p>A userscript that adds a few features to the Moonbounce website and experience.</p>
</div>

## Features

- Ponder for potential new crafting opportunities based on your inventory
- Appraise the value of your inventory, as well as how many items are contained within (both total and unique)
- Sort your inventory by name, id, rarity, type, item value, quantity, stack value
  - NOTE: Currently doesn't work in the Crafting tab
- Copy the info from the currently selected item to your clipboard (for data collection, such as for the [Moonbounce Wiki](https://moonbounce.wiki))
  - Click on the item's image to copy the item data
  - Ctrl+Right Click on the item's image download the image with its name formatted for the wiki

## Installation

1. Install a userscript manager for your browser. I recommend [Tampermonkey](https://www.tampermonkey.net/).
2. Install the script by clicking [here](https://github.com/Jordy3D/MoonbouncePlus/raw/main/scripts/MoonbouncePlus.user.js).
3. The script should now be active on the Moonbounce website!

## Side Features

This repo also contains a Python script to help generate wiki page template code. It will output a .txt file for every item in the data file into a newly created `wiki` folder, organised by type.

## Known Issues

- Sometimes the script fails to download the data file before you click on something, causing the script to not work properly. If this happens, simply refresh the page and try again.

## To-Do

- [ ] Add buttons to go to the Marketplace and Backpack on the Moonbounce Portal

## Changelog

Check the top of the script for the latest version and changes.