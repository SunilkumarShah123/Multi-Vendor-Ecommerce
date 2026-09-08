import React, { useEffect } from 'react'
import userAuthStore from '../../store/auth'
import { logOut } from '../../utils/auth'
import { useNavigate } from 'react-router-dom'
const LogOut = () => {
  const navigate=useNavigate()
  const isLoggedIn=userAuthStore( state => state.isLoggedIn)
  const handleLogOut= ()=>{
    logOut()
    useEffect(()=>{
        if(!isLoggedIn()){
            navigate('dashboard/')
        }
    })
  }
  return 
    <>
    <button onClick={handleLogOut} className="btn btn-danger">
        Log Out
    </button>
    </>
  
}

export default LogOut