import { Link } from "react-router-dom";
import "../../Css/base/header.css";
import getCartId from "../../utils/cart_plugins/generateCartId";
import userAuthStore from "../../store/auth";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { CartCountCreater } from "../../utils/cart_plugins/UseCartCount";
import apiInstance from "../../utils/axios";
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

const Header = () => {
  const { cartCount, setCartCount } = useContext(CartCountCreater);
  const [search, setSearch] = useState("");
  const isLoggedIn = userAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      setCartCount(0);
      return;
    }

    const fetchCount = async () => {
      try {
        const response = await apiInstance.get(
          `course/cart-list/${getCartId()}`
        );
        setCartCount(response?.data?.length);
        console.log("cart-count", response.data.length);
      } catch (error) {
        setCartCount(0);
        console.log(error?.response?.data?.message || error.message);
      }
    };

    fetchCount();
  }, [isLoggedIn]);

  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();

    if (!search.trim()) {
      return;
    }

    navigate(`/search/?query=${encodeURIComponent(search.trim())}`);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          {/* Brand */}
          <Link className="navbar-brand text-light fw-normal" to="/">
            My Website
          </Link>

          {/* Toggler */}
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

          {/* Collapsible content */}
          <div className="collapse navbar-collapse" id="navbarNav">
            {/* Left Nav Links */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
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

              {/* Instructor Dropdown */}
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

              {/* Student Dropdown */}
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

            {/* Right Side: Search + Buttons */}
            <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2 mt-3 mt-lg-0">
              {/* Search Form */}
              <form
                className="d-flex flex-grow-1"
                role="search"
                onSubmit={handleSearch}
                style={{ minWidth: "200px" }}
              >
                <input
                  style={{ backgroundColor: "black", color: "white" }}
                  className="form-control me-2 search-input"
                  type="search"
                  placeholder="Search Courses"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  className="btn btn-outline-success d-flex align-items-center flex-shrink-0"
                  type="submit"
                >
                  <MdSearch className="me-1" />
                  Search
                </button>
              </form>

              {/* Auth / Cart Buttons */}
              <div className="d-flex flex-wrap gap-2 justify-content-start justify-content-lg-end">
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
                      <span className="badge text-info ms-1">{cartCount}</span>
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
        </div>
      </nav>
    </>
  );
};

export default Header;