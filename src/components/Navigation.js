import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-brand">
        حل المسائل الرياضية
      </div>
      <ul className="nav-links">
        <li>
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            <i className="fas fa-keyboard"></i>
            كتابة
          </Link>
        </li>
        <li>
          <Link 
            to="/scan" 
            className={location.pathname === '/scan' ? 'active' : ''}
          >
            <i className="fas fa-camera"></i>
            مسح ضوئي
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
