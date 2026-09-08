/* =========================================================
   ZEMA ROYALE — DIGITAL ORDER SYSTEM
   ========================================================= */

const ORDER_KEY = "zemaRoyaleOrders";
const SUPABASE_URL = "https://fywchmoqexsqldsxaatk.supabase.co";
const SUPABASE_KEY = "sb_publishable_nCuOx745eMyJBz91GZXWzA_CveVVueR";

let cart = [];

let selectedFood = null;


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function getOrders() {
    return JSON.parse(localStorage.getItem(ORDER_KEY) || "[]");
}


function saveOrders(orders) {
    localStorage.setItem(
        ORDER_KEY,
        JSON.stringify(orders)
    );
}


function money(value) {
    return Number(value).toLocaleString() + " ETB";
}


function escapeHTML(value) {

    return String(value).replace(
        /[&<>"']/g,

        function (character) {

            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[character];

        }
    );
}


/* =========================================================
   FOOD DATA
   ========================================================= */

const foods = {

    "Doro Wot": {
        category: "ETHIOPIAN",
        price: 450,
        image: "doro-wot.jpg",
        description:
            "Traditional Ethiopian chicken stew prepared with berbere, onions and carefully selected spices."
    },

    "Special Tibs": {
        category: "ETHIOPIAN",
        price: 520,
        image: "tibs.jpg",
        description:
            "Tender pieces of meat sautéed with peppers, onions and aromatic Ethiopian herbs."
    },

    "Kitfo Royale": {
        category: "ETHIOPIAN",
        price: 550,
        image: "kitfo.jpg",
        description:
            "A refined Ethiopian classic seasoned with traditional spices and served with care."
    },

    "Royal Mixed Grill": {
        category: "GRILL",
        price: 650,
        image: "mixed-grill.jpg",
        description:
            "A premium selection of grilled meats prepared for guests who want the full royal experience."
    },

    "Royal Alfredo": {
        category: "INTERNATIONAL",
        price: 380,
        image: "pasta.jpg",
        description:
            "Creamy pasta prepared with a rich and luxurious sauce for a modern international taste."
    },

    "Royal Grilled Chicken": {
        category: "INTERNATIONAL",
        price: 420,
        image: "chicken.jpg",
        description:
            "Juicy grilled chicken served with our signature sides and carefully prepared seasoning."
    },

    "Fresh Tropical Juice": {
        category: "DRINKS",
        price: 150,
        image: "juice.jpg",
        description:
            "Freshly prepared tropical fruit juice served chilled for a refreshing experience."
    },

    "Ethiopian Coffee": {
        category: "DRINKS",
        price: 120,
        image: "coffee.jpg",
        description:
            "Traditional Ethiopian coffee prepared with care and served with the spirit of Ethiopian hospitality."
    }

};


/* =========================================================
   SEARCH
   ========================================================= */

const searchInput =
    document.getElementById("searchInput");


if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterFoods
    );

}


function filterFoods() {

    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";

    const activeButton =
        document.querySelector(
            ".category-btn.active"
        );

    const category =
        activeButton
            ? activeButton.dataset.category
            : "all";


    document.querySelectorAll(
        ".food-card"
    ).forEach(card => {

        const name =
            card.querySelector(
                ".food-name"
            )?.textContent
            .toLowerCase() || "";

        const description =
            card.querySelector(
                ".food-description"
            )?.textContent
            .toLowerCase() || "";

        const cardCategory =
            card.dataset.category;


        const matchesSearch =
            name.includes(search) ||
            description.includes(search);


        const matchesCategory =
            category === "all" ||
            cardCategory === category;


        card.style.display =
            matchesSearch &&
            matchesCategory
                ? ""
                : "none";

    });

}


/* =========================================================
   CATEGORY FILTER
   ========================================================= */

document.querySelectorAll(
    ".category-btn"
).forEach(button => {

    button.addEventListener(
        "click",
        function () {

            document.querySelectorAll(
                ".category-btn"
            ).forEach(btn =>
                btn.classList.remove("active")
            );


            this.classList.add("active");


            filterFoods();

        }
    );

});


/* =========================================================
   FOOD DETAILS MODAL
   ========================================================= */

function createFoodModal() {

    if (document.getElementById("foodModal")) {
        return;
    }


    const modal =
        document.createElement("div");

    modal.id = "foodModal";

    modal.className = "food-modal";


    modal.innerHTML = `

        <div class="food-modal-box">

            <button
                class="close-modal"
                id="closeFoodModal">
                ×
            </button>


            <div class="food-modal-image">

                <img
                    id="foodModalImage"
                    src=""
                    alt="">

            </div>


            <div class="food-modal-content">

                <span
                    class="food-modal-category"
                    id="foodModalCategory">
                </span>


                <h2 id="foodModalName"></h2>


                <div
                    class="food-modal-price"
                    id="foodModalPrice">
                </div>


                <p
                    class="food-modal-description"
                    id="foodModalDescription">
                </p>


                <button
                    class="add-to-order"
                    id="addToOrder">
                    ADD TO ORDER
                </button>

            </div>

        </div>
    `;


    document.body.appendChild(modal);


    document
        .getElementById("closeFoodModal")
        .addEventListener(
            "click",
            closeFoodModal
        );


    document
        .getElementById("addToOrder")
        .addEventListener(
            "click",
            addSelectedFood
        );


    modal.addEventListener(
        "click",
        function (event) {

            if (event.target === modal) {
                closeFoodModal();
            }

        }
    );
}


createFoodModal();


/* =========================================================
   OPEN FOOD DETAILS
   ========================================================= */

document.querySelectorAll(
    ".food-card"
).forEach(card => {

    card.addEventListener(
        "click",
        function () {

            const name =
                this.querySelector(
                    ".food-name"
                )?.textContent.trim();


            if (!name || !foods[name]) {
                return;
            }


            selectedFood = name;


            const food = foods[name];


            document.getElementById(
                "foodModalImage"
            ).src = food.image;


            document.getElementById(
                "foodModalImage"
            ).alt = name;


            document.getElementById(
                "foodModalCategory"
            ).textContent = food.category;


            document.getElementById(
                "foodModalName"
            ).textContent = name;


            document.getElementById(
                "foodModalPrice"
            ).textContent = money(food.price);


            document.getElementById(
                "foodModalDescription"
            ).textContent = food.description;


            document.getElementById(
                "foodModal"
            ).classList.add("show");


            document.body.classList.add(
                "modal-open"
            );

        }
    );

});


function closeFoodModal() {

    const modal =
        document.getElementById("foodModal");

    if (modal) {
        modal.classList.remove("show");
    }

    document.body.classList.remove(
        "modal-open"
    );
}


/* =========================================================
   ADD FOOD TO CART
   ========================================================= */

function addSelectedFood() {

    if (!selectedFood) {
        return;
    }


    const existing =
        cart.find(
            item =>
                item.name === selectedFood
        );


    if (existing) {

        existing.quantity++;

    } else {

        cart.push({

            name: selectedFood,

            price:
                foods[selectedFood].price,

            quantity: 1

        });

    }


    updateCartCount();

    closeFoodModal();

    openCart();

}


/* =========================================================
   CART
   ========================================================= */

function createCart() {

    if (document.getElementById("cartModal")) {
        return;
    }


    const modal =
        document.createElement("div");

    modal.id = "cartModal";

    modal.className = "cart-modal";


    modal.innerHTML = `

        <div class="cart-box">

            <button
                class="close-modal"
                id="closeCart">
                ×
            </button>


            <h2>Your Order</h2>

            <p class="cart-subtitle">
                Review your selections before placing your order.
            </p>


            <div
                class="cart-items"
                id="cartItems">
            </div>


            <div class="cart-total">

                <span>
                    TOTAL
                </span>

                <strong
                    id="cartTotal">
                    0 ETB
                </strong>

            </div>


            <div class="customer-form">

                <input
                    type="text"
                    id="customerName"
                    placeholder="Your name">


                <input
                    type="text"
                    id="customerTable"
                    placeholder="Table / Room number">

            </div>


            <button
                class="place-order-button"
                id="placeOrderButton">
                PLACE ORDER
            </button>

        </div>
    `;


    document.body.appendChild(modal);


    document
        .getElementById("closeCart")
        .addEventListener(
            "click",
            closeCart
        );


    document
        .getElementById("placeOrderButton")
        .addEventListener(
            "click",
            placeOrder
        );


    modal.addEventListener(
        "click",
        function (event) {

            if (event.target === modal) {
                closeCart();
            }

        }
    );
}


createCart();


/* =========================================================
   CART BUTTON
   ========================================================= */

const cartButton =
    document.getElementById("cartButton");


if (cartButton) {

    cartButton.addEventListener(
        "click",
        openCart
    );

}


function openCart() {

    renderCart();


    document
        .getElementById("cartModal")
        .classList.add("show");


    document.body.classList.add(
        "modal-open"
    );

}


function closeCart() {

    document
        .getElementById("cartModal")
        .classList.remove("show");


    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================================
   RENDER CART
   ========================================================= */

function renderCart() {

    const container =
        document.getElementById("cartItems");


    const totalElement =
        document.getElementById("cartTotal");


    if (!container) {
        return;
    }


    if (cart.length === 0) {

        container.innerHTML = `

            <div class="empty-cart"
                 style="
                    padding:30px 0;
                    text-align:center;
                    color:#777e76;
                 ">

                Your order is currently empty.

            </div>
        `;


        totalElement.textContent =
            "0 ETB";

        return;
    }


    container.innerHTML =
        cart.map(
            (item, index) => `

                <div class="cart-item">

                    <div>

                        <div class="cart-item-name">
                            ${escapeHTML(item.name)}
                        </div>

                        <div class="cart-item-price">
                            ${money(item.price * item.quantity)}
                        </div>

                    </div>


                    <div class="quantity-controls">

                        <button
                            onclick="changeQuantity(${index}, -1)">
                            −
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button
                            onclick="changeQuantity(${index}, 1)">
                            +
                        </button>

                        <button
                            class="remove-item"
                            onclick="removeCartItem(${index})">
                            ×
                        </button>

                    </div>

                </div>
            `
        ).join("");


    const total =
        cart.reduce(
            (sum, item) =>
                sum +
                item.price *
                item.quantity,
            0
        );


    totalElement.textContent =
        money(total);

}


/* =========================================================
   QUANTITY
   ========================================================= */

function changeQuantity(index, amount) {

    if (!cart[index]) {
        return;
    }


    cart[index].quantity += amount;


    if (cart[index].quantity <= 0) {

        cart.splice(index, 1);

    }


    updateCartCount();

    renderCart();

}


/* =========================================================
   REMOVE ITEM
   ========================================================= */

function removeCartItem(index) {

    cart.splice(index, 1);

    updateCartCount();

    renderCart();

}


/* =========================================================
   CART COUNT
   ========================================================= */

function updateCartCount() {

    const count =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    const element =
        document.getElementById(
            "cartCount"
        );


    if (element) {
        element.textContent = count;
    }

}


/* =========================================================
   PLACE ORDER
   ========================================================= */

async function placeOrder() {

    if (cart.length === 0) {
        alert("Your order is empty. Please add an item first.");
        return;
    }

    const customerInput =
        document.getElementById("customerName");

    const tableInput =
        document.getElementById("customerTable");

    const customerName =
        customerInput.value.trim();

    const tableNumber =
        tableInput.value.trim();

    if (!customerName) {
        alert("Please enter your name.");
        customerInput.focus();
        return;
    }

    if (!tableNumber) {
        alert("Please enter your table or room number.");
        tableInput.focus();
        return;
    }

    const total =
        cart.reduce(
            (sum, item) =>
                sum + item.price * item.quantity,
            0
        );

    try {

        /* Get latest order number */
        const latestResponse = await fetch(
            SUPABASE_URL +
            "/rest/v1/orders?select=order_number&order=order_number.desc&limit=1",
            {
                headers: {
                    "apikey": SUPABASE_KEY
                }
            }
        );

        if (!latestResponse.ok) {
            throw new Error(
                await latestResponse.text()
            );
        }

        const latestOrders =
            await latestResponse.json();

        const orderNumber =
            latestOrders.length > 0
                ? Number(latestOrders[0].order_number) + 1
                : 1001;


        /* Create order */
        const order = {
            order_number: orderNumber,

            customer: customerName,

            table_number: tableNumber,

            items: cart.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),

            total: total,

            status: "New"
        };


        /* Send order to Supabase */
        const response = await fetch(
            SUPABASE_URL + "/rest/v1/orders",
            {
                method: "POST",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },

                body: JSON.stringify(order)
            }
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(errorText);
        }


        /* Clear cart */
        cart = [];

        updateCartCount();

        customerInput.value = "";

        tableInput.value = "";

        closeCart();


        /* Show success */
        showOrderSuccess({
            orderNumber: orderNumber,
            customer: customerName,
            table: tableNumber,
            items: order.items,
            total: total,
            status: "New"
        });


    } catch (error) {

        console.error(
            "SUPABASE ORDER ERROR:",
            error
        );

        alert(
            "Order could not be sent. Please try again."
        );
    }
}
/* =========================================================
   ORDER SUCCESS
   ========================================================= */

function showOrderSuccess(order) {

    const modal = document.createElement("div");

    modal.id = "orderSuccess";

    modal.innerHTML = `
        <div style="
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.75);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            padding: 20px;
        ">

            <div style="
                background: #101510;
                border: 1px solid #c9a227;
                border-radius: 16px;
                padding: 35px;
                width: min(500px, 100%);
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            ">

                <div style="
                    font-size: 55px;
                    margin-bottom: 10px;
                ">✓</div>

                <h2 style="
                    color: #c9a227;
                    margin: 0 0 10px;
                    font-size: 30px;
                ">
                    Order Confirmed
                </h2>

                <p style="
                    color: #eee;
                    font-size: 17px;
                    margin-bottom: 25px;
                ">
                    Thank you, ${order.customer}!
                </p>

                <div style="
                    background: #181e18;
                    border-radius: 10px;
                    padding: 18px;
                    text-align: left;
                    margin-bottom: 20px;
                ">

                    <p style="color:#c9a227;">
                        <strong>Order #${order.orderNumber}</strong>
                    </p>

                    <p>
                        Table / Room:
                        <strong>${order.table}</strong>
                    </p>

                    <p>
                        Total:
                        <strong>${order.total} ETB</strong>
                    </p>

                </div>

                <p style="
                    color: #aaa;
                    margin-bottom: 20px;
                ">
                    Your order has been sent to the restaurant.
                </p>

                <button id="successCloseButton" style="
                    width: 100%;
                    padding: 14px;
                    border: 1px solid #c9a227;
                    background: #c9a227;
                    color: #111;
                    font-weight: bold;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 15px;
                ">
                    DONE
                </button>

            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document
        .getElementById("successCloseButton")
        .addEventListener("click", function () {
            modal.remove();
        });
}


/* =========================================================
    KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "") {
            return;
        }


        const success =
            document.getElementById(
                "orderSuccess"
            );


        if (success) {

            success.remove();

        }


        closeFoodModal();

        closeCart();

    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

updateCartCount();

filterFoods();