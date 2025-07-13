const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

const params = new URLSearchParams(window.location.search);
const imdbID = params.get('id');

const titleHeading = document.querySelector('#movie-details h2');
const detailLeft   = document.getElementById('detail-left');
const detailRight  = document.getElementById('detail-right');

import placeholderImg from '/images/placeholder.png'; // Necessary due to Vite for placeholder image

if (!imdbID) {
  titleHeading.textContent = 'Movie not found';
  detailRight.innerHTML = '<p>No movie ID was provided in the URL.</p>';
} else {
  loadMovieDetails(imdbID);
}

async function loadMovieDetails(id) {
  try {
    const res  = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}&plot=full`);
    const data = await res.json();

    if (data.Response === 'False') {
      titleHeading.textContent = 'Movie not found';
      detailRight.innerHTML = `<p>${data.Error}</p>`;
      return;
    }

    titleHeading.textContent = data.Title;

    detailLeft.innerHTML = `
      <img
        src="${data.Poster !== 'N/A' ? data.Poster : placeholderImg}"
        alt="Poster for ${data.Title}"
        onerror="this.onerror=null;this.src=${placeholderImg};"
      />
    `;

    detailRight.innerHTML = `
      <p><strong>Year:</strong> ${data.Year}</p>
      <p><strong>Rated:</strong> ${data.Rated}</p>
      <p><strong>Runtime:</strong> ${data.Runtime}</p>
      <p><strong>Genre:</strong> ${data.Genre}</p>
      <p><strong>Director:</strong> ${data.Director}</p>
      <p><strong>Writer:</strong> ${data.Writer}</p>
      <p><strong>Actors:</strong> ${data.Actors}</p>
      <p><strong>Plot:</strong> ${data.Plot}</p>
      <p><strong>IMDb Rating:</strong> ${data.imdbRating}</p>
    `;
  } catch (err) {
    titleHeading.textContent = 'Error';
    detailRight.innerHTML = `<p>There was a problem fetching the movie details.</p>`;
  }
}
