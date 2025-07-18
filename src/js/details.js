import { placeholderImage } from './utils.js';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

const params = new URLSearchParams(window.location.search);
const imdbID = params.get('id');

const titleHeading = document.querySelector('#movie-details h2');
const detailLeft = document.getElementById('detail-left');
const detailRight = document.getElementById('detail-right');

if (!imdbID) {
  titleHeading.textContent = 'Movie not found';
  detailRight.innerHTML = '<p>No movie ID was provided in the URL.</p>';
} else {
  loadMovieDetails(imdbID);
}

async function loadMovieDetails(id) {
  try {
    const title = document.getElementById("details-title");

    // Fetch data from API for movie details based on ID
    const res = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}&plot=full`
    );
    const data = await res.json();

    if (data.Response === 'False') {
      title.textContent = 'Movie not found';
      detailRight.innerHTML = `<p>${data.Error}</p>`;
      return;
    }

    title.textContent = data.Title;

    detailLeft.innerHTML = `
      <img id="details-img"
        src="${data.Poster !== 'N/A' ? data.Poster : placeholderImage}"
        alt="Poster for ${data.Title}"
        onerror="this.onerror=null;this.src='${placeholderImage}';"
      />
    `;

    detailRight.innerHTML = `
      <p>${data.Plot}</p>
      <p><strong>${data.Year} | ${data.Rated} | ${data.Runtime}</strong></p>
      <p><strong>Genre:</strong> ${data.Genre}</p>
      <p><strong>Director:</strong> ${data.Director}</p>
      <p><strong>Writer:</strong> ${data.Writer}</p>
      <p><strong>Actors:</strong> ${data.Actors}</p>
      <p><strong>IMDb Rating:</strong> ${data.imdbRating}</p>
    `;
  } catch {
    titleHeading.textContent = 'Error';
    detailRight.innerHTML = `<p>There was a problem fetching the movie details.<br>Please reload the page and try again.</p>`;
  }
}
