import { Link } from "react-router-dom";
import "../../Css/base/header.css";
import userAuthStore from "../../store/auth";
import { useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdMenuBook,
  MdAddCircle,
  MdRateReview,
  MdQuestionAnswer,
  MdPeople,
  MdAttachMoney,
  MdQuiz,
  MdSettings,
  MdSchool,
  MdFavorite,
  MdSearch,
  MdLogin,
  MdPersonAdd,
  MdShoppingCart,
  MdContactMail,
  MdInfo,
  MdPerson,
} from "react-icons/md";

import { useState } from "react";

const Header = () => {
  const [search, setSearch] = useState("");
  const isLoggedIn = userAuthStore((state) => state.isLoggedIn);
  const navigate = useNavigate();
  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <>
      <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand text-light fw-normal" to="/">
            My Website
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center" to="#">
                  <MdContactMail className="me-1" />
                  Contact Us
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center" to="#">
                  <MdInfo className="me-1" />
                  About Us
                </Link>
              </li>

              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  to="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <MdSchool className="me-1" />
                  Instructor
                </Link>

                <ul className="dropdown-menu dropdown-menu-start">
                  <li>
                    <Link className="dropdown-item" to="#">
                      <MdDashboard className="me-2" />
                      Dashboard
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="#">
                      <MdMenuBook className="me-2" />
                      My Courses
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="#">
                      <MdAddCircle className="me-2" />
                      Create Course
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="#">
                      <MdRateReview className="me-2" />
                      Reviews
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="#">
                      <MdQuestionAnswer className="me-2" />
                      Q/A
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="#">
                      <MdPeople className="me-2" />
                      Students
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="#">
                      <MdAttachMoney className="me-2" />
                      Earning
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="#">
                      <MdQuiz className="me-2" />
                      Quiz
                      <span className="badge bg-primary ms-2">2</span>
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="#">
                      <MdSettings className="me-2" />
                      Settings & Profile
                    </Link>
                  </li>
                </ul>
              </li>

              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  to="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <MdPerson className="me-1" />
                  Student
                </Link>

                <ul className="dropdown-menu dropdown-menu-start">
                  <li>
                    <Link className="dropdown-item" to="#">
                      <MdDashboard className="me-2" />
                      Dashboard
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="#">
                      <MdSchool className="me-2" />
                      My Courses
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="#">
                      <MdQuiz className="me-2" />
                      Quiz
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="#">
                      <MdFavorite className="me-2" />
                      Wishlist
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="#">
                      <MdQuestionAnswer className="me-2" />
                      Q/A
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="#">
                      <MdSettings className="me-2" />
                      Profile & Settings
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>

            <form className="d-flex me-2" role="search" onSubmit={handleSearch}>
              <input
                className="form-control me-2"
                type="search"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button
                className="btn btn-outline-success d-flex align-items-center"
                type="submit"
              >
                <MdSearch className="me-1" />
                Search
              </button>
            </form>

            <div className="extra-button d-flex gap-2">
              {isLoggedIn ? (
                <>
                  <button
                    className="btn btn-danger d-flex align-items-center"
                    onClick={() => navigate("/logout")}
                  >
                    <MdLogin className="me-1" />
                    Logout
                  </button>

                  <button
                    className="btn btn-success d-flex align-items-center"
                    onClick={() => navigate("/cart")}
                  >
                    <MdShoppingCart className="me-1" />
                    Cart
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-primary d-flex align-items-center"
                    onClick={() => navigate("/login")}
                  >
                    <MdLogin className="me-1" />
                    Login
                  </button>

                  <button
                    className="btn btn-primary d-flex align-items-center"
                    onClick={() => navigate("/register")}
                  >
                    <MdPersonAdd className="me-1" />
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
