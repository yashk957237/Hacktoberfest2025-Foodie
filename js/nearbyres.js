// nearbyRestaurants.js

// Optional: dynamic restaurant data (you can expand later)
const restaurants = [
  { name: "Mezban", type: "Authentic Indian Cuisine", rating: 4.7, distance: "1.2 km", image: "../imgs/rest7.png" },
  { name: "Delici", type: "Modern Café & Grill", rating: 4.6, distance: "0.8 km", image: "../imgs/rest5.png" },
  { name: "Kovason", type: "Fresh Japanese Rolls", rating: 4.8, distance: "1.5 km", image: "../imgs/rest6.png" },
  { name: "The Green Bowl", type: "Healthy Salads & Smoothies", rating: 4.5, distance: "2.1 km", image: "../imgs/rest4.png" }
];

const container = document.querySelector(".restaurant-grid");

restaurants.forEach((res, index) => {
  const card = document.createElement("div");
  card.classList.add("restaurant-card");
  card.setAttribute("data-aos", "zoom-in");
  card.setAttribute("data-aos-delay", (index + 1) * 100);

  card.innerHTML = `
    <img src="${res.image}" alt="${res.name}" class="restaurant-img" />
    <div class="restaurant-info">
      <h3>${res.name}</h3>
      <p>${res.type}</p>
      <p><i class="fa-solid fa-star"></i> ${res.rating} | ${res.distance} away</p>
    </div>
  `;
  container.appendChild(card);
});
