class SearchBar {
    constructor() {
        this.searchInput = document.getElementById('header-search');
        this.resultsContainer = document.getElementById('search-results');
        this.setupEventListeners();

        // Debug initial data state
        const data = window.moonbounceData || window.combinedData;
        // console.log('Initial data state:', {
        //     moonbounceData: !!window.moonbounceData,
        //     combinedData: !!window.combinedData,
        //     data: data
        // });
    }

    setupEventListeners() {
        // Directly bind the methods to maintain 'this' context
        this.searchInput.addEventListener('input', this.handleSearch.bind(this));
        this.searchInput.addEventListener('focus', this.handleSearch.bind(this));
        
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.resultsContainer.contains(e.target)) {
                this.hideResults();
            }
        });
    }

    handleSearch() {
        const query = this.searchInput.value.toLowerCase();
        // Make sure we have data before searching
        const data = window.moonbounceData || window.combinedData;
        if (!data?.items) {
            // console.warn('No data available for search');
            return;
        }

        if (query.length < 2) {
            this.hideResults();
            return;
        }

        const results = this.searchAllContent(query);
        if (results.length > 0) {
            // console.log(`Found ${results.length} results for "${query}"`);
            this.displayResults(results);
        } else {
            // console.log(`No results found for "${query}"`);
            this.hideResults();
        }
    }

    searchAllContent(query) {
        const results = [];
        const data = window.moonbounceData || window.combinedData || {};
        
        // Search items
        if (data.items) {
            data.items.forEach(item => {
                const nameMatch = item.name.toLowerCase().includes(query);
                const idMatch = `#${item.id}`.includes(query);
                if (nameMatch || idMatch) {
                    // console.log('Found matching item:', item.name);
                    results.push({
                        type: 'item',
                        name: item.name,
                        rarity: item.rarity,
                        itemType: item.type,
                        id: item.id
                    });
                }
            });
        }

        // Search sources
        if (data.sources) {
            data.sources.forEach(source => {
                if (source.name.toLowerCase().includes(query)) {
                    // console.log('Found matching source:', source.name);
                    results.push({
                        type: 'source',
                        name: source.name
                    });
                }
            });
        }

        return results.slice(0, 5);
    }

    displayResults(results) {
        if (!results.length) {
            this.hideResults();
            return;
        }

        const html = results.map(result => {
            if (result.type === 'item') {
                return `
                    <a href="wiki.html?q=${encodeURIComponent(result.name)}" 
                       class="search-result-item ${result.rarity.toLowerCase()}">
                        <img src="images/${result.itemType.toLowerCase()}/${result.name.replace(/ /g, '_')}.webp" 
                             alt="${result.name}" />
                        <span> ${result.name}</span>
                    </a>
                `;
            }
            return `
                <a href="wiki.html?q=${encodeURIComponent(result.name)}" 
                   class="search-result-item">
                    <img src="images/sources/${result.name.replace(/ /g, '_')}.webp" 
                         alt="${result.name}" />
                    <span>${result.name}</span>
                </a>
            `;
        }).join('');

        this.resultsContainer.innerHTML = html;
        this.showResults();
    }

    showResults() {
        if (this.resultsContainer.innerHTML) {
            this.resultsContainer.style.display = 'block';
            // console.log('Showing results');
        }
    }

    hideResults() {
        this.resultsContainer.style.display = 'none';
        // console.log('Hiding results');
    }
}

// Remove polling approach and only use event-based initialization
window.addEventListener('loadData', () => {
    // console.log('Data loaded, initializing search');
    new SearchBar();
});
