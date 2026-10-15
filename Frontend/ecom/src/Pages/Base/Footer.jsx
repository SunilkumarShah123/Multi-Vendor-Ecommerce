import "../../Css/base/footer.css";
import {
  FaFacebook,
  FaGithub,
  FaXTwitter,
} from "react-icons/fa6";

const Footer = () => {
  return (
    <>
      <div className="footer text-white">
        <div className="container-fluid mt-5 py-4">
          <div className="row g-4">
            {/* Brand / About */}
            <div className="col-12 col-md-5 col-lg-4 info">
              <h1 className="h3 mb-3">Sunil Kumar Shah</h1>
              <p className="mb-3">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                Eligendi ex veritatis ipsa harum, ullam delectus?
              </p>
              <div className="icons d-flex gap-3 fs-4">
                <FaFacebook />
                <FaXTwitter />
                <FaGithub />
              </div>
            </div>

            {/* Company */}
            <div className="col-6 col-md-2 col-lg-2">
              <h1 className="h5 mb-3">Company</h1>
              <ul className="list-unstyled text-capitalize">
                <li className="mb-2">About</li>
                <li className="mb-2">Pricing</li>
                <li className="mb-2">Blog</li>
                <li className="mb-2">Careers</li>
                <li className="mb-2">Contact</li>
              </ul>
            </div>

            {/* Support */}
            <div className="col-6 col-md-2 col-lg-2">
              <h1 className="h5 mb-3">Support</h1>
              <ul className="list-unstyled text-capitalize">
                <li className="mb-2">About</li>
                <li className="mb-2">Pricing</li>
                <li className="mb-2">Blog</li>
                <li className="mb-2">Careers</li>
                <li className="mb-2">Contact</li>
              </ul>
            </div>

            {/* Get in Touch */}
            <div className="col-12 col-md-3 col-lg-4">
              <h1 className="h5 mb-3">Get in touch</h1>
              <ul className="list-unstyled">
                <li className="mb-2">Pepsicola-32, Kathmandu</li>
                <li className="mb-2">
                  Email:{" "}
                  <a href="mailto:sunilkumarshah@gmail.com">
                    sunilkumarshah@gmail.com
                  </a>
                </li>
                <li className="mb-2">
                  Phone: <a href="tel:+977980000000">980000000</a>
                </li>
              </ul>
            </div>
          </div>

          <hr className="hr my-4" />

          <div className="text-center pb-2">
            Sunil Kumar Shah @Copyright 2026
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;