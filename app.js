// ==========================================
// SalaryOS Dashboard
// app.js
// ==========================================


// ==========================================
// USER DATA (Blank template)
// Real data comes from the user's own entries,
// or later from a backend/API.
// ==========================================

function getBlankDashboardData() {

    return {

        user: {
            name: "User",
            designation: "",
            sector: "",
            email: "",
            picture: ""
        },

        finance: {

            monthlySalary: 0,

            monthlyExpense: 0,

            totalAssets: 0,

            netWorth: 0,

            goalCompleted: 0,

            financialHealth: 0,

            emergencyFund: {

                current: 0,

                target: 0

            },

            budget: {

                used: 0,

                limit: 0

            },

            savingsRate: 0,

            monthlyGrowth: 0,

            goals: [],

            assets: [],

            chartData: {

                transactions: []

            }

        }

    };

}

let dashboardData = getBlankDashboardData();

// ==========================================
// LOCAL STORAGE
// ==========================================

function saveData() {

    localStorage.setItem(

        "salaryOS",

        JSON.stringify(dashboardData)

    );

}

function loadData() {

    const savedData = localStorage.getItem("salaryOS");

    if (savedData) {

        dashboardData = JSON.parse(savedData);

    } else {

        dashboardData = getBlankDashboardData();

    }

    if (!dashboardData.finance.goals) {

        dashboardData.finance.goals = [];

    }

    if (!dashboardData.finance.assets) {

        dashboardData.finance.assets = [];

    }

}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function setText(id, value) {

    document.getElementById(id).textContent = value;

}

function formatCurrency(amount) {

    return "₹" + amount.toLocaleString("en-IN");

}

function formatLakh(amount) {

    return (amount / 100000).toFixed(1);

}

function calculatePercentage(current, target) {

    if (target === 0) return 0;

    return Math.round((current / target) * 100);

}

function calculateFinancialHealth() {

    const finance = dashboardData.finance;

    if (!finance.monthlySalary) return 0;

    const savings =
        finance.monthlySalary - finance.monthlyExpense;

    let score = 0;

    // Savings Rate (50 Marks)

    score += Math.min(
        (savings / finance.monthlySalary) * 50,
        50
    );

    // Emergency Fund (30 Marks)

    score += Math.min(
        finance.emergencyFund.target
            ? (finance.emergencyFund.current /
                finance.emergencyFund.target) * 30
            : 0,
        30
    );

    // Budget (20 Marks)

    score += Math.max(
        20 -
        (
            finance.budget.limit
                ? (finance.budget.used / finance.budget.limit) * 20
                : 0
        ),
        0
    );

    return Math.round(score);

}

// ==========================================
// MONTHLY STATS
// ==========================================

function renderMonthlyStats() {

    const transactions =
        dashboardData.finance.chartData.transactions;

    let income = 0;
    let expense = 0;

    transactions.forEach(item => {

        const amount = Number(
            item.amount
                .replace(/[₹,+-]/g, "")
                .replace(/,/g, "")
        );

        if (item.amount.startsWith("+")) {

            income += amount;

        } else {

            expense += amount;

        }

    });

    setText(
        "monthIncome",
        formatCurrency(income)
    );

    setText(
        "monthExpense",
        formatCurrency(expense)
    );

    setText(
        "monthSavings",
        formatCurrency(income - expense)
    );

    setText(
        "transactionCount",
        transactions.length
    );

}

// ==========================================
// REPORTS
// ==========================================

function renderReports() {

    const transactions =
        dashboardData.finance.chartData.transactions;

    let income = 0;

    let expense = 0;

    transactions.forEach(item => {

        const amount = Number(

            item.amount

                .replace(/[₹,+-]/g, "")

                .replace(/,/g, "")

        );

        if (item.amount.startsWith("+")) {

            income += amount;

        } else {

            expense += amount;

        }

    });

    const savings = income - expense;

    const savingRate = income
        ? Math.round((savings / income) * 100)
        : 0;

    setText(
        "reportIncome",
        formatCurrency(income)
    );

    setText(
        "reportExpense",
        formatCurrency(expense)
    );

    setText(
        "reportSavings",
        formatCurrency(savings)
    );

    setText(
        "reportSavingRate",
        savingRate + "%"
    );

}

// ==========================================
// REPORT TABLE
// ==========================================

function renderReportTable() {

    const tbody = document.getElementById("reportTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    const report = {};

    dashboardData.finance.chartData.transactions.forEach(item => {

        const amount = Number(
            item.amount
                .replace(/[₹,+-]/g, "")
                .replace(/,/g, "")
        );

        if (!report[item.category]) {

            report[item.category] = {

                income: 0,

                expense: 0

            };

        }

        if (item.amount.startsWith("+")) {

            report[item.category].income += amount;

        } else {

            report[item.category].expense += amount;

        }

    });

    Object.keys(report).forEach(category => {

        tbody.innerHTML += `

<tr>

<td>${category}</td>

<td>${report[category].income ? formatCurrency(report[category].income) : "-"}</td>

<td>${report[category].expense ? formatCurrency(report[category].expense) : "-"}</td>

</tr>

`;

    });

}

// ==========================================
// GOALS
// ==========================================

function renderGoals() {

    const tbody = document.getElementById("goalBody");

    if (!tbody) return;

    if (!dashboardData.finance.goals) return;

    tbody.innerHTML = "";

    dashboardData.finance.goals.forEach(goal => {

        const progress = Math.round((goal.saved / goal.target) * 100);
        const status = progress >= 100
            ? `<span class="goal-complete">Completed</span>`
            : `<span class="goal-active">In Progress</span>`;

        tbody.innerHTML += `
        <tr>
            <td>${goal.title}</td>
            <td>${formatCurrency(goal.saved)}</td>
            <td>${formatCurrency(goal.target)}</td>
            <td>

<div class="goal-progress">

<div class="goal-progress-fill"
style="width:${progress}%"></div>

</div>

<span>${progress}%</span>

</td>
            <td>${goal.deadline}</td>
            <td>${status}</td>
            <td>

<button class="add-btn"
onclick="addMoneyToGoal(${goal.id})">

<i class="bi bi-plus-circle"></i>

</button>            
<button class="edit-btn" onclick="editGoal(${goal.id})">

<i class="bi bi-pencil-square"></i>

</button>

<button class="delete-btn" onclick="deleteGoal(${goal.id})">

<i class="bi bi-trash"></i>

</button>

</td>
        </tr>`;
    });
}


function editGoal(id) {

    const goal = dashboardData.finance.goals.find(g => g.id === id);

    if (!goal) return;

    goalEditIndex = id;

    document.getElementById("goalTitle").value = goal.title;

    document.getElementById("goalTarget").value = goal.target;

    document.getElementById("goalSaved").value = goal.saved;

    document.getElementById("goalDeadline").value = goal.deadline;

    goalModal.style.display = "flex";

}

function deleteGoal(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this goal?"
    );

    if (!confirmDelete) return;

    dashboardData.finance.goals =
        dashboardData.finance.goals.filter(
            goal => goal.id !== id
        );

    saveData();

    refreshDashboard();

}

function addMoneyToGoal(id) {

    const goal = dashboardData.finance.goals.find(
        g => g.id === id
    );

    if (!goal) return;

    const amount = Number(
        prompt("Enter amount to add:")
    );

    if (!amount || amount <= 0) return;

    goal.saved += amount;

    saveData();

    refreshDashboard();

}


// ==========================================
// GOAL SUMMARY
// ==========================================

function renderGoalSummary() {

    const goals = dashboardData.finance.goals;

    if (!goals) return;

    const totalGoals = goals.length;

    const completedGoals =
        goals.filter(goal => goal.saved >= goal.target).length;

    const activeGoals =
        totalGoals - completedGoals;

    const totalTarget =
        goals.reduce((sum, goal) => sum + goal.target, 0);

    setText("totalGoals", totalGoals);

    setText("completedGoals", completedGoals);

    setText("activeGoals", activeGoals);

    setText("goalTarget", formatCurrency(totalTarget));

}

function updateCharts() {

    renderIncomeExpenseChart();

    renderExpenseChart();

}


// ==========================================
// ASSETS
// ==========================================

function renderAssets() {

    const tbody = document.getElementById("assetBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    dashboardData.finance.assets.forEach((asset, index) => {

        tbody.innerHTML += `

<tr>

<td>${asset.category}</td>

<td>${asset.description}</td>

<td>${formatCurrency(asset.amount)}</td>

<td class="goal-actions">

<button class="edit-btn"
onclick="editAsset(${index})">

<i class="bi bi-pencil-square"></i>

</button>

<button class="delete-btn"
onclick="deleteAsset(${index})">

<i class="bi bi-trash"></i>

</button>

</td>

</tr>

`;

    });

}


// ==========================================
// ASSET SUMMARY
// ==========================================

function renderAssetSummary() {

    const assets = dashboardData.finance.assets;

    if (!assets || assets.length === 0) return;

    setText(
        "totalAssetsCount",
        assets.length
    );

    const totalValue =
        assets.reduce((sum, asset) => sum + asset.amount, 0);

    setText(
        "totalAssetValue",
        formatCurrency(totalValue)
    );

    const highest =
        assets.reduce((a, b) =>
            a.amount > b.amount ? a : b
        );

    setText(
        "highestAsset",
        highest.description
    );

    setText(
        "averageAssetValue",
        formatCurrency(
            Math.round(totalValue / assets.length)
        )
    );

}

// ==========================================
// EDIT TRANSACTION
// ==========================================

let editIndex = -1;

// ==========================================
// CHART INSTANCES
// ==========================================

let incomeExpenseChart = null;

let expenseChart = null;

// ==========================================
// GREETING
// ==========================================

function renderGreeting() {

    const hour = new Date().getHours();

    let greeting = "";

    if (hour < 12) {

        greeting = "Good Morning";

    }

    else if (hour < 17) {

        greeting = "Good Afternoon";

    }

    else if (hour < 21) {

        greeting = "Good Evening";

    }

    else {

        greeting = "Good Night";

    }

    const today = new Date();

    const options = {

        weekday: "long",

        year: "numeric",

        month: "long",

        day: "numeric"

    };

    const formattedDate = today.toLocaleDateString("en-IN", options);

    setText("username", dashboardData.user.name);

    setText("greeting", greeting);

    setText("current-date", formattedDate);

}


// ==========================================
// HERO CARD
// ==========================================

function renderHeroCard() {

    setText(

        "netWorth",

        formatCurrency(dashboardData.finance.netWorth)

    );

    setText(

        "heroHealthPercent",

        dashboardData.finance.financialHealth + "%"

    );

    setText(

        "growthText",

        "+" + dashboardData.finance.monthlyGrowth + "% this month"

    );

}


// ==========================================
// DASHBOARD CARDS
// ==========================================

function renderDashboardCards() {

    setText(

        "salaryAmount",

        formatCurrency(dashboardData.finance.monthlySalary)

    );

    setText(

        "expenseAmount",

        formatCurrency(dashboardData.finance.monthlyExpense)

    );

    setText(

        "assetAmount",

        formatCurrency(dashboardData.finance.totalAssets)

    );

    setText(

        "goalAmount",

        dashboardData.finance.goalCompleted + "%"

    );

}


// ==========================================
// SUMMARY CARDS
// ==========================================

function renderSummaryCards() {

    const finance = dashboardData.finance;

    const emergencyPercent = calculatePercentage(

        finance.emergencyFund.current,

        finance.emergencyFund.target

    );

    const budgetPercent = calculatePercentage(

        finance.budget.used,

        finance.budget.limit

    );



    // Financial Health

    setText(

        "healthPercent",

        finance.financialHealth + "%"

    );



    if (finance.financialHealth >= 80) {

        setText(

            "healthMessage",

            "Excellent. Keep maintaining your savings habit."

        );

    }

    else if (finance.financialHealth >= 60) {

        setText(

            "healthMessage",

            "Good. Try increasing your investments."

        );

    }

    else {

        setText(

            "healthMessage",

            "Needs improvement. Focus on saving more."

        );

    }



    // Emergency Fund

    setText(

        "emergencyFundAmount",

        "₹" +

        formatLakh(finance.emergencyFund.current) +

        "L / ₹" +

        formatLakh(finance.emergencyFund.target) +

        "L"

    );



    setText(

        "emergencyFundStatus",

        emergencyPercent + "% Completed"

    );



    // Budget

    setText(

        "budgetAmount",

        formatCurrency(finance.budget.used) +

        " / " +

        formatCurrency(finance.budget.limit)

    );



    setText(

        "budgetStatus",

        budgetPercent + "% Used"

    );



    // Savings Rate

    setText(

        "savingRate",

        finance.savingsRate + "%"

    );



    if (finance.savingsRate >= 40) {

        setText(

            "savingMessage",

            "Excellent Savings Habit"

        );

    }

    else if (finance.savingsRate >= 25) {

        setText(

            "savingMessage",

            "Good Savings Rate"

        );

    }

    else {

        setText(

            "savingMessage",

            "Increase Your Savings"

        );

    }



    // Progress Bars

    document.querySelector(".health").style.width =
        finance.financialHealth + "%";

    document.querySelector(".emergency").style.width =
        emergencyPercent + "%";

    document.querySelector(".budget").style.width =
        budgetPercent + "%";

    document.querySelector(".saving").style.width =
        finance.savingsRate + "%";

}

function renderIncomeExpenseChart() {

    const transactions = dashboardData.finance.chartData.transactions;

    let income = 0;
    let expense = 0;

    transactions.forEach(item => {

        const amount = Number(
            item.amount.replace(/[₹,+-]/g, "").replace(/,/g, "")
        );

        if (item.amount.startsWith("+")) {

            income += amount;

        } else {

            expense += amount;

        }

    });

    if (incomeExpenseChart) {

        incomeExpenseChart.destroy();

    }

    incomeExpenseChart = new Chart(

        document.getElementById("incomeExpenseChart"),

        {

            type: "bar",

            data: {

                labels: ["Income", "Expense"],

                datasets: [

                    {

                        label: "Amount",

                        data: [income, expense]

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        }

    );

}

function renderExpenseChart() {

    const transactions = dashboardData.finance.chartData.transactions;

    const categoryWise = {};

    transactions.forEach(item => {

        if (item.amount.startsWith("-")) {

            const amount = Number(
                item.amount.replace(/[₹,+-]/g, "").replace(/,/g, "")
            );

            if (!categoryWise[item.category]) {

                categoryWise[item.category] = 0;

            }

            categoryWise[item.category] += amount;

        }

    });

    if (expenseChart) {

        expenseChart.destroy();

    }

    expenseChart = new Chart(

        document.getElementById("expenseChart"),

        {

            type: "pie",

            data: {

                labels: Object.keys(categoryWise),

                datasets: [

                    {

                        data: Object.values(categoryWise)

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        }

    );

}



function renderTransactions() {

    const tbody = document.getElementById("transactionBody");

    tbody.innerHTML = "";

    dashboardData.finance.chartData.transactions.forEach((item, index) => {

        tbody.innerHTML += `

        <tr>

            <td>${item.date}</td>

            <td>${item.category}</td>

            <td>${item.description}</td>

            <td>${item.amount}</td>

            <td>

                <span class="status ${item.status.toLowerCase()}">
                    ${item.status}
                </span>

            </td>

            <td>

<button class="edit-btn" onclick="editTransaction(${index})">

<i class="bi bi-pencil-square"></i>

</button>

<button class="delete-btn" onclick="deleteTransaction(${index})">

<i class="bi bi-trash"></i>

</button>

</td>

        </tr>

        `;

    });

}

function deleteTransaction(index) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (!confirmDelete) return;

    const transaction =
        dashboardData.finance.chartData.transactions[index];

    const amount = Number(
        transaction.amount
            .replace(/[₹,+-]/g, "")
            .replace(/,/g, "")
    );

    if (transaction.amount.startsWith("+")) {

        dashboardData.finance.monthlySalary -= amount;

        dashboardData.finance.netWorth -= amount;

    } else {

        dashboardData.finance.monthlyExpense -= amount;

        dashboardData.finance.budget.used -= amount;

    }

    dashboardData.finance.chartData.transactions.splice(index, 1);

    saveData();

    refreshDashboard();

}

function editTransaction(index) {

    editIndex = index;

    const transaction =
        dashboardData.finance.chartData.transactions[index];

    const oldAmount = Number(
        transaction.amount
            .replace(/[₹,+-]/g, "")
            .replace(/,/g, "")
    );

    if (transaction.amount.startsWith("+")) {

        document.getElementById("incomeAmountInput").value = oldAmount;

        document.getElementById("incomeDate").value =
            new Date().toISOString().split("T")[0];

        document.getElementById("incomeCategory").value =
            transaction.category;

        document.getElementById("incomeDescription").value =
            transaction.description;

        incomeModal.style.display = "flex";

    } else {

        document.getElementById("expenseAmountInput").value = oldAmount;

        document.getElementById("expenseDate").value =
            new Date().toISOString().split("T")[0];

        document.getElementById("expenseCategory").value =
            transaction.category;

        document.getElementById("expenseDescription").value =
            transaction.description;

        modal.style.display = "flex";

    }

}



function refreshDashboard() {

    dashboardData.finance.financialHealth =
        calculateFinancialHealth();

    renderHeroCard();

    renderDashboardCards();

    renderMonthlyStats();

    renderSummaryCards();

    renderReports();

    renderReportTable();

    renderGoals();

    renderGoalSummary();

    renderAssets();

    renderAssetSummary();

    renderTransactions();

    updateCharts();

    renderSalaryPage();

    renderSettingsPage();

    renderNotifications();

    renderProfileWidgets();

}

// ==========================================
// SALARY PAGE
// ==========================================

function renderSalaryPage() {

    const finance = dashboardData.finance;

    if (!document.getElementById("salaryMonthly")) return;

    setText("salaryMonthly", formatCurrency(finance.monthlySalary));

    setText("salaryYearly", formatCurrency(finance.monthlySalary * 12));

    setText("salaryGrowth", "+" + finance.monthlyGrowth + "%");

    const incomeTransactions =
        finance.chartData.transactions.filter(
            item => item.amount.startsWith("+")
        );

    const totalIncome = incomeTransactions.reduce((sum, item) => {

        const amount = Number(
            item.amount.replace(/[₹,+-]/g, "").replace(/,/g, "")
        );

        return sum + amount;

    }, 0);

    setText("salaryTotalIncome", formatCurrency(totalIncome));

    setText("salaryEmpName", dashboardData.user.name);

    setText("salaryEmpDesignation", dashboardData.user.designation);

    setText("salaryEmpSector", dashboardData.user.sector);

    const tbody = document.getElementById("salaryHistoryBody");

    if (tbody) {

        tbody.innerHTML = "";

        incomeTransactions.forEach(item => {

            tbody.innerHTML += `
            <tr>
                <td>${item.date}</td>
                <td>${item.category}</td>
                <td>${item.description}</td>
                <td>${item.amount}</td>
                <td>
                    <span class="status ${item.status.toLowerCase()}">
                        ${item.status}
                    </span>
                </td>
            </tr>
            `;

        });

    }

}

const salaryAddIncomeBtn = document.getElementById("salaryAddIncomeBtn");

if (salaryAddIncomeBtn) {

    salaryAddIncomeBtn.addEventListener("click", () => {

        incomeModal.style.display = "flex";

    });

}

// ==========================================
// SETTINGS PAGE
// ==========================================

function renderSettingsPage() {

    if (!document.getElementById("settingName")) return;

    document.getElementById("settingName").value =
        dashboardData.user.name;

    document.getElementById("settingDesignation").value =
        dashboardData.user.designation;

    document.getElementById("settingSector").value =
        dashboardData.user.sector;

}

const saveProfileBtn = document.getElementById("saveProfileBtn");

if (saveProfileBtn) {

    saveProfileBtn.addEventListener("click", () => {

        const name =
            document.getElementById("settingName").value.trim();

        const designation =
            document.getElementById("settingDesignation").value.trim();

        const sector =
            document.getElementById("settingSector").value.trim();

        if (!name) {

            alert("Name cannot be empty.");

            return;

        }

        dashboardData.user.name = name;
        dashboardData.user.designation = designation;
        dashboardData.user.sector = sector;

        saveData();

        renderGreeting();

        refreshDashboard();

        alert("Profile updated successfully.");

    });

}

const exportDataBtn = document.getElementById("exportDataBtn");

if (exportDataBtn) {

    exportDataBtn.addEventListener("click", () => {

        const dataStr = JSON.stringify(dashboardData, null, 2);

        const blob = new Blob([dataStr], { type: "application/json" });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download = "salaryOS-backup.json";

        a.click();

        URL.revokeObjectURL(url);

    });

}

const importDataBtn = document.getElementById("importDataBtn");

const importDataInput = document.getElementById("importDataInput");

if (importDataBtn && importDataInput) {

    importDataBtn.addEventListener("click", () => {

        importDataInput.click();

    });

    importDataInput.addEventListener("change", (e) => {

        const file = e.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event) => {

            try {

                const imported = JSON.parse(event.target.result);

                if (!imported.user || !imported.finance) {

                    alert("Invalid backup file.");

                    return;

                }

                dashboardData = imported;

                saveData();

                renderGreeting();

                refreshDashboard();

                alert("Data imported successfully.");

            } catch (err) {

                alert("Could not read this file. Please choose a valid backup JSON.");

            }

        };

        reader.readAsText(file);

        importDataInput.value = "";

    });

}

const resetDataBtn = document.getElementById("resetDataBtn");

if (resetDataBtn) {

    resetDataBtn.addEventListener("click", () => {

        const confirmReset = confirm(
            "This will permanently delete all your saved data. Continue?"
        );

        if (!confirmReset) return;

        localStorage.removeItem("salaryOS");

        localStorage.removeItem("salaryOS_loggedIn");

        location.reload();

    });

}

// ==========================================
// LOGIN SCREEN (Google Sign-In + Guest mode)
// ==========================================
// NOTE: Real "Sign in with Google" requires a Google Cloud OAuth
// Client ID (from https://console.cloud.google.com/apis/credentials).
// Replace GOOGLE_CLIENT_ID below with your own to enable it.
// Without it, the button stays inactive and "Continue as Guest"
// is the working path.

const GOOGLE_CLIENT_ID = "1091128650329-an45at0ibos3uu0v64f7od113n68d94c.apps.googleusercontent.com";

const loginOverlay = document.getElementById("loginOverlay");

function decodeJwt(token) {

    try {

        return JSON.parse(atob(token.split(".")[1]));

    } catch (e) {

        return null;

    }

}

function handleGoogleCredential(response) {

    const payload = decodeJwt(response.credential);

    if (!payload) return;

    dashboardData.user.name = payload.name || dashboardData.user.name;

    dashboardData.user.email = payload.email || "";

    dashboardData.user.picture = payload.picture || "";

    saveData();

    completeLogin();

}

function initGoogleSignIn() {

    if (!window.google || GOOGLE_CLIENT_ID.startsWith("YOUR_")) {

        const btn = document.getElementById("googleSignInBtn");

        if (btn) {

            btn.innerHTML =
                `<button class="guest-btn" style="opacity:.6;cursor:not-allowed;" disabled>
                    <i class="bi bi-google"></i> Sign in with Google (setup required)
                </button>`;

        }

        return;

    }

    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential
    });

    google.accounts.id.renderButton(
        document.getElementById("googleSignInBtn"),
        { theme: "outline", size: "large", width: 260 }
    );

}

function completeLogin() {

    localStorage.setItem("salaryOS_loggedIn", "true");

    loginOverlay.classList.add("hide");

    setTimeout(() => {

        loginOverlay.style.display = "none";

    }, 300);

    renderGreeting();

    refreshDashboard();

}

const guestLoginBtn = document.getElementById("guestLoginBtn");

if (guestLoginBtn) {

    guestLoginBtn.addEventListener("click", completeLogin);

}

if (localStorage.getItem("salaryOS_loggedIn") === "true") {

    loginOverlay.style.display = "none";

} else {

    initGoogleSignIn();

}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        localStorage.removeItem("salaryOS_loggedIn");

        location.reload();

    });

}

// ==========================================
// DARK MODE
// ==========================================

const darkModeBtn = document.getElementById("darkModeBtn");

function applyDarkModePreference() {

    const isDark = localStorage.getItem("salaryOS_theme") === "dark";

    document.body.classList.toggle("dark", isDark);

    if (darkModeBtn) {

        darkModeBtn.className = isDark ? "bi bi-sun-fill" : "bi bi-moon-fill";

    }

}

if (darkModeBtn) {

    darkModeBtn.addEventListener("click", () => {

        const isDark = document.body.classList.toggle("dark");

        localStorage.setItem("salaryOS_theme", isDark ? "dark" : "light");

        darkModeBtn.className = isDark ? "bi bi-sun-fill" : "bi bi-moon-fill";

    });

}

applyDarkModePreference();

// ==========================================
// SIDEBAR COLLAPSE (mobile / manual toggle)
// ==========================================

const sidebarToggle = document.getElementById("sidebarToggle");

const sidebarEl = document.querySelector(".sidebar");

const mainContentEl = document.querySelector(".main-content");

const topNavbarEl = document.querySelector(".top-navbar");

const sidebarOverlay = document.getElementById("sidebarOverlay");

function openSidebarMobile() {

    sidebarEl.classList.add("mobile-open");

    if (sidebarOverlay) sidebarOverlay.classList.add("show");

}

function closeSidebarMobile() {

    sidebarEl.classList.remove("mobile-open");

    if (sidebarOverlay) sidebarOverlay.classList.remove("show");

}

if (sidebarToggle) {

    sidebarToggle.addEventListener("click", () => {

        if (window.innerWidth <= 992) {

            sidebarEl.classList.contains("mobile-open")
                ? closeSidebarMobile()
                : openSidebarMobile();

        } else {

            sidebarEl.classList.toggle("collapsed");

            mainContentEl.classList.toggle("expanded");

            topNavbarEl.classList.toggle("expanded");

        }

    });

}

if (sidebarOverlay) {

    sidebarOverlay.addEventListener("click", closeSidebarMobile);

}

document.querySelectorAll(".menu li").forEach(item => {

    item.addEventListener("click", () => {

        if (window.innerWidth <= 992) {

            closeSidebarMobile();

        }

    });

});

// ==========================================
// NOTIFICATIONS
// ==========================================

function generateNotifications() {

    const finance = dashboardData.finance;

    const notifications = [];

    const budgetPercent = calculatePercentage(
        finance.budget.used,
        finance.budget.limit
    );

    if (budgetPercent >= 90) {

        notifications.push({
            title: "Budget almost exhausted",
            text: `You've used ${budgetPercent}% of your monthly budget.`,
            icon: "bi-wallet2"
        });

    }

    const emergencyPercent = calculatePercentage(
        finance.emergencyFund.current,
        finance.emergencyFund.target
    );

    if (emergencyPercent < 50) {

        notifications.push({
            title: "Emergency fund is low",
            text: `Only ${emergencyPercent}% of your emergency fund target is saved.`,
            icon: "bi-shield-exclamation"
        });

    }

    (finance.goals || []).forEach(goal => {

        const progress = calculatePercentage(goal.saved, goal.target);

        if (progress >= 100) {

            notifications.push({
                title: "Goal completed 🎉",
                text: `"${goal.title}" has been fully funded.`,
                icon: "bi-trophy"
            });

        } else {

            const daysLeft = Math.ceil(
                (new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)
            );

            if (daysLeft >= 0 && daysLeft <= 30) {

                notifications.push({
                    title: "Goal deadline approaching",
                    text: `"${goal.title}" is due in ${daysLeft} day(s), ${progress}% funded.`,
                    icon: "bi-hourglass-split"
                });

            }

        }

    });

    if (finance.financialHealth >= 85) {

        notifications.push({
            title: "Great financial health",
            text: `Your financial health score is ${finance.financialHealth}%. Keep it up!`,
            icon: "bi-heart-pulse"
        });

    }

    return notifications;

}

function renderNotifications() {

    const list = document.getElementById("notificationList");

    const badge = document.getElementById("notifBadge");

    if (!list || !badge) return;

    const notifications = generateNotifications();

    if (notifications.length === 0) {

        list.innerHTML = `<div class="notif-empty">You're all caught up 🎉</div>`;

        badge.style.display = "none";

    } else {

        list.innerHTML = notifications.map(n => `
            <div class="notif-item">
                <div class="notif-title"><i class="bi ${n.icon}"></i> ${n.title}</div>
                <div>${n.text}</div>
            </div>
        `).join("");

        badge.textContent = notifications.length;

        badge.style.display = "flex";

    }

}

const notificationBtn = document.getElementById("notificationBtn");

const notificationDropdown = document.getElementById("notificationDropdown");

const profileBtn = document.getElementById("profileBtn");

const profileDropdown = document.getElementById("profileDropdown");

if (notificationBtn && notificationDropdown) {

    notificationBtn.addEventListener("click", (e) => {

        e.stopPropagation();

        notificationDropdown.classList.toggle("show");

        profileDropdown.classList.remove("show");

    });

}

if (profileBtn && profileDropdown) {

    profileBtn.addEventListener("click", (e) => {

        e.stopPropagation();

        profileDropdown.classList.toggle("show");

        notificationDropdown.classList.remove("show");

    });

}

document.addEventListener("click", () => {

    if (notificationDropdown) notificationDropdown.classList.remove("show");

    if (profileDropdown) profileDropdown.classList.remove("show");

});

const profileSettingsLink = document.getElementById("profileSettingsLink");

if (profileSettingsLink) {

    profileSettingsLink.addEventListener("click", () => {

        document.querySelector('.menu li[data-page="setting"]').click();

    });

}

function getInitials(name) {

    if (!name) return "U";

    return name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

}

function renderProfileWidgets() {

    const name = dashboardData.user.name;

    const initials = getInitials(name);

    if (profileBtn) profileBtn.textContent = initials;

    const dropdownAvatar = document.getElementById("profileDropdownAvatar");

    if (dropdownAvatar) dropdownAvatar.textContent = initials;

    setText("profileDropdownName", name);

    setText("profileDropdownRole", dashboardData.user.designation);

}

// ==========================================
// EXPORT TO PDF
// ==========================================

const exportPdfBtn = document.getElementById("exportPdfBtn");

if (exportPdfBtn) {

    exportPdfBtn.addEventListener("click", () => {

        const { jsPDF } = window.jspdf;

        const doc = new jsPDF();

        const finance = dashboardData.finance;

        doc.setFontSize(18);

        doc.text("SalaryOS - Financial Report", 14, 18);

        doc.setFontSize(11);

        doc.text(`Name: ${dashboardData.user.name}`, 14, 28);

        doc.text(`Net Worth: ${formatCurrency(finance.netWorth)}`, 14, 35);

        doc.text(`Monthly Salary: ${formatCurrency(finance.monthlySalary)}`, 14, 42);

        doc.text(`Monthly Expense: ${formatCurrency(finance.monthlyExpense)}`, 14, 49);

        doc.autoTable({

            startY: 56,

            head: [["Date", "Category", "Description", "Amount", "Status"]],

            body: finance.chartData.transactions.map(t => [
                t.date, t.category, t.description, t.amount, t.status
            ])

        });

        doc.save("SalaryOS-Report.pdf");

    });

}

// ==========================================
// EXPORT TO EXCEL
// ==========================================

const exportExcelBtn = document.getElementById("exportExcelBtn");

if (exportExcelBtn) {

    exportExcelBtn.addEventListener("click", () => {

        const finance = dashboardData.finance;

        const wb = XLSX.utils.book_new();

        const txSheet = XLSX.utils.json_to_sheet(finance.chartData.transactions);

        XLSX.utils.book_append_sheet(wb, txSheet, "Transactions");

        const goalSheet = XLSX.utils.json_to_sheet(finance.goals || []);

        XLSX.utils.book_append_sheet(wb, goalSheet, "Goals");

        const assetSheet = XLSX.utils.json_to_sheet(finance.assets || []);

        XLSX.utils.book_append_sheet(wb, assetSheet, "Assets");

        XLSX.writeFile(wb, "SalaryOS-Data.xlsx");

    });

}


// ==========================================
// INITIALIZATION
// ==========================================

function init() {

    loadData();

    renderGreeting();

    refreshDashboard();

}

init();

moveExpenseSection();

moveGoalSection();

moveAssetSection();

moveReportSection();

function moveExpenseSection() {

    const expensePage =
        document.getElementById("expenseContent");

    const transactionSection =
        document.getElementById("transactionSection");

    const expenseStats =
        document.getElementById("expenseStatsSection");

    if (expensePage && expenseStats) {

        expensePage.appendChild(expenseStats);

    }

    if (expensePage && transactionSection) {

        expensePage.appendChild(transactionSection);

    }

}

function moveGoalSection() {

    const goalContent =
        document.getElementById("goalContent");

    const goalSection =
        document.getElementById("goalSection");

    if (goalContent && goalSection) {

        goalContent.appendChild(goalSection);

    }

}

function moveAssetSection() {

    const assetContent =
        document.getElementById("assetContent");

    const assetSection =
        document.querySelector(".asset-section");

    if (assetContent && assetSection) {

        assetContent.appendChild(assetSection);

    }

}

function moveReportSection() {

    const reportPage =
        document.getElementById("reportPage");

    const reportSection =
        document.querySelector(".report-section");

    if (reportPage && reportSection) {

        reportPage.appendChild(reportSection);

    }

}

// ==========================================
// ADD INCOME MODAL
// ==========================================

const incomeModal = document.getElementById("incomeModal");

const addIncomeBtn = document.getElementById("addIncomeBtn");

const closeIncomeModal = document.getElementById("closeIncomeModal");

const cancelIncome = document.getElementById("cancelIncome");


// Open Modal

addIncomeBtn.addEventListener("click", () => {

    incomeModal.style.display = "flex";

});


// Close Button

closeIncomeModal.addEventListener("click", () => {

    incomeModal.style.display = "none";

});


// Cancel Button

cancelIncome.addEventListener("click", () => {

    incomeModal.style.display = "none";

});


// Click Outside

window.addEventListener("click", (e) => {

    if (e.target === incomeModal) {

        incomeModal.style.display = "none";

    }

});

// ==========================================
// SAVE INCOME
// ==========================================

document.getElementById("saveIncome").onclick = () => {

    const category =
        document.getElementById("incomeCategory").value;

    const amount =
        Number(document.getElementById("incomeAmountInput").value);

    const date =
        document.getElementById("incomeDate").value;

    const description =
        document.getElementById("incomeDescription").value;

    if (!amount || !description) {

        alert("Please fill all fields.");

        return;

    }

    if (editIndex === -1) {

        dashboardData.finance.monthlySalary += amount;

        dashboardData.finance.netWorth += amount;

    } else {

        const oldTransaction =
            dashboardData.finance.chartData.transactions[editIndex];

        const oldAmount = Number(
            oldTransaction.amount
                .replace(/[₹,+-]/g, "")
                .replace(/,/g, "")
        );

        dashboardData.finance.monthlySalary -= oldAmount;
        dashboardData.finance.netWorth -= oldAmount;

        dashboardData.finance.monthlySalary += amount;
        dashboardData.finance.netWorth += amount;
    }

    // Add Transaction
    const transaction = {

        date: new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short"
        }),

        category: category,

        description: description,

        amount: "+₹" + amount.toLocaleString("en-IN"),

        status: "Completed"

    };

    if (editIndex === -1) {

        dashboardData.finance.chartData.transactions.unshift(transaction);

    } else {

        dashboardData.finance.chartData.transactions[editIndex] = transaction;

        editIndex = -1;

    }

    // Refresh UI
    saveData();

    refreshDashboard();



    // Close Modal
    incomeModal.style.display = "none";

    // Clear Form
    document.getElementById("incomeAmountInput").value = "";

    document.getElementById("incomeDescription").value = "";

};

// ==========================================
// ASSET MODAL
// ==========================================

const assetModal = document.getElementById("assetModal");

const addAssetBtn = document.getElementById("addAssetBtn");

const closeAssetModal = document.getElementById("closeAssetModal");

const cancelAsset = document.getElementById("cancelAsset");

let assetEditIndex = -1;

// Open

addAssetBtn.addEventListener("click", () => {

    assetModal.style.display = "flex";

});

// Close (X)

closeAssetModal.addEventListener("click", () => {

    assetModal.style.display = "none";

});

// Cancel

cancelAsset.addEventListener("click", () => {

    assetModal.style.display = "none";

});

// Click Outside

window.addEventListener("click", (e) => {

    if (e.target === assetModal) {

        assetModal.style.display = "none";

    }

});

// ==========================================
// SAVE ASSET
// ==========================================

document.getElementById("saveAsset").onclick = () => {

    const category =
        document.getElementById("assetCategory").value;

    const amount =
        Number(document.getElementById("assetAmountInput").value);

    const description =
        document.getElementById("assetDescription").value;

    if (!amount || !description) {

        alert("Please fill all fields.");

        return;

    }

    const asset = {

        id: Date.now(),

        category: category,

        description: description,

        amount: amount

    };

    if (assetEditIndex === -1) {

        dashboardData.finance.assets.push(asset);

        dashboardData.finance.totalAssets += amount;

        dashboardData.finance.netWorth += amount;

    } else {

        const oldAsset =
            dashboardData.finance.assets[assetEditIndex];

        dashboardData.finance.totalAssets -= oldAsset.amount;

        dashboardData.finance.netWorth -= oldAsset.amount;

        dashboardData.finance.assets[assetEditIndex] = asset;

        dashboardData.finance.totalAssets += amount;

        dashboardData.finance.netWorth += amount;

        assetEditIndex = -1;

    }

    saveData();

    refreshDashboard();

    assetModal.style.display = "none";

    document.getElementById("assetAmountInput").value = "";

    document.getElementById("assetDescription").value = "";

    assetEditIndex = -1;

};

function editAsset(index) {

    assetEditIndex = index;

    const asset =
        dashboardData.finance.assets[index];

    document.getElementById("assetCategory").value =
        asset.category;

    document.getElementById("assetAmountInput").value =
        asset.amount;

    document.getElementById("assetDescription").value =
        asset.description;

    assetModal.style.display = "flex";

}


function deleteAsset(index) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this asset?"
    );

    if (!confirmDelete) return;

    const asset =
        dashboardData.finance.assets[index];

    dashboardData.finance.totalAssets -= asset.amount;

    dashboardData.finance.netWorth -= asset.amount;

    dashboardData.finance.assets.splice(index, 1);

    saveData();

    refreshDashboard();

}


// ==========================
// EXPENSE MODAL
// ==========================

const modal = document.getElementById("expenseModal");

document.getElementById("addExpenseBtn").addEventListener("click", () => {

    modal.style.display = "flex";

});

document.getElementById("closeModal").onclick = () => {

    modal.style.display = "none";

};

document.getElementById("cancelExpense").onclick = () => {

    modal.style.display = "none";

};

window.addEventListener("click", (e) => {

    if (e.target === modal) {

        modal.style.display = "none";

    }

});

document.getElementById("saveExpense").onclick = () => {

    const category =
        document.getElementById("expenseCategory").value;

    const amount =
        Number(document.getElementById("expenseAmountInput").value);

    const date =
        document.getElementById("expenseDate").value;

    const description =
        document.getElementById("expenseDescription").value;

    if (!amount || !description) {

        alert("Please fill all fields.");

        return;

    }

    // Update Expense
    if (editIndex === -1) {

        dashboardData.finance.monthlyExpense += amount;

        dashboardData.finance.budget.used += amount;

    } else {

        const oldTransaction =
            dashboardData.finance.chartData.transactions[editIndex];

        const oldAmount = Number(
            oldTransaction.amount
                .replace(/[₹,+-]/g, "")
                .replace(/,/g, "")
        );

        dashboardData.finance.monthlyExpense -= oldAmount;
        dashboardData.finance.budget.used -= oldAmount;

        dashboardData.finance.monthlyExpense += amount;
        dashboardData.finance.budget.used += amount;
    }

    // Add Transaction
    const transaction = {

        date: new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short"
        }),

        category: category,

        description: description,

        amount: "-₹" + amount.toLocaleString("en-IN"),

        status: "Completed"

    };

    if (editIndex === -1) {

        dashboardData.finance.chartData.transactions.unshift(transaction);

    } else {

        dashboardData.finance.chartData.transactions[editIndex] = transaction;

        editIndex = -1;

    }

    saveData();

    refreshDashboard();

    modal.style.display = "none";

    document.getElementById("expenseAmountInput").value = "";

    document.getElementById("expenseDescription").value = "";

    editIndex = -1;

};

// ==========================================
// GOAL MODAL
// ==========================================

const goalModal = document.getElementById("goalModal");

const addGoalBtn = document.getElementById("addGoalBtn");

const closeGoalModal = document.getElementById("closeGoalModal");

const cancelGoal = document.getElementById("cancelGoal");

const quickGoalBtn = document.getElementById("quickGoalBtn");

let goalEditIndex = -1;

// Open Modal
addGoalBtn.addEventListener("click", () => {

    goalModal.style.display = "flex";

});

quickGoalBtn.addEventListener("click", () => {

    addGoalBtn.click();

});

// Close Button
closeGoalModal.addEventListener("click", () => {

    goalModal.style.display = "none";

});

// Cancel Button
cancelGoal.addEventListener("click", () => {

    goalModal.style.display = "none";

});

// Click Outside
window.addEventListener("click", (e) => {

    if (e.target === goalModal) {

        goalModal.style.display = "none";

    }

});



// ==========================================
// SAVE GOAL
// ==========================================

document.getElementById("saveGoal").onclick = () => {

    const title = document.getElementById("goalTitle").value.trim();

    const target = Number(document.getElementById("goalTarget").value);

    const saved = Number(document.getElementById("goalSaved").value);

    const deadline = document.getElementById("goalDeadline").value;

    if (!title || !target || !deadline) {

        alert("Please fill all required fields.");

        return;

    }

    const goal = {

        id: Date.now(),

        title,

        target,

        saved,

        deadline

    };

    if (goalEditIndex === -1) {

        dashboardData.finance.goals.unshift(goal);

    } else {

        const index = dashboardData.finance.goals.findIndex(
            g => g.id === goalEditIndex
        );

        dashboardData.finance.goals[index] = {

            id: goalEditIndex,

            title,

            target,

            saved,

            deadline

        };

        goalEditIndex = -1;

    }

    saveData();

    refreshDashboard();

    goalModal.style.display = "none";

    document.getElementById("goalTitle").value = "";

    document.getElementById("goalTarget").value = "";

    document.getElementById("goalSaved").value = "";

    document.getElementById("goalDeadline").value = "";

};

// ==========================================
// SIDEBAR NAVIGATION
// ==========================================

const pages = {

    dashboard: document.getElementById("dashboardPage"),

    salary: document.getElementById("salaryPage"),

    expense: document.getElementById("expensePage"),

    goal: document.getElementById("goalPage"),

    asset: document.getElementById("assetPage"),

    report: document.getElementById("reportPage"),

    setting: document.getElementById("settingPage")

};

document.querySelectorAll(".menu li").forEach(item => {

    item.addEventListener("click", () => {

        // Active Menu
        document.querySelectorAll(".menu li").forEach(li =>
            li.classList.remove("active")
        );

        item.classList.add("active");

        // Hide all pages
        Object.values(pages).forEach(page => {

            if (page) {

                page.style.display = "none";

            }

        });

        // Show selected page
        const pageName = item.dataset.page;

        if (pages[pageName]) {

            pages[pageName].style.display = "block";

        }

        // Change title
        document.getElementById("pageTitle").textContent =
            item.textContent.trim();

    });

});
