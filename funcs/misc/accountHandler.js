document.addEventListener("DOMContentLoaded", () => {
    const password = document.querySelector('input[name="user_password"]');
    const confPassword = document.querySelector('input[name="user_confirmpass"]');
    const showBtn = document.getElementById("show");

    showBtn.addEventListener("click", () => {
        if (password.type === "password") {
            password.type = "text"
            showBtn.textContent = "Hide Password";

            if (confPassword) confPassword.type = "text";
        } else if (password.type = "text") {
            password.type = "password";
            showBtn.textContent = "Show Password";

            if (confPassword) confPassword.type = "password";
        }
    })
});

function previewImage(e) {
    const files = e.target.files;

    if (files.length > 0) {
        const imgUrl = URL.createObjectURL(files[0]);
        const imgElement = document.getElementById("previewUser")

        imgElement.src = imgUrl;
    }
}

async function processLog(e) {
    e.preventDefault();

    const username = document.querySelector('input[name="user_name"]');
    const password = document.querySelector('input[name="user_password"]');

    let formData = new FormData();
    formData.append("user_name", username.value);
    formData.append("user_password", password.value)

    try {
        const response = await fetch("funcs/php/user/processLog.php", {
            method: "POST",
            body: formData,
        })

        if (!response.ok) {
            throw new Error("Response was not ok.")
        }

        const data = await response.json();
        showNotification(data.message, data.status == "success" || data.status == "already" ? "success" : "error");

        if (data.status == "success" || data.status == "already") {
            setTimeout(() => {
                window.location.href = "Profile.html";
            }, 3000);
        }
    } catch (error) {
        console.error("Error processing sign-in: ", error);
    }
}

async function createAccount(e) {
    e.preventDefault();

    const user_img_path = document.getElementById("user_img_path").files[0];
    const user_name = document.querySelector('input[name="user_name"]');
    const user_email = document.querySelector('input[name="user_email"]');
    const user_password = document.querySelector('input[name="user_password"]');
    const user_confirmpass = document.querySelector('input[name="user_confirmpass"]');
    const user_type = document.getElementById("user-type");

    const selected = user_type.options[user_type.selectedIndex];

    if (!selected.dataset.id) {
        showNotification("Please select a user type.", "error");
        return;
    }

    if (user_password.value !== user_confirmpass.value) {
        showNotification("Password not matching.", "error");
        return;
    }

    const confirmed = await showConfirm("Are the informations filled correctly?");
    if (!confirmed) return;

    let formData = new FormData();
    formData.append("user_name", user_name.value);
    formData.append("user_email", user_email.value);
    formData.append("user_password", user_password.value);
    formData.append("user_img_path", user_img_path);
    formData.append("user_type", selected.dataset.id);

    try {
        const response = await fetch("funcs/php/user/createAccount.php", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        showNotification(data.message, data.status === "created" ? "success" : "error");

        if (data.status === "created") {
            setTimeout(() => {
                window.location.href = "SignIn.html";
            }, 3500);
        }
    } catch (error) {
        showNotification("Server error occurred.", "error");
        console.error(error);
    }
}

async function displayAccount() {
    const previewUser = document.getElementById("previewUser");
    const user_name = document.querySelector('input[name="user_name"]');
    const user_email = document.querySelector('input[name="user_email"]');
    const user_description = document.getElementById("user_description");

    try {
        const response = await fetch("funcs/php/user/displayAccount.php", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error("Response was not ok.");
        }

        const data = await response.json();

        if (data.status == "retrieved") {
            previewUser.src = data.data.user_img_path
            previewUser.dataset.old = data.data.user_img_path
            user_name.value = data.data.user_name;
            user_email.value = data.data.user_email;
            user_description.value = data.data.user_description;
        }
    } catch (error) {
        console.error("Error displaying: ", error);
    }
}

async function editAccount(e) {
    e.preventDefault();

    const old_user_img_path = document.getElementById("user_img_path").dataset.old;
    const user_img_path = document.getElementById("user_img_path").files[0];
    const user_name = document.querySelector('input[name="user_name"]');
    const user_email = document.querySelector('input[name="user_email"]');
    const user_password = document.querySelector('input[name="user_password"]');
    const user_confirmpass = document.querySelector('input[name="user_confirmpass"]');
    const user_description = document.getElementById("user_description");

    if (user_password.value !== user_confirmpass.value) {
        showNotification("Password not matching.", "error");
        return;
    }

    const confirmed = await showConfirm("Change your information?");
    if (!confirmed) return;

    let formData = new FormData();
    formData.append("user_name", user_name.value);
    formData.append("user_email", user_email.value);
    formData.append("user_password", user_password.value);
    formData.append("user_description", user_description.value)
    formData.append("user_img_path", user_img_path);
    formData.append("old_user_img_path", old_user_img_path);

    try {
        const response = await fetch("funcs/php/user/editAccount.php", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        showNotification(data.message, data.status === "updated" ? "success" : "error");

        if (data.status === "updated") {
            displayAccount();
        }
    } catch (error) {
        showNotification("Update failed.", "error");
        console.error(error);
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

function showConfirm(message) {
    return new Promise(resolve => {
        const container = document.getElementById("confirm-container");

        // prevent stacking
        container.innerHTML = "";
        container.style.display = "flex";

        const box = document.createElement("div");
        box.className = "confirm-box";

        box.innerHTML = `
            <p>${message}</p>
            <button id="confirmYes">Yes</button>
            <button id="confirmNo">No</button>
        `;

        container.appendChild(box);

        document.getElementById("confirmYes").onclick = () => {
            container.style.display = "none";
            resolve(true);
        };

        document.getElementById("confirmNo").onclick = () => {
            container.style.display = "none";
            resolve(false);
        };
    });
}