const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");
const menuCards = document.querySelectorAll(".order-card");

function searchFood() {
    const query = searchInput.value.toLowerCase();

    menuCards.forEach(card => {
        const name = card.dataset.name.toLowerCase();
        if(name.includes(query)) {
            card.style.display = "block";          // Show matched card
            card.classList.add("active");          // Optional: add class for "open/expand"
        } else {
            card.style.display = "none";           // Hide unmatched card
            card.classList.remove("active");
        }
    });
}

// Trigger search on button click
searchBtn.addEventListener("click", searchFood);

// Trigger search on pressing "Enter"
searchInput.addEventListener("keyup", (e) => {
    if(e.key === "Enter") searchFood();
});
