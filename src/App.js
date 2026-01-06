import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

import MoviesList from './components/MoviesList';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [openingTextInput, setOpeningTextInput] = useState('');
  const [releaseDateInput, setReleaseDateInput] = useState('');
  const retryTimeoutRef = useRef(null);
  const isCancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const attemptFetch = useCallback(async () => {
    try {
      const response = await fetch('https://swapi.py4e.com/api/films/');
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      const data = await response.json();

      const transformedMovies = data.results.map((movieData) => {
        return {
          id: movieData.episode_id,
          title: movieData.title,
          openingText: movieData.opening_crawl,
          releaseDate: movieData.release_date,
        };
      });
      setMovies(transformedMovies);
      setIsRetrying(false);
      setErrorMessage('');
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      setErrorMessage('Something went wrong ....Retrying');
      setIsRetrying(true);

      if (!isCancelledRef.current) {
        retryTimeoutRef.current = setTimeout(() => {
          if (!isCancelledRef.current) {
            attemptFetch();
          }
        }, 5000);
      }
    }
  }, []);

  const fetchMoviesHandler = useCallback(() => {
    // start or restart attempts
    isCancelledRef.current = false;
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    setErrorMessage('');
    setIsRetrying(false);
    attemptFetch();
  }, [attemptFetch]);

  const cancelRetry = useCallback(() => {
    isCancelledRef.current = true;
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    setIsRetrying(false);
    setErrorMessage('Retrying cancelled');
  }, []);

  // auto-fetch on mount
  useEffect(() => {
    fetchMoviesHandler();
  }, [fetchMoviesHandler]);

  const moviesMemo = useMemo(() => movies, [movies]);

  function addMovieHandler(e) {
    e.preventDefault && e.preventDefault();
    const newMovie = {
      title: titleInput,
      openingText: openingTextInput,
      releaseDate: releaseDateInput,
    };
    console.log(newMovie);
  }

  return (
    <React.Fragment>
      <section>
        <form onSubmit={addMovieHandler} style={{ padding: '1rem', background: 'transparent' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontWeight: 700 }}>Title</label>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px' }}
            />
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontWeight: 700 }}>Opening Text</label>
            <textarea
              value={openingTextInput}
              onChange={(e) => setOpeningTextInput(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px' }}
            />
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontWeight: 700 }}>Release Date</label>
            <input
              type="text"
              value={releaseDateInput}
              onChange={(e) => setReleaseDateInput(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px' }}
            />
          </div>
          <div>
            <button type="submit" style={{ background: '#3b0b6f', color: '#fff', padding: '8px 16px', borderRadius: '20px' }}>
              Add Movie
            </button>
          </div>
        </form>
      </section>

      <section>
        <button onClick={fetchMoviesHandler}>Fetch Movies</button>
        {isRetrying && (
          <button onClick={cancelRetry} style={{ marginLeft: '8px' }}>
            Cancel
          </button>
        )}
        {errorMessage && <p>{errorMessage}</p>}
      </section>
      <section>
        <MoviesList movies={moviesMemo} />
      </section>
    </React.Fragment>
  );
}

export default App;
