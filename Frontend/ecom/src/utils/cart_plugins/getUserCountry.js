import { useState, useEffect } from "react";

const getUserCountry = () => {
    const [country, setCountry] = useState("");

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const longitude = position.coords.longitude;
            const latitude = position.coords.latitude;

            // Get address based on latitude and longitude
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );

            const data = await response.json();
          

            setCountry(data.address.country);
        });
    }, []);

    return country;
};

export default getUserCountry;