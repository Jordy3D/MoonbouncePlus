<div align="center">
  <h1>Moonbounce Plus</h1>
  <img src="https://github.com/Jordy3D/MoonbouncePlus/blob/main/assets/MoonbouncePlus.png" height=100>
  <p>A userscript that adds a few features to the Moonbounce website and experience.</p>

  <a href="#features">Features</a> | <a href="#installation">Installation</a> | <a href="#side-features">Side Features</a> | <a href="#known-issues">Known Issues</a> | <a href="#to-do">To-Do</a> | <a href="#changelog">Changelog</a>
</div>

## Features

### Moonbounce Portal
- OSRS chat effects! Use most of the chat effects you're familiar with from OldSchool RuneScape!  
  <img src="https://github.com/Jordy3D/MoonbouncePlus/assets/19144524/33e1a56b-4c4f-462e-a7fd-794786b892f3" width=300 style="border-radius: 15px">
- YouTube videos embedded in chat!  
  <img src="https://github.com/user-attachments/assets/fbece47a-ee5d-40bb-9aa9-5956456d0136" width=300 style="border-radius: 15px">
- Quick access buttons to the Marketplace, Inventory, and Directory pages

### Moonbounce Site
- Ponder for potential new crafting opportunities based on your inventory  
  <img src="https://github.com/Jordy3D/MoonbouncePlus/assets/19144524/3a386947-a633-405b-9ed4-5e3432abe4c2" width=300 style="border-radius: 15px">
- Appraise the value of your inventory, as well as how many items are contained within (both total and unique)  
  <img src="https://github.com/Jordy3D/MoonbouncePlus/assets/19144524/1efd6494-434b-4bbd-90bc-7b6aad0e6916" width=300 style="border-radius: 15px">
- Sort your inventory by Name, ID, Rarity, Type, Item Value, Quantity, Stack Value
- Copy the info from the currently selected item to your clipboard (for data collection, such as for the [Moonbounce Wiki](https://moonbounce.wiki))
  - Click on the item's image to copy the item data
  - Ctrl+Right Click on the item's image download the image with its name formatted for the wiki
- Copy the info for the Marketplace page you're currently on to your clipboard
- A link to the Moonbounce Wiki page for the currently selected item in your inventory
- Auto-refresh on Application Error (which happens both naturally, and due to the script)


## Installation

1. Install a userscript manager for your browser. I recommend [Tampermonkey](https://www.tampermonkey.net/).
2. Install the script by clicking [here](https://github.com/Jordy3D/MoonbouncePlus/raw/main/scripts/MoonbouncePlus.user.js).
3. The script should now be active on the Moonbounce website!

## Side Features

This repo also contains a Python script to help generate wiki page template code. It will output a .txt file for every item in the data file into a newly created `wiki` folder, organised by type.

## Known Issues

- Sometimes the script fails to download the data file before you click on something, causing the script to not work properly. If this happens, simply refresh the page and try again.
- The script may not work properly if the Moonbounce website is updated and the script is not updated to match it. If this happens, please open an issue on this repo.

## To-Do

- [ ] Add a toggle for horizontal/vertical Moonbounce Portal button layout
- [ ] Add transparent mode to the Moonbounce Portal (ie: buttons and chat)
- [ ] Add transparency and/or size options to the item drop notification

## Changelog

Check the top of the script for the latest version and changes.
