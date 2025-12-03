const API_BASE_URL = 'https://dog.ceo/api/';

const randomBtn = document.getElementById('random-btn');
const breedBtn = document.getElementById('breed-btn');
const breedSelect = document.getElementById('breed-select');
const dogImage = document.getElementById('dog-image');
const breedNameH2 = document.getElementById('breed-name');
const statusMessageP = document.getElementById('status-message');
const lastBreedInfo = document.getElementById('last-breed-info');

async function populateBreeds() {
    const url = `${API_BASE_URL}breeds/list/all`;
    breedSelect.innerHTML = '<option value="random">Завантаження порід...</option>';

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error('Не вдалося завантажити список порід.');
        }

        const breeds = data.message;
        breedSelect.innerHTML = '<option value="random">Випадкова порода</option>';
        
        for (const [mainBreed, subBreeds] of Object.entries(breeds)) {
            const formattedBreed = mainBreed.charAt(0).toUpperCase() + mainBreed.slice(1);
            
            const option = document.createElement('option');
            option.value = mainBreed;
            option.textContent = formattedBreed;
            breedSelect.appendChild(option);
            
            if (subBreeds.length > 0) {
                subBreeds.forEach(subBreed => {
                    const fullBreed = `${mainBreed}/${subBreed}`;
                    const formattedSubBreed = `${subBreed.charAt(0).toUpperCase() + subBreed.slice(1)} ${formattedBreed}`;
                    
                    const subOption = document.createElement('option');
                    subOption.value = fullBreed;
                    subOption.textContent = formattedSubBreed;
                    breedSelect.appendChild(subOption);
                });
            }
        }
        
        breedBtn.disabled = false;
        loadLastBreed();
        
    } catch (error) {
        breedSelect.innerHTML = '<option value="random">Помилка завантаження</option>';
        statusMessageP.textContent = `Помилка: ${error.message}`;
    }
}

async function fetchDogPhoto(breed = 'random') {
    let url;
    
    if (breed === 'random') {
        url = `${API_BASE_URL}breeds/image/random`;
        breedNameH2.textContent = 'Завантаження випадкового песика... 🐕';
    } else {
        url = `${API_BASE_URL}breed/${breed}/images/random`;
        const displayBreed = breed.replace('/', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).reverse().join(' ');
        breedNameH2.textContent = `Завантаження ${displayBreed}...`;
    }

    randomBtn.disabled = true;
    breedBtn.disabled = true;
    statusMessageP.textContent = 'Очікування відповіді API...';
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Помилка HTTP: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.status !== 'success') {
            throw new Error(`Помилка API: ${data.message}`);
        }
        
        dogImage.src = data.message;
        dogImage.alt = `Фото собаки породи ${breed}`;
        
        let finalBreedName = breed;
        if (breed === 'random') {
             finalBreedName = data.message.split('/breeds/')[1].split('/')[0].replace('-', ' ');
        }
        
        const displayBreed = finalBreedName.replace('/', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).reverse().join(' ');
        breedNameH2.textContent = `Порода: ${displayBreed}`;


        statusMessageP.textContent = 'Зображення завантажено успішно!';
        
        saveLastBreed(finalBreedName);

    } catch (error) {
        breedNameH2.textContent = 'Помилка завантаження фото 😔';
        statusMessageP.textContent = `Помилка: ${error.message}`;
        dogImage.src = 'https://via.placeholder.com/400?text=Error';
    } finally {
        randomBtn.disabled = false;
        if (breedSelect.options.length > 1) {
            breedBtn.disabled = false;
        }
    }
}

function saveLastBreed(breed) {
    if (breed === 'random' || breed.includes('error')) return;
    
    localStorage.setItem('lastDogBreed', breed);
    localStorage.setItem('lastDogTime', new Date().toLocaleTimeString('uk-UA'));
    loadLastBreed();
}

function loadLastBreed() {
    const lastBreed = localStorage.getItem('lastDogBreed');
    const lastTime = localStorage.getItem('lastDogTime');

    if (lastBreed) {
        breedSelect.value = lastBreed;
        const displayBreed = lastBreed.replace('/', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).reverse().join(' ');
        
        lastBreedInfo.textContent = `Остання переглянута порода: ${displayBreed} о ${lastTime}`;
    } else {
        lastBreedInfo.textContent = 'Ще не було збережено жодної породи.';
    }
}

randomBtn.addEventListener('click', () => {
    fetchDogPhoto('random');
});

breedBtn.addEventListener('click', () => {
    const breed = breedSelect.value;
    if (breed && breed !== 'random') {
        fetchDogPhoto(breed);
    } else {
        fetchDogPhoto('random');
    }
});

window.addEventListener('load', () => {
    populateBreeds();
    fetchDogPhoto('random');
});