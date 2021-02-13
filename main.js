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
    numberOfCards: 32,
    timeToShow: 2000,
  },
  3: {
    name: "Insane",
    numberOfCards: 64,
    timeToShow: 1000,
  },
}

const Game = {
  endGame: false,
  previousClick: false,
  previousCard: false,
  uncoverPairs: 0,
  Attempts: 0,

  win: () => {
    Game.endGame
    Game.timerStop()
    alert(`Congratulations, you have won in ${Game.Attempts} Attempts !`)
  },

  changeLevel: (level) => {
    loadLevels()
    Config = Object.values(gameParameters)[level]
    console.info(`Level: ${Config.name}, ${Config.numberOfCards} cards.`)
    document.getElementById("level").getElementsByTagName("option")[
      level
    ].selected = "selected"
    Game.reload()
    Game.timerStop()
    Game.timerReset()
  },

  setInsane: () => {
    const btn = document.getElementById("btn-insane")
    btn.classList.toggle("active")
    container.classList.toggle("insane")
  },

  newAttempt: () => {
    Game.Attempts++
    const showAttempts = document.getElementById("attempts")
    showAttempts.innerText = Game.Attempts
  },

  calculateCardSize: () => {
    const cardMargin = 10
    const horizontalCard = Math.trunc(Math.sqrt(Config.numberOfCards))
    const minimalWorkspace =
      container.clientHeight - container.clientWidth < 0
        ? container.clientHeight
        : container.clientWidth

    const cardSize = Math.trunc(
      minimalWorkspace / horizontalCard - cardMargin * 2
    )
    return cardSize
  },

  reload: () => {
    const cardSize = Game.calculateCardSize()

    // Center card
    container.style.justifySelf = "center"

    container.style.visibility = "hidden"
    container.innerHTML = ""

    const arrayOfCard = new Array(Config.numberOfCards / 2).fill(null)

    // Create array of card
    cardsArray = arrayOfCard.map(
      (item, index) =>
        Card.createNewCard(
          index,
          `https://source.unsplash.com/collection/${index}/${cardSize}x${cardSize}`
        )
      // Source 2: `https://picsum.photos/${cardSize}?random=${index}`
    )

    // Add cards to container
    cardsArray.map((card) => {
      const cloneCard = card.cloneNode(true)

      // card.classList.add("uncover")
      // cloneCard.classList.add("uncover")

      container.appendChild(card)
      container.appendChild(cloneCard)
    })

    // Shuffle children of container
    container.children = shuffleChildren(container)

    container.style.visibility = "visible"

    Game.previousClick = Game.previousCard = null
    Game.uncoverPairs = Game.Attempts = 0
    document.getElementById("attempts").innerText = 0
    document.getElementById("discovery").innerText = 0
  },

  // Timer Function
  timerCount: 0,
  timer: null,

  timerShow: (srtToShow) => {
    const display = document.getElementById("timer")
    display.innerHTML = srtToShow
  },

  timerStart: () => {
    Game.timer = setInterval(() => {
      Game.timerUp()
    }, 1000)
  },

  timerStop: () => {
    window.clearInterval(Game.timer)
  },

  timerReset: () => {
    Game.timerCount = 0
    const srtToShow = Game.timerCount.toHHMMSS()
    Game.timerShow(srtToShow)
  },

  timerUp: () => {
    Game.timerCount++
    const srtToShow = Game.timerCount.toHHMMSS()
    Game.timerShow(srtToShow)
  },
} // Game

const Card = {
  uncoverCard: null,
  timeoutID: null,

  click: (card) => {
    if (Game.endGame || Card.uncoverCard === card) return

    if (Game.timerCount === 0) Game.timerStart()

    // First Click
    if (Card.uncoverCard === null) {
      Card.hideActiveCards()
      Card.showCard(card)
      Card.uncoverCard = card
      return
    }

    // Second Click
    if (
      Card.uncoverCard != null &&
      Card.uncoverCard.dataset.pairid === card.dataset.pairid
    ) {
      // Good Attempt
      Card.uncoverPair(card.dataset.pairid)

      if (Config.numberOfCards / 2 === Game.uncoverPairs) {
        Game.newAttempt()
        Game.win()
      }
    } else {
      // Bad Attempt
      Card.showCard(card)
      Card.coverPair(card.dataset.pairid)
      Card.uncoverCard = null
    }
    Game.newAttempt()
    Card.uncoverCard = null
  },

  showCard: (card) => {
    card.classList.add("active")
  },

  coverPair: async (id) => {
    Card.timeoutID = window.setTimeout(Card.hideActiveCards, Config.timeToShow)
    // console.log(timeoutID)
  },

  uncoverPair: (id) => {
    Game.uncoverPairs++
    const showDiscovery = document.getElementById("discovery")
    showDiscovery.innerText = Game.uncoverPairs
    const pairs = [...document.querySelectorAll(`[data-pairid='${id}']`)]
    pairs.forEach((card) => card.classList.add("uncover"))
  },

  hideActiveCards: () => {
    window.clearTimeout(Card.timeoutID)
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
  const aside = document.getElementById("aside")

  if (aside)
    aside.addEventListener("mouseup", () => aside.classList.toggle("active"))

  if (container)
    container.addEventListener("mouseup", (target) => {
      const card = target.target
      Card.click(card)
    })

  Game.changeLevel(1)
  // Game.reload()
})

function loadLevels() {
  const levelIndicator = document.getElementById("level")

  levelIndicator.innerText = ""

  Object.entries(gameParameters).map((x) => {
    const option = document.createElement("option")
    option.value = x[0]
    option.innerText = x[1].name

    levelIndicator.appendChild(option)
  })
}

// Return shuffle node
function shuffleChildren(node) {
  shuffleArray([...node.children]).map((item) => node.appendChild(item))
  return node
}

// Shuffle Array
function shuffleArray(array) {
  return array
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value)
}

// Seconds to HH:MM:SS
Number.prototype.toHHMMSS = function () {
  if (!this) return // don't forget the second param

  var sec_num = parseInt(this, 10)
  var hours = Math.floor(sec_num / 3600)
  var minutes = Math.floor((sec_num - hours * 3600) / 60)
  var seconds = sec_num - hours * 3600 - minutes * 60

  if (hours < 10) {
    hours = "0" + hours
  }
  if (minutes < 10) {
    minutes = "0" + minutes
  }
  if (seconds < 10) {
    seconds = "0" + seconds
  }

  return hours + ":" + minutes + ":" + seconds
}
