import React, { useRef } from "react";
import { Link,useNavigate } from "react-router-dom";
import { Modal, Button } from 'react-bootstrap';
import './MainPage.css';


function MainPage() {

  console.log("welcome to main page");

  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  const userName = getCookie('name');
  const carouselRef = useRef(null);

  const handleLeftArrowClick = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  function deleteAllCookies() {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
  }

  
  const handleRightArrowClick = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };
  const navigate = useNavigate();

  const handleLogout = () => {
    deleteAllCookies();
    navigate('/LoginPage');
  };

 


  return (
    <div className="hero-container" id="MainPage">
      <div className="heroGreeting">
      <nav className="NavBar navbar navbar-expand-lg">
      <div className="container-fluid">
        <div className="NavBar-left navbar-brand">
          <h1>Hi {userName ? userName : 'Guest'}</h1>
        </div>
        {userName && (
          <div className="NavBar-right ml-auto d-flex align-items-center">
         
            <button className="logout-button btn btn-dark" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>



        <div className="cantainer">
            <div className="row">
                <div className="col-6 col-left">
                <Link to="/Test">
                  <div className="card card-left d-flex mt-2 myCard">
                  Social emotional learnings
                  </div>
                  </Link>
                  <Link to="/displayAids">
                  <div className="card card-right mt-2 myCard">
                  AIDS awareness
                  </div>
                  </Link>
                </div>
                <div className="col-6 col-right">
                <Link to="/displayNostress">
                  <div className="card card-right mt-2 myCard">
                  Mental health
                  </div>
                  </Link>
                  <Link to="/displayCopublica">
                  <div className="card card-left d-flex  mt-2 myCard">
                Learn about voicebots
                  </div>
                  </Link>
                </div>
                <div className="col-12">
                <Link to="/Mmc">
                  <div className="card card-right mt-2 myCard">
                  Menopause & midlife crisis
                  </div>
                  </Link>
                 
                </div>

                <div className="col-12">
                <Link to="/HeartBreak">
                  <div className="card card-right mt-2 myCard">
                  Heart Break
                  </div>
                  </Link>
                 
                </div>
            </div>
        </div>
        {/* <div className="motivational-box">
          <Link to="/displayCopublica">
            <div className="voicebot-voiebot">
          
              <p>Learn about how voicebots can help</p>
            </div>
          </Link>
        </div>
        <h4 className="mt-4">Use cases</h4>
        <div className="little-carousels" style={{ position: 'relative' }}>
          <div className="content" id="silderVoicebot" ref={carouselRef} style={{ display: 'flex', overflowX: 'scroll', scrollBehavior: 'smooth' }}>
            <Link to="/test" className="link">
              <div className="voivecard">
                <h4>Social Emotional Learning</h4>
              </div>
            </Link>
            <Link to="/displayNostress" className="link">
              <div className="voivecard">
                <h4>Stress Management</h4>
              </div>
            </Link>
            <Link to="/displayAids" className="link">
              <div className="voivecard">
                <h4>AIDS Awareness</h4>
              </div>
            </Link>
          </div>
         
        </div>
        <div className="carousel-arrows mt-2" style={{ display: 'flex', justifyContent: 'center'}}>
            <button onClick={handleLeftArrowClick} className="left-arrow">
              <i className="fas fa-angle-left"></i>
            </button>
            <button onClick={handleRightArrowClick} className="right-arrow" style={{ marginLeft: '10px' }}>
              <i className="fas fa-angle-right"></i>
            </button>
          </div> */}
        <h4 className="mt-3 faq">Frequently asked questions</h4>
        <div className="convo-history">
          <Link to="/test" className="link">
            <div className="accordion1">
              <p>What is Social Emotional Learning?</p>
            </div>
          </Link>
          <Link to="/displayNostress" className="link">
            <div className="accordion1">
              <p>I am feeling anxious. What should I do?</p>
            </div>
          </Link>
          <Link to="/displayAids" className="link">
            <div className="accordion1">
              <p>What is HIV type 2?</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
