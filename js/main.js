const API_BASE_URL = 'https://api.thedogapi.com/v1/';
const BREED_CACHE_KEY = 'dogBreedsDetailsCache';
const HISTORY_CACHE_KEY = 'dogBreedHistory'; 
const HISTORY_LIMIT = 5; 

const TEMPERAMENT_MAP = {
    "Affectionate": "Лагідний",
    "Agile": "Спритний",
    "Alert": "Пильний",
    "Calm": "Спокійний",
    "Cheerful": "Життєрадісний",
    "Clever": "Кмітливий",
    "Composed": "Врівноважений",
    "Confident": "Впевнений",
    "Courageous": "Сміливий",
    "Curious": "Допитливий",
    "Dedicated": "Відданий",
    "Dutiful": "Сумлінний",
    "Eager": "Завзятий",
    "Energetic": "Енергійний",
    "Friendly": "Дружній",
    "Gentle": "Ніжний",
    "Independent": "Незалежний",
    "Intelligent": "Розумний",
    "Loyal": "Відданий",
    "Obedient": "Покірний",
    "Playful": "Грайливий",
    "Protective": "Захисний",
    "Quick": "Швидкий",
    "Reserved": "Стриманий",
    "Sociable": "Товариський",
    "Spunky": "Жвавий",
    "Strong Willed": "Вольовий",
    "Sweet-Tempered": "З доброю вдачею",
    "Willful": "Свавільний",
    "Aloof": "Байдужий",
    "Steady": "Витривалий",
    "Bold": "Відвижний",
    "Dominant": "Панівний",
    "Territorial": "Прив'язаний до території",
    "Trainable": "Піддається навчанню",
    "Good-natured": "Добродушний",
    "Devoted": "Відданий",
    "Lively": "Жвавий",
    "Active": "Активний",
    "Happy": "Життєрадісний",
    "Stubborn": "Впертий",
    "Adventurous": "Авантюрний",
    "Fun-loving": "Люблячий розваги",
    "Companionable": "Компанійський",
    "Spirited": "Жвавий",
    "Fearless": "Безстрашний",
    "Tolerant": "Спокійний",
    "Assertive": "Наполегливий",
    "Gay": "Веселий",
    "Quiet": "Тихий",
    "Cooperative": "Готовий до співпраці",
    "Tenacious": "Наполегливий",
    "Attentive": "Уважний",
    "Reliable": "Надійний",
    "Mischievous": "Грайливий",
    "People-Oriented": "Орієнтований на людей",
    "Charming": "Чарівний",
    "Keen": "Проникливий",
    "Faithful": "Вірний",
    "Sturdy": "Кріпкий",
    "Bright": "Розумний",
    "Docile": "Покірний",
    "Self-important": "Самовпевнений",
    "Sensitive": "Чутливий",
    "Watchful": "Пильний",
    "Inquisitive": "Допитливий",
    "Cunning": "Хитрий",
    "Extroverted": "Екстравертний",
    "Amiable": "Приязний",
    "Even Tempered": "Спокійний",
    "Excitable": "Збудливий",
    "Determined": "Визначений",
    "Athletic": "Атлетичний",
    "Opinionated": "Впевнений у своїй думці",
    "Aggressive": "Агресивний",
    "Dignified": "Гідний",
    "Patient": "Терплячий",
    "Thoughtful": "Задумливий",
    "Loving": "Люблячий",
    "Familial": "Сімейний",
    "Outgoing": "Комунікабельний",
    "Great-hearted": "Великодушний",
    "Hard-working": "Працьовитий",
    "Powerful": "Потужний",
    "Fast": "Швидкий",
    'Benevolent': "Доброзичливий",
    
};

const randomBtn = document.getElementById('random-btn'); 
const breedBtn = document.getElementById('breed-btn');
const breedSelect = document.getElementById('breed-select');
const dogImage = document.getElementById('dog-image');
const breedNameH2 = document.getElementById('breed-name');
const lastBreedInfo = document.getElementById('last-breed-info');
const originInfoP = document.getElementById('origin-info');
const historyListUL = document.getElementById('history-list'); 

const weightInfoP = document.getElementById('weight-info');
const lifeSpanInfoP = document.getElementById('life-span-info');
const temperamentInfoP = document.getElementById('temperament-info');

let allBreedsData = {};

function translateTemperament(englishTemperament) {
    if (!englishTemperament) {
        return 'Не визначено';
    }
    
    const terms = englishTemperament.split(', ').map(term => term.trim());
    const translatedTerms = terms.map(term => TEMPERAMENT_MAP[term] || term);
    
    return translatedTerms.join(', ');
}

function resetDogInfo(message) {
    if (breedNameH2) breedNameH2.textContent = message;
    if (originInfoP) {
        originInfoP.textContent = '';
        originInfoP.style.display = 'none';
    }
    if (dogImage) dogImage.src = '';
    if (weightInfoP) weightInfoP.textContent = 'Вага: N/A';
    if (lifeSpanInfoP) lifeSpanInfoP.textContent = 'Тривалість життя: N/A';
    if (temperamentInfoP) temperamentInfoP.textContent = 'Темперамент: N/A';
}

function formatBreedsToOptions(breeds) {
    if (!breedSelect) return;
    
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
        if (breedBtn) breedBtn.disabled = false;
        loadLastBreed();
        
        const lastBreed = localStorage.getItem('lastDogBreed');
        if (lastBreed) {
            fetchDogPhoto(lastBreed);
        }
        return; 
    }

    const url = `${API_BASE_URL}breeds`;
    if (breedSelect) breedSelect.innerHTML = '<option value="">Завантаження порід...</option>';
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Помилка HTTP: ${response.status}`);
        }
        
        const breeds = await response.json();
        formatBreedsToOptions(breeds);
        localStorage.setItem(BREED_CACHE_KEY, JSON.stringify(allBreedsData));
        if (breedBtn) breedBtn.disabled = false;
        loadLastBreed();
        
        const lastBreed = localStorage.getItem('lastDogBreed');
        if (lastBreed) {
            fetchDogPhoto(lastBreed);
        }
        
    } catch (error) {
        if (breedSelect) breedSelect.innerHTML = '<option value="">Помилка завантаження API</option>';
        resetDogInfo(`Помилка: ${error.message}`);
        if (breedBtn) breedBtn.disabled = true;
    }
}

async function fetchDogPhoto(breedName) {
    let breedDetail;
    
    if (breedBtn) breedBtn.disabled = true;
    if (randomBtn) randomBtn.disabled = true;
    if (breedNameH2) breedNameH2.textContent = `Завантаження даних для породи ${breedName}...`;
    
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
        const originToDisplay = breedDetail.origin;
        
        const weight = breedDetail.weight ? `${breedDetail.weight.metric} кг` : 'N/A';
        const lifeSpan = breedDetail.life_span || 'N/A';
        const englishTemperament = breedDetail.temperament;
        
        const translatedTemperament = translateTemperament(englishTemperament);
        
        if (weightInfoP) weightInfoP.textContent = `Вага: ${weight}`;
        if (lifeSpanInfoP) lifeSpanInfoP.textContent = `Тривалість життя: ${lifeSpan}`;
        if (temperamentInfoP) temperamentInfoP.textContent = `Темперамент: ${translatedTemperament}`;
        
        if (breedNameH2) breedNameH2.textContent = `${nameToDisplay}`;
        
        if (dogImage) {
            dogImage.src = breedDetail.image.url;
            dogImage.alt = `Фото собаки породи ${nameToDisplay}`;
        }
        
        if (originInfoP) {
            if (originToDisplay) {
                originInfoP.textContent = `Походження: ${originToDisplay}`;
                originInfoP.style.display = 'block';
            } else {
                originInfoP.textContent = '';
                originInfoP.style.display = 'none';
            }
        }
        
        saveLastBreed(nameToDisplay);

    } catch (error) {
        resetDogInfo(`Помилка завантаження фото/деталей: ${error.message} 😔`);
        
    } finally {
        if (Object.keys(allBreedsData).length > 0) {
            if (breedBtn) breedBtn.disabled = false;
            if (randomBtn) randomBtn.disabled = false;
        }
    }
}

async function fetchRandomDogPhoto() {
    if (breedBtn) breedBtn.disabled = true;
    if (randomBtn) randomBtn.disabled = true;
    if (breedNameH2) breedNameH2.textContent = `Випадковий вибір породи...`;
    
    try {
        const breedNames = Object.keys(allBreedsData);
        
        if (breedNames.length === 0) {
            throw new Error('Список порід ще не завантажено. Дочекайтесь завантаження.');
        }

        const randomIndex = Math.floor(Math.random() * breedNames.length);
        const randomBreedName = breedNames[randomIndex];
        
        if (breedSelect) breedSelect.value = randomBreedName;
        
        await fetchDogPhoto(randomBreedName); 
        
    } catch (error) {
        resetDogInfo(`Помилка завантаження випадкового фото: ${error.message} 😔`);
        if (breedBtn) breedBtn.disabled = false;
        if (randomBtn) randomBtn.disabled = false;
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
        if (lastBreedInfo) lastBreedInfo.innerHTML = `Порода: **${lastBreed}**<br>Час та Дата: ${lastTimeDate}`;
    } else {
        if (lastBreedInfo) lastBreedInfo.textContent = 'Ще не було збережено жодної породи.';
    }
    
    renderBreedHistory();
}

function renderBreedHistory() {
    const history = getBreedHistory();
    if (!historyListUL) return; 
    
    historyListUL.innerHTML = '';
    
    if (history.length === 0) {
        historyListUL.innerHTML = '<li>Історія порожня.</li>';
        return;
    }
    
    for (const breed of history) {
        const li = document.createElement('li');
        li.textContent = breed;
        
        li.addEventListener('click', () => {
            if (breedSelect) breedSelect.value = breed;
            fetchDogPhoto(breed);
        });
        
        historyListUL.appendChild(li);
    }
}

if (randomBtn) {
    randomBtn.addEventListener('click', fetchRandomDogPhoto);
}

if (breedBtn) {
    breedBtn.addEventListener('click', () => {
        const breed = breedSelect.value;
        if (breed && breed !== '') { 
            fetchDogPhoto(breed);
        } else {
            resetDogInfo('Будь ласка, оберіть породу зі списку.');
        }
    });
}

window.addEventListener('load', () => {
    populateBreeds();
});