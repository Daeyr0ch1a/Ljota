let currentSpriteIndex = parseInt(localStorage.getItem('currentSpriteIndex')) || 0;

function getCurrentSpriteIndex() {
    return currentSpriteIndex;
}

function setCurrentSpriteIndex(index) {
    currentSpriteIndex = index;
    localStorage.setItem('currentSpriteIndex', index); // Сохраняем в localStorage
    console.log(`Событие spriteChanged отправлено с индексом: ${index}`);
    const event = new CustomEvent('spriteChanged', { detail: currentSpriteIndex });
    window.dispatchEvent(event);
}

export { getCurrentSpriteIndex, setCurrentSpriteIndex };