import {create} from "zustand"


const userAuthStore= create((set,get)=>({ 
    userData:null,
  isLoggedIn:false,
    loading:false,
    user: ()=>({
      user_id:get().userData?.user_id||null,
      username:get().userData?.username||null,
    }),
    setUser: (user => set({userData:user, isLoggedIn:user !== null})),
    setLoading: ( loading => set({loading:loading})),
}))


//not mendatory just for checking 
// if (import.meta.env.DEV) {
//   mountStoreDevtool('Store', userAuthStore)
// }

export default userAuthStore