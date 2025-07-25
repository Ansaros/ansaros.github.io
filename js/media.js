// ===== КОНФИГУРАЦИЯ API =====
const CONFIG = {
  API_KEY: "AIzaSyAPNoe4hXwejLxnUr04bqEeWZRE7VqJYP4",
  SPREADSHEET_ID: "1Ez6HZNuqi81NKBOXdfgQiClwnZy3pDIkiKuID-hnPEQ",
  RANGES: {
    ru: "Media!A:F", // Русский лист
    kz: "Media_KZ!A:F", // Казахский лист
    en: "Media_EN!A:F", // Английский лист
  },
  CACHE_DURATION: 5 * 60 * 1000, // 5 минут кеширования
}

// ===== ПЕРЕВОДЫ =====
const translations = {
  ru: {
    address: "Улы Дала, 35, Город Астана",
    schedule: "Пн-Пт 10:00-19:00  Сб, Вс 10:00-16:00",
    nav_home: "ГЛАВНАЯ",
    nav_prices: "ЦЕНЫ",
    nav_cases: "КЕЙСЫ",
    nav_doctors: "ВРАЧИ",
    nav_contacts: "КОНТАКТЫ",
    nav_reviews: "ОТЗЫВЫ",
    nav_media: "МЕДИА",
    hero_title: "МЕДИА",
    hero_subtitle: "центр клиники",
    hero_description: "Процедуры лечения и жизнь клиники.",
    watch_videos: "Смотреть видео",
    categories_title: "Категории видео",
    categories_subtitle: "Выберите интересующую вас тему",
    loading_categories: "Загружаем категории...",
    loading_videos: "Загружаем видео...",
    video_title: "Видео",
    prev_video: "Предыдущее",
    next_video: "Следующее",
    footer_description: "Стоматология 5 звезд",
    footer_navigation: "Навигация",
    footer_social: "Мы в соцсетях",
    copyright: "© 2025 Nelly dental clinic. Все права защищены.",
    all_videos: "Все видео",
    about_clinic: "О клинике",
    equipment: "Оборудование",
    no_videos: "Видео не найдены. Проверьте подключение к интернету.",
    error_loading: "Ошибка загрузки видео:",
    try_again: "Попробовать снова",
  },
  kz: {
    address: "Ұлы Дала, 35, Астана қаласы",
    schedule: "Дс-Жм 10:00-19:00  Сб, Жс 10:00-16:00",
    nav_home: "БАСТЫ БЕТ",
    nav_prices: "БАҒАЛАР",
    nav_cases: "ЖҰМЫСТАР",
    nav_doctors: "ДӘРІГЕРЛЕР",
    nav_contacts: "БАЙЛАНЫС",
    nav_reviews: "ПІКІРЛЕР",
    nav_media: "МЕДИА",
    hero_title: "МЕДИА",
    hero_subtitle: "клиника орталығы",
    hero_description: "Емдеу процедуралары және клиника өмірі.",
    watch_videos: "Бейне көру",
    categories_title: "Бейне санаттары",
    categories_subtitle: "Сізді қызықтыратын тақырыпты таңдаңыз",
    loading_categories: "Санаттарды жүктеп жатырмыз...",
    loading_videos: "Бейнелерді жүктеп жатырмыз...",
    video_title: "Бейне",
    prev_video: "Алдыңғы",
    next_video: "Келесі",
    footer_description: "5 жұлдызды стоматология",
    footer_navigation: "Навигация",
    footer_social: "Біз әлеуметтік желілерде",
    copyright: "© 2025 Nelly dental clinic. Барлық құқықтар қорғалған.",
    all_videos: "Барлық бейне",
    about_clinic: "Клиника туралы",
    equipment: "Жабдықтар",
    no_videos: "Бейнелер табылмады. Интернет байланысын тексеріңіз.",
    error_loading: "Бейнелерді жүктеу қатесі:",
    try_again: "Қайта көру",
  },
  en: {
    address: "Uly Dala, 35, Astana City",
    schedule: "Mon-Fri 10:00-19:00  Sat, Sun 10:00-16:00",
    nav_home: "HOME",
    nav_prices: "PRICES",
    nav_cases: "CASES",
    nav_doctors: "DOCTORS",
    nav_contacts: "CONTACTS",
    nav_reviews: "REVIEWS",
    nav_media: "MEDIA",
    hero_title: "MEDIA",
    hero_subtitle: "clinic center",
    hero_description: "Treatment procedures and clinic life.",
    watch_videos: "Watch videos",
    categories_title: "Video categories",
    categories_subtitle: "Choose a topic that interests you",
    loading_categories: "Loading categories...",
    loading_videos: "Loading videos...",
    video_title: "Video",
    prev_video: "Previous",
    next_video: "Next",
    footer_description: "5-star dentistry",
    footer_navigation: "Navigation",
    footer_social: "We are on social networks",
    copyright: "© 2025 Nelly dental clinic. All rights reserved.",
    all_videos: "All videos",
    about_clinic: "About clinic",
    equipment: "Equipment",
    no_videos: "No videos found. Check your internet connection.",
    error_loading: "Error loading videos:",
    try_again: "Try again",
  },
}

// ===== КЕШИРОВАНИЕ =====
let videoCache = {
  ru: null,
  kz: null,
  en: null,
}
let cacheTimestamp = {
  ru: null,
  kz: null,
  en: null,
}
let currentVideoIndex = 0
let filteredVideos = []
let currentFilter = "all"
let currentLanguage = localStorage.getItem("language") || "ru"

// ===== УТИЛИТЫ =====
function formatGoogleDriveUrl(url) {
  if (!url) return ""

  // Извлекаем ID файла из различных форматов Google Drive URL
  const patterns = [/\/file\/d\/([a-zA-Z0-9-_]+)/, /id=([a-zA-Z0-9-_]+)/, /\/d\/([a-zA-Z0-9-_]+)/]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return `https://drive.google.com/file/d/${match[1]}/preview`
    }
  }

  return url
}

function formatGoogleDriveImageUrl(url) {
  if (!url) return ""

  // Извлекаем ID файла из различных форматов Google Drive URL
  const patterns = [/\/file\/d\/([a-zA-Z0-9-_]+)/, /id=([a-zA-Z0-9-_]+)/, /\/d\/([a-zA-Z0-9-_]+)/]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`
    }
  }

  // Если это уже thumbnail URL или обычный URL, возвращаем как есть
  return url
}

function isCacheValid(lang = currentLanguage) {
  return videoCache[lang] && cacheTimestamp[lang] && Date.now() - cacheTimestamp[lang] < CONFIG.CACHE_DURATION
}

function getCategoryIcon(category) {
  const icons = {
    clinic: "fa-solid fa-building",
    oborudovanie: "fa-solid fa-cogs",
    all: "fa-solid fa-grid-2",
  }
  return icons[category] || "fa-solid fa-play"
}

function getCategoryName(category) {
  const names = {
    clinic: translations[currentLanguage].about_clinic,
    oborudovanie: translations[currentLanguage].equipment,
    all: translations[currentLanguage].all_videos,
  }
  return names[category] || category
}

// ===== СИСТЕМА ПЕРЕВОДОВ =====
function translatePage() {
  const elements = document.querySelectorAll("[data-translate]")
  elements.forEach((element) => {
    const key = element.getAttribute("data-translate")
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
      element.textContent = translations[currentLanguage][key]
    }
  })

  // Обновляем заголовок страницы
  const titles = {
    ru: "Медиа - Nelly dental clinic",
    kz: "Медиа - Nelly dental clinic",
    en: "Media - Nelly dental clinic",
  }
  document.title = titles[currentLanguage] || titles.ru

  // Обновляем атрибут lang
  document.documentElement.lang = currentLanguage
}

async function switchLanguage(lang) {
  const previousLanguage = currentLanguage
  currentLanguage = lang
  localStorage.setItem("language", lang)

  // Force remove active class from ALL language buttons first
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.classList.remove("active")
  })
  
  // Small delay to ensure DOM updates, then add active class
  setTimeout(() => {
    document.querySelectorAll(`[data-lang="${lang}"]`).forEach((btn) => {
      btn.classList.add("active")
    })
  }, 10)

  translatePage()

  // Показываем индикатор загрузки
  const gallery = document.getElementById("videoGallery")
  const filterButtons = document.getElementById("filterButtons")

  gallery.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">${translations[currentLanguage].loading_videos}</div>
    </div>
  `

  filterButtons.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">${translations[currentLanguage].loading_categories}</div>
    </div>
  `

  try {
    // Загружаем видео для нового языка
    const videos = await loadVideosFromSheet(lang)
    renderFilterButtons(videos)
    renderVideoGallery(videos)
    currentFilter = "all" // Сбрасываем фильтр
  } catch (error) {
    console.error(`Ошибка при переключении на язык ${lang}:`, error)

    // Возвращаемся к предыдущему языку при ошибке
    currentLanguage = previousLanguage
    localStorage.setItem("language", previousLanguage)

  // Restore active buttons with proper cleanup
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.classList.remove("active")
  })
  setTimeout(() => {
    document.querySelectorAll(`[data-lang="${previousLanguage}"]`).forEach((btn) => {
      btn.classList.add("active")
    })
  }, 10)

    gallery.innerHTML = `
      <div class="error-message">
        <i class="fa-solid fa-exclamation-triangle"></i>
        <p>${translations[currentLanguage].error_loading} ${error.message}</p>
        <button onclick="location.reload()">
          ${translations[currentLanguage].try_again}
        </button>
      </div>
    `
  }
}
// Force refresh language buttons state
function refreshLanguageButtons() {
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.classList.remove("active")
  })
  document.querySelectorAll(`[data-lang="${currentLanguage}"]`).forEach((btn) => {
    btn.classList.add("active")
  })
}
// ===== ЗАГРУЗКА ДАННЫХ =====
async function loadVideosFromSheet(lang = currentLanguage) {
  if (isCacheValid(lang)) {
    console.log(`Используем кешированные данные для языка: ${lang}`)
    return videoCache[lang]
  }

  try {
    const range = CONFIG.RANGES[lang] || CONFIG.RANGES.ru
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/${range}?key=${CONFIG.API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      // Если лист для языка не найден, используем русский как fallback
      if (lang !== "ru") {
        console.warn(`Лист для языка ${lang} не найден, используем русский`)
        return await loadVideosFromSheet("ru")
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.values || data.values.length === 0) {
      // Если данных нет, используем русский как fallback
      if (lang !== "ru") {
        console.warn(`Нет данных для языка ${lang}, используем русский`)
        return await loadVideosFromSheet("ru")
      }
      throw new Error("Нет данных в таблице")
    }

    // Пропускаем заголовок (первую строку)
    const rows = data.values.slice(1)

    const videos = rows
      .map((row, index) => ({
        id: index + 1,
        title: row[0] || "Без названия",
        description: row[1] || "Описание отсутствует",
        thumbnail: formatGoogleDriveImageUrl(row[2]) || "https://via.placeholder.com/400x250?text=Видео",
        videoUrl: formatGoogleDriveUrl(row[3] || ""),
        category: row[4] || "clinic",
        duration: row[5] || "0:00",
        tags: [getCategoryName(row[4] || "clinic")],
      }))
      .filter((video) => video.videoUrl) // Фильтруем видео без ссылок

    // Кешируем данные для конкретного языка
    videoCache[lang] = videos
    cacheTimestamp[lang] = Date.now()

    console.log(`Загружено ${videos.length} видео из Google Sheets для языка: ${lang}`)
    return videos
  } catch (error) {
    console.error(`Ошибка загрузки данных для языка ${lang}:`, error)

    // Если это не русский язык, пробуем загрузить русский как fallback
    if (lang !== "ru") {
      console.warn(`Используем русский язык как fallback для ${lang}`)
      return await loadVideosFromSheet("ru")
    }

    throw error
  }
}

// ===== ОТОБРАЖЕНИЕ ФИЛЬТРОВ =====
function renderFilterButtons(videos) {
  const filterContainer = document.getElementById("filterButtons")

  // Получаем уникальные категории
  const categories = ["all", ...new Set(videos.map((video) => video.category))]

  const buttonsHTML = categories
    .map(
      (category) => `
    <button class="media-filter-btn ${category === "all" ? "active" : ""}" 
            data-filter="${category}"
            onclick="filterVideos('${category}')">
      <i class="${getCategoryIcon(category)}"></i>
      <span>${getCategoryName(category)}</span>
    </button>
  `,
    )
    .join("")

  filterContainer.innerHTML = buttonsHTML
}

// ===== ОТОБРАЖЕНИЕ ВИДЕО =====
function renderVideoGallery(videos) {
  const gallery = document.getElementById("videoGallery")

  if (!videos || videos.length === 0) {
    gallery.innerHTML = `
      <div class="error-message">
        <i class="fa-solid fa-exclamation-triangle"></i>
        <p>${translations[currentLanguage].no_videos}</p>
      </div>
    `
    return
  }

  const gridHTML = videos
    .map(
      (video, index) => `
        <div class="video-card-beautiful" 
             data-category="${video.category}"
             data-video="${video.videoUrl}" 
             data-title="${video.title}"
             data-index="${index}"
             onclick="openVideoModal(${index})">
          
          <div class="video-thumbnail-beautiful">
            <img src="${video.thumbnail}" alt="${video.title}" loading="lazy" 
                 onerror="this.src='https://via.placeholder.com/400x250?text=Видео'">
            <div class="video-overlay-beautiful">
              <div class="play-button-beautiful">
                <i class="fa-solid fa-play"></i>
              </div>
              <div class="video-info-overlay">
                <span class="video-category">${getCategoryName(video.category)}</span>
                <span class="video-duration">${video.duration}</span>
              </div>
            </div>
            <div class="video-quality-badge">HD</div>
          </div>
          
          <div class="video-content-beautiful">
            <h3>${video.title}</h3>
            <p>${video.description}</p>
            <div class="video-tags-beautiful">
              ${video.tags
                .map((tag, tagIndex) => `<span class="tag-beautiful ${tagIndex === 0 ? "primary" : ""}">${tag}</span>`)
                .join("")}
            </div>
          </div>
        </div>
      `,
    )
    .join("")

  gallery.innerHTML = `<div class="gallery-grid-beautiful">${gridHTML}</div>`

  // Добавляем анимацию появления карточек
  const cards = gallery.querySelectorAll(".video-card-beautiful")
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`
  })

  // Сохраняем отфильтрованные видео для навигации в модальном окне
  filteredVideos = videos
}

// ===== ФИЛЬТРАЦИЯ ВИДЕО =====
function filterVideos(category) {
  currentFilter = category

  // Обновляем активную кнопку
  document.querySelectorAll(".media-filter-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  document.querySelector(`[data-filter="${category}"]`).classList.add("active")

  // Фильтруем видео
  const filteredData =
    category === "all"
      ? videoCache[currentLanguage]
      : videoCache[currentLanguage].filter((video) => video.category === category)

  renderVideoGallery(filteredData)
}

// ===== БЕЗОПАСНАЯ ЗАГРУЗКА IFRAME =====
function safeLoadIframe(iframe, url) {
  try {
    // Очищаем предыдущий src
    iframe.src = ""

    // Небольшая задержка перед загрузкой нового URL
    setTimeout(() => {
      iframe.src = url
    }, 100)
  } catch (error) {
    console.warn("Ошибка загрузки iframe:", error)
    iframe.src = url // Fallback к обычной загрузке
  }
}

// ===== МОДАЛЬНОЕ ОКНО =====
function openVideoModal(index) {
  currentVideoIndex = index
  const video = filteredVideos[index]

  const modal = document.getElementById("videoModal")
  const modalTitle = document.getElementById("modalTitle")
  const modalIframe = document.getElementById("modalIframe")

  modalTitle.textContent = video.title

  // Используем безопасную загрузку iframe
  safeLoadIframe(modalIframe, video.videoUrl)

  modal.classList.add("active")

  // Обновляем кнопки навигации
  updateModalNavigation()

  // Блокируем скролл страницы
  document.body.style.overflow = "hidden"
}

function closeModal() {
  const modal = document.getElementById("videoModal")
  const modalIframe = document.getElementById("modalIframe")

  modal.classList.remove("active")
  modalIframe.src = ""

  // Восстанавливаем скролл страницы
  document.body.style.overflow = ""
}

function updateModalNavigation() {
  const prevBtn = document.getElementById("prevVideo")
  const nextBtn = document.getElementById("nextVideo")

  prevBtn.disabled = currentVideoIndex === 0
  nextBtn.disabled = currentVideoIndex === filteredVideos.length - 1
}

function navigateVideo(direction) {
  if (direction === "prev" && currentVideoIndex > 0) {
    currentVideoIndex--
  } else if (direction === "next" && currentVideoIndex < filteredVideos.length - 1) {
    currentVideoIndex++
  }

  const video = filteredVideos[currentVideoIndex]
  const modalTitle = document.getElementById("modalTitle")
  const modalIframe = document.getElementById("modalIframe")

  modalTitle.textContent = video.title

  // Используем безопасную загрузку iframe
  safeLoadIframe(modalIframe, video.videoUrl)

  updateModalNavigation()
}

// ===== НАВИГАЦИЯ =====
function scrollToVideos() {
  const gallery = document.querySelector(".video-gallery-beautiful")
  if (gallery) {
    gallery.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }
}

// ===== МОБИЛЬНОЕ МЕНЮ =====
function initMobileMenu() {
  const burger = document.getElementById("burger")
  const mobileNav = document.getElementById("mobileNav")
  const menuOverlay = document.getElementById("menuOverlay")
  const closeMenu = document.getElementById("closeMenu")

  if (burger && mobileNav && menuOverlay && closeMenu) {
    // Открытие меню
    burger.addEventListener("click", () => {
      burger.classList.add("active")
      mobileNav.classList.add("open")
      menuOverlay.classList.add("active")
      document.body.style.overflow = "hidden"
    })

    // Закрытие меню
    function closeMobileMenu() {
      burger.classList.remove("active")
      mobileNav.classList.remove("open")
      menuOverlay.classList.remove("active")
      document.body.style.overflow = ""
    }

    closeMenu.addEventListener("click", closeMobileMenu)
    menuOverlay.addEventListener("click", closeMobileMenu)

    // Закрытие при клике на ссылку
    const mobileLinks = mobileNav.querySelectorAll("a")
    mobileLinks.forEach((link) => {
      link.addEventListener("click", closeMobileMenu)
    })
  }
}

// ===== ИНИЦИАЛИЗАЦИЯ ЯЗЫКОВЫХ ПЕРЕКЛЮЧАТЕЛЕЙ =====
function initLanguageSwitchers() {
  // Десктопные кнопки языка
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang")
      switchLanguage(lang)
    })
  })

  // Мобильные кнопки языка
  document.querySelectorAll(".mobile-lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang")
      switchLanguage(lang)
    })
  })

// Clear all active states first, then set current language
document.querySelectorAll("[data-lang]").forEach((btn) => {
  btn.classList.remove("active")
})
document.querySelectorAll(`[data-lang="${currentLanguage}"]`).forEach((btn) => {
  btn.classList.add("active")
})
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Страница загружена, начинаем загрузку видео...")

  // Инициализируем переводы
  translatePage()

  // Инициализируем языковые переключатели
  initLanguageSwitchers()
  refreshLanguageButtons() // Add this line
  // Инициализируем мобильное меню
  initMobileMenu()

  try {
    const videos = await loadVideosFromSheet(currentLanguage)
    renderFilterButtons(videos)
    renderVideoGallery(videos)
  } catch (error) {
    console.error("Ошибка при загрузке видео:", error)

    const gallery = document.getElementById("videoGallery")
    gallery.innerHTML = `
      <div class="error-message">
        <i class="fa-solid fa-exclamation-triangle"></i>
        <p>${translations[currentLanguage].error_loading} ${error.message}</p>
        <button onclick="location.reload()">
          ${translations[currentLanguage].try_again}
        </button>
      </div>
    `
  }
})

// Закрытие модального окна по Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal()
  }
})

// Навигация в модальном окне
document.addEventListener("DOMContentLoaded", () => {
  const prevBtn = document.getElementById("prevVideo")
  const nextBtn = document.getElementById("nextVideo")

  if (prevBtn) prevBtn.addEventListener("click", () => navigateVideo("prev"))
  if (nextBtn) nextBtn.addEventListener("click", () => navigateVideo("next"))
})

// ===== ОБНОВЛЕНИЕ КЕША =====
// Автоматическое обновление каждые 5 минут
setInterval(async () => {
  if (!isCacheValid(currentLanguage)) {
    console.log(`Кеш устарел для языка ${currentLanguage}, обновляем данные...`)
    try {
      const videos = await loadVideosFromSheet(currentLanguage)
      renderFilterButtons(videos)
      filterVideos(currentFilter) // Применяем текущий фильтр
    } catch (error) {
      console.error("Ошибка автообновления:", error)
    }
  }
}, CONFIG.CACHE_DURATION)

// ===== УТИЛИТЫ ДЛЯ ОТЛАДКИ =====
window.MediaGalleryDebug = {
  clearCache: (lang = null) => {
    if (lang) {
      videoCache[lang] = null
      cacheTimestamp[lang] = null
      console.log(`Кеш очищен для языка: ${lang}`)
    } else {
      videoCache = { ru: null, kz: null, en: null }
      cacheTimestamp = { ru: null, kz: null, en: null }
      console.log("Весь кеш очищен")
    }
  },

  reloadVideos: async function (lang = currentLanguage) {
    this.clearCache(lang)
    try {
      const videos = await loadVideosFromSheet(lang)
      renderFilterButtons(videos)
      renderVideoGallery(videos)
      console.log(`Видео перезагружены для языка: ${lang}`)
    } catch (error) {
      console.error("Ошибка перезагрузки:", error)
    }
  },

  showCache: (lang = null) => {
    if (lang) {
      console.log(`Кешированные данные для ${lang}:`, videoCache[lang])
      console.log(`Время кеша для ${lang}:`, new Date(cacheTimestamp[lang]))
    } else {
      console.log("Все кешированные данные:", videoCache)
      console.log("Время кеша:", cacheTimestamp)
    }
  },

  loadAllLanguages: async () => {
    const languages = ["ru", "kz", "en"]
    for (const lang of languages) {
      try {
        console.log(`Загружаем данные для языка: ${lang}`)
        await loadVideosFromSheet(lang)
      } catch (error) {
        console.error(`Ошибка загрузки для ${lang}:`, error)
      }
    }
    console.log("Загрузка всех языков завершена")
  },

  testImageUrl: (url) => {
    const formatted = formatGoogleDriveImageUrl(url)
    console.log("Исходный URL:", url)
    console.log("Форматированный URL:", formatted)
    return formatted
  },

  testVideoUrl: (url) => {
    const formatted = formatGoogleDriveUrl(url)
    console.log("Исходный URL:", url)
    console.log("Форматированный URL:", formatted)
    return formatted
  },

  filterVideos: (category) => {
    filterVideos(category)
  },

  switchLanguage: (lang) => {
    switchLanguage(lang)
  },

  getCurrentLanguage: () => {
    return currentLanguage
  },
}
