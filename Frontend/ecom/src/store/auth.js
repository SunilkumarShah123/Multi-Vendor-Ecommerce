import {create} from "zustand"


const userAuthStore= create((set,get)=>({ 
    allUserData:null,
    loading:false,
    user: ()=>({
      user_id:get().allUserData?.user_id||null,
      username:get().allUserData?.username||null,
    }),
    setUser: (user => set({allUserData:user})),
    setLoading: ( loading => set({loading:loading})),
    isLoggedIn: ()=> get().allUserData !== null,
}))


//not mendatory just for checking 
// if (import.meta.env.DEV) {
//   mountStoreDevtool('Store', userAuthStore)
// }

export default userAuthStore