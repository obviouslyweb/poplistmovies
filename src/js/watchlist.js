// src/js/main.js

const API_KEY            = import.meta.env.VITE_OMDB_API_KEY;
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
            `<option value="${n}" ${movie.rating===n?'selected':''}>${n} ★</option>`
          ).join('')}
        </select>
      </label>
      <button class="remove-btn">Remove</button>
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
      src="${movie.Poster!=='N/A'?movie.Poster:'/images/placeholder.png'}"
      alt="Poster for ${movie.Title}"
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

// Initial watchlist render
renderWatchlist();
