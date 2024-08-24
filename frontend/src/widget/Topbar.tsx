// Copyright © 2024 Navarrotech

import { Link } from "react-router-dom"

export function Topbar(){
  return <nav className="navbar">
    <div className="navbar-brand">
      <div className="navbar-item">
        {/* <img src="" /> */}
        <strong>Navarro Banking</strong>
      </div>
  
      <div role="button" className="navbar-burger">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </div>
  
    </div>
  
    <div className="navbar-menu">
      <div className="navbar-start">
  
        <Link to="/" className="navbar-item">
          Dashboard
        </Link>
        <Link to="/rules" className="navbar-item">
          Rules
        </Link>
        <Link to="/tags" className="navbar-item">
          Tags
        </Link>
        <Link to="/dashboard" className="navbar-item">
          Year To Date
        </Link>
  
  
        {/* <div className="navbar-end">
          <div className="navbar-item">
  
          </div>
        </div> */}
      </div>
    </div>
  </nav>
}
