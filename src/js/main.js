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
let selectedSuggestionIndex = -1;

function selectSuggestion(title) {
  input.value = title;
  suggestionsList.innerHTML = '';
  selectedSuggestionIndex = -1;
  input.focus();
  // Automatically trigger search
  searchMovies(API_KEY, title, resultsContainer, watchlist, saveWatchlist, fetchMovieDetails);
}

function updateSuggestionSelection() {
  const suggestions = suggestionsList.querySelectorAll('li');
  suggestions.forEach((li, index) => {
    li.classList.toggle('selected', index === selectedSuggestionIndex);
  });
}

input.addEventListener('input', () => {
  const q = input.value.trim();
  clearTimeout(suggestTimeout);
  suggestionsList.innerHTML = '';
  selectedSuggestionIndex = -1;
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
          li.setAttribute('data-title', m.Title);
          li.addEventListener('click', (e) => {
            e.preventDefault();
            selectSuggestion(m.Title);
          });
          li.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevent blur event
          });
          suggestionsList.append(li);
        });
      }
    } catch {
      suggestionsList.innerHTML = '';
    }
  }, 300);
});

input.addEventListener('keydown', (e) => {
  const suggestions = suggestionsList.querySelectorAll('li');
  
  if (suggestions.length === 0) return;
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
      updateSuggestionSelection();
      break;
    case 'ArrowUp':
      e.preventDefault();
      selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
      updateSuggestionSelection();
      break;
    case 'Enter':
      if (selectedSuggestionIndex >= 0) {
        e.preventDefault();
        const selectedTitle = suggestions[selectedSuggestionIndex].getAttribute('data-title');
        selectSuggestion(selectedTitle);
      }
      break;
    case 'Escape':
      suggestionsList.innerHTML = '';
      selectedSuggestionIndex = -1;
      break;
  }
});

input.addEventListener('blur', () => {
  setTimeout(() => {
    suggestionsList.innerHTML = '';
    selectedSuggestionIndex = -1;
  }, 200);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = input.value.trim();
  if (q) searchMovies(API_KEY, q, resultsContainer, watchlist, saveWatchlist, fetchMovieDetails);
});

if (watchlistContainer) {
  renderWatchlist(watchlistContainer, watchlist, saveWatchlist);
}
