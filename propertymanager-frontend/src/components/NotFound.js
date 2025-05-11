import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div>
      <h2>404 - Strona nie istnieje</h2>
      <p>Przepraszamy, strona której szukasz nie została znaleziona.</p>
      <Link to="/">Wróć do strony głównej</Link>
    </div>
  );
}

export default NotFound;