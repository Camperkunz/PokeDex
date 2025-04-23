/*
omg that will be a lot of work


1) API connectivity. Figure out all JSON stuff. Collect all necessery info for cards (like photos, number, description etc)
1.1) Updating 20 more by button
2) Create Cards template based on API. 
2.1) Don't forget about localstorage stuff.
3) Modal window.
4) Search bar
5) Navigation bar(?)
*/

// 

// Main variables
const cardsGrid = document.querySelector(".cards-grid");
const showMoreButton = document.querySelector(".button-show-more");
let pokemonOffset = 0;
const pokemonLimit = 12;
let caughtPokemons = JSON.parse(localStorage.getItem("caughtPokemons")) || [];


// API Loadings MAIN
async function loadPokemons(offset, limit) {
	const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
	const data = await response.json();
	const pokemonList = data.results;

	for (const pokemon of pokemonList) {
		const pokemonData = await fetch(pokemon.url).then(res => res.json());
		renderPokemonCard(pokemonData);
	}
}

// More Button for extra pokemons
showMoreButton.addEventListener("click", () => {
	pokemonOffset += pokemonLimit;
	loadPokemons(pokemonOffset, pokemonLimit);
});


// first start
loadPokemons(pokemonOffset, pokemonLimit);

// remember the tab (for my pokemons)
window.addEventListener("load", () => {
    const currentPage = localStorage.getItem("currentPage");
  
    if (currentPage === "yourPokedex") {
      homePage.style.display = "none";
      yourPokedexPage.style.display = "block";
      showCaughtPokemons();
    } else if (currentPage === "home") {
      homePage.style.display = "block";
      yourPokedexPage.style.display = "none";
    } else {
      homePage.style.display = "block";
      yourPokedexPage.style.display = "none";
    }
  });
// 

// all cards
function renderPokemonCard(pokemon) {
    const isCaught = caughtPokemons.includes(pokemon.name);

    const card = document.createElement("div");
    card.className = "pokemon-card";
    const pokemonImage = pokemon.sprites.other['official-artwork'].front_default;

    card.innerHTML = `
        <img src="${pokemonImage}" alt="${pokemon.name}" class="pokemon-image">
        <h5>#${pokemon.id}</h5>
        <h3 class="pokemon-name">${pokemon.name}</h3>
        <button class="pokemon-card-button" data-name="${pokemon.name}">
            ${isCaught ? "Release" : "Catch"}
        </button>
    `;
	
	const button = card.querySelector(".pokemon-card-button");
    if (isCaught) {
        button.style.backgroundColor = "#D24561";
    }

    cardsGrid.appendChild(card);
}

//Check status button (release/catch) and modal open

cardsGrid.addEventListener("click", async (event) => {
    // Catch/Release
    if (event.target.classList.contains("pokemon-card-button")) {
      const name = event.target.dataset.name;
  
      if (caughtPokemons.includes(name)) {
        caughtPokemons = caughtPokemons.filter(p => p !== name);
        event.target.textContent = "Catch";
        event.target.style.backgroundColor = "";
      } else {
        caughtPokemons.push(name);
        event.target.textContent = "Release";
        event.target.style.backgroundColor = "#D24561";
      }
  
      localStorage.setItem("caughtPokemons", JSON.stringify(caughtPokemons));
      return;
    }
  
    // Modal open
    const card = event.target.closest(".pokemon-card");
    if (card) {
      const name = card.querySelector(".pokemon-name")?.textContent;
      if (!name) return;
  
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const data = await response.json();
      showPokemonDescription(data);
    }
  });


// WHOLE MODAL
function showPokemonDescription(pokemon) {
    const modal = document.getElementById("modal-description");
    const isCaught = (JSON.parse(localStorage.getItem("caughtPokemons")) || []).includes(pokemon.name);

    modal.querySelector(".pokemon-name-full").textContent = pokemon.name;
    modal.querySelector(".pokemon-description-id").textContent = `#${pokemon.id}`;
    modal.querySelector(".pokemon-image-full").src = pokemon.sprites.other["official-artwork"].front_default;
    modal.querySelector("#pokemonType").textContent = "Type: " + pokemon.types.map(t => t.type.name).join(", ");

    const details = modal.querySelector(".pokemonDetails");
    details.innerHTML = "";
    pokemon.stats.forEach(stat => {
        details.innerHTML += `<p>${stat.stat.name}: ${stat.base_stat}</p>`;
    });

    // This is for star (I added result on button)
      const star = modal.querySelector(".pokemon-star");
      if (star) {
          star.src = isCaught ? "images/star/active-star.svg" : "images/star/unactive-star.svg";
  
          star.onclick = () => {
            const index = caughtPokemons.indexOf(pokemon.name);
        
            if (index > -1) {
                caughtPokemons.splice(index, 1);
                star.src = "images/star/unactive-star.svg";
            } else {
                caughtPokemons.push(pokemon.name);
                star.src = "images/star/active-star.svg";
            }
        
            localStorage.setItem("caughtPokemons", JSON.stringify(caughtPokemons));
        
            const allCards = document.querySelectorAll(".pokemon-card");
            allCards.forEach(card => {
                const cardName = card.querySelector(".pokemon-name")?.textContent;
                const button = card.querySelector(".pokemon-card-button");
                if (cardName?.toLowerCase() === pokemon.name.toLowerCase() && button) {
                    const isNowCaught = caughtPokemons.includes(pokemon.name);
                    button.textContent = isNowCaught ? "Release" : "Catch";
                    button.style.backgroundColor = isNowCaught ? "#D24561" : "";
                }
            });
        
            if (yourPokedexPage.style.display === "block") {
                showCaughtPokemons();
            }
        };
      }

    // modal
    modal.style.display = "block";

    // close modal
    modal.addEventListener("click", (e) => {
        if (!e.target.closest(".modal-content")) {
            modal.style.display = "none";
        }
    });
}


// Search feature omg why

const searchForm = document.querySelector(".search");
const searchInput = document.querySelector(".search-input");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = searchInput.value.trim().toLowerCase();
    cardsGrid.innerHTML = "";

    if (!name) {
        loadPokemons(0, pokemonLimit);
        return;
    }

    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
        .then(res => {
            if (!res.ok) throw new Error("Not found");
            return res.json();
        })
        .then(pokemon => {
            renderPokemonCard(pokemon);
        })
        .catch(() => {
            alert(`No Pokemon found with name "${name}"`);
        });
});

// This is for burger menu
const burgerMenu = document.getElementById("burger-menu");
const navLinks = document.getElementById("nav-links");

burgerMenu.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});
// 
// for navigation updating
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", async (e) => {
    e.preventDefault();
    const target = e.target.textContent.trim();

    navLinks.classList.remove("active");

    if (target === "Your Pokedex") {
      homePage.style.display = "none";
      yourPokedexPage.style.display = "block";
      localStorage.setItem("currentPage", "yourPokedex");
      showCaughtPokemons();
    } else if (target === "Home" || target === "Main Pokedex") {
      yourPokedexPage.style.display = "none";
      homePage.style.display = "block";
      localStorage.setItem("currentPage", "home");
    }
  });
});
//   

// for my pokemons page
const yourPokedexPage = document.getElementById("yourPokedexPage");
const yourPokedexGrid = document.getElementById("your-pokedex-grid");
const homePage = document.getElementById("homePage");


// find catсhed pokemons

async function showCaughtPokemons() {
  yourPokedexGrid.innerHTML = "";
  const caught = JSON.parse(localStorage.getItem("caughtPokemons")) || [];

  if (caught.length === 0) {
    yourPokedexGrid.innerHTML = "<p>You haven't caught any Pokemon yet!</p>";
    return;
  }

  for (const name of caught) {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const data = await res.json();
      renderPokemonCardToCaughtGrid(data);
    } catch {
      yourPokedexGrid.innerHTML += `<p>Failed to load ${name}</p>`;
    }
  }
  yourPokedexGrid.querySelectorAll(".pokemon-card").forEach(card => {
    card.addEventListener("click", async () => {
        const name = card.querySelector(".pokemon-name").textContent;
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const data = await response.json();
        showPokemonDescription(data);
    });
});
}

// display pokemon
function renderPokemonCardToCaughtGrid(pokemon) {
  const card = document.createElement("div");
  card.className = "pokemon-card";

  const pokemonImage = pokemon.sprites.other['official-artwork'].front_default;

  card.innerHTML = `
    <img src="${pokemonImage}" alt="${pokemon.name}" class="pokemon-image">
    <h5>#${pokemon.id}</h5>
    <h3 class="pokemon-name" style="text-transform: capitalize; padding-bottom: 10px";>${pokemon.name}</h3>
  `;

  yourPokedexGrid.appendChild(card);
}
// this is for logo in header

function goHome(e) {
    e.preventDefault();
    homePage.style.display = "block";
    yourPokedexPage.style.display = "none";
    localStorage.setItem("currentPage", "home");

    cardsGrid.innerHTML = "";
    pokemonOffset = 0;
    loadPokemons(pokemonOffset, pokemonLimit);
  }

logo.addEventListener("click", goHome); 