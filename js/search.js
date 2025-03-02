class SearchBar {
    constructor() {
        this.searchInput = document.getElementById('header-search');
        this.resultsContainer = document.getElementById('search-results');
        this.isWikiPage = window.location.pathname.includes('wiki.html');
        this.setupEventListeners();
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
        // Check both possible data sources
        const data = window.moonbounceData || window.combinedData;
        if (!data?.items) {
            return;
        }

        if (query.length < 2) {
            this.hideResults();
            return;
        }

        const results = this.searchAllContent(query);
        if (results.length > 0) {
            this.displayResults(results);
        } else {
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

        const baseUrl = this.isWikiPage ? '' : 'wiki.html';

        const html = results.map(result => {
            if (result.type === 'item') {
                return `
                    <a href="${baseUrl}?q=${encodeURIComponent(result.name)}" 
                       class="search-result-item ${result.rarity.toLowerCase()}">
                        <img src="images/${result.itemType.toLowerCase()}/${result.name.replace(/ /g, '_')}.webp" 
                             alt="${result.name}" />
                        <span>${result.name}</span>
                    </a>
                `;
            }
            return `
                <a href="${baseUrl}?q=${encodeURIComponent(result.name)}" 
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
        }
    }

    hideResults() {
        this.resultsContainer.style.display = 'none';
    }
}

// Initialize search when data is loaded from either source
window.addEventListener('loadData', () => {
    new SearchBar();
});

// Also initialize if moonbounceData is already available (for index.html)
if (window.moonbounceData) {
    new SearchBar();
}
