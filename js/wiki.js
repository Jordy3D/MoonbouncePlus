/*
█▀▀ █▀█ █▄ █ █▀ ▀█▀ ▄▀█ █▄ █ ▀█▀ █▀ 
█▄▄ █▄█ █ ▀█ ▄█  █  █▀█ █ ▀█  █  ▄█ 
*/

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
        check: (name) => combinedData?.items && ['Items', 'Material', 'Tool', 'Accessory', 'Character', 'Quests'].includes(name),
        display: displayCollectionPage
    },
    {
        type: 'quest',
        check: (name) => combinedData?.quests && findQuest(name),
        display: (name) => {
            const quest = findQuest(name);
            if (quest) displayQuestPage(quest);
            else showErrorMessage(`Quest "${name}" not found`);
        }
    },
    {
        type: 'info',
        check: (name) => findPage(name),
        display: (name) => {
            const page = findPage(name);
            if (page) displayInfoPage(page);
            else showErrorMessage(`Page "${name}" not found`);
        }
    }
];

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

// Update category handlers with better error checking
const categoryHandlers = {
    'Loot Source': () => {
        if (!combinedData?.sources) return [];
        return combinedData.sources.map(source => ({
            type: 'source',
            name: source.name
        }));
    },
    'Quest': () => {
        if (!combinedData?.quests) return [];
        return combinedData.quests.map(quest => ({
            type: 'quest',
            name: quest.quest_name
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

        // Add promotional quests
        if (combinedData?.quests) {
            const promoQuests = combinedData.quests.filter(quest => {
                const wikiInfo = findWikiInfo(quest.quest_name);
                return wikiInfo?.promo === true;
            }).map(quest => ({
                type: 'quest',
                name: quest.quest_name
            }));
            items.push(...promoQuests);
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

const themes = ['theme-light', 'theme-dark', 'theme-fire', 'theme-water', 'theme-air', 'theme-earth'];

/*
█ █▄ █ █ ▀█▀ 
█ █ ▀█ █  █  
*/

let combinedData = {};
let currentThemeIndex = 0;

// Load saved theme or default
const savedTheme = localStorage.getItem('selectedTheme') || 'theme-light';
document.body.classList.add(savedTheme);
currentThemeIndex = themes.indexOf(savedTheme);


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

// Consolidated data loading function
async function initializeWiki() {
    try {
        // Only load data if we haven't already
        if (!combinedData?.items) {
            const [mainData, marketplaceData, wikiData, sourcesData, questsData] = await Promise.all([
                fetchData('main'),
                fetchData('marketplace'),
                fetchData('wiki'),
                fetchData('sources'),
                fetchData('quests')
            ]);

            combinedData = {
                items: mainData.items,
                recipes: mainData.recipes,
                marketplace: marketplaceData.marketplace,
                wiki: wikiData,
                sources: sourcesData.sources,
                quests: questsData
            };

            window.combinedData = combinedData;
            window.dispatchEvent(new Event('loadData'));
        }

        displayWikiPage(searchQuery);
    } catch (error) {
        console.error("Error loading data:", error);
        showErrorMessage("Failed to load required data");
    }
}

/*
█▀▀ █ █ █▀▀ █▄ █ ▀█▀ █▀ 
██▄ ▀▄▀ ██▄ █ ▀█  █  ▄█ 
*/


// Add this after combinedData declaration
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('selectedTheme') || 'theme-light';
    setTheme(savedTheme);
    document.querySelector('.theme-selector select').value = savedTheme;
});

// Remove other loadAllData calls and replace with single initialization
document.addEventListener('DOMContentLoaded', initializeWiki);

/*
█ █ █▀▀ █   █▀█ █▀▀ █▀█ 
█▀█ ██▄ █▄▄ █▀▀ ██▄ █▀▄ 
*/

function findPage(name) {
    return wikiPages[name?.toLowerCase()];
}

function updatePageTitle(title) {
    document.title = `${title} | MB+ Wiki`;
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

function getRewardSize(amount) {
    if (amount >= 5000) return 'Large';
    if (amount >= 2000) return 'Medium';
    return 'Small';
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

/*
█▀█ ▄▀█ █▀▀ █▀▀ █▀ 
█▀▀ █▀█ █▄█ ██▄ ▄█ 
*/

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
        recipes: combinedData?.recipes?.length || 0,
        quests: combinedData?.quests?.length || 0  // Add this line
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
                        <li><a href="?q=quests">${stats.quests} Quests</a></li>
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

function displayItemPage(item) {
    updatePageTitle(item.name);
    // Format item properties
    item.rarity = config.formatText(item.rarity);
    item.type = config.formatText(item.type);

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
        ${sections.usedIn ? generateUsedInSection(usedInRecipes, item.name) : ''}
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

function displayCollectionPage(collectionName) {
    updatePageTitle(`${collectionName} Collection`);
    const items = collectionName === 'Quest' 
        ? (combinedData?.quests || []).map(quest => ({
            type: 'quest',
            name: quest.quest_name,
            questType: quest.quest_quest_type,
            instanceType: quest.quest_instance_type
        }))
        : findItemsByType(collectionName);
    
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

function displayQuestPage(quest) {
    updatePageTitle(quest.quest_name);
    const wikiContent = document.getElementById('wiki-content');
    const wikiInfo = findWikiInfo(quest.quest_name);

    // Create array of quest categories
    const questCategories = ['Quest'];
    if (wikiInfo?.promo)
        questCategories.push('Promotional');

    if (wikiInfo?.categories)
        questCategories.push(...wikiInfo.categories);

    wikiContent.innerHTML = `
        <h1>${quest.quest_name}</h1>
        <div class="quest-page">
            ${generateQuestInfobox(quest)}
            ${generateQuestIntroduction(quest)}
            ${generateQuestDescription(quest)}
            ${quest.prerequisites?.length ? generateQuestPrerequisites(quest) : ''}
            ${generateQuestRequirements(quest)}
            ${generateQuestRewards(quest)}
            ${generateTriviaSection(wikiInfo)}
            ${generateCategories(questCategories)}
        </div>
    `;
}

function displayInfoPage(page) {
    updatePageTitle(page.title);
    const wikiContent = document.getElementById('wiki-content');
    wikiContent.innerHTML = page.render();
    initializeFilters();
}

/*
█▀▀ █▀▀ █▄ █ █▀▀ █▀█ ▄▀█ ▀█▀ █▀█ █▀█ █▀ 
█▄█ ██▄ █ ▀█ ██▄ █▀▄ █▀█  █  █▄█ █▀▄ ▄█ 
*/

function generateCategoryDescription(category) {
    const descriptions = {
        'Loot Source': 'All sources that drop items in Moonbounce.',
        'Quest': 'All available Quests.',
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
                        <a href="?q=${encodeURIComponent(linkName)}">${item.name}</a>
                    </div>
                    <div class="card-image">
                        <a href="?q=${encodeURIComponent(linkName)}">
                            <img src="images/sources/${imagePath}.webp" alt="${item.name}" />
                        </a>
                    </div>
                </div>
            `;
        case 'quest':
            return `
                <div class="card quest" data-name="${item.name}">
                    <div class="card-title">
                        <a href="?q=${encodeURIComponent(item.name)}">${item.name}</a>
                    </div>
                    <div class="card-image">
                        <a href="?q=${encodeURIComponent(item.name)}">
                            <img src="images/quest/Quest.webp" alt="${item.name}" />
                        </a>
                    </div>
                </div>
            `;
        default:
            return generateCardFromName(item.name);
    }
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
    const sources = item.sources || [];
    const questRewards = findQuestsRewardingItem(item.name);
    
    if (!sources.length && !questRewards.length) {
        return `
            <div class="found-in-section">
                <h2>Found In</h2>
                <p>This item cannot be found naturally.</p>
            </div>
        `;
    }

    return `
        <div class="found-in-section">
            <h2>Found In</h2>
            ${sources.length > 0 ? `
                <h3>Sources</h3>
                <div class="card-container left-align">
                    ${sources.map(source => generateCard(source)).join('\n')}
                </div>
            ` : ''}
            ${questRewards.length > 0 ? `
                <h3>Quest Rewards</h3>
                <div class="card-container left-align">
                    ${questRewards.map(quest => `
                        <div class="card quest">
                            <div class="card-title">
                                <a href="?q=${encodeURIComponent(quest.quest_name)}">${quest.quest_name}</a>
                            </div>
                            <div class="card-image">
                                <a href="?q=${encodeURIComponent(quest.quest_name)}">
                                    <img src="images/quest/Quest.webp" alt="${quest.quest_name}" />
                                </a>
                            </div>
                        </div>
                    `).join('\n')}
                </div>
            ` : ''}
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

function generateUsedInSection(recipes, itemName) {
    const usedInRecipes = recipes || [];
    const usedInQuests = findQuestsRequiringItem(itemName);

    if (!usedInRecipes.length && !usedInQuests.length) {
        return '<div class="used-in-section"><h2>Used In</h2><p>This item is not used in any recipes or quests.</p></div>';
    }

    return `
        <div class="used-in-section">
            <h2>Used In</h2>
            ${usedInRecipes.length > 0 ? generateRecipeGroup('Recipes', usedInRecipes) : ''}
            ${usedInQuests.length > 0 ? `
                <h3>Quests</h3>
                <div class="card-container left-align">
                    ${usedInQuests.map(quest => `
                        <div class="card quest">
                            <div class="card-title">
                                <a href="?q=${encodeURIComponent(quest.quest_name)}">${quest.quest_name}</a>
                            </div>
                            <div class="card-image">
                                <a href="?q=${encodeURIComponent(quest.quest_name)}">
                                    <img src="images/quest/Quest.webp" alt="${quest.quest_name}" />
                                </a>
                            </div>
                        </div>
                    `).join('\n')}
                </div>
            ` : ''}
        </div>
    `;
}

function generateRecipeGroup(title, recipes) {
    if (!recipes || recipes.length === 0) return '';

    return `
        <h3>${title}</h3>
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
    const rarity = config.formatText(item.rarity);
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

function generateQuestInfobox(quest) {
    let imagePath = quest.quest_name.replace(/ /g, '_').replace(/#/g, '-').replace(/\?/g, '-');
    
    return `
        <div class="infobox">
            <div class="infobox-title">${quest.quest_name}</div>
            <img src="images/quest/Quest.webp"
                 alt="${quest.quest_name}" 
                 title="${quest.quest_name}" 
                 onerror="this.src='images/quest/Quest.webp'"/>
            
            <div class="infobox-rows">
                ${generateInfoboxRow('Type', quest.quest_quest_type)}
                ${generateInfoboxRow('Instance', quest.quest_instance_type)}
                ${generateInfoboxRow('Recurring', quest.recurring ? 'Yes' : 'No')}
                ${generateInfoboxRow('Items Required', quest.required_items?.length || 0)}
                ${generateInfoboxRow('Rewards', quest.rewards?.length || 0)}
            </div>
        </div>
    `;
}

function generateQuestIntroduction(quest) {
    // The [quest] is a [instance] [quest type] Quest in Moonbounce.

    return `
        <div class="introduction-section">
            <p>
                The <strong>${quest.quest_name}</strong> is a 
                ${quest.quest_instance_type} ${quest.quest_quest_type} <a href="?q=quests">Quest</a> in Moonbounce.
            </p>
        </div>
    `;
}

function generateQuestDescription(quest) {
    // First replace URLs in brackets [https://... Text]
    const processedDesc = quest.quest_description.replace(
        /\[(https?:\/\/[^\s\]]+)(?:\s+([^\]]+))?\]/g, 
        (match, url, text) => `<a class="external-link" href="${url}" target="_blank" rel="noopener noreferrer">${text || url}</a>`
    );

    // Then replace bare URLs that aren't already in links
    const finalDesc = processedDesc.replace(
        /(?<!["'])(https?:\/\/[^\s<]+)/g,
        '<a class="external-link" href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    return `
        <div class="description-section">
            <h2>Description</h2>
            <p>${finalDesc}</p>
        </div>
    `;
}

function generateQuestRequirements(quest) {
    if (!quest.required_items?.length) return '';

    return `
        <div class="quest-requirements">
            <h2>Requirements</h2>
            <div class="card-container">
                ${quest.required_items.map(item => `
                    <div class="quest-requirement">
                        ${generateCardFromName(item.item_name)}
                        <div class="requirement-quantity">×${item.quantity}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function generateQuestRewards(quest) {
    if (!quest.rewards?.length) return '';

    return `
        <div class="quest-rewards">
            <h2>Rewards</h2>
            <div class="card-container">
                ${quest.rewards.map(reward => generateQuestReward(reward)).join('')}
            </div>
        </div>
    `;
}

function generateQuestReward(reward) {
    switch (reward.reward_type) {
        case 'item':
            return `
                <div class="quest-reward">
                    ${generateCardFromName(reward.item_name)}
                    ${reward.quantity > 1 ? `<div class="reward-quantity">×${reward.quantity}</div>` : ''}
                </div>
            `;
        case 'currency':
            return `
                <div class="quest-reward">
                    <div class="card">
                        <div class="card-title">MP Reward</div>
                        <div class="card-image">
                            <img src="images/quest/MP_${getRewardSize(reward.quantity)}.webp" 
                                 alt="${reward.quantity} MP" />
                        </div>
                        <div class="reward-quantity">${reward.quantity} MP</div>
                    </div>
                </div>
            `;
        case 'recipe':
            return `
                <div class="quest-reward">
                    ${generateRecipeItemCard(reward.recipe_name)}
                </div>
            `;
        case 'quest':
            return `
                <div class="quest-reward">
                    <div class="card">
                        <div class="card-title">New Quest</div>
                        <div class="card-image">
                            <img src="images/quest/Quest.webp" alt="New Quest" />
                        </div>
                    </div>
                </div>
            `;
        default:
            return '';
    }
}

function generateQuestPrerequisites(quest) {
    if (!quest.prerequisites?.length) return '';

    const prereqQuests = quest.prerequisites
        .map(prereqId => combinedData.quests.find(q => q.quest_id === prereqId))
        .filter(q => q); // Remove any undefined quests

    if (!prereqQuests.length) return '';

    return `
        <div class="quest-prerequisites">
            <h2>Prerequisites</h2>
            <div class="card-container">
                ${prereqQuests.map(prereq => `
                    <div class="card quest">
                        <div class="card-title">
                            <a href="?q=${encodeURIComponent(prereq.quest_name)}">${prereq.quest_name}</a>
                        </div>
                        <div class="card-image">
                            <a href="?q=${encodeURIComponent(prereq.quest_name)}">
                                <img src="images/quest/Quest.webp" 
                                     alt="${prereq.quest_name}"
                                     onerror="this.src='images/quest/Quest.webp'" />
                            </a>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function generateRecipeItemCard(recipeName) {
    const item = findItem(recipeName);
    if (!item) return '';

    return `
        <div class="recipe-card card">
            <div class="card-title">
                <a href="?q=${encodeURIComponent(recipeName)}">${recipeName} Recipe</a>
            </div>
            <div class="card-image recipe-stack">
                <img src="images/quest/recipe_sheet.webp" alt="Recipe" class="recipe-background" />
                <img src="images/${item.type.toLowerCase()}/${item.name.replace(/ /g, '_')}.webp" 
                     alt="${item.name}" 
                     class="recipe-item" />
            </div>
        </div>
    `;
}

/*
▀█▀ █ █ █▀▀ █▀▄▀█ █▀▀ █▀ 
 █  █▀█ ██▄ █ ▀ █ ██▄ ▄█ 
*/

// Add theme management

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

/*
█▀▀ █ █   ▀█▀ █▀▀ █▀█ █▀ 
█▀  █ █▄▄  █  ██▄ █▀▄ ▄█ 
*/

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

/*
█▀▀ █ █▄ █ █▀▄ █▀▀ █▀█ █▀ 
█▀  █ █ ▀█ █▄▀ ██▄ █▀▄ ▄█ 
*/

function findQuestsRewardingItem(itemName) {
    if (!itemName || !combinedData?.quests) return [];
    
    return combinedData.quests.filter(quest => 
        quest.rewards?.some(reward => 
            reward.reward_type === 'item' && 
            reward.item_name?.toLowerCase() === itemName.toLowerCase()
        )
    );
}

function findQuestsRequiringItem(itemName) {
    if (!itemName || !combinedData?.quests) return [];
    
    return combinedData.quests.filter(quest =>
        quest.required_items?.some(requirement =>
            requirement.item_name?.toLowerCase() === itemName.toLowerCase()
        )
    );
}

function findQuest(name) {
    return combinedData.quests?.find(quest => 
        quest.quest_name.toLowerCase() === name.toLowerCase());
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
    if (itemInfo) return itemInfo;

    // Then try sources
    const sourceInfo = combinedData.wiki.sources?.find(source =>
        source.name.toLowerCase() === name.toLowerCase()
    );
    if (sourceInfo) return sourceInfo;

    // Finally try quests
    return combinedData.wiki.quests?.find(quest =>
        quest.name?.toLowerCase() === name.toLowerCase()
    );
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