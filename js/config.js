// Define config globally to ensure it works in all environments
window.config = {
    urls: {
        main: "https://raw.githubusercontent.com/Jordy3D/MoonbouncePlus/main/data/MoonbouncePlus.json",
        marketplace: "https://raw.githubusercontent.com/Jordy3D/MoonbouncePlus/main/data/marketplace.json",
        wiki: "https://raw.githubusercontent.com/Jordy3D/MoonbouncePlus/main/data/wiki_data.json",
        sources: "https://raw.githubusercontent.com/Jordy3D/MoonbouncePlus/main/data/sources.json",
        quests: "https://raw.githubusercontent.com/Jordy3D/MoonbouncePlus/main/data/quests.json",  // Add this line
    },
    localUrls: {
        main: "data/MoonbouncePlus.json",
        marketplace: "data/marketplace.json",
        wiki: "data/wiki_data.json",
        sources: "data/sources.json",
        quests: "data/quests.json",  // Add this line
    },

    rarityOrder: {
        'COMMON': 0,
        'UNCOMMON': 1,
        'RARE': 2,
        'LEGENDARY': 3,
        'MYTHIC': 4,
        'UNKNOWN': 999
    },

    sortFunctions: {
        sortId: (a, b) => {
            return Number(a?.getAttribute("data-id") || 0) - Number(b?.getAttribute("data-id") || 0);
        },
        sortName: (a, b) => {
            const nameA = a?.getAttribute("data-name") || '';
            const nameB = b?.getAttribute("data-name") || '';
            return nameA.localeCompare(nameB);
        },
        sortRarity: (a, b) => {
            const rarityA = a?.getAttribute("data-rarity")?.toUpperCase() || 'UNKNOWN';
            const rarityB = b?.getAttribute("data-rarity")?.toUpperCase() || 'UNKNOWN';
            return (config.rarityOrder[rarityA] || 999) - (config.rarityOrder[rarityB] || 999);
        },
        sortType: (a, b) => {
            const typeA = a?.getAttribute("data-type") || '';
            const typeB = b?.getAttribute("data-type") || '';
            return typeA.localeCompare(typeB);
        },
        sortValue: (a, b) => {
            return Number(a?.getAttribute("data-value") || 0) - Number(b?.getAttribute("data-value") || 0);
        }
    },

    sortingMethods: [
        { name: "ID", method: function(a, b) { return this.sortFunctions.sortId(a, b); }},
        { name: "Name (A > Z)", method: function(a, b) { return this.sortFunctions.sortName(a, b); }},
        { name: "Name (Z > A)", method: function(a, b) { return this.sortFunctions.sortName(b, a); }},
        { name: "Rarity (Common > Mythic)", method: function(a, b) { return this.sortFunctions.sortRarity(a, b); }},
        { name: "Rarity (Mythic > Common)", method: function(a, b) { return this.sortFunctions.sortRarity(b, a); }},
        { name: "Type", method: function(a, b) { return this.sortFunctions.sortType(a, b); }},
        { name: "Value (Low > High)", method: function(a, b) { return this.sortFunctions.sortValue(a, b); }},
        { name: "Value (High > Low)", method: function(a, b) { return this.sortFunctions.sortValue(b, a); }}
    ],

    loadAllData: async function(onDataLoaded) {
        try {
            const [mainData, marketplaceData, wikiData, sourcesData, questsData] = await Promise.all([
                this.fetchData('main'),
                this.fetchData('marketplace'),
                this.fetchData('wiki'),
                this.fetchData('sources'),
                this.fetchData('quests')  // Add this line
            ]);

            const combinedData = {
                items: mainData.items,
                recipes: mainData.recipes,
                marketplace: marketplaceData.marketplace,
                wiki: wikiData,
                sources: sourcesData.sources,
                quests: questsData  // Add this line
            };

            window.moonbounceData = combinedData;
            window.combinedData = combinedData;

            console.log("Data loaded:", combinedData);

            window.dispatchEvent(new Event('loadData'));
            
            if (onDataLoaded) {
                onDataLoaded(combinedData);
            }

            return combinedData;
        } catch (error) {
            console.error("Error loading data:", error);
            throw error;
        }
    },
    fetchData: async function(key) {
        try {
            const response = await fetch(this.urls[key]);
            if (!response.ok) throw new Error(`Remote ${key} not found`);
            return await response.json();
        } catch (error) {
            console.log(`Falling back to local ${key}`);
            const response = await fetch(this.localUrls[key]);
            if (!response.ok) throw new Error(`Local ${key} not found`);
            return await response.json();
        }
    },

    formatText: (text) => {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
};
