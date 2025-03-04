var mainDataURL = "https://raw.githubusercontent.com/Jordy3D/MoonbouncePlus/main/data/MoonbouncePlus.json";
var marketplaceDataURL = "https://raw.githubusercontent.com/Jordy3D/MoonbouncePlus/main/data/marketplace.json";
var wikiDataURL = "https://raw.githubusercontent.com/Jordy3D/MoonbouncePlus/main/data/wiki_data.json";

let combinedData = {};

// Add this after combinedData declaration
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('selectedTheme') || 'theme-light';
    setTheme(savedTheme);
    document.querySelector('.theme-selector select').value = savedTheme;
});

// Get the query parameter
const urlParams = new URLSearchParams(window.location.search);
const searchQuery = urlParams.get('q');

async function fetchData(key) {
    try {
        const response = await fetch(config.urls[key]);
        if (!response.ok) throw new Error(`Remote ${key} not found`);
        return await response.json();
    } catch (error) {
        console.log(`Falling back to local ${key}`);
        const response = await fetch(config.localUrls[key]);
        if (!response.ok) throw new Error(`Local ${key} not found`);
        return await response.json();
    }
}

// Replace the Promise.all block with individual fetches
async function loadAllData() {
    try {
        const [mainData, marketplaceData, wikiData, sourcesData] = await Promise.all([
            fetchData('main'),
            fetchData('marketplace'),
            fetchData('wiki'),
            fetchData('sources')
        ]);

        combinedData = {
            items: mainData.items,
            recipes: mainData.recipes,
            marketplace: marketplaceData.marketplace,
            wiki: wikiData,
            sources: sourcesData.sources
        };

        // console.log('All data loaded:', combinedData);
        window.combinedData = combinedData;
        // console.log('Data available in window.combinedData:', window.combinedData);

        // Dispatch event when data is loaded
        window.dispatchEvent(new Event('loadData'));

        displayWikiPage(searchQuery);
    } catch (error) {
        console.error("Error loading data:", error);
        showErrorMessage("Failed to load required data");
    }
}

config.loadAllData(() => displayWikiPage(searchQuery));

function formatText(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Define page types and their handlers
const pageTypes = [
    {
        type: 'item',
        check: (name) => combinedData?.items && findItem(name),
        display: (name) => {
            const item = findItem(name);
            if (item) displayItemPage(item);
            else showErrorMessage(`Item "${name}" not found`);
        }
    },
    {
        type: 'source',
        check: (name) => combinedData?.sources && findSource(name),
        display: (name) => {
            const source = findSource(name);
            if (source) displaySourcePage(source);
            else showErrorMessage(`Source "${name}" not found`);
        }
    },
    {
        type: 'category',
        check: (name) => typeof name === 'string' && name.includes('Category:'),
        display: (name) => {
            const category = name.split('Category:')[1];
            displayCategoryPage(category);
        }
    },
    {
        type: 'collection',
        check: (name) => combinedData?.items && ['Items', 'Material', 'Tool', 'Accessory', 'Character'].includes(name),
        display: displayCollectionPage
    }
];

function displayWikiPage(searchQuery) {
    if (!searchQuery) {
        displayWelcomePage();
        return;
    }

    // Try each page type until we find one that matches
    for (const pageType of pageTypes) {
        if (pageType.check(searchQuery)) {
            pageType.display(searchQuery);
            return;
        }
    }

    showErrorMessage(`"${searchQuery}" not found`);
}

function displayWelcomePage() {
    updatePageTitle('Welcome');
    const wikiContent = document.getElementById('wiki-content');
    
    const stats = {
        items: combinedData?.items?.length || 0,
        sources: combinedData?.sources?.length || 0,
        recipes: combinedData?.recipes?.length || 0
    };

    wikiContent.innerHTML = `
        <div class="welcome-page">
            <h1>Welcome to the MoonbouncePlus Wiki</h1>
            
            <div class="welcome-content">
                <p>This wiki contains information about items, sources, and recipes in Moonbounce.</p>
                
                <div class="wiki-stats">
                    <h2>Quick Stats</h2>
                    <ul>
                        <li><a href="?q=Category:Items">${stats.items} Items</a></li>
                        <li><a href="?q=Category:Loot Source">${stats.sources} Sources</a></li>
                        <li>${stats.recipes} Recipes</li>
                    </ul>
                </div>

                <div class="browse-categories">
                    <h2>Browse by Category</h2>
                    <div class="category-links">
                        <div class="category-section">
                            <h3>Rarities</h3>
                            <ul>
                                <li><a href="?q=Category:Common">Common Items</a></li>
                                <li><a href="?q=Category:Uncommon">Uncommon Items</a></li>
                                <li><a href="?q=Category:Rare">Rare Items</a></li>
                                <li><a href="?q=Category:Legendary">Legendary Items</a></li>
                                <li><a href="?q=Category:Mythic">Mythic Items</a></li>
                            </ul>
                        </div>

                        <div class="category-section">
                            <h3>Types</h3>
                            <ul>
                                <li><a href="?q=Material">Materials</a></li>
                                <li><a href="?q=Tool">Tools</a></li>
                                <li><a href="?q=Accessory">Accessories</a></li>
                                <li><a href="?q=Character">Characters</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Page section configuration
const pageSections = {
    item: {
        title: true,
        infobox: true,
        introduction: true,
        description: true,
        foundIn: true,
        recipe: true,
        usedIn: true,     // Add new section
        trivia: true,     // Add new section
        categories: true
    },
    source: {
        title: true,
        infobox: true,
        introduction: true,
        drops: true,
        categories: true
    },
    category: {
        title: true,
        description: true,
        items: true,
        filter: true
    },
    collection: {
        title: true,
        description: true,
        items: true,
        filter: true
    }
};

function updatePageTitle(title) {
    document.title = `${title} - MoonbouncePlus Wiki`;
}

function displayItemPage(item) {
    updatePageTitle(item.name);
    // Format item properties
    item.rarity = formatText(item.rarity);
    item.type = formatText(item.type);

    const recipe = findRecipe(item.name);
    const usedInRecipes = findRecipesUsingItem(item.name);
    const wikiInfo = findWikiInfo(item.name);
    const wikiContent = document.getElementById('wiki-content');

    const sections = pageSections.item;
    wikiContent.innerHTML = `
        ${sections.title ? generateTitle(item) : ''}
        ${sections.infobox ? generateInfobox(item, recipe) : ''}
        ${sections.introduction ? generateIntroduction(item) : ''}
        ${sections.description ? generateDescription(item) : ''}
        ${sections.foundIn ? generateFoundIn(item) : ''}
        ${sections.recipe ? generateRecipeSection(recipe) : ''}
        ${sections.usedIn ? generateUsedInSection(usedInRecipes) : ''}
        ${sections.trivia ? generateTriviaSection(wikiInfo) : ''}
        ${sections.categories ? generateItemCategories(item) : ''}
    `;
}

function displaySourcePage(source) {
    updatePageTitle(`${source.name} (Source)`);
    if (!source) {
        showErrorMessage("Invalid source data");
        return;
    }

    const drops = source.drops || [];
    const wikiInfo = findWikiInfo(source.name);
    const wikiContent = document.getElementById('wiki-content');
    const sections = pageSections.source;

    const sortedDrops = drops
        .map(name => ({
            name,
            item: findItem(name),
            rarity: findItem(name)?.rarity || 'UNKNOWN'
        }))
        .sort((a, b) => getRarityValue(a.rarity) - getRarityValue(b.rarity))
        .map(drop => drop.name);

    // Create array of categories
    const sourceCategories = ['Loot Source'];
    if (wikiInfo?.promo) {
        sourceCategories.push('Promotional');
    }
    if (wikiInfo?.categories) {
        sourceCategories.push(...wikiInfo.categories);
    }

    wikiContent.innerHTML = `
        ${sections.title ? generateTitle({ name: source.name }) : ''}
        ${sections.infobox ? generateSourceInfobox(source) : ''}
        ${sections.introduction ? `
            <p>The <strong>${source.name}</strong> is a source of items in Moonbounce.</p>
        ` : ''}
        ${sections.drops ? `
            <h2>Drops</h2>
            <div class="card-container" id="filtered-items">
                ${sortedDrops.map(item => generateCardFromName(item)).join('\n')}
            </div>
        ` : ''}
        ${sections.categories ? generateCategories(sourceCategories) : ''}
    `;

    if (sections.filter) initializeFilters();
}

// Update category handlers with better error checking
const categoryHandlers = {
    'Loot Source': () => {
        if (!combinedData?.sources) return [];
        return combinedData.sources.map(source => ({
            type: 'source',
            name: source.name
        }));
    },
    'Quests': () => {
        if (!combinedData?.quests) return [];
        return combinedData.quests.map(quest => ({
            type: 'quest',
            name: quest.name
        }));
    },
    'Promotional': () => {
        const items = [];
        
        // Add promotional items
        if (combinedData?.items) {
            const promoItems = combinedData.items.filter(item => {
                const wikiInfo = findWikiInfo(item.name);
                return wikiInfo?.promo === true;
            });
            items.push(...promoItems);
        }
        
        // Add promotional sources
        if (combinedData?.sources) {
            const promoSources = combinedData.sources.filter(source => {
                const wikiInfo = findWikiInfo(source.name);
                return wikiInfo?.promo === true;
            }).map(source => ({
                type: 'source',
                name: source.name
            }));
            items.push(...promoSources);
        }
        
        return items;
    },
    'default': (category) => {
        const items = [];
        
        // Check items
        if (combinedData?.items) {
            const matchingItems = combinedData.items.filter(item => {
                if (item.rarity.toLowerCase() === category.toLowerCase() ||
                    item.type.toLowerCase() === category.toLowerCase()) {
                    return true;
                }
                const wikiInfo = findWikiInfo(item.name);
                return wikiInfo?.categories?.includes(category);
            });
            items.push(...matchingItems);
        }
        
        // Check sources
        if (combinedData?.sources) {
            const matchingSources = combinedData.sources.filter(source => {
                const wikiInfo = findWikiInfo(source.name);
                return wikiInfo?.categories?.includes(category);
            }).map(source => ({
                type: 'source',
                name: source.name
            }));
            items.push(...matchingSources);
        }
        
        return items;
    }
};

function displayCategoryPage(category) {
    updatePageTitle(`${category} Category`);
    try {
        if (!category || typeof category !== 'string') {
            showErrorMessage("Invalid category");
            return;
        }

        // Get handler for this category or use default
        const handler = categoryHandlers[category] || categoryHandlers.default;
        const items = category.toLowerCase() === 'items'
            ? (combinedData?.items || [])
            : handler(category);

        const sections = pageSections.category;
        const wikiContent = document.getElementById('wiki-content');

        // Only generate items HTML if we have items
        const itemsHtml = items.length > 0
            ? items.map(item => generateCategoryCard(item)).join('\n')
            : '<p>No items found in this category.</p>';

        wikiContent.innerHTML = `
            ${sections.title ? `<h1>${category} Category</h1>` : ''}
            ${sections.description ? generateCategoryDescription(category) : ''}
            ${sections.filter && items.length > 0 ? generateFilterControls() : ''}
            ${sections.items ? `
                <div class="category-card-container" id="filtered-items">
                    ${itemsHtml}
                </div>
            ` : ''}
        `;

        if (sections.filter && items.length > 0) initializeFilters();
    } catch (error) {
        console.error("Category page error:", error);
        showErrorMessage("Failed to load category page");
    }
}

function generateCategoryDescription(category) {
    const descriptions = {
        'Loot Source': 'All sources that drop items in Moonbounce.',
        'Quests': 'Available quests and their rewards.',
        'Promotional': 'Entries related to some sort of promotion, event, or creator.',
        'default': `Entries in the ${category} category.`
    };

    return `<p>${descriptions[category] || descriptions.default}</p>`;
}

function generateCategoryCard(item) {
    if (!item?.name) return ''; // Skip invalid items

    let imagePath = item.name.replace(/ /g, '_').replace(/#/g, '-').replace(/\?/g, '-');
    let linkName = item.name.replace(/#/g, '%23');

    // Add data attributes for sorting
    const cardAttrs = `
        data-name="${item.name}"
        data-id="${item.id || 0}"
        data-rarity="${item.rarity || 'UNKNOWN'}"
        data-type="${item.type || ''}"
        data-value="${item.value || 0}"
    `;

    switch (item.type) {
        case 'source':
            return `
                <div class="card" ${cardAttrs}>
                    <div class="card-title">
                        <a href="?q=${linkName}">${item.name}</a>
                    </div>
                    <div class="card-image">
                        <a href="?q=${linkName}">
                            <img src="images/sources/${imagePath}.webp" alt="${item.name}" />
                        </a>
                    </div>
                </div>
            `;
        case 'quest':
            return `
                <div class="card quest" ${cardAttrs}>
                    <div class="card-title">
                        <a href="?q=${linkName}">${item.name}</a>
                    </div>
                    <div class="card-info">Reward: ${item.reward || ''}</div>
                </div>
            `;
        default:
            return generateCardFromName(item.name);
    }
}

function displayCollectionPage(collectionName) {
    updatePageTitle(`${collectionName} Collection`);
    const items = findItemsByType(collectionName);
    const sections = pageSections.collection;

    const wikiContent = document.getElementById('wiki-content');
    wikiContent.innerHTML = `
        ${sections.title ? `<h1>${collectionName}</h1>` : ''}
        ${sections.description ? `
            <p>All ${collectionName.toLowerCase()} items in Moonbounce.</p>
        ` : ''}
        ${sections.filter ? generateFilterControls() : ''}
        ${sections.items ? `
            <div class="category-card-container" id="filtered-items">
                ${items.map(item => generateCardFromName(item.name)).join('\n')}
            </div>
        ` : ''}
    `;

    if (sections.filter) initializeFilters();
}

function getRarityValue(rarity = '') {
    const rarityOrder = {
        'COMMON': 0,
        'UNCOMMON': 1,
        'RARE': 2,
        'LEGENDARY': 3,
        'MYTHIC': 4
    };
    return rarityOrder[rarity.toUpperCase()] ?? 999;
}

function generateSourceInfobox(source) {
    const drops = source.drops || [];

    let imagePath = source.name.replace(/ /g, '_').replace(/#/g, '-').replace(/\?/g, '-');

    return `
        <div class="infobox">
            <div class="infobox-title">${source.name}</div>
            <img src="images/sources/${imagePath}.webp"
                 alt="${source.name}" 
                 title="${source.name}" />
            
            <div class="infobox-row">
                <div class="infobox-label">Type</div>
                <div class="infobox-value">Source</div>
            </div>
            <div class="infobox-row">
                <div class="infobox-label">Drops</div>
                <div class="infobox-value">${drops.length} items</div>
            </div>
        </div>
    `;
}

function generateTitle(item) {
    return `<h1>${item.name}</h1>`;
}

function generateIntroduction(item) {
    const isCharacter = item.type.toLowerCase() === 'character';

    const plurals = [
        "glasses", "ears", "budz", "particles", "horns"
    ]

    // output introduction section with item name, rarity, and type
    // if the rarity begins with a vowel, use 'an' instead of 'a'
    // if the item is a character, do not include 'The' in the introduction
    // if the item is one of a list of known plurals, use "are" instead of "is"

    const startsWithVowel = ['A', 'E', 'I', 'O', 'U'].includes(item.rarity[0]);
    const isPlural = plurals.includes(item.name.toLowerCase());

    return `
        <div class="introduction-section">
            <p>
                ${isCharacter ?
            `<strong>${item.name}</strong>` :
            `The <strong>${item.name}</strong>`} ${isPlural ? 'are' : 'is'} ${startsWithVowel ? 'an' : 'a'} <a href="?q=Category:${item.rarity}">${item.rarity}</a> <a href="?q=Category:${item.type}">${item.type}</a> in Moonbounce.
            </p>
        </div>
    `;
}

function generateDescription(item) {
    return `
        <div class="description-section">
            <h2>Description</h2>
            <p>${item.description}</p>
        </div>
    `;
}

function generateFoundIn(item) {
    return `
        <div class="found-in-section">
            <h2>Found In</h2>
            <div class="card-container left-align">
                ${item.sources && item.sources.length > 0
            ? item.sources.map(source => generateCard(source)).join('\n')
            : '<p>This item cannot be found naturally.</p>'
        }
            </div>
        </div>
    `;
}

function generateRecipeSection(recipe) {
    if (!recipe) return '<div class="recipe-section"><h2>Recipe</h2><p>This item cannot be crafted.</p></div>';

    return `
        <div class="recipe-section">
            <h2>Recipe</h2>
            <h3>Ingredients</h3>
            <div class="card-container left-align">
                ${recipe.ingredients.map(ing => generateCardFromName(ing)).join('\n')}
            </div>
            ${recipe.tools.length > 0 ? `
                <h3>Tools</h3>
                <div class="card-container left-align">
                    ${recipe.tools.map(tool => generateCardFromName(tool)).join('\n')}
                </div>
            ` : ''}
        </div>
    `;
}

function generateUsedInSection(recipes) {
    if (!recipes || recipes.length === 0) {
        return '<div class="used-in-section"><h2>Used In</h2><p>This item is not used in any recipes.</p></div>';
    }

    // find all recipes that use this item as an ingredient or tool and display all of them in a card container

    let usedInRecipes = recipes.map(recipe => findRecipe(recipe.result));

    // search for the items by the result name
    usedInRecipes = usedInRecipes.map(recipe => findItem(recipe.result));

    // sort the recipes by rarity
    usedInRecipes = usedInRecipes.sort((a, b) => getRarityValue(a.rarity) - getRarityValue(b.rarity));

    return `
        <div class="used-in-section">
            <h2>Used In</h2>
            <h3>Recipes</h3>
            <div class="card-container left-align">
                ${usedInRecipes.map(recipe => generateCardFromName(recipe.name)).join('\n')}
            </div>
        </div>
    `;
}

function generateRecipeGroup(title, recipes) {
    if (!recipes || recipes.length === 0) return '';

    return `
        <h3>${title} Recipes</h3>
        <div class="card-container left-align">
            ${recipes.map(recipe => generateCardFromName(recipe.result)).join('\n')}
        </div>
    `;
}

function generateTriviaSection(wikiInfo) {
    if (!wikiInfo?.trivia?.length) return '';

    return `
        <div class="trivia-section">
            <h2>Trivia</h2>
            <ul class="trivia-list">
                ${generateTriviaList(parseTrivia(wikiInfo.trivia))}
            </ul>
        </div>
    `;
}

function parseTrivia(triviaArray) {
    const cleanAndFormat = (text) => {
        // Process in specific order with non-overlapping patterns        
        // Handle wiki-style links with display text: [[Page|Display]]
        text = text.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (_, link, display) => {
            return `<a href="?q=${encodeURIComponent(link.trim())}">${display.trim()}</a>`;
        });

        // Handle simple wiki links: [[Page]]
        text = text.replace(/\[\[([^\]]+?)\]\]/g, (_, link) => {
            return `<a href="?q=${encodeURIComponent(link.trim())}">${link.trim()}</a>`;
        });

        // Handle simpler wiki links: [Page] only if it's not a URL
        if (!text.match(/\[https?:\/\//) && !text.match(/\[ftp:\/\//)) {
            text = text.replace(/\[([^\]]+?)\]/g, (_, link) => {
                return `<a href="?q=${encodeURIComponent(link.trim())}">${link.trim()}</a>`;
            });
        }

        // Handle external URLs: [http... Display Text]
        text = text.replace(/\[(https?:\/\/[^\s\]]+)\s+([^\]]+)\]/g, (_, url, title) => {
            return `<a class="external-link" href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>`;
        });

        // Remove leading asterisks and trim
        return text.replace(/^\*+\s*/, '').trim();
    };

    const result = [];
    let current = null;

    triviaArray.forEach(fact => {
        const depth = (fact.match(/^\*+/)?.[0] || '').length;
        const cleanedFact = cleanAndFormat(fact);

        if (depth === 1) {
            current = { text: cleanedFact, children: [] };
            result.push(current);
        } else if (depth > 1 && current) {
            current.children.push(cleanedFact);
        }
    });

    return result;
}

function generateTriviaList(trivia) {
    return trivia.map(item => `
        <li>• ${item.text}
            ${item.children.length > 0 ? `
                <ul>
                    ${item.children.map(child => `
                        <li>◦ ${child}</li>
                    `).join('')}
                </ul>
            ` : ''}
        </li>
    `).join('\n');
}

function generateGallery(item) {
    return `
        <h2>Gallery</h2>
        <gallery> ${item.name.replace(/ /g, '_')}.png | ${item.name} item sprite </gallery>
    `;
}

function generateItemCategories(item) {
    const categories = [
        `<a href="?q=Category:${item.type}">${item.type}</a>`,
        `<a href="?q=Category:${item.rarity}">${item.rarity}</a>`,
        '<a href="?q=Category:Items">Items</a>'
    ];

    // Add promotional category if item is promotional
    const wikiInfo = findWikiInfo(item.name);
    if (wikiInfo?.promo) {
        categories.push('<a href="?q=Category:Promotional">Promotional</a>');
    }

    // Add custom categories if they exist
    if (wikiInfo?.categories) {
        wikiInfo.categories.forEach(category => {
            categories.push(`<a href="?q=Category:${category}">${category}</a>`);
        });
    }

    return `
        <div class="categories-section">
            <hr />
            <p>
                <strong>Categories:</strong> 
                ${categories.join(', ')}
            </p>
        </div>
    `;
}

function generateCategories(categories) {
    return `
        <div class="categories-section">
            <hr />
            <p>
                <strong>Categories:</strong>
                ${categories.map(cat => `<a href="?q=Category:${cat}">${cat}</a>`).join(', ')}
            </p>
        </div>
    `;
}

function findItem(name) {
    return combinedData.items.find(item =>
        item.name.toLowerCase() === name.toLowerCase());
}

function findRecipe(name) {
    return combinedData.recipes.find(recipe =>
        recipe.result.toLowerCase() === name.toLowerCase());
}

function findRecipesUsingItem(itemName) {
    if (!itemName || !combinedData.recipes) return [];

    return combinedData.recipes.filter(recipe =>
        recipe.ingredients.includes(itemName) ||
        recipe.tools.includes(itemName)
    );
}

function findInMarketplace(name) {
    return combinedData.marketplace?.items.find(item =>
        item.name.toLowerCase() === name.toLowerCase());
}

function findWikiInfo(name) {
    // First try to find in items array
    const itemInfo = combinedData.wiki.items?.find(item =>
        item.name.toLowerCase() === name.toLowerCase()
    );

    // Return the item info if found
    if (itemInfo) {
        return itemInfo;
    }

    // If not found in items, try sources
    return combinedData.wiki.sources?.find(source =>
        source.name.toLowerCase() === name.toLowerCase());
}

function findSource(name) {
    if (!name || !combinedData.sources) return null;
    return combinedData.sources.find(source =>
        source.name.toLowerCase() === name.toLowerCase());
}

function findItemsByCategory(category) {
    if (!category) return [];

    const searchTerm = category.toLowerCase();

    if (searchTerm === 'items') {
        return combinedData.items;
    }

    return combinedData.items.filter(item =>
        item.rarity.toLowerCase() === searchTerm ||
        item.type.toLowerCase() === searchTerm
    );
}

function findItemsByType(type) {
    return combinedData.items.filter(item =>
        item.type.toLowerCase() === type.toLowerCase());
}

function generateSourcesHTML(item) {
    if (!item.sources || item.sources.length === 0) return '';

    return `
        <div class="source-details">
            <h3>Sources</h3>
            <ul>
                ${item.sources.map(source => `<li>${source}</li>`).join('')}
            </ul>
        </div>
    `;
}

function generateRecipeHTML(recipe) {
    if (!recipe) return '';

    return `
        <div class="recipe">
            <p><strong>Ingredients:</strong></p>
            <ul>
                ${recipe.ingredients.map(ing =>
        `<li><a href="?q=${ing}">${ing}</a></li>`
    ).join('')}
            </ul>
            ${recipe.tools.length > 0 ? `
                <p><strong>Tools:</strong></p>
                <ul>
                    ${recipe.tools.map(tool =>
        `<li><a href="?q=${tool}">${tool}</a></li>`
    ).join('')}
                </ul>
            ` : ''}
        </div>
    `;
}

function generateMarketplaceHTML(marketInfo) {
    if (!marketInfo) return '';

    return `
        <div class="marketplace-info">
            <h3>Marketplace Information</h3>
            <p>Listed Price: ${marketInfo.cost} MP</p>
            ${marketInfo.seller ? `<p>Seller: ${marketInfo.seller}</p>` : ''}
        </div>
    `;
}

function generateWikiHTML(wikiInfo) {
    if (!wikiInfo) return '';

    return `
        <div class="wiki-info">
            <h3>Additional Information</h3>
            ${wikiInfo.description ? `<p>${wikiInfo.description}</p>` : ''}
            ${wikiInfo.notes ? `<p class="notes">${wikiInfo.notes}</p>` : ''}
        </div>
    `;
}

// Add theme management
const themes = ['theme-light', 'theme-dark', 'theme-fire', 'theme-water', 'theme-air', 'theme-earth'];
let currentThemeIndex = 0;

function cycleTheme() {
    document.body.classList.remove(themes[currentThemeIndex]);
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    document.body.classList.add(themes[currentThemeIndex]);
    localStorage.setItem('selectedTheme', themes[currentThemeIndex]);

    // Update select value
    document.getElementById('themeSelect').value = themes[currentThemeIndex];
}

function setTheme(themeName) {
    themes.forEach(theme => document.body.classList.remove(theme));
    document.body.classList.add(themeName);
    currentThemeIndex = themes.indexOf(themeName);
    localStorage.setItem('selectedTheme', themeName);
}

// Load saved theme or default
const savedTheme = localStorage.getItem('selectedTheme') || 'theme-light';
document.body.classList.add(savedTheme);
currentThemeIndex = themes.indexOf(savedTheme);

function generateInfobox(item, recipe) {
    const rarityClass = item.rarity.toLowerCase();
    return `
        <div class="infobox ${rarityClass}">
            <div class="infobox-title">${item.name}</div>
            <img src="images/${item.type.toLowerCase()}/${item.name.replace(/ /g, '_')}.webp" 
                 alt="${item.name}" 
                 title="${item.name}" />
            
            <div class="infobox-rows">
                ${generateInfoboxRow('ID', item.id)}
                ${generateInfoboxRow('Rarity', item.rarity)}
                ${generateInfoboxRow('Type', item.type)}
                ${generateInfoboxRow('Description', item.description)}
                ${generateInfoboxRow('Value', `${item.value || 0} MP`)}
                ${generateInfoboxRow('Drops', item.sources && item.sources.length > 0 ? 'Yes' : 'No')}
                ${generateInfoboxRow('Craftable', recipe ? 'Yes' : 'No')}
            </div>
        </div>
    `;
}

function generateInfoboxRow(label, value) {
    return `
        <div class="infobox-row">
            <div class="infobox-label">${label}</div>
            <div class="infobox-value">${value}</div>
        </div>
    `;
}

function generateCardFromName(name, showRarity = false) {
    const item = findItem(name);
    if (!item) return generateCard(name, 'sources');

    const folder = item.type.toLowerCase();
    const rarity = formatText(item.rarity);
    const rarityClass = rarity.toLowerCase();

    let imagePath = item.name.replace(/ /g, '_').replace(/#/g, '-').replace(/\?/g, '-');

    // Add data attributes for sorting
    const cardAttrs = `
        data-name="${item.name}"
        data-id="${item.id || 0}"
        data-rarity="${item.rarity || 'UNKNOWN'}"
        data-type="${item.type || ''}"
        data-value="${item.value || 0}"
    `;

    return `
        <div class="card ${rarityClass}" ${cardAttrs}>
            <div class="card-title">
                <a href="?q=${name}">${name}</a>
            </div>
            <div class="card-image">
                <a href="?q=${name}">
                    <img src="images/${folder}/${imagePath}.webp"
                         alt="${name}" 
                         title="${name}" />
                </a>
            </div>
            ${showRarity ? `<div class="card-rarity">${rarity}</div>` : ''}
        </div>
    `;
}

function generateCard(name, folder = 'sources') {
    let imagePath = name.replace(/ /g, '_').replace(/#/g, '-').replace(/\?/g, '-');
    let linkName = name.replace(/#/g, '%23');


    return `
        <div class="card">
            <div class="card-title">
                <a href="?q=${linkName}">${name}</a>
            </div>
            <div class="card-image">
                <a href="?q=${linkName}">
                    <img src="images/${folder}/${imagePath}.webp"
                         alt="${name}" 
                         title="${name}" />
                </a>
            </div>
        </div>
    `;
}

function generateFilterControls() {
    return `
        <div class="filter-controls">
            <input type="text" id="item-search" placeholder="Search items..." class="search-input">
            <select id="sort-by" class="sort-select">
                ${config.sortingMethods.map(method =>
        `<option value="${method.name}">${method.name}</option>`
    ).join('\n')}
            </select>
        </div>
    `;
}

function initializeFilters() {
    const searchInput = document.getElementById('item-search');
    const sortSelect = document.getElementById('sort-by');
    const container = document.getElementById('filtered-items');

    if (!searchInput || !sortSelect || !container) return;

    searchInput.addEventListener('input', updateFilters);
    sortSelect.addEventListener('change', updateFilters);
}

function updateFilters() {
    const searchValue = document.getElementById('item-search').value.toLowerCase();
    const sortValue = document.getElementById('sort-by').value;
    const container = document.getElementById('filtered-items');

    let cards = Array.from(container.children);

    // Show all cards first
    cards.forEach(card => card.style.display = '');

    // Filter
    cards = cards.filter(card => {
        const name = card.querySelector('.card-title a').textContent.toLowerCase();
        const shouldShow = name.includes(searchValue);
        if (!shouldShow) {
            card.style.display = 'none';
        }
        return shouldShow;
    });

    // Sort
    const sortMethod = config.sortingMethods.find(method => method.name === sortValue);
    if (sortMethod) {
        cards.sort((a, b) => sortMethod.method.call(config, a, b));

        // Remove all cards
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        // Add them back in sorted order
        cards.forEach(card => container.appendChild(card));
    }
}

function showErrorMessage(message = "An error occurred") {
    updatePageTitle('Error');
    const wikiContent = document.getElementById('wiki-content');
    wikiContent.innerHTML = `
        <div class="not-found">
            <h2>Error</h2>
            <p>${message}</p>
            <p><a href="index.html">Return to item list</a></p>
        </div>
    `;
}

// Load data and handle loading/errors
config.loadAllData((data) => {
    combinedData = data;
    displayWikiPage(searchQuery);
}).catch(error => {
    console.error("Error loading data:", error);
    showErrorMessage("Failed to load required data");
});

// Wait for both DOM and data before initializing
async function initWiki() {
    try {
        // Load data first
        combinedData = await config.loadAllData();

        // Now that we have data, we can safely display the page
        displayWikiPage(searchQuery);
    } catch (error) {
        console.error("Error loading data:", error);
        showErrorMessage("Failed to load required data");
    }
}

// Remove old loadAllData and config.loadAllData calls
document.addEventListener('DOMContentLoaded', initWiki);

// Add welcome page styles
const welcomeStyles = document.createElement('style');
welcomeStyles.textContent = `
    .welcome-content {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    }

    .wiki-stats {
        margin: 2rem 0;
        padding: 1rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--card-fade);
    }

    .wiki-stats ul {
        list-style: none;
        padding: 0;
        display: flex;
        justify-content: space-around;
        gap: 2rem;
    }

    .category-links {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 2rem;
        margin: 1rem 0;
    }

    .category-links ul {
        list-style: none;
        padding: 0;
    }

    .category-links li {
        margin: 0.5rem 0;
    }
`;
document.head.appendChild(welcomeStyles);

// ...rest of existing code...
