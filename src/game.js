export class Game {
  constructor() {
    this.totalCoins = 0
    this.totalStars = 0
    this.currentLevelStars = 11855
    this.targetLevelStars = 100000
    this.clickPower = 1
    this.level = 1
    this.autoCollectorActive = true
    this.autoCollectorTimeLeft = 600 // 10 minutes in seconds
    this.boosterMultiplier = 1
    this.boosterTimeLeft = 0
    
    this.lastUpdate = Date.now()
    this.autoCollectRate = 10 // coins per second when auto collector is active
  }

  init() {
    this.updateUI()
    this.startAutoCollector()
  }

  startGameLoop() {
    setInterval(() => {
      this.gameLoop()
    }, 1000) // Update every second
  }

  gameLoop() {
    const now = Date.now()
    const deltaTime = (now - this.lastUpdate) / 1000
    this.lastUpdate = now

    // Auto collector logic
    if (this.autoCollectorActive && this.autoCollectorTimeLeft > 0) {
      this.autoCollectorTimeLeft -= deltaTime
      const coinsToAdd = Math.floor(this.autoCollectRate * deltaTime)
      this.totalCoins += coinsToAdd
      
      if (this.autoCollectorTimeLeft <= 0) {
        this.autoCollectorActive = false
        this.autoCollectorTimeLeft = 0
      }
    }

    // Booster timer
    if (this.boosterTimeLeft > 0) {
      this.boosterTimeLeft -= deltaTime
      if (this.boosterTimeLeft <= 0) {
        this.boosterMultiplier = 1
      }
    }

    this.updateUI()
  }

  collectReward(value, element) {
    const actualValue = Math.floor(value * this.boosterMultiplier)
    this.totalCoins += actualValue
    this.currentLevelStars += Math.floor(actualValue / 10)
    
    // Check for level up
    if (this.currentLevelStars >= this.targetLevelStars) {
      this.levelUp()
    }
    
    // Visual feedback
    this.showFloatingText(`+${actualValue}`, element)
    this.animateReward(element)
    
    this.updateUI()
  }

  clickCharacter(element) {
    const coinsEarned = this.clickPower * this.boosterMultiplier
    this.totalCoins += coinsEarned
    this.currentLevelStars += Math.floor(coinsEarned / 10)
    
    // Character animation
    element.style.transform = 'scale(0.95)'
    setTimeout(() => {
      element.style.transform = 'scale(1)'
    }, 100)
    
    // Show floating coins
    this.showFloatingText(`+${coinsEarned}`, element)
    
    this.updateUI()
  }

  activateBooster() {
    this.boosterMultiplier = 2
    this.boosterTimeLeft = 30 // 30 seconds
    
    // Visual feedback
    document.querySelector('.boosters-btn').style.background = '#ff6b35'
    setTimeout(() => {
      document.querySelector('.boosters-btn').style.background = ''
    }, 200)
  }

  activateBoosterStar(index) {
    // Remove active class from all stars
    document.querySelectorAll('.booster-star').forEach(star => {
      star.classList.remove('active')
    })
    
    // Add active class to clicked star
    document.querySelectorAll('.booster-star')[index].classList.add('active')
    
    // Increase click power based on star level
    this.clickPower = index + 1
  }

  levelUp() {
    this.level++
    this.totalStars += 10
    this.currentLevelStars = 0
    this.targetLevelStars = Math.floor(this.targetLevelStars * 1.5)
    
    // Show level up animation
    this.showLevelUpAnimation()
    
    // Send level up event to Telegram
    if (window.telegramApp) {
      window.telegramApp.telegram.hapticFeedback('success')
      window.telegramApp.telegram.showAlert(`🎉 Level Up! You reached level ${this.level}!`)
    }
  }

  showFloatingText(text, element) {
    const floatingText = document.createElement('div')
    floatingText.className = 'floating-text'
    floatingText.textContent = text
    
    const rect = element.getBoundingClientRect()
    floatingText.style.left = rect.left + rect.width / 2 + 'px'
    floatingText.style.top = rect.top + 'px'
    
    document.body.appendChild(floatingText)
    
    setTimeout(() => {
      floatingText.remove()
    }, 1000)
  }

  animateReward(element) {
    element.style.transform = 'scale(1.1)'
    element.style.filter = 'brightness(1.3)'
    
    setTimeout(() => {
      element.style.transform = 'scale(1)'
      element.style.filter = 'brightness(1)'
    }, 200)
  }

  showLevelUpAnimation() {
    const levelUpDiv = document.createElement('div')
    levelUpDiv.className = 'level-up-animation'
    levelUpDiv.innerHTML = `
      <div class="level-up-text">LEVEL UP!</div>
      <div class="level-up-number">Level ${this.level}</div>
    `
    
    document.body.appendChild(levelUpDiv)
    
    setTimeout(() => {
      levelUpDiv.remove()
    }, 2000)
  }

  startAutoCollector() {
    if (this.autoCollectorActive) {
      setInterval(() => {
        if (this.autoCollectorActive && this.autoCollectorTimeLeft > 0) {
          this.updateAutoCollectorUI()
        }
      }, 1000)
    }
  }

  updateAutoCollectorUI() {
    const progressPercent = ((600 - this.autoCollectorTimeLeft) / 600) * 100
    const progressFill = document.querySelector('.mini-progress-fill')
    if (progressFill) {
      progressFill.style.width = progressPercent + '%'
    }
    
    const timeLeft = Math.floor(this.autoCollectorTimeLeft)
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    
    const collectorText = document.querySelector('.collector-text')
    if (collectorText) {
      collectorText.textContent = `Auto-collector stars for ${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  }

  updateBoosterStartUI() {
    const progressPercent = ((600 - this.autoCollectorTimeLeft) / 600) * 100
    const progressFill = document.querySelector('.mini-progress-fill')
    if (progressFill) {
      progressFill.style.width = progressPercent + '%'
    }
    
    const timeLeft = Math.floor(this.autoCollectorTimeLeft)
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    
    const collectorText = document.querySelector('div#booster_collector_countdown>.collector-text')
    if (collectorText) {
      collectorText.textContent = `Booster stars for ${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  }

  updateUI() {
    // Update main stats
    document.getElementById('totalCoins').textContent = this.totalCoins.toLocaleString()
    document.getElementById('totalStars').textContent = this.totalStars
    document.getElementById('currentLevelStars').textContent = this.currentLevelStars.toLocaleString()
    
    // Update progress
    const progressPercent = Math.floor((this.currentLevelStars / this.targetLevelStars) * 100)
    document.getElementById('progressPercent').textContent = progressPercent + '%'
    document.getElementById('progressFill').style.width = progressPercent + '%'
    
    // Update auto collector progress
    if (this.autoCollectorActive) {
      const autoProgressPercent = Math.floor(((600 - this.autoCollectorTimeLeft) / 600) * 100)
      document.querySelector('.progress-text').textContent = autoProgressPercent + '%'
    }
  }

  getStats() {
    return {
      totalCoins: this.totalCoins,
      totalStars: this.totalStars,
      level: this.level,
      clickPower: this.clickPower,
      currentLevelStars: this.currentLevelStars,
      targetLevelStars: this.targetLevelStars,
      autoCollectorActive: this.autoCollectorActive,
      boosterMultiplier: this.boosterMultiplier
    }
  }
}