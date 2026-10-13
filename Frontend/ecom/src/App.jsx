import Home from "./Pages/Home";
import { Toaster } from "react-hot-toast";
import Login from "./Pages/auth/Login";
import RegisterUser from "./Pages/auth/RegisterUser";
import Dashboard from "./Pages/auth/Dashboard";
import { Route, Routes } from "react-router-dom";
import LogOut from "./Pages/auth/LogOut";
import PasswrodResetEmail from "./Pages/auth/PasswrodResetEmail";
import PasswordReset from "./Pages/auth/PasswordReset";
import { useEffect } from "react";
import { setUser } from "./utils/auth";
import Erorro_404 from "./Pages/Erorro_404";
import CourseDetail from "./Pages/CourseDetail";
import CartDetail from "./Pages/cart/CartDetail";
import { CartCountProvider } from "./utils/cart_plugins/UseCartCount";
import CheckOut from "./Pages/cart/CheckOut";
import Search from "./Pages/Base/Search";
const App = () => {
  useEffect(() => {
    setUser();
  }, []);


  return (
    <>
      <CartCountProvider>
        <Toaster position="top-right" className="mb-4" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="login/" element={<Login />} />
          <Route path="register/" element={<RegisterUser />} />
          <Route path="dashboard/" element={<Dashboard />} />
          <Route path="logout/" element={<LogOut />} />
          <Route
            path="password-reset-email/"
            element={<PasswrodResetEmail />}
          />
          <Route path="password-reset/" element={<PasswordReset />} />
          <Route path="course-detail/:slug" element={<CourseDetail />} />
          <Route path="search/" element={<Search />} />
          <Route path="cart/" element={<CartDetail />} />
          <Route path="checkout/:order_id" element={<CheckOut/>}/>
          <Route path="*" element={<Erorro_404 />} />
        </Routes>
      </CartCountProvider>
    </>
  );
};

export default App;
