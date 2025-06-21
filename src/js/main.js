// src/js/main.js

const API_KEY            = import.meta.env.VITE_OMDB_API_KEY;
const form               = document.getElementById('search-form');
const input              = document.getElementById('search-input');
const suggestionsList    = document.getElementById('suggestions');
const resultsContainer   = document.getElementById('movies-container');
const watchlistContainer = document.getElementById('watchlist-container');

// 1. Load or initialize the watchlist
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

// 2. Helper to persist the watchlist
function saveWatchlist() {
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

// 3. Fetch full movie details from OMDb
async function fetchMovieDetails(imdbID) {
  const res  = await fetch(
    `https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&plot=short`
  );
  const data = await res.json();
  return data.Response === 'True' ? data : null;
}

// 4. Render the watchlist (with rating & remove)
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
      <img
        src="${movie.Poster !== 'N/A' ? movie.Poster : '/images/placeholder.png'}"
        alt="Poster for ${movie.Title}"
      />
      <h3>${movie.Title}</h3>
      <p>${movie.Year}</p>

      <label class="rating-label">
        Rating:
        <select class="rating-select">
          <option value="">—</option>
          ${[1,2,3,4,5].map(n =>
            `<option value="${n}" ${movie.rating === n ? 'selected' : ''}>
              ${n} ★
            </option>`
          ).join('')}
        </select>
      </label>

      <button class="remove-btn">Remove</button>
    `;

    // Remove button handler
    card.querySelector('.remove-btn').addEventListener('click', () => {
      watchlist = watchlist.filter(m => m.imdbID !== movie.imdbID);
      saveWatchlist();
      renderWatchlist();
    });

    // Rating select handler
    card.querySelector('.rating-select').addEventListener('change', e => {
      const val = e.target.value;
      movie.rating = val ? Number(val) : null;
      saveWatchlist();
    });

    watchlistContainer.append(card);
  });
}

// 5. Build a search‐result card with “More Info” + “Add to Watchlist”
function createMovieCard(movie) {
  const card = document.createElement('article');
  card.className = 'movie-card';

  // Static HTML
  card.innerHTML = `
    <img
      src="${movie.Poster !== 'N/A' ? movie.Poster : '/images/placeholder.png'}"
      alt="Poster for ${movie.Title}"
    />
    <h3>${movie.Title}</h3>
    <p>${movie.Year}</p>

    <div class="details-container" style="display:none;">
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

  // “More Info” toggle
  toggleBtn.addEventListener('click', async () => {
    if (!loaded) {
      const info = await fetchMovieDetails(movie.imdbID);
      if (info) {
        detailsDiv.innerHTML = `
          <p><strong>Rated:</strong> ${info.Rated}</p>
          <p><strong>Director:</strong> ${info.Director}</p>
          <p><strong>Actors:</strong> ${info.Actors}</p>
        `;
      } else {
        detailsDiv.innerHTML = `<p>Details not available.</p>`;
      }
      loaded = true;
    }
    const isHidden = detailsDiv.style.display === 'none';
    detailsDiv.style.display = isHidden ? 'block' : 'none';
    toggleBtn.textContent    = isHidden ? 'Hide Info' : 'More Info';
  });

  // “Add to Watchlist” handler
  addBtn.addEventListener('click', () => {
    if (addBtn.textContent.startsWith('+')) {
      watchlist.push(movie);
      saveWatchlist();
      renderWatchlist();
      addBtn.textContent = '✓ In Watchlist';
    }
  });

  return card;
}

// 6. Fetch OMDb search results and render them
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
    json.Search.forEach(movie => {
      resultsContainer.append(createMovieCard(movie));
    });
  } catch (err) {
    console.error(err);
    resultsContainer.textContent = 'Error fetching data.';
  }
}

// 7. Autocomplete suggestions (debounced)
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

// 8. Hide suggestions on blur (allow clicks)
input.addEventListener('blur', () => {
  setTimeout(() => { suggestionsList.innerHTML = ''; }, 200);
});

// 9. Handle form submit
form.addEventListener('submit', e => {
  e.preventDefault();
  const query = input.value.trim();
  if (query) searchMovies(query);
});

// 10. Initial render of watchlist
renderWatchlist();
