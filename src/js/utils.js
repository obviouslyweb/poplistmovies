// this JS file should contain everything that is generally shared between more than 1 page

import placeholderImg from '/images/placeholder.png';

export const placeholderImage = placeholderImg;

export let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

let movieToRemoveID = null;
let onConfirmCallback = null;


export function saveWatchlist() {
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

export async function fetchMovieDetails(API_KEY, imdbID) {
  const res = await fetch(
    `https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&plot=short`
  );
  const data = await res.json();
  return data.Response === 'True' ? data : null;
}

/**
 * Creates a movie card element (common version).
 * - `options` may include callbacks or flags for buttons.
 * - can customize per page
 */
export function createMovieCard(movie, watchlist, saveWatchlist, fetchMovieDetails, options = {}) {
  const card = document.createElement('article');
  card.className = 'movie-card';

  card.innerHTML = `
    <img
      src="${movie.Poster !== 'N/A' ? movie.Poster : placeholderImg}"
      alt="Poster for ${movie.Title}"
      onerror="this.onerror=null;this.src='${placeholderImg}';"
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
  const toggleBtn = card.querySelector('.toggle-details-btn');
  const addBtn = card.querySelector('.add-btn');
  let loaded = false;

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
    toggleBtn.textContent = showing ? 'More Info' : 'Hide Info';
  });

  addBtn.addEventListener('click', () => {
    if (!watchlist.some(m => m.imdbID === movie.imdbID)) {
      watchlist.push(movie);
      saveWatchlist();
      if (options.onWatchlistUpdated) options.onWatchlistUpdated();
      addBtn.textContent = '✓ In Watchlist';
      let watchlistContainer = document.querySelector("#watchlist-container");
      renderWatchlist(watchlistContainer, watchlist, saveWatchlist);
    }
  });

  return card;
}

function showModal(callback) {
  const modal = document.querySelector(".modal-container");
  modal.classList.remove("hide-modal");
  modal.setAttribute("aria-hidden", "false");
  onConfirmCallback = callback;
}

function hideModal() {
  const modal = document.querySelector(".modal-container");
  modal.classList.add("hide-modal");
  modal.setAttribute("aria-hidden", "true");
  movieToRemoveID = null;
  onConfirmCallback = null;
}


// Renders the watchlist container with movie cards and extra controls
export function renderWatchlist(watchlistContainer, watchlist, saveWatchlist) {
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
          src="${movie.Poster !== 'N/A' ? movie.Poster : placeholderImg}"
          alt="Poster for ${movie.Title}"
          onerror="this.onerror=null;this.src='${placeholderImg}';"
        />
      </a>
      <h3>${movie.Title}</h3>
      <p>${movie.Year}</p>
      <label class="rating-label">
        Rating:
        <select class="rating-select">
          <option value="">—</option>
          ${[1, 2, 3, 4, 5]
            .map(
              (n) =>
                `<option value="${n}" ${
                  movie.rating === n ? 'selected' : ''
                }>${n} ★</option>`
            )
            .join('')}
        </select>
      </label>
      <button class="remove-btn">Remove</button>
    `;

    card.querySelector('.remove-btn').addEventListener('click', () => {
      let movieToRemoveID = movie.imdbID;
      showModal(() => {
        const index = watchlist.findIndex((m) => m.imdbID === movieToRemoveID);
        if (index > -1) {
          watchlist.splice(index, 1);
          saveWatchlist();
          renderWatchlist(watchlistContainer, watchlist, saveWatchlist);
        }
        hideModal();
      });
    });


    card.querySelector('.rating-select').addEventListener('change', (e) => {
      movie.rating = e.target.value ? Number(e.target.value) : null;
      saveWatchlist();
    });

    watchlistContainer.append(card);
  });
}

// Search movies by title and append results using createMovieCard
export async function searchMovies(API_KEY, title, resultsContainer, watchlist, saveWatchlist, fetchMovieDetails) {
  resultsContainer.innerHTML = 'Loading…';
  try {
    const res = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(title)}`
    );
    const json = await res.json();
    if (json.Response === 'False') {
      resultsContainer.textContent = json.Error;
      return;
    }
    resultsContainer.innerHTML = '';
    json.Search.forEach((m) =>
      resultsContainer.append(
        createMovieCard(m, watchlist, saveWatchlist, fetchMovieDetails)
      )
    );
  } catch {
    resultsContainer.textContent = 'Error fetching data.';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path.endsWith('index.html') || path.endsWith('watchlist.html') || path === '/' || path.endsWith('/watchlist')) {
    const confirmBtn = document.getElementById('modal-confirm');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        if (onConfirmCallback) onConfirmCallback();
      });
    }

    const cancelBtn = document.getElementById('modal-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        hideModal();
      });
    }
  }
});

