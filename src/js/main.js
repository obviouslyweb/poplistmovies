// src/js/main.js

const API_KEY            = import.meta.env.VITE_OMDB_API_KEY;
const form               = document.getElementById('search-form');
const input              = document.getElementById('search-input');
const suggestionsList    = document.getElementById('suggestions');
const resultsContainer   = document.getElementById('movies-container');
const watchlistContainer = document.getElementById('watchlist-container');

// Load or initialize watchlist
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

// Persist helper
function saveWatchlist() {
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

// Fetch full movie details
async function fetchMovieDetails(imdbID) {
  const res  = await fetch(
    `https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&plot=short`
  );
  const data = await res.json();
  return data.Response === 'True' ? data : null;
}

// Render your watchlist
function renderWatchlist() {
  watchlistContainer.innerHTML = '';
  if (!watchlist.length) {
    watchlistContainer.textContent = 'Your watchlist is empty.';
    return;
  }

  watchlist.forEach(movie => {
    const card = document.createElement('article');
    card.className = 'movie-card';

    card.innerHTML = `
    <a href="/details.html?id=${movie.imdbID}">
      <img
        src="${movie.Poster !== 'N/A' ? movie.Poster : '/images/placeholder.png'}"
        alt="Poster for ${movie.Title}"
      />
    </a>
    <h3>${movie.Title}</h3>
    <p>${movie.Year}</p>
    <div class="details-container" style="display:none">
      <p><em>Loading details…</em></p>
    </div>
    <button class="toggle-details-btn">More Info</button>
    <button class="add-btn">
      ${watchlist.some(m => m.imdbID === movie.imdbID)
        ? '✓ In Watchlist'
        : '+ Add to Watchlist'}
    </button>
  `;

    // Remove handler
    card.querySelector('.remove-btn').addEventListener('click', () => {
      watchlist = watchlist.filter(m => m.imdbID !== movie.imdbID);
      saveWatchlist();
      renderWatchlist();
    });

    // Rating handler
    card.querySelector('.rating-select').addEventListener('change', e => {
      movie.rating = e.target.value ? Number(e.target.value) : null;
      saveWatchlist();
    });

    watchlistContainer.append(card);
  });
}

// Build one search‐result card
function createMovieCard(movie) {
  const card = document.createElement('article');
  card.className = 'movie-card';

  card.innerHTML = `
    <img
      src="${movie.Poster !== 'N/A' ? movie.Poster : '/images/placeholder.png'}"
      alt="Poster for ${movie.Title}"
      onerror="this.onerror=null;this.src='/images/placeholder.png';"
    />
    <h3>${movie.Title}</h3>
    <p>${movie.Year}</p>
    <div class="details-container" style="display:none">
      <p><em>Loading details…</em></p>
    </div>
    <button class="toggle-details-btn">More Info</button>
    <button class="add-btn">
      ${watchlist.some(m => m.imdbID === movie.imdbID)
        ? '✓ In Watchlist'
        : '+ Add to Watchlist'}
    </button>
  `;

  const detailsDiv = card.querySelector('.details-container');
  const toggleBtn  = card.querySelector('.toggle-details-btn');
  const addBtn     = card.querySelector('.add-btn');
  let loaded       = false;

  // Toggle “More Info”
  toggleBtn.addEventListener('click', async () => {
    if (!loaded) {
      const info = await fetchMovieDetails(movie.imdbID);
      detailsDiv.innerHTML = info
        ? `<p><strong>Rated:</strong> ${info.Rated}</p>
           <p><strong>Director:</strong> ${info.Director}</p>
           <p><strong>Actors:</strong> ${info.Actors}</p>`
        : `<p>Details not available.</p>`;
      loaded = true;
    }
    const showing = detailsDiv.style.display === 'block';
    detailsDiv.style.display = showing ? 'none' : 'block';
    toggleBtn.textContent    = showing ? 'More Info' : 'Hide Info';
  });

  // **Simplified Add to Watchlist** (no text-check needed)
  addBtn.addEventListener('click', () => {
    if (!watchlist.some(m => m.imdbID === movie.imdbID)) {
      watchlist.push(movie);
      saveWatchlist();
      renderWatchlist();
      addBtn.textContent = '✓ In Watchlist';
    }
  });

  return card;
}

// Search function
async function searchMovies(title) {
  resultsContainer.innerHTML = 'Loading…';
  try {
    const res  = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(title)}`
    );
    const json = await res.json();
    if (json.Response === 'False') {
      resultsContainer.textContent = json.Error;
      return;
    }
    resultsContainer.innerHTML = '';
    json.Search.forEach(m => resultsContainer.append(createMovieCard(m)));
  } catch {
    resultsContainer.textContent = 'Error fetching data.';
  }
}

// Autocomplete suggestions (as before)
let suggestTimeout;
input.addEventListener('input', () => {
  const q = input.value.trim();
  clearTimeout(suggestTimeout);
  suggestionsList.innerHTML = '';
  if (q.length < 3) return;

  suggestTimeout = setTimeout(async () => {
    try {
      const res  = await fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(q)}`
      );
      const json = await res.json();
      if (json.Response === 'True') {
        suggestionsList.innerHTML = '';
        json.Search.forEach(m => {
          const li = document.createElement('li');
          li.textContent = m.Title;
          li.addEventListener('click', () => {
            input.value = m.Title;
            suggestionsList.innerHTML = '';
          });
          suggestionsList.append(li);
        });
      }
    } catch {
      suggestionsList.innerHTML = '';
    }
  }, 300);
});

input.addEventListener('blur', () => {
  setTimeout(() => (suggestionsList.innerHTML = ''), 200);
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const q = input.value.trim();
  if (q) searchMovies(q);
});

// Initial watchlist render
renderWatchlist();
