import { Link } from "react-router-dom";
import "../../Css/pages/checkout.css";
import toast from "react-hot-toast";
import { CartCountCreater } from "../../utils/cart_plugins/UseCartCount";
import { useContext } from "react";
import { useCallback, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useParams, useSearchParams } from "react-router-dom";
import "../../Css/pages/cart.css";
import apiInstance from "../../utils/axios";
import Pagewrapper from "../Pagewrapper";

const CheckOut = () => {
  const [order, setOrder] = useState(null);
  const { setCartCount } = useContext(CartCountCreater);
  const param = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [paying, setPaying] = useState(false);
  const cleanedPaidOrderIds = useRef(new Set());
  const [cupon,setCupon]=useState({
    cupon:'',
  })
  const navigate = useNavigate();

  const clearPaidCheckoutState = useCallback((orderId) => {
    localStorage.removeItem("randomCartId");
    localStorage.removeItem("checkoutBioData");
    if (localStorage.getItem("editingOrderId") === orderId) {
      localStorage.removeItem("editingOrderId");
    }
    setCartCount(0);
    setOrder(null);
    navigate("/cart", { replace: true });
  }, [navigate, setCartCount]);

  const fetchOrder = async () => {
    try {
      const response = await apiInstance.get(
        `course/order-checkout/${param.order_id}/`,
      );
      const fetchedOrder = response.data;
      setOrder(fetchedOrder);

      if (
        fetchedOrder.payment_status?.toLowerCase() === "paid" &&
        !cleanedPaidOrderIds.current.has(fetchedOrder.order_id)
      ) {
        cleanedPaidOrderIds.current.add(fetchedOrder.order_id);
        clearPaidCheckoutState(fetchedOrder.order_id);
        return;
      }

      // Remember current editing order
      if (fetchedOrder.payment_status?.toLowerCase() !== "paid") {
        localStorage.setItem("editingOrderId", fetchedOrder.order_id);
      }
    } catch (error) {
      console.log(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    if (param.order_id) {
      localStorage.setItem("editingOrderId", param.order_id);
    }

    fetchOrder();
  }, [param.order_id]);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (!payment) {
      return;
    }
    if (payment === "success") {
      toast.success("Payment verified successfully. A receipt has been emailed to you.");
      if (param.order_id) {
        cleanedPaidOrderIds.current.add(param.order_id);
        clearPaidCheckoutState(param.order_id);
        return;
      }
    } else {
      toast.error("Khalti payment was canceled or could not be verified.");
    }
    searchParams.delete("payment");
    setSearchParams(searchParams, { replace: true });
  }, [clearPaidCheckoutState, param.order_id, searchParams, setSearchParams]);

  const payWithKhalti = async () => {
    if (!param.order_id) {
      toast.error("Order not found.");
      return;
    }
    if (order?.payment_status?.toLowerCase() === "paid") {
      toast.error("This order has already been paid.");
      return;
    }

    setPaying(true);
    try {
      const response = await apiInstance.post(
        "khalti/initiate-khalti-payment/",
        { order_id: param.order_id },
        { timeout: 20000 },
      );
      const paymentUrl = response.data?.payment_url;
      if (!paymentUrl) {
        toast.error("Unable to start Khalti payment.");
        return;
      }
      window.location.href = paymentUrl;
    } catch (error) {
      const data = error?.response?.data;
      toast.error(
        data?.detail ||
          data?.error_key ||
          (typeof data === "string" ? data : "Unable to start Khalti payment. Please try again."),
      );
    } finally {
      setPaying(false);
    }
  };

const handleCuponChange=(e)=>{
  const {name,value}= e.target
  setCupon(cupon => ({...cupon, [name]:value}))
}

const handleCuponSubmit= async (e)=>{

  e.preventDefault()

  
  try{
      const response = await apiInstance.post('/course/apply-coupon/',{
        order_id:param.order_id,
        coupon:cupon.cupon,
      })

      const message =
        response.data?.message ||
        response.data?.detail ||
        (typeof response.data === "string" ? response.data : "Coupon applied successfully.");
      if (response.status === 200) {
        toast.error(message);
        await fetchOrder()
      } else {
        await fetchOrder()
        toast.success(message);
      }
  }
  catch(error){
      const data = error?.response?.data;
      toast.error(
        data?.message ||
          data?.detail ||
          (typeof data === "string" ? data : "Unable to apply coupon. Please try again."),
      );
  }
}
  return (
    <Pagewrapper>
      <section className="container page-header py-4 my-2">
        <h2 className="fw-bolder mt-3">Checkout</h2>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/courses">Course</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Cart
            </li>
          </ol>
        </nav>
      </section>

      <section className="main-content mb-5">
        <div className="container">
          <div className="row g-4">
            {/* Left Column: Courses & Personal Details */}
            <div className="col-lg-8">
              <div className="alert-message mb-3">
                <div
                  className="alert alert-warning alert-dismissible fade show mb-0"
                  role="alert"
                >
                  <strong>Holy guacamole!</strong> You should check in on some
                  of those fields below.
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="alert"
                    aria-label="Close"
                  ></button>
                </div>
              </div>

              <div className="courses-box mb-4">
                <div className="card border-0 rounded-3 shadow-sm">
                  <div className="card-body p-4">
                    <div className="h5 fw-bold mb-3">Courses in Cart</div>
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-3">
                        <tbody>
                          {order?.order_items?.map((item) => (
                            <tr key={item.id}>
                              <td className="d-flex align-items-center border-0">
                                <img
                                  src={item?.course?.image}
                                  className="rounded-2 object-fit-cover me-3"
                                  height={60}
                                  width={90}
                                />
                                <h6 className="mb-0 fw-semibold">
                                  {item.course?.title ||
                                    `Course #${item.course?.course_id}`}
                                </h6>
                              </td>
                              <td className="text-end border-0">
                                <span className="text-success fs-5 fw-bolder">
                                  Rs {item.total}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => {
                        if (order) {
                          localStorage.setItem(
                            "editingOrderId",
                            order.order_id,
                          );
                          localStorage.setItem(
                            "checkoutBioData",
                            JSON.stringify({
                              full_name: order.full_name || "",
                              email: order.email || "",
                              country: order.country || "",
                            }),
                          );
                        }
                        navigate("/cart");
                      }}
                    >
                      Edit Cart <i className="fas fa-edit ms-1"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="personal-detail">
                <div className="card border-0 rounded-3 shadow-sm">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">Billing Details</h5>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label fw-semibold">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        placeholder="Enter Your Name"
                        id="name"
                        name="full_name"
                        value={order?.full_name || ""}
                        readOnly
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label fw-semibold">
                        Your Email *
                      </label>
                      <input
                        type="email"
                        className="form-control bg-light"
                        placeholder="Enter Your Email Address"
                        id="email"
                        name="email"
                        value={order?.email || ""}
                        readOnly
                      />
                    </div>
                    <div className="mb-0">
                      <label
                        htmlFor="country"
                        className="form-label fw-semibold"
                      >
                        Select Country *
                      </label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        placeholder="Enter Your Country Name"
                        id="country"
                        name="country"
                        value={order?.country || ""}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="col-lg-4">
              <div className="card border shadow-sm rounded-3">
                <div className="card-body p-4">
                  <h4 className="card-title fw-bold mb-3">Order Summary</h4>

                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <span className="text-secondary small fw-semibold">
                      Transaction ID
                    </span>
                    <span className="fw-semibold text-dark fs-6">
                      #{param?.order_id}
                    </span>
                  </div>
                   <form onSubmit={handleCuponSubmit}>
                    <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control text-uppercase"
                      placeholder="COUPON CODE"
                      id="couponCode"
                      name="cupon"
                      value={cupon.cupon}
                      onChange={handleCuponChange}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary px-3 fw-semibold"
                      id="applyCouponBtn"
                      
                    >
                      Apply
                    </button>
                  </div>
                   </form>
                  

                  <div className="card bg-light border-0 rounded-3 mb-3">
                    <div className="card-body p-3">
                      <h5 className="card-title fw-bold fs-6 mb-2">
                        Cart Total
                      </h5>
                      <ul className="list-group list-group-flush bg-transparent">
                        <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center px-0 py-1 border-0">
                          <span className="text-secondary">Sub Total</span>
                          <span className="fw-semibold">Rs {order?.
initial_total}</span>
                        </li>
                        <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center px-0 py-1 border-0">
                          <span className="text-secondary">Discount</span>
                          <span className="text-danger fw-semibold">
                            -Rs {order?.saved}
                          </span>
                        </li>
                        <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center px-0 py-1 border-0">
                          <span className="text-secondary">Tax</span>
                          <span className="fw-semibold">Rs {order?.tax_fee}</span>
                        </li>
                        <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center px-0 pt-2 pb-0 border-top mt-2">
                          <span className="fw-bold fs-6">Total</span>
                          <span className="fw-bold fs-5 text-primary">
                            Rs {order?.total}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                

                    <button
                      type="button"
                      className="btn btn-lg btn-purple w-100 fw-bold shadow-sm"
                      onClick={payWithKhalti}
                      disabled={paying || order?.payment_status?.toLowerCase() === "paid"}
                      style={{ backgroundColor: "#5C2D91", color: "#fff" }}
                    >
                      {paying ? "Redirecting to Khalti..." : "Pay with Khalti"}
                    </button>
                  
                  </div>

                  <p className="small text-secondary mb-0 mt-3 text-center">
                    By proceeding to payment, you agree to these{" "}
                    <a href="#" className="text-decoration-none">
                      <strong>Terms of Service</strong>
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Pagewrapper>
  );
};

export default CheckOut;
