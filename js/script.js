

var moonbounceData = null;

var dataURL = "https://raw.githubusercontent.com/Jordy3D/MoonbouncePlus/main/data/MoonbouncePlus.json";

// fetch the data from the URL
fetch(dataURL)
    .then(response => response.json())
    .then(data => {
        moonbounceData = data;
        // console.log(moonbounceData);
        // call the function to display the data
        displayData();
    })
    .catch(error => {
        console.error("Error fetching data: ", error);
    });

// create a new div for each item in the data
const items = document.getElementById("items");
const searchBox = document.getElementById("search");

const itemTemplate = `
                <h3 class="name"></h3>
                <div class="details">
                    <h4>Desription</h4>
                    <p class="description"></p>
                    <h4>Details</h4>
                    <div class="pill-details">
                        <p class="pill rarity"></p>
                        <p class="pill type"></p>
                        <p class="pill value"></p>
                    </div>
                    <div class="source-details">
                        <div class="source">
                            <h3>Obtainable From</h3>
                            <ul></ul>
                        </div>
                    </div>
                </div>
        `;

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

        // an item looks lke the following
        /*
        {
            "id": 68,
            "name": "Nebula Orb",
            "uuid": "73e0610e-26e5-4e86-b27c-f45ad255530d",
            "description": "It’s emitting an interesting and chaotic aura",
            "rarity": "UNCOMMON",
            "type": "MATERIAL",
            "value": 100,
            "sources": []
        }
        */

        for (var i = 0; i < itemData.length; i++) {
            const item = itemData[i];
            const itemElement = document.createElement("div");
            itemElement.innerHTML = itemTemplate;

            let nameElement = itemElement.querySelector(".name");
            let descriptionElement =
                itemElement.querySelector(".description");
            let rarityElement =
                itemElement.querySelector(".rarity");
            let typeElement = itemElement.querySelector(".type");
            let valueElement = itemElement.querySelector(".value");

            nameElement.textContent = `${item.name} #${item.id}`;
            descriptionElement.textContent = item.description;
            rarityElement.textContent = item.rarity;
            typeElement.textContent = item.type;
            valueElement.textContent = `${item.value} MP`;

            if (item.value === 0 || item.value === null)
                valueElement.style.display = "none";

            // add the class for the rarity and type
            itemElement.classList.add("item");
            itemElement.classList.add(item.rarity.toLowerCase());
            itemElement.classList.add(item.type.toLowerCase());

            const dropsFrom =
                itemElement.querySelector(".source ul");

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

            // add various data attributes to the item
            itemElement.setAttribute("data-name", item.name);
            itemElement.setAttribute("data-id", item.id);
            itemElement.setAttribute("data-uuid", item.uuid);
            itemElement.setAttribute("data-value", item.value || 0);
            itemElement.setAttribute("data-rarity", item.rarity);
            itemElement.setAttribute("data-type", item.type);

            items.appendChild(itemElement);
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
            const itemElement = items.querySelector(`[data-name="${recipe.result}"]`);

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
    const items = document.querySelectorAll(".item");

    items.forEach(item => {
        // search the item's data-name, data-id, data-rarity, and data-type
        const name = item.getAttribute("data-name").toLowerCase();
        const id = item.getAttribute("data-id").toLowerCase();
        const rarity = item.getAttribute("data-rarity").toLowerCase();
        const type = item.getAttribute("data-type").toLowerCase();

        if (name.includes(searchValue) || id.includes(searchValue) || rarity.includes(searchValue) || type.includes(searchValue)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }

    });
}