import React from "react";
import "../../Css/base/footer.css";
import {
  FaFacebook,
  FaSquareTwitter,
  FaGithub,
  FaXTwitter,
} from "react-icons/fa6";
const Footer = () => {
  return (
    <>
      <div className="footer text-white">
        <div className="container-fluid mt-5 ">
          <div className="row">
            <div className="col-md-5 info">
              <h1>Sunil Kumar Shah</h1>
              <p>
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                Eligendi ex veritatis ipsa harum, ullam delectus?
              </p>
              <div className="icons d-flex gap-2">
                <FaFacebook />
                <FaXTwitter />
                <FaGithub />
              </div>
            </div>
            <div className="col-md-2">
              <h1>Company</h1>
              <ul className="list-unstyled text-capitalize">
                <li>About</li>
                <li>pricing</li>
                <li>blog</li>
                <li>careers</li>
                <li>contact</li>
              </ul>
            </div>
            <div className="col-md-2">
              <h1>Support</h1>
              <ul className="list-unstyled text-capitalize">
                <li>About</li>
                <li>pricing</li>
                <li>blog</li>
                <li>careers</li>
                <li>contact</li>
              </ul>
            </div>
            <div className="col-md-3">
              <h1>Get in touch</h1>
              <ul className="list-unstyled text-capitalize">
                <li>Pepsicola-32,Kathmandu</li>
                <li>
                  Email:{" "}
                  <a href="mailto:sunilkumarshah@gmail.com">
                    sunilkumarshah@gmail.com
                  </a>
                </li>

                <li>
                  Phone: <a href="tel:+977980000000">980000000</a>
                </li>
              </ul>
            </div>
          </div>
          <hr className="hr" />
          <div className="text-center mb-2">
            Sunil Kumar Shah @Copyright 2026
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
