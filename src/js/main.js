const API_KEY            = import.meta.env.VITE_OMDB_API_KEY;
const form               = document.getElementById('search-form');
const input              = document.getElementById('search-input');
const suggestionsList    = document.getElementById('suggestions');
const resultsContainer   = document.getElementById('movies-container');
const watchlistContainer = document.getElementById('watchlist-container');

let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

function saveWatchlist() {
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

async function fetchMovieDetails(imdbID) {
  const res  = await fetch(
    `https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&plot=short`
  );
  const data = await res.json();
  return data.Response === 'True' ? data : null;
}

function renderWatchlist() {
  if (!watchlistContainer) return;

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
          onerror="this.onerror=null;this.src='/images/placeholder.png';"
        />
      </a>
      <h3>${movie.Title}</h3>
      <p>${movie.Year}</p>
    `;

    watchlistContainer.append(card);
  });
}

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

if (watchlistContainer) {
  renderWatchlist();
}