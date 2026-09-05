import { useEffect, useState } from "react";

function App() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/home/")
            .then((response) => response.json())
            .then((data) => {
                setMessage(data.message);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    return (
        <div className="container mt-5">
            <h1>{message}</h1>
        </div>
    );
}

export default App;