import React from 'react'
import Pagewrapper from './Pagewrapper'
import { useNavigate } from 'react-router-dom'
const Erorro_404 = () => { 
  const navigate=useNavigate()
  return <>
  <Pagewrapper>
    <h1 className='text-center' style={{marginTop:"100px"}}>Page doesnot found</h1>
    <h3 className='text-center mt-4'>Return Back to Home page</h3>
    <div className='text-center mt-4'>

    <button className=" btn btn-lg btn-primary" onClick={()=>{navigate('/home')}}>
        Click Here
    </button>
    </div>
  </Pagewrapper>
  </>
}

export default Erorro_404