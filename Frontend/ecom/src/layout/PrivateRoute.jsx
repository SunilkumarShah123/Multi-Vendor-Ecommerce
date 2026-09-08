import {Navigate} from "react-router-dom"
//Navigate is component provided by react router dom that perform conditional redirection of component to specific route where as similar useNavigate() is a hook that is invoke by specific function or event and prefrom redirection 
import userAuthStore from "../store/auth"

//it is component dedicated to protect the certain page or route so that only authenticated or logged in user can acces the protected page or route else redirect to login page
const PrivateRoute = ({children}) => {
    const isLoggedIn= userAuthStore( state => state.isLoggedIn)()//IIFE(Immediately Invoked Function Expression.)
  return isLoggedIn ? <>{children}</>:<Navigate to="/login"/>
}

export default PrivateRoute