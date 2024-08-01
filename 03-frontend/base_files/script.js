document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
  
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            await loginUser(email, password);
        });
    } else {
        // Si l'utilisateur est déjà connecté, vérifier le jeton et charger les données
        checkAuthentication();
        fetchCountries();
        fetchPlaces();
    }
});

// Fonction pour lire les cookies
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Fonction pour vérifier la présence du jeton JWT
function checkJwtToken() {
    const token = getCookie('token');
    if (token) {
        //console.log('JWT token found:', token);
    } else {
        console.log('JWT token not found');
    }
}

// Fonction pour vérifier l'authentification
function checkAuthentication() {
    const token = getCookie('token');
    if (!token) {
        window.location.href = 'login.html';
    } else {
        checkJwtToken();
    }
}

// Appeler cette fonction après une connexion réussie
async function loginUser(email, password) {
    const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    if (response.ok) {
        const data = await response.json();
        document.cookie = `token=${data.access_token}; path=/`;
        checkJwtToken(); // Vérifier le jeton après la connexion
        window.location.href = 'index.html';
    } else {
        alert('Échec de la connexion : ' + response.statusText);
    }
}

// Fonction pour récupérer les pays
async function fetchCountries() {
    try {
        const response = await fetch('http://127.0.0.1:5000/countries');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const countries = await response.json();
        displayCountries(countries);
    } catch (error) {
        console.error('Fetch countries failed:', error);
    }
}

// Fonction pour afficher les options de pays
function displayCountries(countries) {
    const countryFilter = document.getElementById('country-filter');
    if (countryFilter) {
        countryFilter.innerHTML = '<option value="">All Countries</option>';
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.name;
            option.textContent = country.name;
            countryFilter.appendChild(option);
        });
    } else {
        console.error('Element country-filter not found');
    }
}

// Fonction pour récupérer les lieux
async function fetchPlaces() {
    try {
        const response = await fetch('http://127.0.0.1:5000/places');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const places = await response.json();
        displayPlaces(places);
    } catch (error) {
        console.error('Fetch places failed:', error);
    }
}

// Fonction pour afficher les lieux
function displayPlaces(places) {
    const placesList = document.getElementById('places-list');
    if (placesList) {
        placesList.innerHTML = '';
        places.forEach(place => {
            const placeCard = document.createElement('div');
            placeCard.className = 'place-list';
            placeCard.innerHTML = `
                <h3>${place.description}</h3>
                <p>Price per night: $${place.price_per_night}</p>
                <p>Location: ${place.city_name}, ${place.country_name}</p>
                <a href="place.html?id=${place.id}" class="details-button">View Details</a>
            `;
            placesList.appendChild(placeCard);
        });
        updateCountryFilter(places);
    } else {
        console.error('Element places-list not found');
    }
}

// Fonction pour mettre à jour les options du filtre de pays
function updateCountryFilter(plcs) {
    const countryFilter = document.getElementById('country-filter');
    if (countryFilter) {
        const countries = [...new Set(plcs.map(place => place.country_name))];
        countryFilter.innerHTML = '<option value="">All Countries</option>';
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countryFilter.appendChild(option);
        });
    } else {
        console.error('Element country-filter not found');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const countryFilter = document.getElementById('country-filter');
    if (countryFilter) {
        countryFilter.addEventListener('change', (event) => {
            const selectedCountry = event.target.value;
            filterPlacesByCountry(selectedCountry);
        });
    }
});

function filterPlacesByCountry(country) {
    const placesList = document.getElementById('places-list');
    const placeCards = placesList.getElementsByClassName('place-list');
    Array.from(placeCards).forEach(card => {
        const location = card.querySelector('p:nth-child(3)').textContent;
        if (country === '' || location.includes(country)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// Fonction pour obtenir l'ID du lieu à partir de l'URL
function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Fonction pour récupérer les détails d'un lieu
async function fetchPlaceDetails(placeId) {
    if (!placeId) {
        console.error('Place ID is not defined');
        return;
    }
    const token = getCookie('token');
    try {
        const response = await fetch(`http://127.0.0.1:5000/places/${placeId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const place = await response.json();
        return place;
    } catch (error) {
        console.error('Fetch place details failed:', error);
    }
}

// Fonction pour afficher les détails d'un lieu
function displayPlaceDetails(place) {
    const placeDetails = document.getElementById('place-details');
    if (placeDetails) {
        placeDetails.innerHTML = `
            <h2>${place.description || 'No Name Provided'}</h2>
            <p><strong>Host:</strong> ${place.host_name || 'No Host Provided'}</p>
            <p><strong>Price per night:</strong> $${place.price_per_night || 'No Price Provided'}</p>
            <p><strong>Location:</strong> ${place.city_name || 'No City Provided'}, ${place.country_name || 'No Country Provided'}</p>
            <p><strong>Amenities:</strong> ${place.amenities ? place.amenities.join(', ') : 'No Amenities Provided'}</p>
        `;
    } else {
        console.error('Element place-details not found');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const placeId = getPlaceIdFromURL();
    if (placeId) {
        const place = await fetchPlaceDetails(placeId);
        if (place) {
            displayPlaceDetails(place);
        }
    }
});
