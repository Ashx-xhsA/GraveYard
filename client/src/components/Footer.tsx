import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer id="footer">
      
      <div id="footerLinkContainer">
        <Link to="/about" className="footer-link">about</Link>
      </div>
      <div id="footerCopyright">
        © {new Date().getFullYear()} GraveYard Project
      </div>

      <p id="footerText">
        may you find eternity
      </p>

    </footer>
  );
};

export default Footer;