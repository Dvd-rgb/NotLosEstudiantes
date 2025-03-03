document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent form from reloading the page

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:3000/signup", {

        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password }) // Send credentials to the backend
    });

    const data = await response.json();

    if (data.success) {
        document.getElementById("message").innerText = "Login exitoso!";
    } else {
        document.getElementById("message").innerText = "Credenciales incorrectas.";
    }
});
