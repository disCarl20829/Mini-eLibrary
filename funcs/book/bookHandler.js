const objCategory = [
    ["History", 1],
    ["Educational", 2],
    ["Philosophical", 3],
    ["Self-Help", 4],
    ["Fiction", 5],
]

function previewImage(e) {
    const files = e.target.files;

    if (files.length > 0) {
        const imgUrl = URL.createObjectURL(files[0]);
        const imgElement = document.getElementById("previewBookImg")

        imgElement.src = imgUrl;
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

async function displayBooks() {
    try {
        const response = await fetch("funcs/php/crud/getBooks.php", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
            const data = await response.json();

            data.data.forEach(b => {
                const categoryName = objCategory.find(([name, id]) => id == b.category_id)[0];
                const divCategory = document.getElementById(categoryName);

                const book = document.createElement("a");
                book.href = `book.html?book_id=${b.book_id}`;
                book.innerHTML = `
                    <article class="book">
                        <img src="${b.book_img_path}" alt="${b.book_title}">
                        <h4>${b.book_title}</h4>
                        <h5>${b.book_author}</h5>
                        <p>${b.book_description}</p>
                    </article>
                `;

                b['book_category'] = categoryName;
                book.onclick = () => {
                    sessionStorage.setItem("book", JSON.stringify(b));
                };

                divCategory.appendChild(book);
            });
        } else {
            throw new Error("Network response was not ok.");
        }
    } catch (error) {
        console.error("Error displaying books:", error);
    }
}

async function createBook(e) { //Creates new book entry
    e.preventDefault(); //Prevents reload

    if (!(await showConfirm("Add this book?"))) return;

    const fileInput = document.getElementById("book_img_path");
    const file = fileInput.files[0]; //Select first file since input file is considered as manys

    let select = document.getElementById("book_category");
    let selectedOption = select.options[select.selectedIndex];
    let categoryID = selectedOption.value; //Sets the 'selected' option from category

    let formData = new FormData(); //Form creation for database
    formData.append("book_title", document.getElementById("book_title").value);
    formData.append("book_category", categoryID); //2
    formData.append("book_author", document.getElementById("book_author").value);
    formData.append("book_pubdate", document.getElementById("book_pubdate").value);
    formData.append("book_description", document.getElementById("book_description").value)
    formData.append("book_price", document.getElementById("book_price").value);
    formData.append("book_img_path", file);

    try {
        const response = await fetch("funcs/php/crud/createBook.php", { //Calls an API for backend or database
            method: "POST",
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            showNotification(data.message, data.status === "success" ? "success" : "error");
            setTimeout(() => {
                window.location.href = "Update.html";
            }, 3000)
        } else {
            throw new Error("Network response was not ok.");
        }
    } catch (error) {
        console.error("Error creating book:", error);
    }
}

async function loadBooks() {
    try {
        const response = await fetch("funcs/php/crud/getBooks.php", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
            const data = await response.json();
            const bookList = document.getElementById("book-list");

            bookList.innerHTML = "";

            data.data.forEach(b => {
                console.log(b.book_title);

                const row = document.createElement("tr");
                row.id = `book-${b.book_id}`;
                row.innerHTML = `
                <td data-label="ID">${b.book_id}</td>
                <td data-label="Image">
                    <img src="${b.book_img_path}" alt="${b.book_title}">
                </td>
                <td data-label="Title">
                    <input type="text" value="${b.book_title}" disabled>
                </td>
                <td data-label="Author">
                    <input type="text" value="${b.book_author}" disabled>
                </td>
                <td data-label="Year">
                    <input type="text" value="${b.book_pubdate}" disabled>
                </td>
                <td data-label="Category">
                   <select disabled>
                       ${objCategory.map(([name, id]) => `
                        <option value="${id}" ${b.category_id == id ? "selected" : ""}>${name}</option>
                        `).join("")}
                   </select>
                </td>
                <td data-label="Price">
                    <input type="text" value="${b.book_price}" disabled>
                </td>
                <td data-label="Description">
                    <textarea disabled>${b.book_description}</textarea>
                 </td>
                <td data-label="Actions">
                    <button onclick="editBook(this, ${b.book_id})" type="button">Edit</button>
                    <button onclick="deleteBook(${b.book_id}, '${b.book_img_path}')" type="button">Delete</button>
                </td>
        `;


                bookList.innerHTML += row.innerHTML;
            })
        } else {
            throw new Error("Network response was not ok.");
        }
    } catch (error) {
        console.error("Error loading books:", error);
    }
}

async function editBook(row, id) { // this, book_id
    const getRow = row.closest("tr");
    const form = getRow.querySelectorAll("input, textarea, select");

    const inputs = getRow.querySelectorAll("input[type='text']");
    const textarea = getRow.querySelector("textarea");

    form.forEach(input => input.disabled = false);

    const imgCell = getRow.querySelector("td:nth-child(2)");
    imgCell.innerHTML += `<input type="file" id="new_book_img_path_${id}">`;

    row.textContent = "Save";
    row.style.backgroundColor = "#4CAF50";
    row.onclick = async function () {
        if (!(await showConfirm("Are you sure you want to save changes?"))) { loadBooks(); return; };

        let select = getRow.querySelector("select");
        let selectedOption = select.options[select.selectedIndex];
        let categoryID = selectedOption.value;

        let formData = new FormData();
        formData.append("book_id", id);
        formData.append("book_title", inputs[0].value);
        formData.append("book_author", inputs[1].value);
        formData.append("book_pubdate", inputs[2].value);
        formData.append("book_category", categoryID);
        formData.append("book_price", inputs[3].value);
        formData.append("book_description", textarea.value);
        formData.append("book_img_path", document.getElementById(`new_book_img_path_${id}`).files[0]);
        formData.append("old_book_img_path", imgCell.querySelector("img").src);

        try {
            const response = await fetch("funcs/php/crud/editBook.php", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                showNotification(data.message, data.status === "success" ? "success" : "error");
                loadBooks();
            } else {
                throw new Error("Network response was not ok.");
            }
        } catch (error) {
            console.error("Error updating book:", error);
        }
    }
}

async function deleteBook(id, imgPath) {
    let formData = new FormData();
    formData.append("book_id", id);
    formData.append("book_img_path", imgPath);

    if (!(await showConfirm("Are you sure you want to delete this book?"))) return;

    try {
        const response = await fetch("funcs/php/crud/deleteBook.php", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            showNotification(data.message, data.status === "success" ? "success" : "error");
            loadBooks();
        } else {
            throw new Error("Network response was not ok.");
        }
    } catch (error) {
        console.error("Error deleting book:", error);
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