document.addEventListener("DOMContentLoaded", async function () {
    if (window.location.pathname.endsWith("SignIn.html")) return;

    const response = await fetch("funcs/php/user/checkLog.php", {
        credentials: "include",
    });

    const data = await response.json();

    const navbar = document.querySelector('.navbar');

    if (data.user_type == "Seller") {
        navbar.innerHTML = `
            <li><a href="Homepage.html">Homepage</a></li>
            <li><a href="Homepage.html#categories">Categories</a></li>
            <li><a href="SavedBooks.html">Save Books</a></li>
            <li><a href="Profile.html">Profile</a></li>
            <li><a href="BookManagement.html">Management</a></li>
            <li><a href="Settings.html">Settings</a></li>
            <li><a onclick="outUser()">Log Out</a></li>
        `;
    } else {
        navbar.innerHTML = `
            <li><a href="Homepage.html">Homepage</a></li>
            <li><a href="Homepage.html#categories">Categories</a></li>
            <li><a href="SavedBooks.html">Save Books</a></li>
            <li><a href="Profile.html">Profile</a></li>
            <li><a href="Settings.html">Settings</a></li>
            <li><a onclick="outUser()">Log Out</a></li>
        `;
    }
    const hamburger = document.getElementById('hamburger');

    hamburger.addEventListener('click', () => {
        document.querySelector('.navbar').classList.toggle('active');
    });

    if (!data.logged) {
        showNotification(data.message, "error");
        console.warn(data.message);
        window.location.href = "SignIn.html";
    }
});


async function outUser() {
    try {
        const response = await fetch("funcs/php/user/processOut.php");

        if (!response.ok) {
            throw new Error("Response was not ok.");
        }

        const data = await response.json();
        showNotification(data.message, "error");

        if (data.status == "success") {
            setTimeout(() => {
                window.location.href = "SignIn.html";
            }, 3500);
        }
    } catch (error) {
        console.error("Error logging out: ", error)
    }
}

function showNotification(message, type = "info", duration = 3000) {
    const container = document.getElementById("notification-container");

    const notification = document.createElement("div");
    notification.classList.add("notification", type);
    notification.innerText = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, duration + 400);
}