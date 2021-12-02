RANDOM_WORD_URL = 'https://random-word-api.herokuapp.com/word?number=1&swear=0';
DICTIONARY_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

// Definitely better suited as an object but I'm laying in the bed I made here.
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
    const wordList = document.querySelector('.list-group');
    const localData = JSON.parse(localStorage.getItem('dictionary')) ?? [];
    dictionary.push(...localData);

    // Create "delete all" row if there's enough data
    if (dictionary.length) {
        const listElement = createListDeleteElement();
        wordList.appendChild(listElement);
    }

    // Add rows for every defined word
    dictionary.forEach(([word, definition]) => {
        const listElement = createListElement(word, definition);
        wordList.appendChild(listElement);
    });
});

/**
 * Create a list-group-item element with a "delete all rows" button
 * @returns A new DOM element
 */
const createListDeleteElement = () => {
    const listElement = document.createElement('li');
    listElement.className = 'list-group-item delete-all';
    listElement.innerHTML = '<button type="button" class="btn btn-secondary" title="Delete ALL rows" onclick="onRowsClear()"><i class="bi bi-trash"></i></button>';
    return listElement;
};

/**
 * Create a bootstrap <li /> element with a word's definition
 * @param {string} queriedWord - Word we are attempting to define
 * @param {string} definedWord - Word the service actually defined
 * @param {object} definition - Definition from the dictionary API
 * @returns A new DOM element 
 */
const createListElement = (definedWord, definition, queriedWord = '') => {
    const listElement = document.createElement('li');
    const classWord = `word-${definedWord || queriedWord}`;
    listElement.className = `list-group-item ${classWord} ${definedWord ? '' : undefined}`;
    listElement.innerHTML = definedWord && definition 
        ? `<p><b>${definedWord}:</b> ${definition}</p>`
        : `<p><b>${queriedWord}:</b> Unable to find a definition for the word <b>${queriedWord}</b></p>`;
    // Yes, I know this has injection issues. Have fun!
    listElement.innerHTML += `<button type="button" class="btn btn-light" title="Delete row" onclick="onRowDelete('${classWord}')"><i class="bi bi-trash-fill"></i></button>`
    return listElement;
};

/**
 * Delete the corresponding list-group-item when the trash icon is clicked, delete in localStorage
 * @param {string} classWord - list-group-item target class to delete
 */
const onRowDelete = classWord => {
    const listingElement = document.querySelector(`.list-group-item.${classWord}`);
    if (!listingElement.classList.contains('undefined')) {
        const i = dictionary.findIndex(dictDef => `word-${dictDef[0]}` === classWord);
        dictionary.splice(i, 1);
        localStorage.setItem('dictionary', JSON.stringify(dictionary));
    }
    if (dictionary.length === 0) {
        const wordList = document.querySelector('.list-group');
        wordList.innerHTML = '';
    }
    listingElement.remove();
};

/**
 * Delete all list-group-items, delete all from localStorage
 */
const onRowsClear = () => {
    const wordList = document.querySelector('.list-group');
    wordList.innerHTML = '';
    dictionary.splice(0, dictionary.length);
    localStorage.setItem('dictionary', JSON.stringify(dictionary));
};

/**
 * Button onclick handler, define the term in the text input
 * @returns nothing!
 */
const defineWord = () => {
    const wordInput = document.querySelector('.word-input');
    const word = wordInput.value || wordInput.placeholder;

    // Do some basic input validation
    if (!word) {
        alert('Please enter a word in the text input!');
        return;
    }

    // Attempt to use the internet to define the word
    fetch(DICTIONARY_URL + encodeURIComponent(word))
        .then(response => response.json())
        .then(data => {
            // Extract some values from the returned data
            const definedWord = data[0]?.word;
            const definition = data[0]?.meanings[0].definitions[0].definition;
            const wordList = document.querySelector('.list-group');

            // Cause validation error if the returned word is already in our dictionary
            if (dictionary.some(dictDef => dictDef[0] === definedWord)) {
                alert(`The word "${word}" has already been defined! Please check the list for similar words and definitions.`);
                return;
            }

            // Add new search to dictionary, store in browser storage, don't save duplicates
            if (definedWord && definition) {
                dictionary.unshift([definedWord, definition]);
                localStorage.setItem('dictionary', JSON.stringify(dictionary));
            }

            // Create a list element and append it to our DOM list
            const listElement = createListElement(definedWord, definition, word);
            wordList.insertBefore(listElement, wordList.firstChild?.nextSibling ?? wordList.firstChild);

            // Create delete all rows list element if necessary
            if (dictionary.length <= 1) {
                const listElement = createListDeleteElement();
                wordList.insertBefore(listElement, wordList.firstChild);
            }
        });
};