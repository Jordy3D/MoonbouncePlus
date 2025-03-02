var moonbounceData = null;
var items = [];

// create a new div for each item in the data
const itemContainer = document.getElementById("items");
const searchBox = document.getElementById("search");
const sortBox = document.getElementById("sort");

// Initialize sort options
if (sortBox) {
    config.sortingMethods.forEach((method) => {
        const option = document.createElement("option");
        option.value = method.name;
        option.text = method.name;
        sortBox.add(option);
    });
}

// Load data and display
config.loadAllData(displayData);

function displayData() {
    if (moonbounceData) {
        var itemData = moonbounceData.items;
        var recipeData = moonbounceData.recipes;
        var marketplaceData = moonbounceData.marketplace;

        function findInMarketplace(itemName, marketplaceData) {
            for (var i = 0; i < marketplaceData.items.length; i++) {
                const item = marketplaceData.items[i];
                if (item.name === itemName) {
                    return item;
                }
            }

            return null;
        }

        for (var i = 0; i < itemData.length; i++) {
            const item = itemData[i];
            const div = document.createElement('div');
            div.classList.add('item');
            div.classList.add(item.rarity.toLowerCase());
            div.classList.add(item.type.toLowerCase());

            // Add data attributes for filtering
            div.setAttribute('data-name', item.name);
            div.setAttribute('data-id', item.id);
            div.setAttribute('data-rarity', item.rarity);
            div.setAttribute('data-type', item.type);
            div.setAttribute('data-value', item.value || 0);

            div.innerHTML = `
                <h3 class="name">
                    <a href="wiki.html?q=${encodeURIComponent(item.name)}">#${item.id} ${item.name}</a>
                </h3>
                <div class="details">
                    <h4>Description</h4>
                    <p class="description">${item.description}</p>
                    <h4>Details</h4>
                    <div class="pill-details">
                        <p class="pill rarity">${item.rarity}</p>
                        <p class="pill type">${item.type}</p>
                        <p class="pill value">${item.value} MP</p>
                    </div>
                    <div class="source-details">
                        <div class="source">
                            <h3>Obtainable From</h3>
                            <ul></ul>
                        </div>
                    </div>
                </div>
            `;

            if (item.value === 0 || item.value === null)
                div.querySelector(".value").style.display = "none";

            const dropsFrom = div.querySelector(".source ul");

            // get the names of the sources
            let obtainSources = [];
            for (var j = 0; j < item.sources.length; j++) {
                const source = item.sources[j];
                obtainSources.push(source);
            }

            let marketplaceItem = findInMarketplace(item.name, marketplaceData);
            // if it's in the marketplace, add it as a source
            if (marketplaceItem) {
                obtainSources.push("Marketplace");
            }

            if (obtainSources.length > 0) {
                for (var j = 0; j < obtainSources.length; j++) {
                    const sourceElement = document.createElement("li");
                    sourceElement.textContent = obtainSources[j];
                    dropsFrom.appendChild(sourceElement);
                }

            } else {
                const sourceElement = document.createElement("li");
                sourceElement.textContent = "Nothing";
                dropsFrom.appendChild(sourceElement);
            }

            itemContainer.appendChild(div);
        }

        // loop through the recipes and add them to the items
        // A recipe looks like the following
        /*
        {
            "result": "Rudolph Toy",
            "ingredients": ["Perfect Snowflake", "Rudolph's Nose"],
            "tools": ["Holiday Magic Orb", "Fairy Particles"],
            "type": "Seasonal (Christmas)"
        }
        */
        for (var i = 0; i < recipeData.length; i++) {
            const recipe = recipeData[i];

            // find the item that the recipe is for
            const itemElement = itemContainer.querySelector(`[data-name="${recipe.result}"]`);

            if (itemElement) {
                const detailsElement = itemElement.querySelector(".details");
                const recipeElement = document.createElement("div");
                recipeElement.classList.add("recipe");

                recipeElement.innerHTML = `<h4>Recipe</h4>`;

                // create a container for the ingredients and tools
                let ingredientsElement = document.createElement("div");
                ingredientsElement.classList.add("pill-details");
                recipeElement.appendChild(ingredientsElement);

                // combine the ingredients and tools into a single array
                let requiredItems = recipe.ingredients.concat(recipe.tools);
                for (var j = 0; j < requiredItems.length; j++) {
                    const requiredItem = requiredItems[j];
                    const requiredItemElement = document.createElement("p");
                    requiredItemElement.classList.add("ingredient");
                    requiredItemElement.classList.add("pill");
                    requiredItemElement.textContent = requiredItem;
                    ingredientsElement.appendChild(requiredItemElement);
                }

                detailsElement.appendChild(recipeElement);
            }
        }

    } else {
        // items.innerHTML = '<p>Loading...</p>';
    }
}

function searchItems() {
    const searchValue = searchBox.value.toLowerCase();
    items = document.querySelectorAll(".item");

    items.forEach(item => {
        // search the item's data-name, data-id, data-rarity, and data-type
        const name = item.getAttribute("data-name").toLowerCase();
        const id = item.getAttribute("data-id").toLowerCase();
        const rarity = item.getAttribute("data-rarity").toLowerCase();
        const type = item.getAttribute("data-type").toLowerCase();

        if (name.includes(searchValue) || id.includes(searchValue) || rarity.includes(searchValue) || type.includes(searchValue)) {
            item.style.display = "flex";
        } else {
            item.style.display = "none";
        }

    });
}



//#region Sorting

// use data-name, data-id, data-rarity, data-type, data-value to sort the items

// sort the items
function sortItems() {
    const sortMethod = config.sortingMethods.find((method) => method.name === sortBox.value);
    if (!sortMethod) return;

    let items = document.querySelectorAll(".item");
    items = Array.from(items);
    items.sort((a, b) => sortMethod.method.call(config, a, b));

    items.forEach((item, index) => {
        item.style.order = index;
    });
}

//#endregion