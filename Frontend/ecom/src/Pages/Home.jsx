import "../Css/pages/home.css";
import { FaHeart, FaCartPlus, FaLongArrowAltRight } from "react-icons/fa";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import apiInstance from "../utils/axios";
import Pagewrapper from "./Pagewrapper";
import RaterModule from "react-rater";
import "react-rater/lib/react-rater.css";
import getCartId from "../utils/cart_plugins/generateCartId";
import getUserCountry from "../utils/cart_plugins/getUserCountry";
import userId from "../utils/cart_plugins/getUserId";
import useAxios from "../utils/useAxios";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CartCountCreater } from "../utils/cart_plugins/UseCartCount";

const Rater = RaterModule.default ?? RaterModule;

const Home = () => {
  const { setCartCount } = useContext(CartCountCreater);
  const { userCountry } = getUserCountry();
  const [course, setCourse] = useState([]);
  const navigate = useNavigate();

  const fetchCourse = async () => {
    try {
      const res = await apiInstance.get("/course/course-list/");
      setCourse(res.data);
      console.log(res.data);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  const createCart = async (courseId, userId, price, countryName, cartId) => {
    const form = new FormData();
    form.append("course_id", courseId);
    form.append("user_id", userId);
    form.append("price", price);
    form.append("country_name", countryName);
    form.append("cart_id", cartId);

    try {
      const axiosInstance = await useAxios();
      const response = await axiosInstance.post("/course/cart/", form);
      console.log(response.data);
      await fetchCount();
      toast.success("Item successfully added to cart");
    } catch (error) {
      toast.error("Something went wrong !!!!");
      console.log(error);
    }
  };

  const fetchCount = async () => {
    try {
      const response = await apiInstance.get(`course/cart-list/${getCartId()}`);
      setCartCount(response?.data?.length);
      console.log("cart-count", response.data.length);
    } catch (error) {
      setCartCount(0);
      console.log(error?.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchCount();
  }, []);

  return (
    <Pagewrapper>
      <div className="container" style={{ marginTop: "70px" }}>
        {/* Hero Section */}
        <div className="hero-section mb-4">
          <div className="row align-items-center g-4">
            <div className="col-12 col-md-6">
              <div className="hero-content p-3 p-md-4">
                <span className="d-inline-block mb-2">
                  Most trusted educational platform
                </span>
                <h2 className="display-5 display-md-3 fw-bolder mb-3">
                  Grow your skills and advance career
                </h2>
                <p className="mb-4">
                  Start, switch or advance your career with more than 5,000
                  courses. Professional certificate, and degrees from world-class
                  universities and companies
                </p>
                <div className="hero-button d-flex flex-column flex-sm-row gap-3">
                  <button className="btn btn-primary fs-5 fs-md-3 fw-medium">
                    Join Free Now +
                  </button>
                  <button className="btn btn-outline-success fs-5 fs-md-3 fw-medium">
                    Watch demo <i className="fas fa-video ms-1"></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="hero-tumbnail"></div>
            </div>
          </div>
        </div>

        <hr className="my-4" />

        {/* Stats Banner */}
        <div className="courses-banner py-3">
          <div className="row g-3">
            <div className="col-6 col-md-3 d-flex flex-column text-center">
              <span className="fs-5 fs-md-4 fw-medium">316,000 +</span>
              <small>Qualified Instructor</small>
            </div>
            <div className="col-6 col-md-3 d-flex flex-column text-center">
              <span className="fs-5 fs-md-4 fw-medium">316,000 +</span>
              <small>Qualified Instructor</small>
            </div>
            <div className="col-6 col-md-3 d-flex flex-column text-center">
              <span className="fs-5 fs-md-4 fw-medium">316,000 +</span>
              <small>Qualified Instructor</small>
            </div>
            <div className="col-6 col-md-3 d-flex flex-column text-center">
              <span className="fs-5 fs-md-4 fw-medium">316,000 +</span>
              <small>Qualified Instructor</small>
            </div>
          </div>
        </div>

        {/* Most Popular Courses */}
        <div className="most-popurlar-course">
          <h1 className="heading text-center mt-5 mb-3">
            🔥 Most Popular Courses
          </h1>
          <p className="text-center mb-5 px-2">
            These are the most popular courses among Geeks Courses Learners
            Worldwide in year 2022
          </p>

          <div className="courses-card-list mb-5">
            <div className="row g-4">
              {course.map((item, index) => {
                return (
                  <div
                    className="col-12 col-sm-6 col-md-4 col-lg-3"
                    key={item.id ?? item.course_id ?? index}
                  >
                    <div className="card h-100">
                      <div className="card-img-top">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-100"
                          style={{
                            height: "200px",
                            objectFit: "cover",
                            padding: "10px",
                            borderRadius: "15px",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            navigate(`course-detail/${item.slug}`)
                          }
                        />
                      </div>

                      <div className="extra-info d-flex justify-content-between align-items-center px-3 mb-2">
                        <div className="d-flex gap-1 flex-wrap">
                          <div className="badge bg-info">{item.level}</div>
                          <div className="badge bg-success">
                            {item.language}
                          </div>
                        </div>
                        <div className="heart text-danger">
                          <FaHeart className="fs-5" />
                        </div>
                      </div>

                      <div className="card-body p-3 p-md-4 d-flex flex-column">
                        <div className="card-title fw-medium mb-2">
                          {item.title?.length <= 30
                            ? item.title
                            : item.title?.slice(0, 30) + "..."}
                        </div>
                        <div className="card-subtitle mb-1">
                          By : {item.teacher?.full_name ?? "Unknown instructor"}
                        </div>
                        <small className="mb-2">
                          {item.student?.length || "No"} student
                        </small>

                        <div className="rating my-2 d-flex align-items-center gap-2 flex-wrap">
                          <Rater total={5} rating={item.average_rating || 0} />
                          <span style={{ color: "gold" }}>
                            {item.average_rating || 0}.0
                          </span>
                          <span className="small">
                            ({item.rating_count || 0} Review)
                          </span>
                        </div>
                      </div>

                      <div className="card-footer d-flex flex-wrap justify-content-between align-items-center gap-2 p-3">
                        <span className="fs-5 fs-md-4 fw-medium">
                          Rs {item.price}
                        </span>

                        <div className="d-flex align-items-center gap-2">
                          <div
                            onClick={() =>
                              createCart(
                                item.course_id,
                                userId(),
                                item.price,
                                userCountry,
                                getCartId()
                              )
                            }
                            className="btn btn-primary cart-icon"
                            style={{ cursor: "pointer" }}
                          >
                            <FaCartPlus />
                          </div>
                          <button className="btn btn-sm btn-primary">
                            Enroll Now <FaLongArrowAltRight />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Pagewrapper>
  );
};

export default Home;