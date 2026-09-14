
import Header from "./Base/Header";
import Footer from "./Base/Footer";
import "../Css/pages/wrapper.css"
const Pagewrapper = ({ children }) => {
  return (
    <>
      <div className="page">
        <main className="main-content">
          <Header />
          {children}
          <Footer />
        </main>
      </div>
    </>
  );
};

export default Pagewrapper;
