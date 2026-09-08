import Home from './Pages/Home'
import Login from './Pages/auth/Login'
import RegisterUser from './Pages/auth/RegisterUser'
import Dashboard from './Pages/auth/Dashboard'
import {Route,Routes} from "react-router-dom"
import LogOut from './Pages/auth/LogOut'
import PasswrodResetEmail from './Pages/auth/PasswrodResetEmail'
import PasswordReset from './Pages/auth/PasswordReset'
const App = () => {
  return <>
    <Routes>
        <Route  path="/" element={<Home/>} />
        <Route path="login/" element={<Login/>} />
        <Route path="register/" element={<RegisterUser/>} />
        <Route path="dashboard/" element={<Dashboard/>} />
        <Route path="logout/" element={<LogOut/>}/>
        <Route path="password-reset-email/" element={<PasswrodResetEmail/>}/>
        <Route path="password-reset/" element={<PasswordReset/>} />
    </Routes>
  </>
}

export default App