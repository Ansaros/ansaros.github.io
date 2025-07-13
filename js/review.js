// ===== КОНФИГУРАЦИЯ API =====
const CONFIG = {
  API_KEY: "AIzaSyAPNoe4hXwejLxnUr04bqEeWZRE7VqJYP4",
  SPREADSHEET_ID: "1P7yGMTyyYvt-Efbn2ntxDhNAPB0eUiM2NNgEhIo4aF0",
  RANGE: "Отзывы!A:E", // Предполагаем колонки: A=Название, B=Описание, C=Фото, D=Ссылка на видео, E=Теги
  CACHE_DURATION: 5 * 60 * 1000, // 5 минут кеширования
}

// ===== КЕШИРОВАНИЕ =====
let videoCache = null
let cacheTimestamp = null

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
        tags: row[4] ? row[4].split(",").map((tag) => tag.trim()) : ["Отзыв"],
        featured: index === 1, // Делаем второе видео рекомендуемым
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

  const gridHTML = `
        <div class="gallery-grid-beautiful">
            ${videos
              .map(
                (video, index) => `
                <div class="video-card-beautiful ${video.featured ? "featured" : ""}" 
                     data-video="${video.videoUrl}" 
                     data-title="${video.title}"
                     onclick="openVideoModal('${video.videoUrl}', '${video.title.replace(/'/g, "\\'")}')">
                    
                    
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

// ===== МОДАЛЬНОЕ ОКНО =====
function openVideoModal(videoUrl, title) {
  const modal = document.getElementById("videoModal")
  const modalTitle = document.getElementById("modalTitle")
  const modalIframe = document.getElementById("modalIframe")

  modalTitle.textContent = title
  modalIframe.src = videoUrl
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

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Страница загружена, начинаем загрузку видео...")

  // Инициализируем мобильное меню
  initMobileMenu()

  try {
    const videos = await loadVideosFromSheet()
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

// ===== ОБНОВЛЕНИЕ КЕША =====
// Автоматическое обновление каждые 5 минут
setInterval(async () => {
  if (!isCacheValid()) {
    console.log("Кеш устарел, обновляем данные...")
    try {
      const videos = await loadVideosFromSheet()
      renderVideoGallery(videos)
    } catch (error) {
      console.error("Ошибка автообновления:", error)
    }
  }
}, CONFIG.CACHE_DURATION)

// ===== УТИЛИТЫ ДЛЯ ОТЛАДКИ =====
window.VideoGalleryDebug = {
  clearCache: () => {
    videoCache = null
    cacheTimestamp = null
    console.log("Кеш очищен")
  },

  reloadVideos: async function () {
    this.clearCache()
    try {
      const videos = await loadVideosFromSheet()
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
}
