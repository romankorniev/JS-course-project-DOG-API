const API_BASE_URL = 'https://api.thedogapi.com/v1/';
const BREED_CACHE_KEY = 'dogBreedsDetailsCache';
const HISTORY_CACHE_KEY = 'dogBreedHistory'; 
const HISTORY_LIMIT = 5; 

const randomBtn = document.getElementById('random-btn'); 
const breedBtn = document.getElementById('breed-btn');
const breedSelect = document.getElementById('breed-select');
const dogImage = document.getElementById('dog-image');
const breedNameH2 = document.getElementById('breed-name');
const statusMessageP = document.getElementById('status-message');
const lastBreedInfo = document.getElementById('last-breed-info');
const originInfoP = document.getElementById('origin-info');
const historyListUL = document.getElementById('history-list'); 

let allBreedsData = {};

function formatBreedsToOptions(breeds) {
    breedSelect.innerHTML = '<option value="">Оберіть породу...</option>';
    const validBreeds = breeds.filter(b => b.id); 
    
    validBreeds.forEach(breed => {
        allBreedsData[breed.name] = breed; 
        const option = document.createElement('option');
        option.value = breed.name;
        option.textContent = breed.name;
        breedSelect.appendChild(option);
    });
}

async function populateBreeds() {
    const cachedData = localStorage.getItem(BREED_CACHE_KEY);
    
    if (cachedData) {
        allBreedsData = JSON.parse(cachedData);
        formatBreedsToOptions(Object.values(allBreedsData));
        breedBtn.disabled = false;
        loadLastBreed();
        
        const lastBreed = localStorage.getItem('lastDogBreed');
        if (lastBreed) {
            fetchDogPhoto(lastBreed);
        }
        return; 
    }

    const url = `${API_BASE_URL}breeds`;
    breedSelect.innerHTML = '<option value="">Завантаження порід з The Dog API...</option>';
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Помилка HTTP: ${response.status}`);
        }
        
        const breeds = await response.json();
        formatBreedsToOptions(breeds);
        localStorage.setItem(BREED_CACHE_KEY, JSON.stringify(allBreedsData));
        breedBtn.disabled = false;
        loadLastBreed();
        statusMessageP.textContent = 'Список порід завантажено успішно. Оберіть породу.';
        
        const lastBreed = localStorage.getItem('lastDogBreed');
        if (lastBreed) {
            fetchDogPhoto(lastBreed);
        }
        
    } catch (error) {
        breedSelect.innerHTML = '<option value="">Помилка завантаження The Dog API</option>';
        statusMessageP.textContent = `Помилка: ${error.message}`;
        breedBtn.disabled = true;
    }
}

async function fetchDogPhoto(breedName) {
    let breedDetail;
    
    breedBtn.disabled = true;
    randomBtn.disabled = true;
    
    try {
        breedDetail = allBreedsData[breedName];
        
        if (!breedDetail) {
             throw new Error(`Деталі для породи "${breedName}" не знайдено в кеші.`);
        }

        if (!breedDetail.image || !breedDetail.image.url) {
            
            const imageUrl = `${API_BASE_URL}images/search?breed_id=${breedDetail.id}`;
            const response = await fetch(imageUrl);
            const data = await response.json();
            
            if (data.length > 0) {
                breedDetail.image = { url: data[0].url };
                localStorage.setItem(BREED_CACHE_KEY, JSON.stringify(allBreedsData));
            } else {
                throw new Error(`Зображення для породи "${breedName}" не знайдено.`);
            }
        }

        const nameToDisplay = breedDetail.name || 'Невідома порода';
        const originToDisplay = breedDetail.origin || 'Інформація про походження відсутня';
        
        breedNameH2.textContent = `Порода: ${nameToDisplay}`;
        dogImage.src = breedDetail.image.url;
        dogImage.alt = `Фото собаки породи ${nameToDisplay}`;
        
        if (originInfoP) {
            originInfoP.textContent = `Походження: ${originToDisplay}`;
        }
        
        saveLastBreed(nameToDisplay);

    } catch (error) {
        breedNameH2.textContent = 'Помилка завантаження фото/деталей 😔';
        statusMessageP.textContent = `Помилка: ${error.message}`;
        
        dogImage.src = '';
        
        if (originInfoP) {
             originInfoP.textContent = '';
        }
    } finally {
        if (Object.keys(allBreedsData).length > 0) {
            breedBtn.disabled = false;
            randomBtn.disabled = false;
        }
    }
}

async function fetchRandomDogPhoto() {
    breedBtn.disabled = true;
    randomBtn.disabled = true;
    statusMessageP.textContent = `Випадковий вибір породи...`;
    
    try {
        const breedNames = Object.keys(allBreedsData);
        
        if (breedNames.length === 0) {
            throw new Error('Список порід ще не завантажено. Дочекайтесь завантаження.');
        }

        const randomIndex = Math.floor(Math.random() * breedNames.length);
        const randomBreedName = breedNames[randomIndex];
        
        breedSelect.value = randomBreedName;
        
        await fetchDogPhoto(randomBreedName); 
        
    } catch (error) {
        breedNameH2.textContent = 'Помилка завантаження випадкового фото 😔';
        statusMessageP.textContent = `Помилка: ${error.message}`;
        dogImage.src = '';
        originInfoP.textContent = '';
        breedBtn.disabled = false;
        randomBtn.disabled = false;
    }
}

function getBreedHistory() {
    const historyString = localStorage.getItem(HISTORY_CACHE_KEY);
    return historyString ? JSON.parse(historyString) : [];
}

function saveBreedHistory(history) {
    localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(history));
}

function updateBreedHistory(breedName) {
    let history = getBreedHistory();
    
    history = history.filter(item => item !== breedName);
    history.unshift(breedName);
    history = history.slice(0, HISTORY_LIMIT);
    
    saveBreedHistory(history);
    renderBreedHistory(); 
}

function saveLastBreed(breed) {
    if (!breed || breed.includes('Помилка')) return;
    
    const now = new Date();
    const dateTimeString = now.toLocaleString('uk-UA', { 
        year: 'numeric', 
        month: 'numeric', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    localStorage.setItem('lastDogBreed', breed);
    localStorage.setItem('lastDogTimeDate', dateTimeString);
    
    loadLastBreed();
    updateBreedHistory(breed);
}

function loadLastBreed() {
    const lastBreed = localStorage.getItem('lastDogBreed');
    const lastTimeDate = localStorage.getItem('lastDogTimeDate');

    if (lastBreed) {
        lastBreedInfo.innerHTML = `Порода: **${lastBreed}**<br>Час та Дата: ${lastTimeDate}`;
    } else {
        lastBreedInfo.textContent = 'Ще не було збережено жодної породи.';
    }
    
    renderBreedHistory();
}

function renderBreedHistory() {
    const history = getBreedHistory();
    historyListUL.innerHTML = '';
    
    if (history.length <= 1) {
        historyListUL.innerHTML = '<li>Історія порожня.</li>';
        return;
    }
    
    for (let i = 1; i < history.length; i++) {
        const breed = history[i];
        const li = document.createElement('li');
        li.textContent = breed;
        
        li.addEventListener('click', () => {
            breedSelect.value = breed;
            fetchDogPhoto(breed);
        });
        
        historyListUL.appendChild(li);
    }
}


randomBtn.addEventListener('click', fetchRandomDogPhoto);


breedBtn.addEventListener('click', () => {
    const breed = breedSelect.value;
    if (breed && breed !== '') { 
        fetchDogPhoto(breed);
    } else {
        statusMessageP.textContent = 'Будь ласка, оберіть породу зі списку.';
    }
});

window.addEventListener('load', () => {
    localStorage.removeItem('ceoToDogApiMap'); 
    populateBreeds();
});