let wikiPages = {};


// season order
// 3.1	Year-Long Recipes
// 3.2	Seasonal Recipes
// 3.2.1	Summer
// 3.2.2	Spring
// 3.3	Holiday Recipes
// 3.3.1	Lunar New Year
// 3.3.2	Valentines
// 3.3.3	St. Patrick's
// 3.3.4	Easter
// 3.3.5	Halloween
// 3.3.6	Christmas
// 3.3.7	New Years 2024
// 3.4	Partnership Recipes
// 3.4.1	Alien Food
// 3.4.2	C Engineer
// 3.4.3	Framed
// 3.4.4	Josh Isn't Gaming
// 3.4.5	Settled
// 3.4.6	SoupRS
// 3.5	Competitions
// 3.5.1	Jake Lucky / Starforge


// Year long recipes have an empty type
// Seasonal recipes have a type like             "type": "Seasonal (Summer)"
// Holiday recipes have a type like              "type": "Seasonal (Halloween)"
// Partnership recipes have a type like          "type": "Partnership (Alien Food)"
// Competition recipes have a type like          "type": "Competition (Jake Lucky / Starforge)"

const recipeOrder = {
    'Year-Long Recipes': 0,
    'Seasonal Recipes': 1,
    'Holiday Recipes': 2,
    'Partnership Recipes': 3,
    'Competition Recipes': 4,
};

const seasonOrder = {
    'Summer': 1,
    'Autumn': 2,
    'Winter': 3,
    'Spring': 4,
}

const holidayOrder = {
    'Lunar New Year': 10,
    'Valentines': 20,
    'St. Patrick\'s': 30,
    'Easter': 40,
    'Halloween': 50,
    'Christmas': 60,
    'New Years': 70,
};




// Initialize pages after data is loaded
window.addEventListener('loadData', () => {
    wikiPages = {
        'quests': {
            title: 'Quests',
            description: 'Complete quests to earn rewards and unlock new content.',
            render: () => {
                const questsData = window.combinedData?.quests || [];
                return `
                    <h1>Quests</h1>
                    <div class="page-content">
                        <p>Quests are special tasks that can be completed to earn rewards. Each quest may require specific items, 
                           and can reward you with items, recipes, currency, or even unlock new quests.</p>

                        <h2>Quest Types</h2>
                        <h3>One-Time</h3>
                        <p>One-time quests can only be completed once. They often unlock new content or provide valuable rewards.</p>
                        <h3>Recurring</h3>
                        <p>Recurring quests can be completed multiple times, but have a cooldown period between completions.</p>

                        <h2>Quest Categories</h2>
                        <h3>Fetch Quests</h3>
                        <p>Fetch quests require you to gather a series of items. These items will be removed upon completion of the Quest.</p>
                        <h3>Collect Quests</h3>
                        <p>Collect quests require you to gather a series of items. These items will not be removed from your inventory upon completion of the Quest.</p>                

                        <h2>Reward Types</h2>
                        <div class="quest-rewards-overview card-container">
                            ${generateSpecificCard('New Quest', 'quest/Quest.webp', 'Quest')}
                            ${generateSpecificCard('Recipe', 'quest/recipe_sheet.webp', 'Recipe')}
                            ${generateSpecificCard('Small MP', 'quest/MP_Small.webp', 'MP_Small')}
                            ${generateSpecificCard('Medium MP', 'quest/MP_Medium.webp', 'MP_Medium')}
                            ${generateSpecificCard('Large MP', 'quest/MP_Large.webp', 'MP_Large')}
                            ${generateSpecificCard('Item Reward', 'quest/Question_Mark.webp', 'Item Reward')}
                        </div>

                        <h2>Available Quests</h2>
                        <div class="card-container" id="filtered-items">
                            ${questsData.map(quest => `
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
                    </div>
                `;
            }
        },
        'crafting': {
            title: 'Crafting',
            description: 'Learn about the crafting system and available recipes.',
            render: () => {
                const recipes = window.combinedData?.recipes || [];
                return `
                    <h1>Crafting</h1>
                    <div class="page-content">
                        <h2>Crafting Basics</h2>
                        <p>Crafting recipes require up to 3 <a href="?q=Material">Materials</a>, and sometimes require the use of up  to 3 <a href="?q=Tool">Tools</a>. When a crafting recipe requires a Tool, the Tool is not destroyed in the process.</p>
                        
                        <p>Crafting a recipe you do not have in your Recipe Book has a chance to fail, however if you own the recipe it will be successful every time.</p>
                        
                        <p>When crafting a recipe successfully without owning it, it will be added to your recipe book for free.</p>

                        <h2>Failure</h2>
                        <p>When you fail to craft something you will create a Junk Item, and one of two messages can appear:</p>

                        <h3>Bummer!</h3>
                        <p>You combined several ingredients that do not make up any recipe.</p>

                        <h3>Close!</h3>
                        <p>You combined several ingredients that do make up a recipe, but did not succeed in crafting.</p>

                        <h2>Junk Items</h2>
                        <p>Failing to craft an item or combining random items will result in receiving a one of the following Junk Items:
                        <div class="card-container center">
                            ${generateCardFromName('Crumpled Metal')}
                            ${generateCardFromName('Empty Bottle')}
                            ${generateCardFromName('Stardust')}
                        </div>
                    </div>
                `;
            }
        },
        'recipes': {
            title: 'Recipes',
            description: 'View all available crafting recipes.',
            render: () => {
                const recipes = window.combinedData?.recipes || [];
                return `
                    <h1>Recipes</h1>
                    <div class="page-content">
                        <p>Recipes are used to craft items using materials and tools. Each recipe requires specific materials and tools to craft, and may have a chance to fail if you do not own the recipe.</p>
                        <p>Below is a list of all available recipes:</p>
                        <div class="recipe-list">
                            ${generateRecipeList(recipes)}
                        </div>
                    </div>
                `;
            }
        },
    };
});

function generateRecipeList(recipes) {
    // Split recipes into their major categories
    const yearLong = [];
    const seasonal = {};
    const holiday = {};
    const partnership = {};
    const competition = {};
    
    for (const recipe of recipes) {
        const type = recipe.type || '';
        if (!type) {
            yearLong.push(recipe);
            continue;
        }

        const match = type.match(/^([^(]+)\s*(?:\(([^)]+)\))?$/);
        if (!match) continue;

        const [_, group, subGroup] = match;
        const trimmedGroup = group.trim();
        const trimmedSubGroup = subGroup ? subGroup.trim() : '';

        switch(trimmedGroup) {
            case 'Seasonal':
                if (!seasonal[trimmedSubGroup]) seasonal[trimmedSubGroup] = [];
                seasonal[trimmedSubGroup].push(recipe);
                break;
            case 'Holiday':
                if (!holiday[trimmedSubGroup]) holiday[trimmedSubGroup] = [];
                holiday[trimmedSubGroup].push(recipe);
                break;
            case 'Partnership':
                if (!partnership[trimmedSubGroup]) partnership[trimmedSubGroup] = [];
                partnership[trimmedSubGroup].push(recipe);
                break;
            case 'Competition':
                if (!competition[trimmedSubGroup]) competition[trimmedSubGroup] = [];
                competition[trimmedSubGroup].push(recipe);
                break;
        }
    }

    let html = '';

    // Year-Long Recipes
    if (yearLong.length > 0) {
        html += generateRecipePageSection('Year-Long Recipes', null, yearLong);
    }

    // Seasonal Recipes
    if (Object.keys(seasonal).length > 0) {
        html += '<h2>Seasonal Recipes</h2>';
        const sortedSeasons = Object.keys(seasonal).sort((a, b) => 
            (seasonOrder[a] || 999) - (seasonOrder[b] || 999)
        );
        for (const season of sortedSeasons) {
            html += generateRecipePageSection(null, season, seasonal[season]);
        }
    }

    // Holiday Recipes
    if (Object.keys(holiday).length > 0) {
        html += '<h2>Holiday Recipes</h2>';
        const sortedHolidays = Object.keys(holiday).sort((a, b) => 
            (holidayOrder[a] || 999) - (holidayOrder[b] || 999)
        );
        for (const holidayName of sortedHolidays) {
            html += generateRecipePageSection(null, holidayName, holiday[holidayName]);
        }
    }

    // Partnership Recipes
    if (Object.keys(partnership).length > 0) {
        html += '<h2>Partnership Recipes</h2>';
        const sortedPartnerships = Object.keys(partnership).sort();
        for (const partnerName of sortedPartnerships) {
            html += generateRecipePageSection(null, partnerName, partnership[partnerName]);
        }
    }

    // Competition Recipes
    if (Object.keys(competition).length > 0) {
        html += '<h2>Competition Recipes</h2>';
        const sortedCompetitions = Object.keys(competition).sort();
        for (const competitionName of sortedCompetitions) {
            html += generateRecipePageSection(null, competitionName, competition[competitionName]);
        }
    }

    return html;
}

function generateRecipePageSection(mainTitle, subTitle, recipes) {
    let html = '';
    if (mainTitle) {
        html += `<h2>${mainTitle}</h2>`;
    }
    if (subTitle) {
        html += `<h3>${subTitle}</h3>`;
    }
    
    html += `
        <table class="recipe-table">
            <thead>
                <tr>
                    <th>Result</th>
                    <th>Ingredients</th>
                    <th>Tools</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    const sortedRecipes = [...recipes].sort((a, b) => a.result.localeCompare(b.result));
    for (const recipe of sortedRecipes) {
        html += `
            <tr>
                <td>
                    <div class="card-container">
                        ${generateCardFromName(recipe.result)}
                    </div>
                </td>
                <td>
                    <div class="card-container">
                        ${recipe.ingredients.map(ing => generateCardFromName(ing)).join('\n')}
                    </div>
                </td>
                <td>
                    <div class="card-container">
                        ${recipe.tools.length > 0 
                            ? recipe.tools.map(tool => generateCardFromName(tool)).join('\n')
                            : ''
                        }
                    </div>
                </td>
            </tr>
        `;
    }
    
    html += '</tbody></table>';
    return html;
}

function findPage(name) {
    return wikiPages[name?.toLowerCase()];
}


function generateSpecificCard(text, image, alt) {
    return `
        <div class="card">
            <div class="card-title">${text}</div>
            <div class="card-image">
                <img src="images/${image}" alt="${alt}" />
            </div>
        </div>
    `;
}
