import Pagewrapper from "../Pagewrapper";
import toast from "react-hot-toast";
import getCartId from "../../utils/cart_plugins/generateCartId";
import { CartCountCreater } from "../../utils/cart_plugins/UseCartCount";
import { useContext, useState, useEffect } from "react";
import userId from "../../utils/cart_plugins/getUserId";
import "../../Css/pages/cart.css";
import { Link, useNavigate } from "react-router-dom";
import apiInstance from "../../utils/axios";

const CartDetail = () => {
  const savedBioData = JSON.parse(
    localStorage.getItem("checkoutBioData") || "{}"
  );
  const [cart, setCart] = useState([]);
  const [cartStatistic, setCartStatistic] = useState([]);
  const { setCartCount } = useContext(CartCountCreater);
  const navigate = useNavigate();
  const [bioData, setBioData] = useState({
    full_name: savedBioData.full_name || "",
    email: savedBioData.email || "",
    country: savedBioData.country || "",
  });

  const fetchCart = async () => {
    try {
      const response = await apiInstance.get(`course/cart-list/${getCartId()}`);
      setCart(response?.data);
      setCartCount(response?.data?.length);
    } catch (error) {
      console.log(error?.response?.data?.message || error.message);
    }
  };

  const fetchCartCalculation = async () => {
    try {
      const response = await apiInstance.get(
        `course/cart-item-in-cart-total-statistic/${getCartId()}/`
      );
      setCartStatistic(response.data);
    } catch (error) {
      console.log(error?.response?.data?.message || error.message);
    }
  };

  const deleteCartItem = async (cart_id, item_id) => {
    try {
      await apiInstance.delete(
        `course/cart-object-delete/${cart_id}/${item_id}/`
      );
      await fetchCart();
      await fetchCartCalculation();
      toast.success("Cart Item Removed Successfully.");
    } catch (error) {
      console.log(error?.response?.data?.message);
    }
  };

  const handleBioDataSubmit = (e) => {
    const { name, value } = e.target;
    setBioData((prev) => {
      const updatedBioData = { ...prev, [name]: value };
      localStorage.setItem("checkoutBioData", JSON.stringify(updatedBioData));
      return updatedBioData;
    });
  };

  useEffect(() => {
    fetchCart();
    fetchCartCalculation();
  }, []);

  const createCartOrder = async (e) => {
    e.preventDefault();

    if (!bioData.full_name || !bioData.email || !bioData.country) {
      toast.error("Please input the order details before creating the order.");
      return;
    }

    if (cart.length === 0) {
      toast.error("Add at least one course before updating the order.");
      return;
    }

    const form = new FormData();
    form.append("full_name", bioData.full_name);
    form.append("email", bioData.email);
    form.append("country", bioData.country);
    form.append("cart_id", getCartId());
    form.append("user_id", userId());

    try {
      const editingOrderId = localStorage.getItem("editingOrderId");
      let response;

      if (editingOrderId) {
        response = await apiInstance.patch(
          `course/order-update/${editingOrderId}/`,
          {
            full_name: bioData.full_name,
            email: bioData.email,
            country: bioData.country,
            cart_id: getCartId(),
          }
        );
      } else {
        response = await apiInstance.post("course/create-order/", form);
      }

      const orderId = editingOrderId || response.data.order_oid;
      localStorage.setItem("editingOrderId", orderId);

      navigate(`/checkout/${orderId}`, { replace: true });

      toast.success(
        editingOrderId
          ? "Order updated successfully!"
          : "Order created successfully!"
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to create/update order."
      );
    }
  };

  return (
    <Pagewrapper>
      {/* Page Header */}
      <section className="container page-header py-4">
        <h2 className="fw-bolder mt-4 mb-2">My Cart</h2>
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/">Course</Link>
          </li>
          <li className="breadcrumb-item active">Cart</li>
        </ol>
      </section>

      {/* Main Content */}
      <section className="main-content container pb-5 mb-5">
        <form onSubmit={createCartOrder}>
          <div className="row g-4">
            {/* Left Side */}
            <div className="col-12 col-lg-8">
              {/* Cart Items */}
              <div className="card mb-4 shadow-sm">
                <div className="card-body p-3 p-md-4">
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <h5 className="mb-0">Cart Items ({cart?.length || 0})</h5>
                    <span className="badge bg-success">
                      {cart?.length || 0} Courses
                    </span>
                  </div>

                  {cart?.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table align-middle mb-0">
                        <tbody>
                          {cart.map((item, index) => (
                            <tr className="border-top" key={item.id || index}>
                              <td style={{ width: "100px" }}>
                                <img
                                  src={item?.course?.image}
                                  alt={item?.course?.title || "Course"}
                                  className="rounded-1 img-fluid"
                                  style={{
                                    height: "70px",
                                    width: "100px",
                                    objectFit: "cover",
                                  }}
                                />
                              </td>
                              <td>
                                <h6 className="mb-1">{item?.course?.title}</h6>
                                <small className="text-muted">
                                  Instructor: {item?.course?.teacher?.full_name}
                                </small>
                              </td>
                              <td className="text-nowrap">
                                <span className="h6 text-success mb-0">
                                  Rs {item?.course?.price}
                                </span>
                              </td>
                              <td className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  onClick={() =>
                                    deleteCartItem(getCartId(), item.id)
                                  }
                                >
                                  <i className="fa-solid fa-xmark"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <h5 className="text-center text-muted my-4">
                      There is no item in cart
                    </h5>
                  )}
                </div>
              </div>

              {/* Personal Details */}
              <div className="card shadow-sm">
                <div className="card-body p-3 p-md-4">
                  <h5 className="mb-1">Personal details</h5>
                  <small className="text-muted d-block mb-3">
                    Enter your information before proceeding to checkout
                  </small>

                  <div className="mb-3">
                    <label htmlFor="full_name" className="form-label">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      onChange={handleBioDataSubmit}
                      value={bioData.full_name}
                      className="form-control"
                      placeholder="Enter Your Name"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      onChange={handleBioDataSubmit}
                      value={bioData.email}
                      className="form-control"
                      placeholder="Enter Your Email Address"
                    />
                  </div>

                  <div className="mb-0">
                    <label htmlFor="country" className="form-label">
                      Your Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      onChange={handleBioDataSubmit}
                      value={bioData.country}
                      className="form-control"
                      placeholder="Enter Your Country Name"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Cart Total */}
            <div className="col-12 col-lg-4">
              <div className="card shadow-sm">
                <div className="card-body p-3 p-md-4">
                  <h5 className="mb-3">Cart Total</h5>

                  <ul className="list-group list-group-flush mb-3">
                    <li className="list-group-item d-flex justify-content-between px-0">
                      <span>SubTotal</span>
                      <span>Rs. {cartStatistic?.price || 0}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between px-0">
                      <span>Tax</span>
                      <span>Rs. {cartStatistic?.tax || 0}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between px-0 fw-bold">
                      <span>Total</span>
                      <span className="text-success">
                        Rs {cartStatistic?.grand_total || 0}
                      </span>
                    </li>
                  </ul>

                  <button
                    className="btn btn-lg w-100 btn-success mb-3"
                    type="submit"
                  >
                    Proceed to Checkout
                  </button>

                  <small className="d-block text-center text-muted">
                    By proceeding to checkout, you agree to these{" "}
                    <span className="text-primary fw-bold">
                      Terms of Service
                    </span>
                  </small>
                </div>
              </div>
            </div>
          </div>
        </form>
      </section>
    </Pagewrapper>
  );
};

export default CartDetail;