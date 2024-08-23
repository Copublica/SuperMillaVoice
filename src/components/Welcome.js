import React from "react";
import { Link } from "react-router-dom";
function Welcome(){
    return(
        <>
         <div className="welcomeScreen-container" id="Welcome">
        <div className="welcomeScreen">

            <div id="carouselExampleIndicators" className=" carousel slide" data-bs-ride="carousel">
                
                <div className="carousel-inner ">
                  <div className="carousel-item active"> 
                    <div className="carousel-img">
                      <img src="assets/images/wlcm1.png" className="d-block w-100 overflow-hidden" alt="..."/>
                    </div>
                    <h2>Future is here 
                        with SuperMilla</h2>
                  </div>
                  <div className="carousel-item">
                    <div className="carousel-img">
                      <img src="assets/images/wlcm2.png" className="d-block w-100 overflow-hidden" alt="..."/>
                    </div>
                    <h2>Blend of knowledge, wit, and charm!</h2>

                  </div>
                  <div className="carousel-item">
                    <div className="carousel-img">
                      <img src="assets/images/wlcm3.png" className="d-block w-100 overflow-hidden" alt="..."/>
                    </div>
                    <h2>AI that truly understands you!</h2>
                  </div>
                </div>
                <div className="carousel-indicators">
                    <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active aio" aria-current="true" aria-label="Slide 1"></button>
                    <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" className="aio" aria-label="Slide 2"></button>
                    <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2" className="aio" aria-label="Slide 3"></button>
                  </div>
            </div>
            <div className="content btn-welcome">
            <Link to="/MainPage">
          <button className="proceed-btn">
              <i className='fas fa-angle-right'></i></button></Link>
            </div>
        </div>
    </div>
   
        </>
    )

}
export default Welcome;