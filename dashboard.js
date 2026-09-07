/* =========================================================
   ZEMA ROYALE — RESTAURANT DASHBOARD
   SUPABASE ONLINE VERSION
   ========================================================= */

const SUPABASE_URL =
    "https://fywchmoqexsqldsxaatk.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_nCuOx745eMyJBz91GZXWzA_CveVVueR";


/* =========================================================
   SUPABASE REQUEST
   ========================================================= */

async function supabaseRequest(endpoint, options = {}) {

    const response = await fetch(
        SUPABASE_URL + "/rest/v1/" + endpoint,
        {
            ...options,

            headers: {
                "apikey": SUPABASE_KEY,
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        }
    );

    if (!response.ok) {

        const errorText = await response.text();

        throw new Error(
            errorText || "Supabase request failed."
        );
    }

    const text = await response.text();

    return text ? JSON.parse(text) : null;
}


/* =========================================================
   GET ORDERS FROM SUPABASE
   ========================================================= */

async function getOrders() {

    try {

        return await supabaseRequest(
            "orders?select=*&order=created_at.desc"
        );

    } catch (error) {

        console.error(
            "Could not load orders:",
            error
        );

        return [];

    }
}


/* =========================================================
   UPDATE ORDER STATUS
   ========================================================= */

async function updateOrderStatus(id, newStatus) {

    try {

        await supabaseRequest(
            `orders?id=eq.${id}`,
            {
                method: "PATCH",

                headers: {
                    "Prefer": "return=minimal"
                },

                body: JSON.stringify({
                    status: newStatus
                })
            }
        );

        await render();

    } catch (error) {

        console.error(
            "Status update failed:",
            error
        );

        alert(
            "Could not update the order. Please try again."
        );
    }
}


/* =========================================================
   FORMAT MONEY
   ========================================================= */

function money(value) {

    return Number(value || 0)
        .toLocaleString() + " ETB";

}


/* =========================================================
   SAFE TEXT
   ========================================================= */

function safe(value) {

    return String(value ?? "")
        .replace(
            /[&<>"']/g,
            character => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[character])
        );

}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatTime(value) {

    if (!value) {
        return "";
    }

    const date = new Date(value);

    return date.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   RENDER DASHBOARD
   ========================================================= */

async function render() {

    const orders = await getOrders();


    /* =====================================================
       STATISTICS
       ===================================================== */

    const todayString =
        new Date().toDateString();


    const todayOrders =
        orders.filter(order => {

            return new Date(
                order.created_at
            ).toDateString() === todayString;

        });


    const todaySales =
        todayOrders.reduce(
            (sum, order) =>
                sum + Number(order.total || 0),
            0
        );


    const newOrders =
        orders.filter(
            order =>
                order.status === "New"
        ).length;


    const activeOrders =
        orders.filter(
            order =>
                order.status === "Preparing" ||
                order.status === "Ready"
        ).length;


    const completedOrders =
        orders.filter(
            order =>
                order.status === "Completed"
        ).length;


    const averageOrder =
        todayOrders.length
            ? Math.round(
                todaySales /
                todayOrders.length
            )
            : 0;


    /* =====================================================
       UPDATE STAT CARDS
       ===================================================== */

    const newElement =
        document.getElementById(
            "newOrders"
        );

    if (newElement) {
        newElement.textContent =
            newOrders;
    }


    const activeElement =
        document.getElementById(
            "activeOrders"
        );

    if (activeElement) {
        activeElement.textContent =
            activeOrders;
    }


    const completedElement =
        document.getElementById(
            "completedOrders"
        );

    if (completedElement) {
        completedElement.textContent =
            completedOrders;
    }


    const salesElement =
        document.getElementById(
            "todaySales"
        );

    if (salesElement) {

        salesElement.textContent =
            money(todaySales);

    }


    const ordersTodayElement =
        document.getElementById(
            "ordersToday"
        );

    if (ordersTodayElement) {

        ordersTodayElement.textContent =
            todayOrders.length;

    }


    const averageElement =
        document.getElementById(
            "averageOrder"
        );

    if (averageElement) {

        averageElement.textContent =
            money(averageOrder);

    }


    /* =====================================================
       TOP SELLING ITEM
       ===================================================== */

    const itemCounts = {};


    todayOrders.forEach(order => {

        let items = [];

        try {

            items =
                Array.isArray(order.items)
                    ? order.items
                    : JSON.parse(
                        order.items || "[]"
                    );

        } catch {

            items = [];

        }


        items.forEach(item => {

            const name =
                item.name || "Unknown";


            itemCounts[name] =
                (itemCounts[name] || 0) +
                Number(item.quantity || 0);

        });

    });


    const top =
        Object.entries(itemCounts)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )[0];


    const topElement =
        document.getElementById(
            "topItem"
        );


    if (topElement) {

        topElement.textContent =
            top
                ? top[0]
                : "—";

    }


    /* =====================================================
       ORDERS LIST
       ===================================================== */

    const list =
        document.getElementById(
            "ordersList"
        );


    if (!list) {
        return;
    }


    if (!orders.length) {

        list.innerHTML = `
            <div class="empty">

                No orders yet.

                <br>

                Orders placed from the
                ZEMA ROYALE customer menu
                will appear here automatically.

            </div>
        `;

        return;
    }


    list.innerHTML =
        orders.map(order => {

            let items = [];

            try {

                items =
                    Array.isArray(order.items)
                        ? order.items
                        : JSON.parse(
                            order.items || "[]"
                        );

            } catch {

                items = [];

            }


            let action = "";


            if (
                order.status === "New"
            ) {

                action = `
                    <button
                        class="action"
                        onclick="
                            updateOrderStatus(
                                ${order.id},
                                'Preparing'
                            )
                        ">

                        START PREPARING

                    </button>
                `;

            }


            else if (
                order.status === "Preparing"
            ) {

                action = `
                    <button
                        class="action"
                        onclick="
                            updateOrderStatus(
                                ${order.id},
                                'Ready'
                            )
                        ">

                        MARK READY

                    </button>
                `;

            }


            else if (
                order.status === "Ready"
            ) {

                action = `
                    <button
                        class="action"
                        onclick="
                            updateOrderStatus(
                                ${order.id},
                                'Completed'
                            )
                        ">

                        COMPLETE

                    </button>
                `;

            }


            const itemText =
                items.length
                    ? items.map(
                        item =>
                            `${safe(item.name)}
                             × ${Number(item.quantity || 0)}`
                    ).join(" • ")
                    : "No items";


            return `

                <div class="order">

                    <div>

                        <span class="badge">

                            ${safe(
                                order.status
                            ).toUpperCase()}

                        </span>


                        <div class="customer">

                            Order
                            #${safe(
                                order.order_number
                            )}

                        </div>


                        <div class="meta">

                            ${safe(
                                order.customer
                            )}

                            • Table/Room

                            ${safe(
                                order.table_number
                            )}

                            •

                            ${formatTime(
                                order.created_at
                            )}

                        </div>

                    </div>


                    <div class="items">

                        ${itemText}

                    </div>


                    <div>

                        <div class="total">

                            ${money(
                                order.total
                            )}

                        </div>


                        <div class="actions">

                            ${action}

                        </div>

                    </div>

                </div>

            `;

        }).join("");

}


/* =========================================================
   CLEAR LOCAL DEMO DATA
   ========================================================= */

const clearButton =
    document.getElementById(
        "clearOrders"
    );


if (clearButton) {

    clearButton.onclick =
        function () {

            alert(
                "Orders are now stored online in Supabase. Use the Supabase dashboard to delete test orders."
            );

        };

}


/* =========================================================
   START
   ========================================================= */

render();


/* =========================================================
   AUTO REFRESH
   ========================================================= */

setInterval(
    render,
    2000
);