// ===== КОНФИГУРАЦИЯ API =====
const CONFIG = {
  API_KEY: "AIzaSyAPNoe4hXwejLxnUr04bqEeWZRE7VqJYP4",
  SPREADSHEET_ID: "1P7yGMTyyYvt-Efbn2ntxDhNAPB0eUiM2NNgEhIo4aF0",
  RANGES: {
    ru: "Отзывы!A:E", // Русский лист
    kz: "Отзывы_KZ!A:E", // Казахский лист
    en: "Отзывы_EN!A:E", // Английский лист
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
    hero_title: "Отзывы",
    hero_subtitle: "центр клиники",
    hero_description: "Видеоотзывы наших пациентов.",
    watch_videos: "Смотреть видео",
    loading_videos: "Загружаем видео...",
    video_title: "Видео",
    footer_description: "Стоматология 5 звезд",
    footer_navigation: "Навигация",
    footer_social: "Мы в соцсетях",
    copyright: "© 2025 Nelly dental clinic. Все права защищены.",
    no_videos: "Видео не найдены. Проверьте подключение к интернету.",
    error_loading: "Ошибка загрузки видео:",
    try_again: "Попробовать снова",
    cta_title: "Хотите поделиться своим опытом?",
    cta_description:
      "Запишите видеоотзыв о лечении в нашей клинике и помогите другим пациентам сделать правильный выбор",
    benefit_professional: "Профессиональная съемка",
    benefit_help: "Ваш отзыв поможет другим",
    leave_review: "Оставить отзыв",
    or_call: "Или позвоните:",
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
    hero_title: "Пікірлер",
    hero_subtitle: "клиника орталығы",
    hero_description: "Біздің пациенттердің бейне пікірлері.",
    watch_videos: "Бейне көру",
    loading_videos: "Бейнелерді жүктеп жатырмыз...",
    video_title: "Бейне",
    footer_description: "5 жұлдызды стоматология",
    footer_navigation: "Навигация",
    footer_social: "Біз әлеуметтік желілерде",
    copyright: "© 2025 Nelly dental clinic. Барлық құқықтар қорғалған.",
    no_videos: "Бейнелер табылмады. Интернет байланысын тексеріңіз.",
    error_loading: "Бейнелерді жүктеу қатесі:",
    try_again: "Қайта көру",
    cta_title: "Өз тәжірибеңізбен бөліскіңіз келе ме?",
    cta_description:
      "Біздің клиникадағы емдеу туралы бейне пікір жазыңыз және басқа пациенттерге дұрыс таңдау жасауға көмектесіңіз",
    benefit_professional: "Кәсіби түсірілім",
    benefit_help: "Сіздің пікіріңіз басқаларға көмектеседі",
    leave_review: "Пікір қалдыру",
    or_call: "Немесе қоңырау шалыңыз:",
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
    hero_title: "Reviews",
    hero_subtitle: "clinic center",
    hero_description: "Video reviews from our patients.",
    watch_videos: "Watch videos",
    loading_videos: "Loading videos...",
    video_title: "Video",
    footer_description: "5-star dentistry",
    footer_navigation: "Navigation",
    footer_social: "We are on social networks",
    copyright: "© 2025 Nelly dental clinic. All rights reserved.",
    no_videos: "No videos found. Check your internet connection.",
    error_loading: "Error loading videos:",
    try_again: "Try again",
    cta_title: "Want to share your experience?",
    cta_description:
      "Record a video review about treatment at our clinic and help other patients make the right choice",
    benefit_professional: "Professional filming",
    benefit_help: "Your review will help others",
    leave_review: "Leave a review",
    or_call: "Or call:",
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
    ru: "Отзывы - Nelly dental clinic",
    kz: "Пікірлер - Nelly dental clinic",
    en: "Reviews - Nelly dental clinic",
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

  gallery.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">${translations[currentLanguage].loading_videos}</div>
    </div>
  `

  try {
    // Загружаем видео для нового языка
    const videos = await loadVideosFromSheet(lang)
    renderVideoGallery(videos)
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
        tags: row[4]
          ? row[4].split(",").map((tag) => tag.trim())
          : [translations[currentLanguage].nav_reviews || "Отзыв"],
        featured: index === 1, // Делаем второе видео рекомендуемым
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

  const gridHTML = `
    <div class="gallery-grid-beautiful">
      ${videos
        .map(
          (video, index) => `
            <div class="video-card-beautiful ${video.featured ? "featured" : ""}" 
                 data-video="${video.videoUrl}" 
                 data-title="${video.title}"
                 onclick="openVideoModal('${video.videoUrl}', '${video.title.replace(/'/g, "\\'")}')">
                
                ${video.featured ? '<div class="featured-badge">Рекомендуем</div>' : ""}
                
                <div class="video-thumbnail-beautiful">
                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy" 
                         onerror="this.src='https://via.placeholder.com/400x250?text=Видео'">
                    <div class="video-overlay-beautiful">
                        <div class="play-button-beautiful">
                            <i class="fa-solid fa-play"></i>
                        </div>
                    </div>
                </div>
                
                <div class="video-content-beautiful">
                    <h3>${video.title}</h3>
                    <p>${video.description}</p>
                    <div class="video-tags-beautiful">
                        ${video.tags
                          .map(
                            (tag, tagIndex) =>
                              `<span class="tag-beautiful ${tagIndex === 0 ? "primary" : ""}">${tag}</span>`,
                          )
                          .join("")}
                    </div>
                </div>
            </div>
        `,
        )
        .join("")}
    </div>
  `

  gallery.innerHTML = gridHTML

  // Добавляем анимацию появления карточек
  const cards = gallery.querySelectorAll(".video-card-beautiful")
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`
  })
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
function openVideoModal(videoUrl, title) {
  const modal = document.getElementById("videoModal")
  const modalTitle = document.getElementById("modalTitle")
  const modalIframe = document.getElementById("modalIframe")

  modalTitle.textContent = title

  // Используем безопасную загрузку iframe
  safeLoadIframe(modalIframe, videoUrl)

  modal.classList.add("active")

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

// ===== ОБНОВЛЕНИЕ КЕША =====
// Автоматическое обновление каждые 5 минут
setInterval(async () => {
  if (!isCacheValid(currentLanguage)) {
    console.log(`Кеш устарел для языка ${currentLanguage}, обновляем данные...`)
    try {
      const videos = await loadVideosFromSheet(currentLanguage)
      renderVideoGallery(videos)
    } catch (error) {
      console.error("Ошибка автообновления:", error)
    }
  }
}, CONFIG.CACHE_DURATION)

// ===== УТИЛИТЫ ДЛЯ ОТЛАДКИ =====
window.VideoGalleryDebug = {
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

  switchLanguage: (lang) => {
    switchLanguage(lang)
  },

  getCurrentLanguage: () => {
    return currentLanguage
  },
}
