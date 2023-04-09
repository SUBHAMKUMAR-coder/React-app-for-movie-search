import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_KEY = '';
const API_URL = 'http://www.omdbapi.com/';
function App() {
  const [query, setQuery] = useState("attack");
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [genres, setGenres] = useState(["Action",
  "Adventure",
  "Animation",
  "Biography",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Film Noir",
  "History",
  "Horror",
  "Music",
  "Musical",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Short",
  "Sport",
  "Superhero",
  "Thriller",
  "War",
  "Western"]);
  const [selectedGenre, setSelectedGenre] = useState('');

  // Fetch genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      const response = await axios.get(
        `${API_URL}?apikey=${API_KEY}&s=${query}&type=movie`
      );
      console.log(response)
      const movies = response.data.Search;
      // const genreList = movies.reduce((acc, movie) => {
      //   console.log(acc, movie)
      //   const movieGenres = movie.Genre.split(', ');
      //   movieGenres.forEach((genre) => {
      //     if (!acc.includes(genre)) {
      //       acc.push(genre);
      //     }
      //   });
      //   return acc;
      // }, []);
    };
    fetchGenres();
  }, []);

  // Fetch movies on search or page change
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);

      // Check if the data is already cached
      const cacheKey = `movies-${query}-${currentPage}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const { movies, totalPages } = JSON.parse(cachedData);
        setMovies(movies);
        setTotalPages(totalPages);
        setIsLoading(false);
        return;
      }

      // Fetch data from API
      const response = await axios.get(
        `${API_URL}?apikey=${API_KEY}&s=${query}&type=movie&page=${currentPage}`
      );
      let newMovies=[]
      if(response.data.Response==='True'){
        console.log(response.data);
        setTotalPages(Math.ceil(response.data.totalResults / 10));
        const tempMovies=response.data.Search;
        await Promise.all(tempMovies.map(async (movie)=>{
          const movieResponse = await axios.get(`${API_URL}?apikey=${API_KEY}&i=${movie.imdbID}`);
          console.log(movieResponse)
          newMovies.push(movieResponse.data);
        }))

        // Cache the fetched data
        const dataToCache = { movies: newMovies, totalPages };
        localStorage.setItem(cacheKey, JSON.stringify(dataToCache));

        setMovies(newMovies)
      }
      else{
        setMovies([]);
        setTotalPages(Math.ceil(0 / 10));
      }
      setIsLoading(false);
    };
    fetchMovies();
  }, [query, currentPage]);

  const handleOnPosterClick=async (title)=>{
    const response = await axios.get(
      `${API_URL}?apikey=${API_KEY}&t=${title}&type=movie`
    );
    console.log(response)
  }
  // Handle search input change
  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle movie selection
  const handleMovieSelect = async (imdbID) => {
    const response = await axios.get(`${API_URL}?apikey=${API_KEY}&i=${imdbID}`);
    setSelectedMovie(response.data);
  };

  // Handle genre selection
  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    //setQuery('');
  //  setCurrentPage(1);
  };

  // Filter movies by selected genre
  const filteredMovies = selectedGenre
    ? movies.filter((movie) =>{
      console.log(movie); 
      const movieGenres = movie.Genre.split(', ');
      if(movieGenres.includes(selectedGenre)) return movie
    })
    : movies;

  return (
    <div className="App">
      <header>
        <h1>Movie Search App</h1>
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search for a movie"
            value={query}
            onChange={handleInputChange}
          />
          <button type="submit">Search</button>
        </form>
      </header>
      <main>
        <aside>
          <h2>Genres</h2>
          <ul>
            <li className={!selectedGenre ? 'selected' : ''} onClick={() => handleGenreSelect('')}>
              All
            </li>
            {genres.map((genre) => (
              <li
                key={genre}
                className={selectedGenre === genre ? 'selected' : ''}
                onClick={() => handleGenreSelect(genre)}
                >
                {genre}
              </li>
            ))}
          </ul>
        </aside>
        <section>
        {isLoading && <p>Loading...</p>}
        {!isLoading && (
        <>
          <p>Showing {filteredMovies.length} of {totalPages * 10} results</p>
          <div className="movie-list">
            {filteredMovies.map((movie) => (
            <div key={movie.imdbID} className="movie-card" onClick={() => handleMovieSelect(movie.imdbID)}>
              <img src={movie.Poster} alt={movie.Title} onClick={()=>{
                handleOnPosterClick(movie.Title)
              }}/>
              <p>{movie.Title}</p>
            </div>
            ))}
            </div>
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              className={currentPage === pageNumber ? 'selected' : ''}
              onClick={() => handlePageChange(pageNumber)}
              >
              {pageNumber}
            </button>
            ))}
          </div>
        </>
        )}
        </section>
        <aside>
        {selectedMovie && (
          <>
            <h2>{selectedMovie.Title}</h2>
            <img src={selectedMovie.Poster} alt={selectedMovie.Title} />
            <p>{selectedMovie.Plot}</p>
            <p>Released: {selectedMovie.Year}</p>
            <p>Runtime: {selectedMovie.Runtime}</p>
          </>
        )}
        </aside>
      </main>
    </div>
  );
 /* return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );*/
}

export default App;