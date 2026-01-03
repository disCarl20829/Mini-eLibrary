document.addEventListener("DOMContentLoaded", function () {
    loadBook()
});

async function loadBook() {
    const book = JSON.parse(sessionStorage.getItem("book"));
    const display = document.querySelector(".book");

    let quantity = 1;

    try {
        const response = await fetch(`funcs/php/displayQuantity.php?book_id=${book.book_id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) throw new Error("Network response was not ok.");

        const data = await response.json();

        if (data.status == "exists") {
            quantity = (data.save_quantity < 1) ? 1 : data.save_quantity;
        }
    } catch (error) {
        console.error("Error fetching to display: ", error);
    }

    display.innerHTML = `
            <div class="booksec">
                <img src="${book.book_img_path}" alt="${book.book_title}">
            </div>

            <div class="book-info">
                <h4 class="title" id="title">${book.book_title}</h4>
                <h5 class="author">Author: ${book.book_author}</h5>
                <p class="year">Year Published: ${book.book_pubdate}</p>
                <p class="category">Category: ${book.book_category}</p>

                <br>

                <p>${book.book_description}</p>

                <br>

                <h4 class="book-price">₱${book.book_price.toLocaleString()}.00</h4>

                <div class="qty-price-row">
                    <label class="qty">Quantity</label>
                    <input type="number" min="1" value=${quantity} title="quantity" id="quantity" class="quantity" disabled>
                    <button type="button" onclick="quantityCrement('+')">+</button>
                    <button type="button" onclick="quantityCrement('-')">-</button>
                </div>

                <div class="book-info-footer">
                    <button onclick="addCart()">Save</button>
                    <button onclick="showNotification("Feature unavailable", "warning")">Purchase</button>
                </div>
            </div>
    `;
}

async function addCart() {
    if (!(await showConfirm("Do you want to add this to your cart?"))) return;

    const book_id = JSON.parse(sessionStorage.getItem("book")).book_id;
    const quantity = document.getElementById("quantity");

    let formData = new FormData();
    formData.append("book_id", book_id);
    formData.append("save_quantity", quantity.value);

    try {
        const response = await fetch("funcs/php/addCart.php", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }

        const data = await response.json();

        if (data.status === "inserted") {
            showNotification("Book was added to cart.", "success");
            setTimeout(() => { window.location.href = "SavedBooks.html" }, 1200);
        } else if (data.status === "updated") {
            showNotification("Cart quantity updated.", "info");
        } else {
            showNotification(data.message || "Something went wrong.", "error");
        }
    } catch (error) {
        console.error("Error adding book to cart: ", error);
        showNotification("Failed to add book to cart.", "error");
    }
}

function quantityCrement(symbol) {
    const quantity = document.getElementById("quantity");

    let currentQty = parseInt(quantity.value) || 1;

    if (symbol === "+") {
        currentQty += 1;
    } else if (symbol === "-" && currentQty > 1) {
        currentQty -= 1;
    }

    quantity.value = currentQty;
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