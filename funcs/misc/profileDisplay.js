document.addEventListener("DOMContentLoaded", async function () {
    const nameText = document.getElementById("user_name")

    loadFeedback();
    displayProfile();
})

async function displayProfile() {
    const info = document.getElementById("info");
    info.innerHTML = "";

    try {
        const response = await fetch("funcs/php/user/displayProfile.php", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) throw new Error("Network response was not ok.");

        const data = await response.json();

        info.innerHTML = `
            <div class="main">
                <div id="shop-img">
                    <img src="${data.data.shop_img_path ?? 'img/default.jpg'}" alt="${(!data.data.shop_img_path) ? "Modify shop image" : data.data.shop_img_path}" class="owner-img">
                </div>
                <h3 id="shop_owner" data-value="${data.data.shop_owner || ""}">${data.data.shop_owner || "Modify shop name"}</h3>
            </div>

            <div class="box">
                <h2>Our Story</h2>
                <p id="shop_history" data-value="${data.data.shop_history || ""}">${(!data.data.shop_history) ? "Modify history" : data.data.shop_history}</p>
            </div>

            <div class="box">
                <h3 class="innerH">Vision</h3>
                <p id="shop_vision" data-value="${data.data.shop_vision || ""}">${(!data.data.shop_vision) ? "Modify shop vision" : data.data.shop_vision}</p>
            </div>

            <div class="box">
                <h3 class="innerH">Mission</h3>
                <p id="shop_mission" data-value="${data.data.shop_mission || ""}">${(!data.data.shop_mission) ? "Modify shop mission" : data.data.shop_mission}</p>
            </div>
            `;

        if (data.data.is_owner) {
            info.innerHTML += `            
            <div class="utilButtons">
                <button type="button" id="modify" onclick="modifyShop()">Modify</button>
            </div>
            `;
        }
    } catch (error) {
        console.error("Error loading profile: ", error);
    }
}

function modifyShop() {
    const shopImg = document.getElementById("shop-img");

    if (!document.getElementById("shop_img_input")) {
        shopImg.innerHTML += `
            <label>
                <input type="file" id="shop-img-input" accept="image/*">
            </label>
        `;
    }

    const fields = [
        { id: "shop_owner", type: "input" },
        { id: "shop_history", type: "textarea" },
        { id: "shop_vision", type: "textarea" },
        { id: "shop_mission", type: "textarea" }
    ];

    fields.forEach(f => {
        const el = document.getElementById(f.id);
        const value = el.dataset.value || "";

        if (f.type === "input") {
            el.innerHTML = `<input type="text" id="${f.id}_input" value="${value}" placeholder="Enter ${f.id} here">`;
        } else {
            el.innerHTML = `<textarea id="${f.id}_input" placeholder="Enter ${f.id} here">${value}</textarea>`;
        }
    });

    const utilButtons = document.querySelector(".utilButtons");
    const modifyButton = document.getElementById("modify");

    utilButtons.innerHTML = `
        <button type="button" id="modify" onclick="saveShop()">Save</button>
        <button type="button" id="cancel" onclick="window.location.reload();">Cancel</button>
    `;
}

async function saveShop() {
    if (!(await showConfirm("Save shop changes?"))) return;

    const shopImg = document.getElementById("shop-img-input")?.files[0];

    const formData = new FormData();
    formData.append("shop_img_path", shopImg);
    formData.append("shop_owner", document.getElementById("shop_owner_input").value);
    formData.append("shop_history", document.getElementById("shop_history_input").value);
    formData.append("shop_vision", document.getElementById("shop_vision_input").value);
    formData.append("shop_mission", document.getElementById("shop_mission_input").value);

    try {
        const response = await fetch("funcs/php/user/updateShop.php", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        showNotification(data.message, data.status === "success" ? "success" : "error");

        if (data.status === "success") {
            displayProfile();
        } else {
            window.location.reload();
        }
    } catch (error) {
        console.error("Error saving shop:", error);
    }
}

function renderStars(rating) {
    const maxStars = 5;
    let stars = "";

    for (let i = 1; i <= maxStars; i++) {
        stars += i <= rating ? "★" : "☆";
    }

    return stars;
}

async function loadFeedback() {
    const feedbackList = document.querySelector(".feedback-list");

    feedbackList.innerHTML = "";

    try {
        const response = await fetch("funcs/php/user/loadFeedback.php", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) throw new Error("Network response was not ok.");

        const data = await response.json();

        data.data.forEach(c => {
            feedbackList.innerHTML += `
                <article class="feedback">
                    <div class="right">
                        <img src="${c.user_img_path}" alt="User Icon" class="user-icon">
                        <h4>${c.user_name}</h4>
                        <p class="text">${renderStars(c.feedback_rating)}</p>
                        <p class="text">${c.feedback_message}</p>
                        ${c.is_owner ? `
                            <div class="actions">
                                <button onclick="editFeedback(this.closest('.feedback'), '${c.user_name}', '${c.feedback_message}', ${c.feedback_rating}, ${c.feedback_id})">Edit</button>
                                <button onclick="deleteFeedback(${c.feedback_id})">Delete</button>
                            </div>
                        ` : ""}
                    </div>
                </article>

            `
        })

    } catch (error) {
        console.error("Error loading feedback: ", error);
    }
}

async function editFeedback(feedbackCard, name, message, rating, feedback_id) {
    feedbackCard.innerHTML = `
        <div id="input-feedback">
            <h4 id="user_name">${name}</h4>

            <div class="rate">
                ${[5, 4, 3, 2, 1].map(i => `
                    <input type="radio" id="star${i}" name="ratingsEdit" value="${i}">
                    <label for="star${i}">${i}</label>
                `).join("")}
            </div>

            <textarea id="feedbackEdit" rows="3">${message}</textarea>
            <button type="button" id="editButton">Save</button>
            <button type="button" onclick="loadFeedback()">Cancel</button>
        </div>
    `;

    feedbackCard.querySelector(`input[value="${rating}"]`).checked = true;

    document.getElementById("editButton").onclick = async () => {
        if (!(await showConfirm("Change your feedback message?"))) return;

        const ratingInput = document.querySelector("input[name=ratingsEdit]:checked");
        const messageInput = document.getElementById("feedbackEdit");

        const formData = new FormData();
        formData.append("feedback_id", feedback_id);
        formData.append("feedback_message", messageInput.value);
        formData.append("feedback_rating", ratingInput.value);

        try {
            const response = await fetch("funcs/php/user/editFeedback.php", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            showNotification(data.message, "success");
            loadFeedback();
        } catch (error) {
            console.error("Error editing feedback:", error);
        }
    };
}

async function deleteFeedback(feedback_id) {
    if (!(await showConfirm("Do you want to remove your feedback?"))) return;

    const formData = new FormData();
    formData.append("feedback_id", feedback_id);

    try {
        const response = await fetch("funcs/php/user/deleteFeedback.php", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        showNotification(data.message, "success");
        loadFeedback();
    } catch (error) {
        console.error("Error deleting feedback:", error);
    }
}

async function uploadFeedback() {
    const feedback_message = document.getElementById("feedback");
    const feedback_rating = document.querySelector("input[name='rating']:checked");

    if (!feedback_message.value || !feedback_rating) {
        showNotification("Please complete the feedback.", "error");
        return;
    }

    const formData = new FormData();
    formData.append("feedback_message", feedback_message.value);
    formData.append("feedback_rating", feedback_rating.value);

    try {
        const response = await fetch("funcs/php/user/uploadFeedback.php", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        showNotification(data.message, data.status === "success" ? "success" : "error");

        if (data.status === "unauthorized") {
            window.location.href = "SignIn.html";
        } else {
            loadFeedback();
        }
    } catch (error) {
        console.error("Error uploading feedback:", error);
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