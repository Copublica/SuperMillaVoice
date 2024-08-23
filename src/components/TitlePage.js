import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const TitlePage = () => {
    console.log("welcome to title page");

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const link = document.getElementById("LoginLink");
            if (link) {
                link.click(); // Programmatically click the link after 3.5 seconds
            }
        }, 3500);

        return () => clearTimeout(timeoutId); // Clear timeout on component unmount
    }, []);

    return (
        <div className="container rounded fade-in" id="TitlePage">
            <div className="content">
                <p>
                    “Creating a world where technology is a catalyst for human potential, not a replacement”
                </p>
                <Link id="LoginLink" to="/LoginPage"></Link>
            </div>
        </div>
    );
};

export default TitlePage;
