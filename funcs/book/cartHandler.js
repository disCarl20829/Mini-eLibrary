document.addEventListener("DOMContentLoaded", async function () {
    await loadBooks();
})

async function loadBooks() {
    const bookList = document.getElementById("book-list");

    try {
        const response = await fetch(`funcs/php/fetchCart.php`, {
            method: "GET",
            headers: { "ContentType": "application/json" },
        })

        if (!response.ok) throw new Error("Network response was not ok.");

        const data = await response.json();

        bookList.innerHTML = "";

        if (!data.data) return;

        data.data.forEach(bCart => {
            const card = document.createElement("div");
            card.id = `${bCart.book_id}`;
            card.classList = "book-card";
            card.innerHTML = `
                <img src="${bCart.book_img_path}" alt="${bCart.book_title}">
                <div class="book-info">
                    <h3>${bCart.book_title}</h3>
                    <p class="author">by ${bCart.book_author}</p>

                    <label class="qty">Quantity</label>
                        <input type="number" min="1" value="${bCart.save_quantity}" title="quantity" class="quantity" disabled>
                        <button type="button" onclick="quantityCrement(this.closest('.book-info'), ${bCart.book_id}, '+')">+</button>
                        <button type="button" onclick="quantityCrement(this.closest('.book-info'), ${bCart.book_id}, '-')">-</button>
                    </div>

                    <div class="price">
                        <span class="price-text" id="price">₱${(bCart.book_price * bCart.save_quantity).toLocaleString()}.00</span>
                    </div>

                    <div class="card-actions">
                        <button class="remove" onclick="removeBook(${bCart.book_id})">Remove</button>
                    </div>
            `;

            sessionStorage.setItem(bCart.book_id, JSON.stringify(bCart))
            bookList.appendChild(card);
        })

        totalAmount();
    } catch (error) {
        console.error("Error fetching carts: ", error);
    }
}

async function totalAmount() {
    const totalDisplay = document.getElementById("total-amount");

    let total = 0;

    try {
        const response = await fetch("funcs/php/fetchCart.php", {
            method: "GET",
            headers: { "ContentType": "application/json" },
        });

        if (!response) {
            throw new Error("Network response was not ok.");
        }

        const data = await response.json();

        data.data.forEach(bCart => {
            const quantity = bCart.save_quantity;
            const price = bCart.book_price;

            total += quantity * price;
        })
    } catch (error) {
        console.error("Error fetching carts: ", error);
    }

    totalDisplay.textContent = "₱" + total.toLocaleString() + ".00";
}

async function removeBook(book_id) {
    if (!(await showConfirm("Are you sure you want to remove this book?"))) return;

    try {
        const response = await fetch(`funcs/php/removeCart.php?book_id=${book_id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }

        const data = await response.json();

        showNotification(data.message, data.status === "success" ? "success" : "error");

        sessionStorage.removeItem(book_id);

        totalAmount();
        setTimeout(() => 
            loadBooks(), 
        800);
    } catch (error) {
        console.error("Error removing book: ", error);
        showNotification("Failed to remove book.", "error");
    }
}

async function quantityCrement(row, book_id, symbol) {
    const quantity = row.querySelector(".quantity");

    let currentQty = parseInt(quantity.value) || 1;

    if (symbol === "+") {
        currentQty += 1;
    } else if (symbol === "-" && currentQty > 1) {
        currentQty -= 1;
    }

    let formData = new FormData();
    formData.append("save_quantity", currentQty);
    formData.append("book_id", book_id);

    try {
        const response = await fetch("funcs/php/addCart.php", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }

        const data = await response.json();

        if (data.status == "updated") {
            loadBooks();
            console.warn("Updated cart of user: " + book_id);
        }
    } catch (error) {
        console.error("Error adding book to cart: ", error);
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