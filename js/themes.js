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

// Load saved theme or default on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('selectedTheme') || 'theme-light';
    setTheme(savedTheme);
    const themeSelect = document.querySelector('.theme-selector select');
    if (themeSelect) {
        themeSelect.value = savedTheme;
    }
});
