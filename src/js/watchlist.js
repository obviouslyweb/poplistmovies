import {
  watchlist,
  saveWatchlist,
  renderWatchlist,
} from './utils.js';

const watchlistContainer = document.getElementById('watchlist-container');

renderWatchlist(watchlistContainer, watchlist, saveWatchlist);