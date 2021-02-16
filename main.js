/**
 * Author: Germán Aliprandi
 * galiprandi@gmail.com
 *
 * Licence: MIT
 */

let Config = null
let container

// Initial Function
document.addEventListener("DOMContentLoaded", () => {
  container = document.getElementById("board")
  const aside = document.getElementById("aside")

  if (aside)
    aside.addEventListener("mouseup", (target) => {
      if (target.target.id === "level") return
      aside.classList.toggle("active")
    })

  if (container)
    container.addEventListener("mouseup", (target) => {
      const card = target.target
      Card.click(card)
    })

  Game.changeLevel(1)
})

/**
 * Game Parameters Configurations
 */
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
    name: "Crazy Thing",
    numberOfCards: 64,
    timeToShow: 1000,
  },
  4: {
    name: "WTF !",
    numberOfCards: 100,
    timeToShow: 700,
  },
}

/**
 * Interface functions
 */
const Interface = {
  loadLevelSelector: () => {
    const levelSelector = document.getElementById("level")

    levelSelector.innerText = ""

    Object.entries(gameParameters).map((item) => {
      const option = document.createElement("option")
      option.value = item[0]
      option.innerText = item[1].name

      levelSelector.appendChild(option)
    })
  },

  updateAttempts: (number) => {
    const displayAttempts = document.querySelectorAll(".attempts")
    displayAttempts.forEach((item) => (item.innerText = number))
  },

  updateDiscoveryPairs: (number) => {
    const discoveryPairs = document.querySelectorAll(".discoveryPairs")
    discoveryPairs.forEach((item) => (item.innerText = number))
  },

  showWinDialog: () => {
    const dialog = document.getElementById("winDialog")
    dialog.setAttribute("open", true)
  },

  closeWinDialog: () => {
    const dialog = document.getElementById("winDialog")
    dialog.removeAttribute("open")
  },
} // Interface

/**
 * Game related functions
 */
const Game = {
  endGame: false,
  previousClick: false,
  previousCard: false,
  uncoverPairs: 0,
  attempts: 0,

  win: () => {
    Game.endGame
    Game.timerStop()
    Interface.showWinDialog()
  },

  changeLevel: (level) => {
    Interface.loadLevelSelector()

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
    Game.attempts++

    Interface.updateAttempts(Game.attempts)
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

    const numberOfCard = new Array(Config.numberOfCards / 2).fill(null)

    // Create array of card
    const cardsArray = numberOfCard.map(
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
    Game.uncoverPairs = Game.attempts = 0

    Interface.updateAttempts(Game.attempts)
    Interface.updateDiscoveryPairs(Game.uncoverPairs)
    Game.timerStop()
    Game.timerReset()
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

/**
 * Card related functions
 */
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

    Interface.updateDiscoveryPairs(Game.uncoverPairs)
    const pairs = [...document.querySelectorAll(`[data-pairid='${id}']`)]
    pairs.forEach((item) => item.classList.add("uncover"))
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

/**
 * Utilities functions
 */

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
