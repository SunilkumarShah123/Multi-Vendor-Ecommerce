import { createContext } from "react";
import { useState } from "react";
export const CartCountCreater=createContext()

export const CartCountProvider=  ({children})=>{
     const [cartCount,setCartCount]= useState(0)
     return (
        <CartCountCreater.Provider value={{cartCount,setCartCount}} >
        {children}
     </CartCountCreater.Provider>
     )
}