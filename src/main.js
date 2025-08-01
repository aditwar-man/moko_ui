import './style.css'
import { Game } from './game.js'
import { TelegramIntegration } from './telegram.js'

class App {
  constructor() {
    this.game = new Game()
    this.telegram = new TelegramIntegration()
    this.isInitialized = false
    this.init()
  }

  async init() {
    console.log('🚀 Starting Star Collector Mini App...')
    
    // Initialize Telegram Web App
    await this.telegram.init()
    
    // Load saved game progress
    await this.loadGameProgress()
    
    // Initialize game
    this.game.init()
    
    // Setup event listeners
    this.setupEventListeners()
    
    // Start the game loop
    this.game.startGameLoop()
    
    // Auto-save game progress periodically
    this.startAutoSave()
    
    this.isInitialized = true
    console.log('✅ App initialized successfully!')
  }

  async loadGameProgress() {
    return new Promise((resolve) => {
      this.telegram.loadGameProgress((savedData) => {
        if (savedData && savedData.user_id === this.telegram.getUserData()?.id) {
          console.log('📥 Restoring saved game progress...')
          
          // Restore game state
          this.game.totalCoins = savedData.totalCoins || this.game.totalCoins
          this.game.totalStars = savedData.totalStars || this.game.totalStars
          this.game.currentLevelStars = savedData.currentLevelStars || this.game.currentLevelStars
          this.game.level = savedData.level || this.game.level
          this.game.clickPower = savedData.clickPower || this.game.clickPower
          
          console.log('✅ Game progress restored!')
          this.telegram.showAlert('🎮 Welcome back! Your progress has been restored.')
        } else {
          console.log('🆕 Starting new game...')
        }
        resolve()
      })
    })
  }

  saveGameProgress() {
    if (!this.isInitialized) return
    
    const gameData = {
      totalCoins: this.game.totalCoins,
      totalStars: this.game.totalStars,
      currentLevelStars: this.game.currentLevelStars,
      level: this.game.level,
      clickPower: this.game.clickPower,
      targetLevelStars: this.game.targetLevelStars
    }
    
    this.telegram.saveGameProgress(gameData)
  }

  startAutoSave() {
    // Save progress every 30 seconds
    setInterval(() => {
      this.saveGameProgress()
    }, 30000)
    
    // Save on page unload
    window.addEventListener('beforeunload', () => {
      this.saveGameProgress()
    })
  }

  setupEventListeners() {
    // Reward items click
    document.querySelectorAll('.reward-item, .special-reward').forEach(item => {
      item.addEventListener('click', (e) => {
        console.log(`CurrentTarget: ${e.currentTarget}`)
        const value = parseInt(e.currentTarget.dataset.value)
        const randValueReward = [
          110,
          330,
          880,
          385,
          220,
          352,
          220,
          275,
          407,
          110,
        ]
        const randomReward = randValueReward[Math.floor(Math.random() * randValueReward.length)];

        this.game.collectReward(randomReward, e.currentTarget)
        this.telegram.hapticFeedback('success')
        
        // Save progress after significant actions
        this.saveGameProgress()
      })
    })

    const boosterBtn = document.getElementById('boostersToggleBtn');
    const boosterCountdown = document.getElementById('boosterCountdown');

    boosterCountdown.style.display = 'none';

    boosterBtn.addEventListener('click', () => {
      boosterBtn.style.display = 'none';
      boosterCountdown.style.display = 'block';

      console.log("🚀 Booster started!");
    });

    // Bottom navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        this.handleNavigation(e.currentTarget.dataset.tab)
        this.telegram.hapticFeedback('light')
      })
    })

    // Booster stars
    document.querySelectorAll('.booster-star').forEach((star, index) => {
      star.addEventListener('click', () => {
        this.game.activateBoosterStar(index)
        this.telegram.hapticFeedback('success')
        this.telegram.showAlert(`⭐ Click power set to ${index + 1}!`)
      })
    })
  }

  handleNavigation(tab) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active')
    })
    
    // Add active class to clicked item
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active')
    
    // Handle tab switching logic here
    switch(tab) {
      case 'earn':
        // Show earn content
        break
      case 'tasks':
        this.showTasksMenu()
        break
      case 'upgrade':
        this.showUpgradeMenu()
        break
      case 'profile':
        this.showProfile()
        break
    }
  }

  showTasksMenu() {
    const tasks = [
      '📱 Share the game with 3 friends',
      '⭐ Collect 1000 stars',
      '💰 Earn 50,000 coins',
      '🎯 Reach level 5',
      '🚀 Use booster 10 times'
    ]
    
    const message = '📋 Daily Tasks:\n\n' + tasks.map((task, i) => `${i + 1}. ${task}`).join('\n')
    this.telegram.showAlert(message)
  }

  showUpgradeMenu() {
    const upgrades = [
      '⚡ Click Power +1 (Cost: 10,000 coins)',
      '🤖 Auto Collector Speed +50% (Cost: 25,000 coins)',
      '🌟 Star Multiplier x2 (Cost: 50,000 coins)',
      '💎 Premium Rewards (Cost: 100,000 coins)'
    ]
    
    const message = '💼 Available Upgrades:\n\n' + upgrades.join('\n\n') + '\n\n💰 Your coins: ' + this.game.totalCoins.toLocaleString()
    this.telegram.showAlert(message)
  }

  showProfile() {
    const userData = this.telegram.getUserData()
    const stats = this.game.getStats()
    const appInfo = this.telegram.getAppInfo()
    
    const message = `👤 Profile\n\n` +
                   `💰 Total Coins: ${stats.totalCoins.toLocaleString()}\n` +
                   `⭐ Total Stars: ${stats.totalStars}\n` +
                   `🎯 Level: ${stats.level}\n` +
                   `⚡ Click Power: ${stats.clickPower}\n\n` +
                   (userData ? `👋 Hello ${userData.first_name}!\n` : '👋 Welcome!\n') +
                   (userData?.username ? `📱 @${userData.username}\n` : '') +
                   `🌐 Language: ${userData?.language_code || 'en'}\n` +
                   `📱 Platform: ${appInfo.platform || 'web'}\n` +
                   `🔧 Version: ${appInfo.version || 'unknown'}`
  
    this.telegram.showAlert(message)
    
    // Update main button to share progress with current stats
    this.updateShareButton()
  }

  updateShareButton() {
    const stats = this.game.getStats()
    const progressPercent = Math.floor((this.game.currentLevelStars / this.game.targetLevelStars) * 100)
    
    // Update share function with current stats
    this.telegram.shareProgress = () => {
      this.telegram.shareProgress({
        totalCoins: stats.totalCoins,
        totalStars: stats.totalStars,
        level: stats.level,
        progressPercent: progressPercent
      })
    }
  }
}

// Start the app
new App()