
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="container py-8 text-center">
      <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-4">The page you are looking for doesn't exist.</p>
      <Link to="/" className="text-primary hover:underline">
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
