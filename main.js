/**
 Data Source:
    https://picsum.photos/${cardSize}?random=${index}
 */

let Config = null
let container

const gameParameters = {
  0: {
    name: "Mom's Baby",
    numberOfCards: 4,
    timeToShow: 4000,
  },
  1: {
    name: "Bermudas Boy",
    numberOfCards: 16,
    timeToShow: 3000,
  },
  2: {
    name: "Responsible adult",
    numberOfCards: 64,
    timeToShow: 2000,
  },
  3: {
    name: "Insane",
    numberOfCards: 32,
    timeToShow: 1000,
  },
}

const Game = {
  endGame: false,
  previusClick: false,
  previusCard: false,
  uncoverPairs: 0,
  attempts: 0,

  win: () => {
    Game.endGame
    alert(`Congratulations, you have won in ${Game.attempts} attempts !`)
  },

  changeLevel: (level) => {
    loadLevels()
    Config = Object.values(gameParameters)[level]
    console.info(`Level: ${Config.name}, ${Config.numberOfCards} cards.`)
    document.getElementById("level").getElementsByTagName("option")[
      level
    ].selected = "selected"
    Game.reload()
  },

  newAttemps: () => {
    Game.attempts++
    const showAttemps = document.getElementById("attempts")
    showAttemps.innerText = Game.attempts
  },

  reload: () => {
    // Calculate card size
    const horizontalCardNumber = Math.sqrt(Config.numberOfCards).toFixed(0)

    let screenSize =
      container.clientHeight - container.clientWidth < 0
        ? container.clientHeight
        : container.clientWidth

    const cardSize = (screenSize / horizontalCardNumber).toFixed(0) - 40

    console.log("Screen Size", screenSize)
    console.log("Horizontals Cards:", horizontalCardNumber)
    console.log("Card Size:", cardSize)

    container.style.visibility = "hidden"
    container.innerHTML = ""

    for (let index = 0; index < Config.numberOfCards / 2; index++) {
      const src = `https://picsum.photos/${cardSize}?random=${index}`

      const card = Card.createNewCard(index, src)
      container.appendChild(card)
    }

    container.innerHTML += container.innerHTML
    suffleChildNodes("board")
    container.style.visibility = "visible"

    Game.previusClick = Game.previusCard = null
    Game.uncoverPairs = Game.attempts = 0
    document.getElementById("attempts").innerText = 0
    document.getElementById("discovery").innerText = 0
  },
} // Game

const Card = {
  uncoverCard: null,

  click: (card) => {
    if (Game.endGame || Card.uncoverCard === card) return

    if (Card.uncoverCard === null) {
      Card.showCard(card)
      Card.uncoverCard = card
      return
    }

    if (
      Card.uncoverCard != null &&
      Card.uncoverCard.dataset.pairid === card.dataset.pairid
    ) {
      // Good Attemp
      Card.uncoverPair(card.dataset.pairid)

      if (Config.numberOfCards / 2 === Game.uncoverPairs) {
        Game.newAttemps()
        Game.win()
      }
    } else {
      // Bad Attemp
      Card.showCard(card)
      Card.coverPair(card.dataset.pairid)
      Card.uncoverCard = null
    }
    Game.newAttemps()
    Card.uncoverCard = null
  },

  showCard: (card) => {
    card.classList.add("active")
  },

  coverPair: async (id) => {
    setTimeout(Card.hideActiveCards, Config.timeToShow)
  },

  uncoverPair: (id) => {
    Game.uncoverPairs++
    const showDiscovery = document.getElementById("discovery")
    showDiscovery.innerText = Game.uncoverPairs
    const pairs = [...document.querySelectorAll(`[data-pairid='${id}']`)]
    pairs.forEach((card) => card.classList.add("uncover"))
  },
  hideActiveCards: () => {
    const activeCards = [...document.getElementsByClassName("active")]
    activeCards.forEach((card) => card.classList.remove("active"))
  },

  createNewCard: (PairId, src) => {
    const image = document.createElement("img")
    image.setAttribute("src", src)
    image.setAttribute("alt", "Memo")

    const card = document.createElement("div")
    card.setAttribute("data-pairid", PairId)
    card.classList.add("card")
    // card.classList.add("active")

    card.appendChild(image)
    return card
  },
} // Card

// Initial Function
document.addEventListener("DOMContentLoaded", () => {
  container = document.getElementById("board")

  if (container)
    container.addEventListener("mouseup", (target) =>
      Card.click(target.originalTarget)
    )

  Game.changeLevel(0)
  Game.reload()
})

function loadLevels() {
  const levelIndicator = document.getElementById("level")

  levelIndicator.innerText = ""

  Object.entries(gameParameters).map((x) => {
    const option = document.createElement("option")
    option.value = x[0]
    option.innerText = x[1].name

    levelIndicator.appendChild(option)
    console.log(x[1].name)
  })
}

/**
 * Suffle Child Node of HTML Element
 *
 */
function suffleChildNodes(nodeId) {
  const node = document.getElementById(nodeId)
  let array = arraySuflle([...node.childNodes])
  node.innerHTML = ""
  array.map((childNode) => node.appendChild(childNode))
}

// Suffle Array
function arraySuflle(array) {
  return array
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value)
}
