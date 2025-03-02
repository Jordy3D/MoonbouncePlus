var moonbounceData = null;

var items = [];

var mainDataURL = "https://raw.githubusercontent.com/Jordy3D/MoonbouncePlus/main/data/MoonbouncePlus.json";
var marketplateDataURL = "https://raw.githubusercontent.com/Jordy3D/MoonbouncePlus/main/data/marketplace.json";
var wikiDataURL = "https://raw.githubusercontent.com/Jordy3D/MoonbouncePlus/main/data/wiki_data.json";

var sourcesDataURL = "https://raw.githubusercontent.com/Jordy3D/MoonbouncePlus/main/data/sources.json";

// if any of these fail, attempt to use local data from /data
var localMainDataURL = "/data/MoonbouncePlus.json";
var localMarketplaceDataURL = "/data/marketplace.json";
var localWikiDataURL = "/data/wiki_data.json";
var localSourcesDataURL = "/data/sources.json";

// fetch the data from the URL
fetch(mainDataURL)
    .then(response => response.json())
    .then(data => {
        moonbounceData = data;

        // fetch the marketplace data
        fetch(marketplateDataURL)
            .then(response => response.json())
            .then(data => {
                moonbounceData.marketplace = data.marketplace;
                // console.log("Data loaded: ", moonbounceData);
                
                // Dispatch the loadData event after we have the data
                window.dispatchEvent(new Event('loadData'));
                
                displayData();
            })
    })
    .catch(error => {
        console.error("Error fetching data: ", error);
        // Try local data as fallback
        fetch(localMainDataURL)
            .then(response => response.json())
            .then(data => {
                moonbounceData = data;
                window.dispatchEvent(new Event('loadData'));
                displayData();
            });
    });

// create a new div for each item in the data
const itemContainer = document.getElementById("items");
const searchBox = document.getElementById("search");
const sortBox = document.getElementById("sort");

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



// sort options and data
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
    { name: "ID", method: (a, b) => sortId(a, b) },
    { name: "Name (A > Z)", method: (a, b) => sortName(a, b) },
    { name: "Name (Z > A)", method: (a, b) => sortName(b, a) },

    { name: "Rarity (Common > Mythic)", method: (a, b) => sortRarity(a, b) },
    { name: "Rarity (Mythic > Common)", method: (a, b) => sortRarity(b, a) },

    { name: "Type", method: (a, b) => sortType(a, b) },
    { name: "Value (Low > High)", method: (a, b) => sortValue(a, b) },
    { name: "Value (High > Low)", method: (a, b) => sortValue(b, a) },
];

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

// add sorting options to the select box
sortingMethods.forEach((method) => {
    const option = document.createElement("option");
    option.value = method.name;
    option.text = method.name;
    sortBox.add(option);
});

// use data-name, data-id, data-rarity, data-type, data-value to sort the items

// sort by rarity
function sortRarity(a, b) {
    const rarityA = rarityOrder.find((rarity) => rarity.name === a.getAttribute("data-rarity")).value;
    const rarityB = rarityOrder.find((rarity) => rarity.name === b.getAttribute("data-rarity")).value;

    return rarityA - rarityB;
}

// sort by id
function sortId(a, b) {
    return a.getAttribute("data-id") - b.getAttribute("data-id");
}

// sort by type
function sortType(a, b) {
    return a.getAttribute("data-type").localeCompare(b.getAttribute("data-type"));
}

// sort by value
function sortValue(a, b) {
    // if the value is 0

    return a.getAttribute("data-value") - b.getAttribute("data-value");
}

// sort by name
function sortName(a, b) {
    let nameA = a.getAttribute("data-name");
    let nameB = b.getAttribute("data-name");

    return nameA.localeCompare(nameB);
}

// sort the items
function sortItems() {
    const sortMethod = sortingMethods.find((method) => method.name === sortBox.value).method;

    let items = document.querySelectorAll(".item");
    console.log(`Sorting ${items.length} items`)

    // turn items into an array
    items = Array.from(items);

    // sort the items
    items.sort(sortMethod);


    // give the items their new order using the order property
    items.forEach((item, index) => {
        item.style.order = index;
    });
}

//#endregion