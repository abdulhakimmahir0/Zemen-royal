const KEY = "zemaRoyaleOrders";


/* GET ORDERS */

function getOrders() {

    return JSON.parse(
        localStorage.getItem(KEY) || "[]"
    );

}


/* SAVE ORDERS */

function saveOrders(orders) {

    localStorage.setItem(
        KEY,
        JSON.stringify(orders)
    );

}


/* RENDER DASHBOARD */

function render() {

    const orders = getOrders();


    /* TODAY */

    const today = orders.filter(order => {

        return new Date(order.time).toDateString() ===
               new Date().toDateString();

    });


    /* SALES */

    const sales = today.reduce(
        (sum, order) => {

            return sum + Number(order.total || 0);

        },
        0
    );


    /* STATISTICS */

    document.getElementById("newOrders").textContent =
        orders.filter(
            order => order.status === "New"
        ).length;


    document.getElementById("activeOrders").textContent =
        orders.filter(
            order =>
                order.status === "Preparing" ||
                order.status === "Ready"
        ).length;


    document.getElementById("completedOrders").textContent =
        orders.filter(
            order => order.status === "Completed"
        ).length;


    document.getElementById("todaySales").textContent =
        sales.toLocaleString() + " ETB";


    /* ANALYTICS */

    document.getElementById("ordersToday").textContent =
        today.length;


    const average =
        today.length
            ? Math.round(sales / today.length)
            : 0;


    document.getElementById("averageOrder").textContent =
        average.toLocaleString() + " ETB";


    /* TOP ITEM */

    const itemCounts = {};


    today.forEach(order => {

        order.items.forEach(item => {

            itemCounts[item.name] =
                (itemCounts[item.name] || 0) +
                Number(item.quantity);

        });

    });


    const topItem =
        Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])[0];


    document.getElementById("topItem").textContent =
        topItem ? topItem[0] : "—";


    /* ORDER LIST */

    const list =
        document.getElementById("ordersList");


    if (!orders.length) {

        list.innerHTML = `
            <div class="empty">
                No orders yet.
                Submit an order from the customer menu.
            </div>
        `;

        return;

    }


    /* BUILD ORDERS */

    list.innerHTML =
        orders
        .slice()
        .reverse()
        .map((order, reverseIndex) => {

            const index =
                orders.length - 1 - reverseIndex;


            /* NEXT BUTTON */

            let nextButton = "";


            if (order.status === "New") {

                nextButton = `
                    <button
                        class="action"
                        onclick="changeStatus(${index}, 'Preparing')"
                    >
                        START PREPARING
                    </button>
                `;

            }


            else if (order.status === "Preparing") {

                nextButton = `
                    <button
                        class="action"
                        onclick="changeStatus(${index}, 'Ready')"
                    >
                        MARK READY
                    </button>
                `;

            }


            else if (order.status === "Ready") {

                nextButton = `
                    <button
                        class="action"
                        onclick="changeStatus(${index}, 'Completed')"
                    >
                        COMPLETE
                    </button>
                `;

            }


            /* ITEMS */

            const items =
                order.items
                .map(item => {

                    return `
                        ${safe(item.name)}
                        × ${item.quantity}
                    `;

                })
                .join(" • ");


            /* TIME */

            const time =
                new Date(order.time)
                .toLocaleTimeString(
                    [],
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );


            return `

                <div class="order">

                    <div>

                        <span class="badge">
                            ${safe(order.status).toUpperCase()}
                        </span>

                        <div class="customer">
                            Order #${safe(order.orderNumber)}
                        </div>

                        <div class="meta">

                            ${safe(order.customer)}

                            • Table/Room

                            ${safe(order.table)}

                            •

                            ${time}

                        </div>

                    </div>


                    <div class="items">

                        ${items}

                    </div>


                    <div>

                        <div class="total">

                            ${Number(order.total).toLocaleString()}
                            ETB

                        </div>


                        <div class="actions">

                            ${nextButton}


                            <button
                                class="action"
                                onclick="removeOrder(${index})"
                            >
                                REMOVE
                            </button>

                        </div>

                    </div>

                </div>

            `;

        })
        .join("");

}


/* CHANGE STATUS */

function changeStatus(index, newStatus) {

    const orders = getOrders();


    if (!orders[index]) {
        return;
    }


    orders[index].status = newStatus;


    saveOrders(orders);


    render();

}


/* REMOVE ORDER */

function removeOrder(index) {

    const orders = getOrders();


    orders.splice(index, 1);


    saveOrders(orders);


    render();

}


/* SECURITY */

function safe(value) {

    return String(value).replace(
        /[&<>"']/g,
        character => {

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


/* CLEAR DEMO ORDERS */

document
    .getElementById("clearOrders")
    .addEventListener("click", function () {

        if (
            confirm(
                "Clear all demo orders?"
            )
        ) {

            localStorage.removeItem(KEY);

            render();

        }

    });


/* INITIAL LOAD */

render();


/* AUTO REFRESH */

setInterval(render, 1500);