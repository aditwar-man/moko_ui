export class TelegramIntegration {
  constructor() {
    this.tg = window.Telegram?.WebApp
    this.isInTelegram = !!this.tg
    this.botToken = '8302115146:AAFJpm5wP2Jcn6RcDZxNdVdJaO1hxWYsSGw'
    this.userData = null
    this.initData = null
  }

  async init() {
    if (this.isInTelegram) {
      console.log('🚀 Initializing Telegram Mini App...')
      
      // Store init data
      this.initData = this.tg.initData
      this.userData = this.tg.initDataUnsafe?.user
      
      console.log('📱 Telegram WebApp Info:')
      console.log('- Version:', this.tg.version)
      console.log('- Platform:', this.tg.platform)
      console.log('- User:', this.userData)
      console.log('- InitData available:', !!this.initData)
      
      // Initialize Telegram WebApp
      this.tg.ready()
      
      // Configure the app
      this.configureApp()
      
      // Set up theme
      this.applyTelegramTheme()
      
      // Set up main button
      this.setupMainButton()
      
      // Set up back button handler
      this.setupBackButton()
      
      // Enable closing confirmation
      this.tg.enableClosingConfirmation()
      
      // Display user info in the app
      this.displayUserInfo()
      
      console.log('✅ Telegram Mini App initialized successfully!')
      
    } else {
      console.log('⚠️ Not running in Telegram - Demo mode')
      this.setupDemoMode()
    }
  }

  configureApp() {
    // Expand to full height
    this.tg.expand()
    
    // Set header color
    this.tg.setHeaderColor('#FFF4E6')
    
    // Set background color
    this.tg.setBackgroundColor('#FFF4E6')
    
    // Hide back button initially
    this.tg.BackButton.hide()
  }

  applyTelegramTheme() {
    const root = document.documentElement
    const themeParams = this.tg.themeParams
    
    console.log('🎨 Applying Telegram theme:', themeParams)
    
    // Apply theme colors if available
    if (themeParams.bg_color) {
      root.style.setProperty('--tg-bg-color', themeParams.bg_color)
      root.style.setProperty('--background-cream', themeParams.bg_color)
    }
    
    if (themeParams.text_color) {
      root.style.setProperty('--tg-text-color', themeParams.text_color)
      root.style.setProperty('--text-brown', themeParams.text_color)
    }
    
    if (themeParams.button_color) {
      root.style.setProperty('--tg-button-color', themeParams.button_color)
      root.style.setProperty('--secondary-orange', themeParams.button_color)
    }
    
    if (themeParams.button_text_color) {
      root.style.setProperty('--tg-button-text-color', themeParams.button_text_color)
    }
    
    // Apply secondary color
    if (themeParams.secondary_bg_color) {
      root.style.setProperty('--reward-blue', themeParams.secondary_bg_color)
    }
  }

  setupMainButton() {
    if (!this.isInTelegram) return
    
    this.tg.MainButton.setText('🌟 Share Progress')
    this.tg.MainButton.color = '#FF8C42'
    this.tg.MainButton.textColor = '#FFFFFF'
    
    this.tg.MainButton.onClick(() => {
      this.shareProgress()
    })
    
    this.tg.MainButton.show()
  }

  setupBackButton() {
    if (!this.isInTelegram) return
    
    this.tg.BackButton.onClick(() => {
      // Handle back button - could show menu or previous screen
      this.showAlert('Back button pressed!')
    })
  }

  displayUserInfo() {
    if (!this.userData) return
    
    const userInfoElement = document.getElementById('init-data-value')
    if (userInfoElement) {
      userInfoElement.innerHTML = `
        <div style="background: rgba(255,255,255,0.9); padding: 8px; border-radius: 8px; margin: 8px 0; font-size: 12px;">
          <div><strong>👤 ${this.userData.first_name || 'User'}</strong></div>
          <div>🆔 ID: ${this.userData.id}</div>
          ${this.userData.username ? `<div>📱 @${this.userData.username}</div>` : ''}
          <div>🌐 Lang: ${this.userData.language_code || 'en'}</div>
        </div>
      `
    }
  }

  setupDemoMode() {
    console.log('🔧 Setting up demo mode...')
    
    // Create mock user data for demo
    this.userData = {
      id: 123456789,
      first_name: 'Demo User',
      username: 'demo_user',
      language_code: 'en'
    }
    
    this.displayUserInfo()
    
    // Show demo notification
    setTimeout(() => {
      alert('🔧 Demo Mode: This is how the app works in Telegram!')
    }, 1000)
  }

  shareProgress(gameStats = null) {
    const stats = gameStats || {
      totalCoins: 100580,
      totalStars: 770,
      level: 1,
      progressPercent: 41
    }
    
    const userName = this.userData?.first_name || 'Player'
    const message = `🌟 ${userName} is collecting stars!\n\n` +
                   `💰 Coins: ${stats.totalCoins.toLocaleString()}\n` +
                   `⭐ Stars: ${stats.totalStars}\n` +
                   `🎯 Level: ${stats.level}\n` +
                   `📊 Progress: ${stats.progressPercent}%\n\n` +
                   `🚀 Join the Star Collector game!`
    
    if (this.isInTelegram) {
      // Try different sharing methods
      if (this.tg.shareToStory) {
        this.tg.shareToStory(window.location.href, {
          text: message,
          widget_link: {
            url: window.location.href,
            name: 'Star Collector'
          }
        })
      } else if (this.tg.switchInlineQuery) {
        this.tg.switchInlineQuery(message, ['users', 'groups'])
      } else {
        // Fallback: copy to clipboard
        this.copyToClipboard(message + '\n\n' + window.location.href)
        this.showAlert('📋 Progress copied to clipboard!\nShare it in any chat.')
      }
      
      // Haptic feedback
      this.hapticFeedback('success')
    } else {
      // Demo mode
      this.copyToClipboard(message + '\n\n' + window.location.href)
      alert('📋 Progress copied to clipboard!')
    }
  }

  copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text)
    } else {
      // Fallback for older browsers or non-HTTPS
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
        textArea.remove()
        return Promise.resolve()
      } catch (error) {
        textArea.remove()
        return Promise.reject(error)
      }
    }
  }

  showAlert(message) {
    if (this.isInTelegram) {
      this.tg.showAlert(message)
    } else {
      alert(message)
    }
  }

  showConfirm(message, callback) {
    if (this.isInTelegram) {
      this.tg.showConfirm(message, callback)
    } else {
      const result = confirm(message)
      callback(result)
    }
  }

  showPopup(params) {
    if (this.isInTelegram && this.tg.showPopup) {
      this.tg.showPopup(params)
    } else {
      // Fallback
      const message = params.message || params.title || 'Notification'
      alert(message)
    }
  }

  hapticFeedback(type = 'medium') {
    if (this.isInTelegram && this.tg.HapticFeedback) {
      try {
        switch (type) {
          case 'light':
            this.tg.HapticFeedback.impactOccurred('light')
            break
          case 'medium':
            this.tg.HapticFeedback.impactOccurred('medium')
            break
          case 'heavy':
            this.tg.HapticFeedback.impactOccurred('heavy')
            break
          case 'success':
            this.tg.HapticFeedback.notificationOccurred('success')
            break
          case 'error':
            this.tg.HapticFeedback.notificationOccurred('error')
            break
          case 'warning':
            this.tg.HapticFeedback.notificationOccurred('warning')
            break
          default:
            this.tg.HapticFeedback.impactOccurred('medium')
        }
      } catch (error) {
        console.log('Haptic feedback not available:', error)
      }
    }
  }

  getUserData() {
    return this.userData
  }

  getInitData() {
    return {
      initData: this.initData,
      user: this.userData,
      platform: this.tg?.platform,
      version: this.tg?.version
    }
  }

  sendData(data) {
    if (this.isInTelegram) {
      try {
        this.tg.sendData(JSON.stringify(data))
      } catch (error) {
        console.error('Error sending data:', error)
      }
    }
  }

  setScore(score) {
    this.sendData({
      action: 'set_score',
      score: score,
      user_id: this.userData?.id,
      timestamp: Date.now()
    })
  }

  openLink(url, options = {}) {
    if (this.isInTelegram) {
      this.tg.openLink(url, options)
    } else {
      window.open(url, '_blank')
    }
  }

  openTelegramLink(url) {
    if (this.isInTelegram) {
      this.tg.openTelegramLink(url)
    } else {
      window.open(url, '_blank')
    }
  }

  requestWriteAccess(callback) {
    if (this.isInTelegram && this.tg.requestWriteAccess) {
      this.tg.requestWriteAccess(callback)
    } else {
      callback && callback(false)
    }
  }

  requestContact(callback) {
    if (this.isInTelegram && this.tg.requestContact) {
      this.tg.requestContact(callback)
    } else {
      callback && callback(false)
    }
  }

  // Cloud Storage methods (if available)
  cloudStorageSetItem(key, value, callback) {
    if (this.isInTelegram && this.tg.CloudStorage && this.isCloudStorageSupported()) {
      this.tg.CloudStorage.setItem(key, value, callback)
    } else {
      // Fallback to localStorage
      try {
        localStorage.setItem(`tg_${key}`, value)
        callback && callback(null, true)
      } catch (error) {
        callback && callback(error, false)
      }
    }
  }

  cloudStorageGetItem(key, callback) {
    if (this.isInTelegram && this.tg.CloudStorage && this.isCloudStorageSupported()) {
      this.tg.CloudStorage.getItem(key, callback)
    } else {
      // Fallback to localStorage
      try {
        const value = localStorage.getItem(`tg_${key}`)
        callback && callback(null, value)
      } catch (error) {
        callback && callback(error, null)
      }
    }
  }

  cloudStorageRemoveItem(key, callback) {
    if (this.isInTelegram && this.tg.CloudStorage && this.isCloudStorageSupported()) {
      this.tg.CloudStorage.removeItem(key, callback)
    } else {
      // Fallback to localStorage
      try {
        localStorage.removeItem(`tg_${key}`)
        callback && callback(null, true)
      } catch (error) {
        callback && callback(error, false)
      }
    }
  }

  // Check if CloudStorage is supported in current version
  isCloudStorageSupported() {
    if (!this.tg || !this.tg.version) return false
    
    // CloudStorage was introduced in version 6.1
    const currentVersion = parseFloat(this.tg.version)
    return currentVersion >= 6.1
  }

  // Save game progress to cloud
  saveGameProgress(gameData) {
    const data = {
      ...gameData,
      user_id: this.userData?.id,
      timestamp: Date.now()
    }
    
    this.cloudStorageSetItem('game_progress', JSON.stringify(data), (error, success) => {
      if (error) {
        console.error('Failed to save game progress:', error)
      } else {
        console.log('✅ Game progress saved to cloud')
      }
    })
  }

  // Load game progress from cloud
  loadGameProgress(callback) {
    this.cloudStorageGetItem('game_progress', (error, data) => {
      if (error) {
        console.error('Failed to load game progress:', error)
        callback && callback(null)
      } else {
        try {
          const gameData = data ? JSON.parse(data) : null
          console.log('📥 Game progress loaded from cloud:', gameData)
          callback && callback(gameData)
        } catch (parseError) {
          console.error('Failed to parse game progress:', parseError)
          callback && callback(null)
        }
      }
    })
  }

  // Check if running in Telegram
  isRunningInTelegram() {
    return this.isInTelegram
  }

  // Get app info
  getAppInfo() {
    return {
      isInTelegram: this.isInTelegram,
      version: this.tg?.version,
      platform: this.tg?.platform,
      user: this.userData,
      themeParams: this.tg?.themeParams
    }
  }
}