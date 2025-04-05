// Add student information dynamically
document.addEventListener('DOMContentLoaded', function() {

    const studentId = "200592535"; 
    const studentName = "Chainpreet Singh";
    
    // Add student info to the page
    document.getElementById('student-info').textContent = `Student ID: ${studentId} | Name: ${studentName}`;
    
    // Set up event listeners
    setupEventListeners();
});

// API Configuration
const API_KEY = 'ea6c0c735aa3dd66ab07511dcda408d4'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
const POSTER_SIZE = 'w500';
const BACKDROP_SIZE = 'original';

function setupEventListeners() {
    // Add click event for search button
    document.getElementById('search-btn').addEventListener('click', function() {
        const movieTitle = document.getElementById('movie-input').value.trim();
        if (movieTitle) {
            searchMovies(movieTitle);
        } else {
            showError("Please enter a movie title");
        }
    });
    
    // Add event listener for Enter key in input field
    document.getElementById('movie-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            const movieTitle = document.getElementById('movie-input').value.trim();
            if (movieTitle) {
                searchMovies(movieTitle);
            } else {
                showError("Please enter a movie title");
            }
        }
    });
}

async function searchMovies(query) {
    try {
        // Show loading state
        document.getElementById('movie-results').innerHTML = '<p class="loading">Searching for movies...</p>';
        
        // Hide movie details section if visible
        document.getElementById('movie-details').classList.add('hidden');
        
        // Build the search URL
        const searchUrl = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`;
        
        // Fetch data from API
        const response = await fetch(searchUrl);
        
        // Check if response is successful
        if (!response.ok) {
            throw new Error(`API error (${response.status})`);
        }
        
        // Parse JSON response
        const data = await response.json();
        
        // Display search results
        displayMovieResults(data.results);
        
    } catch (error) {
        // Display error message
        showError(error.message);
    }
}

function displayMovieResults(movies) {
    const resultsContainer = document.getElementById('movie-results');
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    // Check if movies were found
    if (movies.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No movies found. Try another search.</p>';
        return;
    }
    
    // Create title for results
    const resultsTitle = document.createElement('h3');
    resultsTitle.textContent = 'Search Results';
    resultsContainer.appendChild(resultsTitle);
    
    // Create movie grid
    const movieGrid = document.createElement('div');
    movieGrid.className = 'movie-grid';
    
    // Add each movie to the grid
    movies.slice(0, 12).forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        
        // Create poster image
        const posterPath = movie.poster_path 
            ? `${IMAGE_BASE_URL}${POSTER_SIZE}${movie.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Poster+Available';
        
        movieCard.innerHTML = `
            <img src="${posterPath}" alt="${movie.title}" class="movie-poster">
            <div class="movie-info">
                <h4>${movie.title}</h4>
                <p>${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
            </div>
        `;
        
        // Add click event to show movie details
        movieCard.addEventListener('click', () => {
            getMovieDetails(movie.id);
        });
        
        movieGrid.appendChild(movieCard);
    });
    
    resultsContainer.appendChild(movieGrid);
}

async function getMovieDetails(movieId) {
    try {
        // Show loading state in the details section
        const detailsSection = document.getElementById('movie-details');
        detailsSection.innerHTML = '<p class="loading">Loading movie details...</p>';
        detailsSection.classList.remove('hidden');
        
        // Scroll to details section
        detailsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Build the movie details URL
        const detailsUrl = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=credits,videos`;
        
        // Fetch data from API
        const response = await fetch(detailsUrl);
        
        // Check if response is successful
        if (!response.ok) {
            throw new Error(`API error (${response.status})`);
        }
        
        // Parse JSON response
        const movie = await response.json();
        
        // Display movie details
        displayMovieDetails(movie);
        
    } catch (error) {
        // Display error message
        document.getElementById('movie-details').innerHTML = `
            <div class="error-container">
                <p class="error-message">${error.message}</p>
                <p>Unable to load movie details. Please try again.</p>
            </div>
        `;
    }
}

function displayMovieDetails(movie) {
    const detailsSection = document.getElementById('movie-details');
    
    // Format budget and revenue
    const formatCurrency = (amount) => {
        if (amount === 0) return 'N/A';
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount);
    };
    
    // Get backdrop image
    const backdropPath = movie.backdrop_path 
        ? `${IMAGE_BASE_URL}${BACKDROP_SIZE}${movie.backdrop_path}`
        : null;
    
    // Get poster image
    const posterPath = movie.poster_path 
        ? `${IMAGE_BASE_URL}${POSTER_SIZE}${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Poster+Available';
    
    // Get director
    const director = movie.credits?.crew.find(person => person.job === 'Director');
    
    // Get top cast
    const topCast = movie.credits?.cast.slice(0, 5).map(actor => actor.name).join(', ');
    
    // Get trailer
    const trailer = movie.videos?.results.find(video => 
        video.type === 'Trailer' && video.site === 'YouTube'
    );
    
    // Create HTML for movie details
    let detailsHTML = `
        ${backdropPath ? `<div class="backdrop" style="background-image: url(${backdropPath})"></div>` : ''}
        <div class="movie-details-content">
            <div class="movie-details-header">
                <img src="${posterPath}" alt="${movie.title}" class="detail-poster">
                <div class="movie-details-info">
                    <h2>${movie.title} ${movie.release_date ? `(${new Date(movie.release_date).getFullYear()})` : ''}</h2>
                    
                    <div class="movie-meta">
                        <span class="release-date">${movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'Release date unknown'}</span>
                        <span class="runtime">${movie.runtime ? `${movie.runtime} minutes` : 'Runtime unknown'}</span>
                    </div>
                    
                    <div class="genres">
                        ${movie.genres.map(genre => `<span class="genre">${genre.name}</span>`).join('')}
                    </div>
                    
                    <div class="rating">
                        <span class="star">★</span>
                        <span class="vote-average">${movie.vote_average.toFixed(1)}/10</span>
                        <span class="vote-count">(${movie.vote_count} votes)</span>
                    </div>
                    
                    <div class="tagline">${movie.tagline || ''}</div>
                </div>
            </div>
            
            <div class="movie-details-body">
                <h3>Overview</h3>
                <p class="overview">${movie.overview || 'No overview available.'}</p>
                
                <div class="movie-details-grid">
                    <div class="detail-item">
                        <h4>Status</h4>
                        <p>${movie.status || 'Unknown'}</p>
                    </div>
                    
                    <div class="detail-item">
                        <h4>Budget</h4>
                        <p>${formatCurrency(movie.budget)}</p>
                    </div>
                    
                    <div class="detail-item">
                        <h4>Revenue</h4>
                        <p>${formatCurrency(movie.revenue)}</p>
                    </div>
                    
                    <div class="detail-item">
                        <h4>Original Language</h4>
                        <p>${movie.original_language?.toUpperCase() || 'Unknown'}</p>
                    </div>
                </div>
                
                <div class="credits">
                    ${director ? `<div class="credit-item"><h4>Director</h4><p>${director.name}</p></div>` : ''}
                    ${topCast ? `<div class="credit-item"><h4>Cast</h4><p>${topCast}</p></div>` : ''}
                </div>
    `;
    
    // Add trailer if available
    if (trailer) {
        detailsHTML += `
            <div class="trailer-section">
                <h3>Trailer</h3>
                <div class="trailer-container">
                    <iframe
                        width="560"
                        height="315"
                        src="https://www.youtube.com/embed/${trailer.key}"
                        title="${movie.title} Trailer"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                </div>
            </div>
        `;
    }
    
    // Close divs
    detailsHTML += `
            </div>
        </div>
    `;
    
    // Update details section
    detailsSection.innerHTML = detailsHTML;
}

function showError(message) {
    // Display error message to user
    document.getElementById('movie-results').innerHTML = `
        <div class="error-container">
            <p class="error-message">${message}</p>
            <p>Please try another search.</p>
        </div>
    `;
}
