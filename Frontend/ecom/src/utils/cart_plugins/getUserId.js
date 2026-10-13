import { jwtDecode } from "jwt-decode"
import Cookies from "js-cookie";

const userId=()=>{
    const accessToken = Cookies.get("access_token");
    if(accessToken){
        const decode= jwtDecode(accessToken)
        const user_id=decode.user_id

        return user_id
    }
    else{
        return null
    }
    
}
export default userId