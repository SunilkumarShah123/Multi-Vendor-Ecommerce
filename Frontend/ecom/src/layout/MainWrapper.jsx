import { Children, useEffect, useState } from "react";
import { setUser } from "../utils/auth";
//purpose of this wraper component is to first load the user information before the depending component loads it ui so that at the time of render ui can get the user information becacuse if we first load the ui and then then the user informatio it may take time from backend and till then ui will show no user or error or invalid user information
const MainWrapper = ({children}) => {
  const [loading, setLoading] = useState(true);
  useEffect(async () => {
    const handler = async () => {
      setLoading(true);
      await setUser();
      setLoading(false);
    };
    handler();
  }, []);

  return <>
  {/* if loading is true the set page to null means no rendering any page else if loading is false that means user information has been fetch to lets the children component like dashboard to be rendered*/}
     {loading?null:Children}
  </>
};

export default MainWrapper;
