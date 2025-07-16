// ===== КОНФИГУРАЦИЯ GOOGLE SHEETS =====
const GOOGLE_SHEETS_CONFIG = {
  API_KEY: "AIzaSyAPNoe4hXwejLxnUr04bqEeWZRE7VqJYP4",
  SPREADSHEET_ID: "1m0qu16ObNFCIFovWViemQTTuAHzx1nDGBEGE0OpCnpU",
  RANGE: "Sheet1!A:B",
  CACHE_DURATION: 5 * 60 * 1000, // 5 минут кеширования
}

// ===== ОСНОВНОЙ КЛАСС ДЛЯ УПРАВЛЕНИЯ СТРАНИЦЕЙ ЦЕН =====
class PricesPageManager {
  constructor() {
    this.pricesData = new Map()
    this.lastUpdateTime = null
    this.isLoading = false
    this.retryCount = 0
    this.maxRetries = 3

    this.init()
  }

  async init() {
    try {
      console.log("Инициализация страницы цен...")

      // Инициализация компонентов
      this.initMobileMenu()
      this.initServiceTabs()
      this.initScrollEffects()
      this.initBookingButtons()

      // Загрузка данных из Google Sheets
      await this.loadPricesData()

      // Обновление цен на странице
      this.updatePricesDisplay()

      // Автообновление каждые 5 минут
      setInterval(() => {
        this.loadPricesData()
      }, GOOGLE_SHEETS_CONFIG.CACHE_DURATION)

      console.log("Инициализация завершена успешно")
    } catch (error) {
      console.error("Ошибка инициализации:", error)
      this.showError("Ошибка загрузки данных: " + error.message)
    }
  }

  // ===== ЗАГРУЗКА ДАННЫХ ИЗ GOOGLE SHEETS =====
  async loadPricesData() {
    if (this.isLoading) return

    this.isLoading = true
    this.updateLoadingStatus("loading")

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID}/values/${GOOGLE_SHEETS_CONFIG.RANGE}?key=${GOOGLE_SHEETS_CONFIG.API_KEY}`

      console.log("Загрузка данных из URL:", url)

      const response = await fetch(url)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Ошибка HTTP:", response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Получены данные:", data)

      if (data.values && data.values.length > 0) {
        this.processPricesData(data.values)
        this.lastUpdateTime = new Date()
        this.retryCount = 0
        this.updateLoadingStatus("success")
        this.updatePricesDisplay()
      } else {
        throw new Error("Нет данных в таблице")
      }
    } catch (error) {
      console.error("Ошибка загрузки данных:", error)
      this.handleLoadError(error)
    } finally {
      this.isLoading = false
    }
  }

  // ===== ОБРАБОТКА ДАННЫХ ИЗ GOOGLE SHEETS =====
  processPricesData(values) {
    this.pricesData.clear()

    console.log("Обработка данных, всего строк:", values.length)

    // Пропускаем заголовок (первая строка)
    for (let i = 1; i < values.length; i++) {
      const row = values[i]
      if (row && row.length >= 2 && row[0] && row[1] !== undefined) {
        const serviceName = this.normalizeServiceName(row[0])
        const priceText = this.formatPriceText(row[1])

        if (serviceName && priceText) {
          this.pricesData.set(serviceName, priceText)
          console.log(`Добавлена услуга: "${serviceName}" = "${priceText}"`)
        }
      }
    }

    console.log("Загружено услуг:", this.pricesData.size)
  }

  // ===== НОРМАЛИЗАЦИЯ НАЗВАНИЯ УСЛУГИ =====
  normalizeServiceName(name) {
    if (!name) return ""
    return name.toString().trim().toLowerCase()
  }

  // ===== ФОРМАТИРОВАНИЕ ТЕКСТА ЦЕНЫ =====
  formatPriceText(price) {
    if (price === undefined || price === null) return ""

    const priceStr = price.toString().trim()

    // Если цена равна 0
    if (priceStr === "0") {
      return "Бесплатно"
    }

    // Если уже есть "от" в начале
    if (priceStr.toLowerCase().startsWith("от ")) {
      return priceStr
    }

    // Если это просто число с пробелами (например "5 000")
    if (/^\d[\d\s]*$/.test(priceStr)) {
      return priceStr + " ₸"
    }

    // Если уже есть валюта или другой текст
    if (priceStr.includes("₸") || priceStr.includes("тенге")) {
      return priceStr
    }

    // Добавляем валюту к числу
    return priceStr + " ₸"
  }

  // ===== ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ ЦЕН НА СТРАНИЦЕ =====
  updatePricesDisplay() {
    const priceElements = document.querySelectorAll("[data-service-key]")
    console.log("Обновление цен, найдено элементов:", priceElements.length)

    priceElements.forEach((element) => {
      const serviceKey = element.getAttribute("data-service-key")
      if (!serviceKey) return

      const normalizedKey = this.normalizeServiceName(serviceKey)
      const price = this.findPriceByKey(normalizedKey)

      console.log(`Поиск цены для "${serviceKey}" (нормализовано: "${normalizedKey}"):`, price)

      if (price) {
        element.textContent = price
        element.classList.remove("price-loading", "price-error")
        element.classList.add("price-loaded")
      } else {
        element.textContent = "Уточните цену"
        element.classList.add("price-error")
        element.classList.remove("price-loading", "price-loaded")
      }
    })
  }

  // ===== ПОИСК ЦЕНЫ ПО КЛЮЧУ =====
  findPriceByKey(searchKey) {
    if (!searchKey) return null

    console.log("Поиск цены для ключа:", searchKey)

    // Точное совпадение
    if (this.pricesData.has(searchKey)) {
      const price = this.pricesData.get(searchKey)
      console.log("Найдено точное совпадение:", price)
      return price
    }

    // Поиск по частичному совпадению
    const searchWords = searchKey.split(" ").filter((word) => word.length > 2)

    for (const [serviceName, price] of this.pricesData) {
      // Проверяем, содержит ли название услуги ключевые слова
      let matchCount = 0
      for (const word of searchWords) {
        if (serviceName.includes(word)) {
          matchCount++
        }
      }

      // Если найдено достаточно совпадений
      if (matchCount >= Math.min(searchWords.length, 2)) {
        console.log(`Найдено частичное совпадение: "${serviceName}" для "${searchKey}":`, price)
        return price
      }
    }

    // Поиск по вхождению ключа в название
    for (const [serviceName, price] of this.pricesData) {
      if (serviceName.includes(searchKey) || searchKey.includes(serviceName)) {
        console.log(`Найдено вхождение: "${serviceName}" для "${searchKey}":`, price)
        return price
      }
    }

    console.log("Цена не найдена для ключа:", searchKey)
    console.log("Доступные услуги:", Array.from(this.pricesData.keys()).slice(0, 10))
    return null
  }

  // ===== ОБРАБОТКА ОШИБОК ЗАГРУЗКИ =====
  handleLoadError(error) {
    this.retryCount++

    if (this.retryCount <= this.maxRetries) {
      console.log(`Повторная попытка загрузки (${this.retryCount}/${this.maxRetries})`)
      setTimeout(() => {
        this.loadPricesData()
      }, 2000 * this.retryCount)
    } else {
      this.updateLoadingStatus("error")
      this.showError("Не удалось загрузить актуальные цены после " + this.maxRetries + " попыток")
    }
  }

  // ===== ОБНОВЛЕНИЕ СТАТУСА ЗАГРУЗКИ =====
  updateLoadingStatus(status) {
    const statusElement = document.getElementById("dataStatus")
    const lastUpdateElement = document.getElementById("lastUpdate")

    if (!statusElement) {
      console.log("Элемент dataStatus не найден")
      return
    }

    statusElement.className = `status-${status}`

    switch (status) {
      case "loading":
        statusElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Загрузка цен...'
        break
      case "success":
        statusElement.innerHTML = '<i class="fa-solid fa-check-circle"></i> Цены обновлены'
        if (lastUpdateElement && this.lastUpdateTime) {
          lastUpdateElement.textContent = `Обновлено: ${this.lastUpdateTime.toLocaleTimeString("ru-RU")}`
        }
        break
      case "error":
        statusElement.innerHTML = '<i class="fa-solid fa-exclamation-triangle"></i> Ошибка загрузки'
        break
    }
  }

  // ===== ПОКАЗ ОШИБКИ =====
  showError(message) {
    console.error("Ошибка:", message)

    // Показываем ошибку в интерфейсе
    const statusElement = document.getElementById("dataStatus")
    if (statusElement) {
      statusElement.innerHTML = `<i class="fa-solid fa-exclamation-triangle"></i> ${message}`
      statusElement.className = "status-error"
    }
  }

  // ===== ИНИЦИАЛИЗАЦИЯ МОБИЛЬНОГО МЕНЮ =====
  initMobileMenu() {
    try {
      const burger = document.getElementById("burger")
      const mobileNav = document.getElementById("mobileNav")
      const menuOverlay = document.getElementById("menuOverlay")
      const closeMenu = document.getElementById("closeMenu")

      if (!burger || !mobileNav || !menuOverlay || !closeMenu) {
        console.log("Элементы мобильного меню не найдены")
        return
      }

      const openMenu = () => {
        burger.classList.add("active")
        mobileNav.classList.add("open")
        menuOverlay.classList.add("active")
        document.body.style.overflow = "hidden"
      }

      const closeMenuFunc = () => {
        burger.classList.remove("active")
        mobileNav.classList.remove("open")
        menuOverlay.classList.remove("active")
        document.body.style.overflow = ""
      }

      burger.addEventListener("click", openMenu)
      closeMenu.addEventListener("click", closeMenuFunc)
      menuOverlay.addEventListener("click", closeMenuFunc)

      // Закрытие по Escape
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && mobileNav.classList.contains("open")) {
          closeMenuFunc()
        }
      })

      console.log("Мобильное меню инициализировано")
    } catch (error) {
      console.error("Ошибка инициализации мобильного меню:", error)
    }
  }

  // ===== ИНИЦИАЛИЗАЦИЯ ТАБОВ УСЛУГ =====
  initServiceTabs() {
    try {
      const tabs = document.querySelectorAll(".service-tab")
      const contents = document.querySelectorAll(".service-content")

      if (tabs.length === 0) {
        console.log("Табы услуг не найдены")
        return
      }

      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          const targetService = tab.getAttribute("data-service")

          // Убираем активный класс со всех табов и контента
          tabs.forEach((t) => t.classList.remove("active"))
          contents.forEach((c) => c.classList.remove("active"))

          // Добавляем активный класс к выбранному табу и контенту
          tab.classList.add("active")
          const targetContent = document.getElementById(targetService)
          if (targetContent) {
            targetContent.classList.add("active")
          }

          // Плавная прокрутка к контенту
          const servicesSection = document.querySelector(".services-content-section")
          if (servicesSection) {
            servicesSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          }
        })
      })

      console.log("Табы услуг инициализированы:", tabs.length)
    } catch (error) {
      console.error("Ошибка инициализации табов:", error)
    }
  }

  // ===== ИНИЦИАЛИЗАЦИЯ ЭФФЕКТОВ ПРОКРУТКИ =====
  initScrollEffects() {
    try {
      // Sticky header
      const header = document.querySelector(".header")

      if (header) {
        window.addEventListener("scroll", () => {
          const currentScrollY = window.scrollY
          if (currentScrollY > 100) {
            header.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.15)"
          } else {
            header.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)"
          }
        })
      }

      console.log("Эффекты прокрутки инициализированы")
    } catch (error) {
      console.error("Ошибка инициализации эффектов прокрутки:", error)
    }
  }

  // ===== ИНИЦИАЛИЗАЦИЯ КНОПОК ЗАПИСИ =====
  initBookingButtons() {
    try {
      const bookingButtons = document.querySelectorAll(".book-service-btn")

      bookingButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          const serviceName = button.getAttribute("data-service") || "Консультация"
          this.handleBookingClick(serviceName, button)
        })
      })

      console.log("Кнопки записи инициализированы:", bookingButtons.length)
    } catch (error) {
      console.error("Ошибка инициализации кнопок записи:", error)
    }
  }

  // ===== ОБРАБОТКА КЛИКА ПО КНОПКЕ ЗАПИСИ =====
  handleBookingClick(serviceName, button) {
    try {
      // Добавляем эффект нажатия
      button.style.transform = "scale(0.95)"
      setTimeout(() => {
        button.style.transform = ""
      }, 150)

      // Формируем сообщение для WhatsApp
      const message = `Здравствуйте! Хочу записаться на "${serviceName}". Подскажите, пожалуйста, удобное время.`
      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/77054026181?text=${encodedMessage}`

      // Открываем WhatsApp
      window.open(whatsappUrl, "_blank")

      console.log("Открыт WhatsApp для услуги:", serviceName)
    } catch (error) {
      console.error("Ошибка обработки клика по кнопке записи:", error)
    }
  }

  // ===== ПЛАВНАЯ ПРОКРУТКА К ЦЕНАМ =====
  scrollToPrices() {
    try {
      const pricesSection = document.querySelector(".services-nav-section")
      if (pricesSection) {
        pricesSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    } catch (error) {
      console.error("Ошибка прокрутки к ценам:", error)
    }
  }
}

// ===== УТИЛИТЫ ДЛЯ СТРАНИЦЫ ЦЕН =====
class PricesPageUtils {
  static scrollToPrices() {
    try {
      const pricesSection = document.querySelector(".services-nav-section")
      if (pricesSection) {
        pricesSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    } catch (error) {
      console.error("Ошибка прокрутки:", error)
    }
  }
}

// ===== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ =====
document.addEventListener("DOMContentLoaded", () => {
  try {
    console.log("DOM загружен, начинаем инициализацию...")

    // Создаем глобальный экземпляр менеджера цен
    window.pricesManager = new PricesPageManager()

    // Добавляем обработчики для кнопок
    const scrollButton = document.querySelector(".scroll-to-prices-btn")
    if (scrollButton) {
      scrollButton.addEventListener("click", PricesPageUtils.scrollToPrices)
    }

    console.log("Страница цен инициализирована успешно")
  } catch (error) {
    console.error("Критическая ошибка инициализации:", error)
  }
})

// ===== ОБРАБОТКА ОШИБОК JAVASCRIPT =====
window.addEventListener("error", (event) => {
  console.error("JavaScript Error:", {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
  })
})

// ===== ЭКСПОРТ ДЛЯ ГЛОБАЛЬНОГО ИСПОЛЬЗОВАНИЯ =====
window.PricesPageUtils = PricesPageUtils

// ===== ФУНКЦИЯ ДЛЯ РАСКРЫТИЯ ДЕТАЛЕЙ УСЛУГ =====
function toggleServiceDetails(element) {
  try {
    const serviceItem = element.closest(".service-item")
    const isExpanded = serviceItem.classList.contains("expanded")

    // Закрываем все открытые карточки в текущей секции
    const currentSection = serviceItem.closest(".service-content")
    const allItems = currentSection.querySelectorAll(".service-item")

    allItems.forEach((item) => {
      item.classList.remove("expanded")
    })

    // Если карточка не была раскрыта, раскрываем её
    if (!isExpanded) {
      serviceItem.classList.add("expanded")

      // Плавная прокрутка к карточке
      setTimeout(() => {
        serviceItem.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        })
      }, 100)
    }

    console.log("Переключение деталей услуги:", serviceItem.querySelector("h3").textContent)
  } catch (error) {
    console.error("Ошибка переключения деталей услуги:", error)
  }
}

// Добавляем функцию в глобальную область видимости
window.toggleServiceDetails = toggleServiceDetails

// JavaScript for Prices Page Functionality

document.addEventListener("DOMContentLoaded", () => {
  // Service tab switching
  const serviceTabs = document.querySelectorAll(".service-tab")
  const serviceContents = document.querySelectorAll(".service-content")

  serviceTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs and contents
      serviceTabs.forEach((t) => t.classList.remove("active"))
      serviceContents.forEach((c) => c.classList.remove("active"))

      // Add active class to clicked tab
      tab.classList.add("active")

      // Show corresponding content
      const targetService = tab.getAttribute("data-service")
      const targetContent = document.getElementById(targetService)
      if (targetContent) {
        targetContent.classList.add("active")
      }
    })
  })

  // Expand/collapse service details
  window.toggleServiceDetails = (element) => {
    const serviceItem = element.closest(".service-item")
    if (serviceItem) {
      serviceItem.classList.toggle("expanded")
    }
  }

  // Scroll to prices button functionality
  window.PricesPageUtils = {
    scrollToPrices: () => {
      const servicesNavSection = document.querySelector(".services-nav-section")
      if (servicesNavSection) {
        const headerOffset = document.querySelector(".header")?.offsetHeight || 0
        const elementPosition = servicesNavSection.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = elementPosition - headerOffset - 20 // Add some padding

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        })
      }
    },
  }

  // Ripple effect for scroll button
  const scrollToPricesBtn = document.querySelector(".scroll-to-prices-btn")
  if (scrollToPricesBtn) {
    scrollToPricesBtn.addEventListener("click", function (e) {
      const x = e.clientX - e.target.getBoundingClientRect().left
      const y = e.clientY - e.target.getBoundingClientRect().top

      const ripple = document.createElement("span")
      ripple.classList.add("btn-ripple-prices")
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`
      this.appendChild(ripple)

      ripple.addEventListener("animationend", () => {
        ripple.remove()
      })
    })
  }

  // Simulate price loading (replace with actual API call)
  const dataStatus = document.getElementById("dataStatus")
  const lastUpdate = document.getElementById("lastUpdate")
  const currentLanguage_price = "ru-RU" // Declare the variable here

  function updatePriceStatus() {
    if (dataStatus) {
      dataStatus.classList.remove("status-loading")
      dataStatus.classList.add("status-success")
      dataStatus.innerHTML =
        '<i class="fa-solid fa-check-circle"></i> <span data-translate="prices_loaded">Цены загружены</span>'
    }
    if (lastUpdate) {
      const now = new Date()
      const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
      lastUpdate.textContent = `Обновлено: ${now.toLocaleDateString(currentLanguage_price, options)}`
    }
  }

  // Call this function after your actual price data is loaded
  setTimeout(updatePriceStatus, 2000) // Simulate 2-second loading time

  // Update price values based on data-service-key (if you fetch prices dynamically)
  // This part would be integrated with your Google Sheets API fetch
  function updatePrices(pricesData) {
    document.querySelectorAll(".price-value").forEach((priceElement) => {
      const serviceKey = priceElement.getAttribute("data-service-key")
      if (pricesData[serviceKey]) {
        priceElement.textContent = pricesData[serviceKey]
      }
    })
  }

  // Example of how you might call updatePrices with dummy data
  // In a real scenario, you'd fetch this from Google Sheets
  const dummyPrices = {
    "Первичная консультация": "5 000₸",
    "консультация без оплаты": "от 3 000₸",
    "Проф. гигиена (полная, частичная или ортодонтическая)": "20 000 - 30 000₸",
    "Проф.гигиена ортодонтическая": "25 000₸",
    "отбеливание системой Beyond": "80 000₸",
    "Домашнее отбеливание гель": "67 000₸",
    "Осветление white smile": "25 000₸",
    "внутрикоронковое отбеливание": "29 000₸",
    "Курс гигиены и ухода за зубами": "от 8 000₸",
    "реставрация поверхностный кариес": "28 000₸",
    "реставрация средний кариес": "31 000₸",
    "лечение глубокого кариеса": "39 000₸",
    "реставрация фронт.зубов": "45 000₸",
    "Первичное эндо 1 канальный": "96 000₸",
    "Первичное эндо 2 канальный": "109 000₸",
    "Первичное эндо 3 канальный": "122 000₸",
    "Повторное эндо 1 канальный": "110 000₸",
    "Повторное эндо 2 канальный": "121 000₸",
    "Повторное эндо 3 канальный и более": "от 140 000₸",
    "Коронки на импланте": "от 150 000₸",
    "цирконевая коронка на импланте Ankylos": "245 000₸",
    "цирконевая коронка на импланте Neo dent": "155 000₸",
    "цирконевая коронка на импланте Root": "150 000₸",
    "Цирконевая коронка на импланте straumann": "290 000₸",
    "Циркониевая коронка на импланте BioHorizons": "от 175 000₸",
    "циркониевая коронка на импланте Mega Gen": "180 000₸",
    "Снятие слепка с 1 челюсти": "10 000₸",
    "коронка циркониевая": "115 000₸",
    "коронка керамическая ЕМАХ": "115 000₸",
    "винир керамика ЕМАХ": "125 000₸",
    "вкладка керамическая ЕМАХ": "90 000₸",
    "временная коронка прямой метод": "10 000₸",
    "временная пластмассовая коронка cad/cam": "30 000₸",
    "Имплантат shtraumn": "395 000₸",
    "имплантат системы Neo Dent": "170 000₸",
    "Ankylos импланты (германия)": "320 000₸",
    "имплантат Biohorizont": "260 000₸",
    "синус лифтинг": "300 000₸",
    "удаление зуба простое (без анестезии)": "23 000₸",
    "удаление третьих моляров(зуб мудрости )": "34 500₸",
    "Консультация стоматолога- ортодонта": "5 000₸",
    "Диагностика (фотопротокол, изготовление гипсовых моделей, анализ 3д и расчет ТРГ)": "5 000₸",
    "Повторная диагностика пациента с установленной брекет системой": "105 000₸",
    "Самолигирующие брекеты Biomim (на одну челюсть)": "198 000₸",
    "Частичная брекет-система 2 на 4 (на одну челюсть)": "65 000₸",
    "Установка металлических самолигирующих брекетов АО эмпаур 2 США ( на одну челюсть)": "350 000₸",
    "Установка металлических лигатурных брекетов АО Mini master США на одну челюсть": "250 000₸",
    "Установка ретейнера (на одну челюсть)": "20 000₸",
    "Подклейка ретейнера одного зуба": "2 500₸",
    "Новый брекет (замена одного брекета)": "5 000₸",
    "Активация брекет-системы": "15 000₸",
    "Снятие брекет-системы (одна челюсть)": "25 000₸",
  }
  updatePrices(dummyPrices)
})
