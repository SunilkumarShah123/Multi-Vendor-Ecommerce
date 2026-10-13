const getCartId = () => {
    const existingCartId = localStorage.getItem("randomCartId");

    // If cart ID already exists, return it
    if (existingCartId) {
        return existingCartId;
    }

    // Create a new cart ID
    const idLength = 6;
    const randomCharacter = "123456790";
    let randomCartId = "";

    for (let i = 0; i < idLength; i++) {
        const characterIndex = Math.floor(
            Math.random() * randomCharacter.length
        );

        randomCartId += randomCharacter.charAt(characterIndex);
    }

    // Save the newly created ID
    localStorage.setItem("randomCartId", randomCartId);

    console.log("New Cart ID:", randomCartId);

    return randomCartId;
};

export default getCartId;