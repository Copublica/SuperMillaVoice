import React from 'react';
import { Link } from 'react-router-dom';

function MaintenancePage() {
  return (
    <>
      <div className="container text-center px-4" id="maintenance-page">
        <img src="assets/images/maintaince.png" id="maintenanceImg" alt="Maintenance Break" />
        <p className="title-text text-center font-weight-bold text-secondary">
          <span className="text-dark">Milla is getting her nails done!</span>
        </p>
        <p className="text-center text-dark mb-3">Sorry for the inconvenience, but we're performing some maintenance at the moment. We'll be back online shortly!</p>
        <p className="text-center text-dark mb-3">Thank you for your patience.</p>
        {/* <div className="form-group">
          <Link to="/" className="btn-login btn btn-primary  border-0">Return to Home</Link>
        </div> */}
      </div>
    </>
  );
}

export default MaintenancePage;
