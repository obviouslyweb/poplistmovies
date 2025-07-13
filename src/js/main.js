import {
  watchlist,
  saveWatchlist,
  fetchMovieDetails,
  searchMovies,
  renderWatchlist,
} from './utils.js';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const suggestionsList = document.getElementById('suggestions');
const resultsContainer = document.getElementById('movies-container');
const watchlistContainer = document.getElementById('watchlist-container');

let suggestTimeout;

input.addEventListener('input', () => {
  const q = input.value.trim();
  clearTimeout(suggestTimeout);
  suggestionsList.innerHTML = '';
  if (q.length < 3) return;

  suggestTimeout = setTimeout(async () => {
    try {
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(q)}`
      );
      const json = await res.json();
      if (json.Response === 'True') {
        suggestionsList.innerHTML = '';
        json.Search.forEach((m) => {
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

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = input.value.trim();
  if (q) searchMovies(API_KEY, q, resultsContainer, watchlist, saveWatchlist, fetchMovieDetails);
});

if (watchlistContainer) {
  renderWatchlist(watchlistContainer, watchlist, saveWatchlist);
}
