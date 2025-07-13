// ===== КОНФИГУРАЦИЯ API =====
const CONFIG = {
  API_KEY: "AIzaSyAPNoe4hXwejLxnUr04bqEeWZRE7VqJYP4",
  SPREADSHEET_ID: "1Ez6HZNuqi81NKBOXdfgQiClwnZy3pDIkiKuID-hnPEQ",
  RANGE: "Медия!A:F", // Предполагаем колонки: A=Название, B=Описание, C=Фото, D=Ссылка на видео, E=Категория, F=Длительность
  CACHE_DURATION: 5 * 60 * 1000, // 5 минут кеширования
}

// ===== КЕШИРОВАНИЕ =====
let videoCache = null
let cacheTimestamp = null
let currentVideoIndex = 0
let filteredVideos = []
let currentFilter = "all"

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

function isCacheValid() {
  return videoCache && cacheTimestamp && Date.now() - cacheTimestamp < CONFIG.CACHE_DURATION
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
    clinic: "О клинике",
    oborudovanie: "Оборудование",
    all: "Все видео",
  }
  return names[category] || category
}

// ===== ЗАГРУЗКА ДАННЫХ =====
async function loadVideosFromSheet() {
  if (isCacheValid()) {
    console.log("Используем кешированные данные")
    return videoCache
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/${CONFIG.RANGE}?key=${CONFIG.API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.values || data.values.length === 0) {
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

    // Кешируем данные
    videoCache = videos
    cacheTimestamp = Date.now()

    console.log(`Загружено ${videos.length} видео из Google Sheets`)
    return videos
  } catch (error) {
    console.error("Ошибка загрузки данных:", error)
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
        <p>Видео не найдены. Проверьте подключение к интернету.</p>
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
  const filteredData = category === "all" ? videoCache : videoCache.filter((video) => video.category === category)

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

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Страница загружена, начинаем загрузку видео...")

  // Инициализируем мобильное меню
  initMobileMenu()

  try {
    const videos = await loadVideosFromSheet()
    renderFilterButtons(videos)
    renderVideoGallery(videos)
  } catch (error) {
    console.error("Ошибка при загрузке видео:", error)

    const gallery = document.getElementById("videoGallery")
    gallery.innerHTML = `
      <div class="error-message">
        <i class="fa-solid fa-exclamation-triangle"></i>
        <p>Ошибка загрузки видео: ${error.message}</p>
        <button onclick="location.reload()">
          Попробовать снова
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
  if (!isCacheValid()) {
    console.log("Кеш устарел, обновляем данные...")
    try {
      const videos = await loadVideosFromSheet()
      renderFilterButtons(videos)
      filterVideos(currentFilter) // Применяем текущий фильтр
    } catch (error) {
      console.error("Ошибка автообновления:", error)
    }
  }
}, CONFIG.CACHE_DURATION)

// ===== УТИЛИТЫ ДЛЯ ОТЛАДКИ =====
window.MediaGalleryDebug = {
  clearCache: () => {
    videoCache = null
    cacheTimestamp = null
    console.log("Кеш очищен")
  },

  reloadVideos: async function () {
    this.clearCache()
    try {
      const videos = await loadVideosFromSheet()
      renderFilterButtons(videos)
      renderVideoGallery(videos)
      console.log("Видео перезагружены")
    } catch (error) {
      console.error("Ошибка перезагрузки:", error)
    }
  },

  showCache: () => {
    console.log("Кешированные данные:", videoCache)
    console.log("Время кеша:", new Date(cacheTimestamp))
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
}
