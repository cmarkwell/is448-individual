RANDOM_WORD_URL = 'https://random-word-api.herokuapp.com/word?number=1&swear=0';
DICTIONARY_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

const dictionary = [];

/**
 * Window load handler
 */
window.addEventListener('load', () => {
    // Get a random word for the input's placeholder
    fetch(RANDOM_WORD_URL)
        .then(response => response.json())
        .then(data => {
            const wordInput = document.querySelector('.word-input');
            wordInput.placeholder = data?.length ? data[0] : 'vestibule';
        });

    // Read browser's localstorage for previously searched words
    const localData = JSON.parse(localStorage.getItem('dictionary') ?? []);
    dictionary.push(...localData);
    dictionary.forEach(([word, definition]) => {
        const wordList = document.querySelector('.list-group');
        const listElement = createListElement(word, definition);
        wordList.appendChild(listElement);
    });
});

/**
 * Create a bootstrap <li /> element with a word's definition
 * @param {string} queriedWord - Word we are attempting to define
 * @param {string} definedWord - Word the service actually defined
 * @param {object} definition - Definition from the dictionary API
 * @returns A new DOM element 
 */
const createListElement = (definedWord, definition, queriedWord = '') => {
    const listingElement = document.createElement('li');
    listingElement.className = `list-group-item ${definedWord}`;
    listingElement.innerHTML = definedWord && definition 
        ? `<b>${definedWord}:</b> ${definition}`
        : `<b>${queriedWord}:</b> Unable to find a definition for the word <b>${queriedWord}</b>`;
    return listingElement;
};

/**
 * Button onclick handler, define the term in the text input
 * @returns nothing!
 */
const defineWord = () => {
    const wordInput = document.querySelector('.word-input');
    const word = wordInput.value || wordInput.placeholder;

    // Do some basic input validation
    if (word === '') {
        return;
    }

    // Attempt to use the internet to define the word
    fetch(DICTIONARY_URL + encodeURIComponent(word))
        .then(response => response.json())
        .then(data => {
            // Extract some values from the returned data
            const definedWord = data[0]?.word;
            const definition = data[0]?.meanings[0].definitions[0].definition;

            // Add new search to dictionary, store in browser storage
            if (definedWord && definition) {
                dictionary.push([definedWord, definition]);
                localStorage.setItem('dictionary', JSON.stringify(dictionary));
            }

            // Create a list element and append it to our DOM list
            const wordList = document.querySelector('.list-group');
            const listElement = createListElement(definedWord, definition, word);
            wordList.appendChild(listElement);
        });
};