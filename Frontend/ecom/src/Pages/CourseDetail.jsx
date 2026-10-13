import "../Css/pages/courseDetail.css";
import Pagewrapper from "./Pagewrapper";
import { FaShareNodes } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import apiInstance from "../utils/axios";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import useAxios from "../utils/useAxios";
import { useState, useEffect } from "react";
import userId from "../utils/cart_plugins/getUserId";
import getCartId from "../utils/cart_plugins/generateCartId";
import getUserCountry from "../utils/cart_plugins/getUserCountry";
const CourseDetail = () => {
  const userCountry = getUserCountry();
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const slug_query = slug;
  const [course, setCourse] = useState({});
  const [addToCartButton, setAddToCartButton] = useState("Add To Cart");

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const response = await apiInstance.get(
        `course/course-detail/${slug_query}/`,
      );
      setCourse(response.data);

      const cartResponse = await apiInstance.get(
        `course/cart-list/${getCartId()}/`,
      );
      const courseIsInCart = cartResponse.data.some(
        (item) => item.course?.course_id === response.data.course_id,
      );
      setAddToCartButton(courseIsInCart ? "Added To Cart" : "Add To Cart");

      console.log(response.data);
    } catch (error) {
      if (error) {
        console.error(error);
        toast.error("Unable to load the course or check your cart.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [slug]);

   const createCart = async (courseId, userId, price, countryName, cartId) => {
    const form = new FormData();
    (form.append("course_id", courseId),
      form.append("user_id", userId),
      form.append("price", price),
      form.append("country_name", countryName),
      form.append("cart_id", cartId));
    try {
      setAddToCartButton("Adding To Cart");
      const axiosInstance = await useAxios();
      const response = await axiosInstance.post("/course/cart/", form);
      console.log(response.data);
      Swal.fire({
        title: "Success!",
        text: response?.data.message,
        icon: "success",
      });
      setAddToCartButton("Added To Cart");
    } catch (error) {
      toast.error("Something went wrong !!!!");
      setAddToCartButton("Add to Cart");
      console.log(error);
    }
  };
  return (
  <>
  <Pagewrapper>
    {loading ? (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    ) : (
      <>
        {course ? (
          <div className="container py-3">
            {/* Hero Section */}
            <div
              className="hero shadow-sm rounded-3 p-3 p-md-4 mb-4"
              style={{ background: "#F9F9FB" }}
            >
              <div className="row g-3 align-items-center">
                <div className="col-12 col-lg-8">
                  <button className="btn btn-primary btn-sm shadow-sm mb-2">
                    <i className="fas fa-book me-2"></i>
                    {course?.category?.title?.length > 20
                      ? `${course.category.title.slice(0, 19)}...`
                      : course?.category?.title}
                  </button>

                  <h1 className="h2 mt-2 mb-3">
                    {course?.title?.length > 40
                      ? `${course.title.slice(0, 40)}...`
                      : course?.title}
                  </h1>

                  <div
                    className="text-muted mb-3"
                    dangerouslySetInnerHTML={{
                      __html:
                        course?.description?.length > 120
                          ? `${course.description.slice(0, 120)}...`
                          : course?.description ?? "",
                    }}
                  />

                  <ul className="list-inline mb-0">
                    <li className="list-inline-item me-3 mb-2">
                      <i className="fas fa-star text-warning me-1"></i>
                      0/5
                    </li>
                    <li className="list-inline-item me-3 mb-2">
                      <i className="fas fa-user-graduate text-warning me-1"></i>
                      {course?.students?.length || 0} Enrolled
                    </li>
                    <li className="list-inline-item me-3 mb-2">
                      <i className="fas fa-signal text-success me-1"></i>
                      {course?.level}
                    </li>
                    <li className="list-inline-item me-3 mb-2">
                      <span className="me-1">📅</span>
                      {course?.created_date
                        ? new Date(course.created_date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "N/A"}
                    </li>
                    <li className="list-inline-item mb-2">
                      <i className="fas fa-globe text-info me-1"></i>
                      {course?.language}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Main Content + Sidebar */}
            <div className="row g-4">
              {/* Left Content */}
              <div className="col-12 col-lg-8 order-2 order-lg-1">
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-white border-bottom-0 pb-0">
                    <ul
                      className="nav nav-pills nav-fill flex-nowrap overflow-auto"
                      style={{ whiteSpace: "nowrap" }}
                      role="tablist"
                    >
                      <li className="nav-item" role="presentation">
                        <button
                          className="nav-link active"
                          id="overview-tab"
                          data-bs-toggle="pill"
                          data-bs-target="#item1"
                          type="button"
                          role="tab"
                        >
                          <i className="fas fa-circle-info me-1 me-md-2"></i>
                          <span className="d-none d-sm-inline">Overview</span>
                          <span className="d-inline d-sm-none">Info</span>
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          className="nav-link"
                          id="curriculum-tab"
                          data-bs-toggle="pill"
                          data-bs-target="#item2"
                          type="button"
                          role="tab"
                        >
                          <i className="fas fa-book-open me-1 me-md-2"></i>
                          <span className="d-none d-sm-inline">Curriculum</span>
                          <span className="d-inline d-sm-none">Lessons</span>
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          className="nav-link"
                          id="instructor-tab"
                          data-bs-toggle="pill"
                          data-bs-target="#item3"
                          type="button"
                          role="tab"
                        >
                          <i className="fas fa-user-tie me-1 me-md-2"></i>
                          <span className="d-none d-sm-inline">Instructor</span>
                          <span className="d-inline d-sm-none">Teacher</span>
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          className="nav-link"
                          id="reviews-tab"
                          data-bs-toggle="pill"
                          data-bs-target="#item4"
                          type="button"
                          role="tab"
                        >
                          <i className="fas fa-star me-1 me-md-2"></i>
                          Reviews
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div className="card-body">
                    <div className="tab-content">
                      {/* Overview */}
                      <div
                        className="tab-pane fade show active"
                        id="item1"
                        role="tabpanel"
                      >
                        <h5 className="mb-3">
                          <i className="fas fa-file-lines me-2"></i>
                          Course Description
                        </h5>
                        <div
                          className="course-description"
                          dangerouslySetInnerHTML={{
                            __html: course?.description ?? "",
                          }}
                        />
                      </div>

                      {/* Curriculum */}
                      <div
                        className="tab-pane fade"
                        id="item2"
                        role="tabpanel"
                      >
                        <div className="accordion" id="courseAccordion">
                          {(course?.curriculum ?? []).map((item, index) => (
                            <div
                              className="accordion-item shadow-sm mb-2 border-0 rounded"
                              key={index}
                            >
                              <h2 className="accordion-header">
                                <button
                                  className={`accordion-button ${
                                    index !== 0 ? "collapsed" : ""
                                  }`}
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target={`#course-item-${index}`}
                                  aria-expanded={index === 0}
                                  aria-controls={`course-item-${index}`}
                                >
                                  {item.title}
                                </button>
                              </h2>
                              <div
                                id={`course-item-${index}`}
                                className={`accordion-collapse collapse ${
                                  index === 0 ? "show" : ""
                                }`}
                                data-bs-parent="#courseAccordion"
                              >
                                <div className="accordion-body p-2 p-md-3">
                                  {(item.variant_items ?? []).map(
                                    (variant, variantIndex) => (
                                      <div
                                        className="variant-item p-2 border-bottom"
                                        key={variantIndex}
                                      >
                                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                          <div className="d-flex align-items-center">
                                            {variant?.preview ? (
                                              <i className="fas fa-play text-primary me-2"></i>
                                            ) : (
                                              <i className="fas fa-lock text-muted me-2"></i>
                                            )}
                                            <span className="fw-medium">
                                              {variant?.title}
                                            </span>
                                          </div>
                                          <span className="text-muted small">
                                            00:00
                                          </span>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Instructor */}
                      <div
                        className="tab-pane fade"
                        id="item3"
                        role="tabpanel"
                      >
                        <div className="card border-0 shadow-sm p-3 p-md-4 mb-4">
                          <div className="row g-3 align-items-center">
                            <div className="col-12 col-sm-4 text-center text-sm-start">
                              <img
                                className="img-fluid rounded-circle instructor-image"
                                src={course?.teacher?.image}
                                alt={course?.teacher?.full_name || "Instructor"}
                                style={{
                                  width: "140px",
                                  height: "140px",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                            <div className="col-12 col-sm-8">
                              <h3 className="h4 mb-2">
                                <i className="fas fa-user me-2"></i>
                                {course?.teacher?.full_name}
                              </h3>
                              <p className="lead fw-semibold text-muted mb-3">
                                <i className="fas fa-user-pen me-2"></i>
                                {course?.teacher?.bio}
                              </p>
                              <div className="d-flex gap-3">
                                {course?.teacher?.facebook && (
                                  <Link
                                    to={course.teacher.facebook}
                                    className="text-primary fs-5"
                                  >
                                    <i className="fab fa-facebook-f"></i>
                                  </Link>
                                )}
                                {course?.teacher?.twitter && (
                                  <Link
                                    to={course.teacher.twitter}
                                    className="text-info fs-5"
                                  >
                                    <i className="fab fa-twitter"></i>
                                  </Link>
                                )}
                                {course?.teacher?.linkedin && (
                                  <Link
                                    to={course.teacher.linkedin}
                                    className="text-primary fs-5"
                                  >
                                    <i className="fab fa-linkedin-in"></i>
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <h4 className="mb-3">
                          <i className="fas fa-user-tie me-2"></i>
                          About Instructor
                        </h4>
                        <p className="fs-6">{course?.teacher?.about}</p>
                      </div>

                      {/* Reviews */}
                      <div
                        className="tab-pane fade"
                        id="item4"
                        role="tabpanel"
                      >
                        <h4 className="mb-4">
                          <i className="fas fa-star me-2"></i>
                          Our Student Reviews
                        </h4>

                        <div className="border rounded p-3 mb-3">
                          <h5 className="mb-1">
                            <i className="fas fa-user-circle me-2"></i>
                            Student Name{" "}
                            <span className="text-muted fs-6">(0/5)</span>
                          </h5>
                          <small className="text-muted">
                            <i className="fas fa-clock me-1"></i>
                            5 days ago
                          </small>
                          <hr className="my-2" />
                          <p className="mb-0 text-muted">
                            No reviews yet. Be the first to review this course!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="col-12 col-lg-4 order-1 order-lg-2">
                <div className="sticky-lg-top" style={{ top: "1.5rem" }}>
                  {/* Course Card */}
                  <div className="card shadow-sm border-0 mb-4">
                    <div className="ratio ratio-16x9">
                      <img
                        src={course?.image}
                        className="card-img-top object-fit-cover"
                        alt={course?.title || "Course"}
                      />
                    </div>

                    <div className="card-body">
                      {/* Video Modal Trigger */}
                      <div className="mb-3">
                        <button
                          className="btn btn-link text-decoration-none p-0 border-0"
                          data-bs-toggle="modal"
                          data-bs-target="#courseVideoModal"
                          type="button"
                        >
                          <i className="fa fa-play-circle text-danger me-2"></i>
                          Course Introduction Video
                        </button>
                      </div>

                      {/* Price + Share */}
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="fw-bold fs-4">
                          <i className="fas fa-tag me-2 text-primary"></i>
                          Rs. {course?.price}
                        </span>

                        <div className="dropdown">
                          <button
                            className="btn btn-light btn-sm shadow-sm"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <FaShareNodes />
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end shadow">
                            <li>
                              <Link className="dropdown-item" to="#">
                                <i className="fab fa-facebook me-2"></i>
                                Facebook
                              </Link>
                            </li>
                            <li>
                              <Link className="dropdown-item" to="#">
                                <i className="fab fa-twitter me-2"></i>
                                Twitter
                              </Link>
                            </li>
                            <li>
                              <Link className="dropdown-item" to="#">
                                <i className="fab fa-linkedin me-2"></i>
                                LinkedIn
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-grid gap-2">
                        {addToCartButton === "Add To Cart" && (
                          <button
                            className="btn btn-primary shadow-sm"
                            onClick={() =>
                              createCart(
                                course.course_id,
                                userId(),
                                course.price,
                                userCountry,
                                getCartId()
                              )
                            }
                          >
                            <i className="fa fa-cart-shopping me-2"></i>
                            Add To Cart
                          </button>
                        )}
                        {addToCartButton === "Added To Cart" && (
                          <button className="btn btn-primary shadow-sm" disabled>
                            <i className="fa fa-check me-2"></i>
                            Added To Cart
                          </button>
                        )}
                        {addToCartButton === "Adding To Cart" && (
                          <button className="btn btn-primary shadow-sm" disabled>
                            <i className="fa fa-spinner fa-spin me-2"></i>
                            Adding To Cart
                          </button>
                        )}

                        <button className="btn btn-success">
                          <i className="fas fa-user-graduate me-2"></i>
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Course Includes */}
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <h5 className="card-title mb-3">
                        <i className="fas fa-list-check me-2"></i>
                        This course includes
                      </h5>

                      <ul className="list-group list-group-flush">
                        <li className="list-group-item d-flex justify-content-between px-0">
                          <span>
                            <i className="fas fa-book-open me-2 text-primary"></i>
                            Lectures
                          </span>
                          <span className="fw-medium">
                            {course?.curriculum?.[0]?.variant_items?.length || 0}
                          </span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between px-0">
                          <span>
                            <i className="fas fa-lightbulb me-2 text-warning"></i>
                            Skills
                          </span>
                          <span className="fw-medium">30</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between px-0">
                          <span>
                            <i className="fas fa-language me-2 text-info"></i>
                            Language
                          </span>
                          <span className="fw-medium">{course?.language}</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between px-0">
                          <span>
                            <i className="fas fa-calendar-check me-2 text-success"></i>
                            Published
                          </span>
                          <span className="fw-medium">
                            {course?.created_date
                              ? new Date(
                                  course.created_date
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Modal */}
            <div
              className="modal fade"
              id="courseVideoModal"
              tabIndex="-1"
              aria-labelledby="courseVideoModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="courseVideoModalLabel">
                      <i className="fa fa-play-circle me-2"></i>
                      Introduction Video
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body p-0">
                    <div className="ratio ratio-16x9">
                      <iframe
                        src="https://www.youtube.com/embed/N7YQamb37VE"
                        title="Course Introduction Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      <i className="fas fa-xmark me-2"></i>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="container py-5">
            <h2 className="text-center text-muted">
              Such Course does not exist
            </h2>
          </div>
        )}
      </>
    )}
  </Pagewrapper>
</>
  );
};

export default CourseDetail;
