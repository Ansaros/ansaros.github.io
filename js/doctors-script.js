// ===== КОНФИГУРАЦИЯ GOOGLE SHEETS ДЛЯ ВРАЧЕЙ =====
const DOCTORS_GOOGLE_SHEETS_CONFIG = {
  API_KEY: "AIzaSyAPNoe4hXwejLxnUr04bqEeWZRE7VqJYP4",
  SPREADSHEET_ID: "1TuQfnrDrBySjOJWSeksdL8WbrCNfytIypw-u-eRaJzs",
  CACHE_DURATION: 5 * 60 * 1000, // 5 минут кеширования
}

// ===== УТИЛИТЫ ДЛЯ КОНВЕРТАЦИИ GOOGLE DRIVE ССЫЛОК =====
class GoogleDriveConverter {
  static extractFileId(url) {
    if (!url || typeof url !== "string") return null

    const patterns = [/\/file\/d\/([a-zA-Z0-9-_]+)/, /id=([a-zA-Z0-9-_]+)/, /\/d\/([a-zA-Z0-9-_]+)/]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }
    return null
  }

  static createThumbnailUrl(fileId, size = "w1000") {
    if (!fileId) return null
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`
  }

  static createDirectUrl(fileId) {
    if (!fileId) return null
    return `https://drive.google.com/uc?export=view&id=${fileId}`
  }

  static isGoogleDriveUrl(url) {
    if (!url || typeof url !== "string") return false
    return url.includes("drive.google.com") && (url.includes("/file/d/") || url.includes("id=") || url.includes("/d/"))
  }

  static convertToThumbnail(url, size = "w1000") {
    if (!this.isGoogleDriveUrl(url)) {
      return url
    }

    const fileId = this.extractFileId(url)
    if (!fileId) {
      console.warn("Не удалось извлечь ID из ссылки Google Drive:", url)
      return url
    }

    const thumbnailUrl = this.createThumbnailUrl(fileId, size)
    console.log(`Конвертирована ссылка: ${url} -> ${thumbnailUrl}`)
    return thumbnailUrl
  }

  static convertUrlsArray(urls, size = "w1000") {
    if (!Array.isArray(urls)) return urls
    return urls.map((url) => this.convertToThumbnail(url, size))
  }
}

// ===== ОСНОВНОЙ КЛАСС ДЛЯ УПРАВЛЕНИЯ СТРАНИЦЕЙ ВРАЧЕЙ =====
class DoctorsPageManager {
  constructor() {
    this.doctorsData = []
    this.specializations = new Set()
    this.lastUpdateTime = null
    this.isLoading = false
    this.retryCount = 0
    this.maxRetries = 3
    this.currentFilter = "all"
    this.imageSize = "w1500"
    this.translations = window.translations_doctors || {}
    this.currentLanguage = window.currentLanguage_doctors || "ru"

    this.init()
  }

  async init() {
    try {
      console.log("Инициализация страницы врачей...")

      this.initMobileMenu()
      this.initFilters()
      this.initModal()

      await this.loadDoctorsData()

      console.log("Инициализация страницы врачей завершена успешно")
    } catch (error) {
      console.error("Ошибка инициализации страницы врачей:", error)
      this.showError(this.translations[this.currentLanguage].error_loading_text + ": " + error.message)
    }
  }

  async reloadDoctorsDataForLanguage(newLang) {
    this.currentLanguage = newLang
    this.translations = window.translations_doctors
    console.log(`Перезагрузка данных врачей для языка: ${newLang}`)
    await this.loadDoctorsData()
    this.renderDoctors()
    this.updateFilters()
    this.updateStats()
  }

  // ===== ЗАГРУЗКА ДАННЫХ ИЗ GOOGLE SHEETS =====
  async loadDoctorsData() {
    if (this.isLoading) return

    this.isLoading = true
    this.updateLoadingStatus("loading")

    try {
      const sheetName = this.getDoctorsSheetName(this.currentLanguage)
      const range = `${sheetName}!A:N`
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${DOCTORS_GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID}/values/${range}?key=${DOCTORS_GOOGLE_SHEETS_CONFIG.API_KEY}`

      console.log("Загрузка данных врачей из URL:", url)

      const response = await fetch(url)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Ошибка HTTP:", response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Получены данные врачей:", data)

      if (data.values && data.values.length > 0) {
        this.processDoctorsData(data.values)
        this.lastUpdateTime = new Date()
        this.retryCount = 0
        this.updateLoadingStatus("success")
        this.renderDoctors()
        this.updateFilters()
        this.updateStats()
      } else {
        throw new Error("Нет данных о врачах в таблице")
      }
    } catch (error) {
      console.error("Ошибка загрузки данных врачей:", error)
      this.handleLoadError(error)
    } finally {
      this.isLoading = false
    }
  }

  getDoctorsSheetName(lang) {
    switch (lang) {
      case "kz":
        return "Врачи_kz"
      case "en":
        return "Врачи_en"
      case "ru":
      default:
        return "Врачи"
    }
  }

  // ===== ОБРАБОТКА ДАННЫХ ИЗ GOOGLE SHEETS =====
  processDoctorsData(values) {
    this.doctorsData = []
    this.specializations.clear()

    console.log("Обработка данных врачей, всего строк:", values.length)

    for (let i = 1; i < values.length; i++) {
      const row = values[i]

      if (row && row.some((cell) => cell && cell.toString().trim())) {
        const doctor = this.createDoctorObject(row, i + 1)
        if (doctor && doctor.name) {
          this.doctorsData.push(doctor)
          if (doctor.specialization) {
            this.specializations.add(doctor.specialization.toLowerCase())
          }
          console.log(`Добавлен врач: ${doctor.name}`)
        }
      }
    }

    console.log("Загружено врачей:", this.doctorsData.length)
    console.log("Специализации:", Array.from(this.specializations))
  }

  // ===== СОЗДАНИЕ ОБЪЕКТА ВРАЧА =====
  createDoctorObject(row, rowNumber) {
    const name = this.cleanText(row[0])

    if (!name) {
      return null
    }

    const originalPhotoUrl = this.cleanText(row[3]) || "img/placeholder.svg"
    const convertedPhotoUrl = GoogleDriveConverter.convertToThumbnail(originalPhotoUrl, this.imageSize)

    const originalCertificates = this.extractUrls(row.slice(5, 12))
    const originalBeforeAfterPhotos = this.extractUrls(row.slice(12, 16))

    const convertedCertificates = GoogleDriveConverter.convertUrlsArray(originalCertificates, this.imageSize)
    const convertedBeforeAfterPhotos = GoogleDriveConverter.convertUrlsArray(originalBeforeAfterPhotos, this.imageSize)

    // Парсим опыт работы для получения числового значения
    const experienceText = this.cleanText(row[1]) || ""
    const experienceYears = this.parseExperienceYears(experienceText)

    return {
      id: `doctor_${rowNumber}`,
      name: name,
      experience: experienceText,
      experienceYears: experienceYears, // Добавляем числовое значение опыта
      specialization: this.cleanText(row[2]) || this.translations[this.currentLanguage].specialization_default,
      photoUrl: convertedPhotoUrl,
      originalPhotoUrl: originalPhotoUrl,
      description: this.cleanText(row[4]) || "",
      certificates: convertedCertificates,
      originalCertificates: originalCertificates,
      beforeAfterPhotos: convertedBeforeAfterPhotos,
      originalBeforeAfterPhotos: originalBeforeAfterPhotos,
      slug: this.generateSlug(name),
    }
  }

  // ===== ПАРСИНГ ОПЫТА РАБОТЫ =====
  parseExperienceYears(experienceText) {
    if (!experienceText) return 0

    // Ищем числа в тексте опыта
    const matches = experienceText.match(/\d+/g)
    if (matches && matches.length > 0) {
      // Берем первое найденное число как количество лет опыта
      return Number.parseInt(matches[0])
    }

    return 0
  }

  // ===== ОЧИСТКА ТЕКСТА =====
  cleanText(text) {
    if (!text) return ""
    return text.toString().trim()
  }

  // ===== ИЗВЛЕЧЕНИЕ URL-ов =====
  extractUrls(cells) {
    return cells
      .filter((cell) => cell && cell.toString().trim())
      .map((cell) => cell.toString().trim())
      .filter((url) => url.startsWith("http"))
  }

  // ===== ГЕНЕРАЦИЯ SLUG =====
  generateSlug(name) {
    if (!name) return "doctor"
    return name
      .toString()
      .toLowerCase()
      .replace(/[^a-zа-я0-9\s]/gi, "")
      .replace(/\s+/g, "-")
      .substring(0, 20)
  }

  // ===== ОТОБРАЖЕНИЕ ВРАЧЕЙ =====
  renderDoctors() {
    const doctorsList = document.getElementById("doctorsList")
    if (!doctorsList) return

    if (this.doctorsData.length === 0) {
      doctorsList.innerHTML = `
        <div class="no-doctors">
          <div class="no-doctors-icon">
            <i class="fa-solid fa-user-doctor"></i>
          </div>
          <h3>${this.translations[this.currentLanguage].no_doctors_title}</h3>
          <p>${this.translations[this.currentLanguage].no_doctors_text}</p>
        </div>
      `
      return
    }

    const filteredDoctors = this.filterDoctors()

    doctorsList.innerHTML = filteredDoctors.map((doctor) => this.createDoctorCard(doctor)).join("")

    this.initDoctorCards()
  }

  // ===== ФИЛЬТРАЦИЯ ВРАЧЕЙ =====
  filterDoctors() {
    if (this.currentFilter === "all") {
      return this.doctorsData
    }

    return this.doctorsData.filter((doctor) => doctor.specialization.toLowerCase().includes(this.currentFilter))
  }

  // ===== СОЗДАНИЕ КАРТОЧКИ ВРАЧА =====
  createDoctorCard(doctor) {
    const isMainDoctor = doctor.name.toLowerCase().includes("нелли") || doctor.name.toLowerCase().includes("курмаева")

    return `
      <div class="doctor-card-beautiful ${isMainDoctor ? "featured" : ""}" data-specialization="${doctor.specialization.toLowerCase()}" data-doctor-id="${doctor.id}">
        <div class="doctor-image-beautiful">
          <img src="${doctor.photoUrl}" alt="${doctor.name}" loading="lazy" onerror="this.src='../img/placeholder.svg'" data-original-url="${doctor.originalPhotoUrl || ""}">
          <div class="doctor-overlay-beautiful">
            <div class="overlay-content-doctors">
              <button class="view-doctor-btn" data-doctor-id="${doctor.id}">
                <i class="fa-solid fa-info-circle"></i>
                <span>${this.translations[this.currentLanguage].card_view_details}</span>
              </button>
              <button class="book-doctor-btn" data-doctor-name="${doctor.name}">
                <i class="fa-solid fa-calendar-plus"></i>
                <span>${this.translations[this.currentLanguage].card_book_appointment}</span>
              </button>
            </div>
          </div>
          ${doctor.experience ? `<div class="experience-badge">${doctor.experience} ${this.translations[this.currentLanguage].card_experience_label}</div>` : ""}
          ${isMainDoctor ? `<div class="doctor-badge">${this.translations[this.currentLanguage].card_featured_doctor}</div>` : ""}
        </div>
        
        <div class="doctor-content-beautiful">
          <div class="doctor-header-beautiful">
            <h3>${doctor.name}</h3>
            </div>
          </div>
          
          <p class="doctor-position-beautiful">${doctor.specialization}</p>
          
          <div class="doctor-specialties">
            <span class="specialty-tag primary">${this.getMainSpecialty(doctor.specialization)}</span>
            ${this.getAdditionalSpecialties(doctor.specialization)
              .map((spec) => `<span class="specialty-tag">${spec}</span>`)
              .join("")}
          </div>
          
          <p class="doctor-description-beautiful">
            ${doctor.description || this.translations[this.currentLanguage].card_default_description}
          </p>
          
          <div class="doctor-stats-beautiful">
            ${
              doctor.experience
                ? `
              <div class="stat-item">
                <i class="fa-solid fa-calendar-check"></i>
                <span>${doctor.experience} ${this.translations[this.currentLanguage].card_stat_experience}</span>
              </div>
            `
                : ""
            }
            <div class="stat-item">
              <i class="fa-solid fa-users"></i>
              <span>${this.translations[this.currentLanguage].card_stat_satisfied_patients}</span>
            </div>
          </div>
          
          <div class="doctor-actions-beautiful">
            <button class="secondary-btn-doctors view-details-btn" data-doctor-id="${doctor.id}">
              <i class="fa-solid fa-info-circle"></i>
              <span>${this.translations[this.currentLanguage].card_view_details}</span>
            </button>
            <button class="primary-btn-doctors" data-doctor-name="${doctor.name}">
              <i class="fa-solid fa-calendar-plus"></i>
              <span>${this.translations[this.currentLanguage].card_book_appointment}</span>
            </button>
          </div>
        </div>
      </div>
    `
  }

  // ===== ПОЛУЧЕНИЕ ОСНОВНОЙ СПЕЦИАЛИЗАЦИИ =====
  getMainSpecialty(specialization) {
    if (!specialization) return this.translations[this.currentLanguage].specialization_default

    const spec = specialization.toLowerCase()
    if (spec.includes("терапевт")) return this.translations[this.currentLanguage].specialization_therapists.slice(0, -1)
    if (spec.includes("ортодонт"))
      return this.translations[this.currentLanguage].specialization_orthodontists.slice(0, -1)
    if (spec.includes("эндодонт"))
      return this.translations[this.currentLanguage].specialization_endodontists.slice(0, -2)
    if (spec.includes("хирург")) return this.translations[this.currentLanguage].specialization_surgeons.slice(0, -1)
    if (spec.includes("ортопед"))
      return this.translations[this.currentLanguage].specialization_orthopedists.slice(0, -1)

    return specialization.split(" ")[0] || this.translations[this.currentLanguage].specialization_default
  }

  // ===== ПОЛУЧЕНИЕ ДОПОЛНИТЕЛЬНЫХ СПЕЦИАЛИЗАЦИЙ =====
  getAdditionalSpecialties(specialization) {
    const additional = []
    if (!specialization) return additional

    const spec = specialization.toLowerCase()
    if (spec.includes("эстетик") || spec.includes("реставрац"))
      additional.push(this.translations[this.currentLanguage].specialization_aesthetic || "Эстетика")
    if (spec.includes("эндодонт") || spec.includes("канал"))
      additional.push(this.translations[this.currentLanguage].specialization_endodontists.slice(0, -2) || "Эндодонтия")
    if (spec.includes("микроскоп"))
      additional.push(this.translations[this.currentLanguage].specialization_microscope || "Микроскоп")
    if (spec.includes("брекет") || spec.includes("элайнер"))
      additional.push(this.translations[this.currentLanguage].specialization_braces || "Брекеты")
    if (spec.includes("диагност"))
      additional.push(this.translations[this.currentLanguage].specialization_diagnostics || "Диагностика")
    if (spec.includes("профилакт"))
      additional.push(this.translations[this.currentLanguage].specialization_prevention || "Профилактика")

    return additional.slice(0, 2)
  }

  // ===== ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКОВ КАРТОЧЕК =====
  initDoctorCards() {
    document.querySelectorAll(".book-doctor-btn, .primary-btn-doctors").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation()
        const doctorName = btn.getAttribute("data-doctor-name")
        if (doctorName) {
          this.handleBookingClick(doctorName)
        }
      })
    })

    document.querySelectorAll(".view-doctor-btn, .view-details-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation()
        const doctorId = btn.getAttribute("data-doctor-id")
        if (doctorId) {
          this.showDoctorDetails(doctorId)
        }
      })
    })
  }

  // ===== ПОКАЗ ДЕТАЛЬНОЙ ИНФОРМАЦИИ О ВРАЧЕ =====
  showDoctorDetails(doctorId) {
    const doctor = this.doctorsData.find((d) => d.id === doctorId)
    if (!doctor) return

    document.getElementById("modalDoctorPhoto").src = doctor.photoUrl
    document.getElementById("modalDoctorPhoto").alt = doctor.name
    document.getElementById("modalDoctorName").textContent = doctor.name
    document.getElementById("modalDoctorSpecialization").textContent = doctor.specialization
    document.getElementById("modalDoctorExperience").textContent = doctor.experience
      ? `${this.translations[this.currentLanguage].modal_experience_label} ${doctor.experience}`
      : ""
    document.getElementById("modalDoctorDescription").textContent =
      doctor.description || this.translations[this.currentLanguage].card_default_description

    const modalBookBtn = document.getElementById("modalBookBtn")
    modalBookBtn.onclick = () => this.handleBookingClick(doctor.name)

    this.renderCertificates(doctor.certificates)
    this.renderBeforeAfterPhotos(doctor.beforeAfterPhotos)

    document.getElementById("doctorModalOverlay").classList.add("active")
    document.body.style.overflow = "hidden"
  }

  // ===== ОТОБРАЖЕНИЕ СЕРТИФИКАТОВ =====
  renderCertificates(certificates) {
    const certificatesGrid = document.getElementById("certificatesGrid")
    const certificatesSection = document.getElementById("certificatesSection")

    if (!certificates || certificates.length === 0) {
      certificatesSection.style.display = "none"
      return
    }

    certificatesSection.style.display = "block"
    certificatesGrid.innerHTML = certificates
      .map(
        (cert, index) => `
      <div class="certificate-item" onclick="window.doctorsManager.showImageViewer('${cert}', '${this.translations[this.currentLanguage].modal_certificate_label} ${index + 1}')">
        <img src="${cert}" alt="${this.translations[this.currentLanguage].modal_certificate_label} ${index + 1}" loading="lazy" onerror="this.parentElement.style.display='none'">
        <div class="certificate-overlay">
          ${this.translations[this.currentLanguage].modal_certificate_label} ${index + 1}
        </div>
      </div>
    `,
      )
      .join("")
  }

  // ===== ОТОБРАЖЕНИЕ ФОТО ДО И ПОСЛЕ =====
  renderBeforeAfterPhotos(photos) {
    const beforeAfterGrid = document.getElementById("beforeAfterGrid")
    const beforeAfterSection = document.getElementById("beforeAfterSection")

    if (!photos || photos.length === 0) {
      beforeAfterSection.style.display = "none"
      return
    }

    beforeAfterSection.style.display = "block"
    beforeAfterGrid.innerHTML = photos
      .map(
        (photo, index) => `
      <div class="before-after-item" onclick="window.doctorsManager.showImageViewer('${photo}', '${this.translations[this.currentLanguage].modal_work_label} ${index + 1}')">
        <img src="${photo}" alt="${this.translations[this.currentLanguage].modal_work_label} ${index + 1}" loading="lazy" onerror="this.parentElement.style.display='none'">
        <div class="before-after-overlay">
          ${this.translations[this.currentLanguage].modal_work_label} ${index + 1}
        </div>
      </div>
    `,
      )
      .join("")
  }

  // ===== ПОКАЗ ПРОСМОТРЩИКА ИЗОБРАЖЕНИЙ =====
  showImageViewer(imageUrl, caption) {
    document.getElementById("imageViewerImg").src = imageUrl
    document.getElementById("imageViewerCaption").textContent = caption
    document.getElementById("imageViewerOverlay").classList.add("active")
  }

  // ===== ИНИЦИАЛИЗАЦИЯ МОДАЛЬНОГО ОКНА =====
  initModal() {
    document.getElementById("modalClose").addEventListener("click", () => {
      this.closeDoctorModal()
    })

    document.getElementById("doctorModalOverlay").addEventListener("click", (e) => {
      if (e.target === document.getElementById("doctorModalOverlay")) {
        this.closeDoctorModal()
      }
    })

    document.getElementById("imageViewerClose").addEventListener("click", () => {
      this.closeImageViewer()
    })

    document.getElementById("imageViewerOverlay").addEventListener("click", (e) => {
      if (e.target === document.getElementById("imageViewerOverlay")) {
        this.closeImageViewer()
      }
    })

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (document.getElementById("imageViewerOverlay").classList.contains("active")) {
          this.closeImageViewer()
        } else if (document.getElementById("doctorModalOverlay").classList.contains("active")) {
          this.closeDoctorModal()
        }
      }
    })
  }

  // ===== ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА ВРАЧА =====
  closeDoctorModal() {
    document.getElementById("doctorModalOverlay").classList.remove("active")
    document.body.style.overflow = ""
  }

  // ===== ЗАКРЫТИЕ ПРОСМОТРЩИКА ИЗОБРАЖЕНИЙ =====
  closeImageViewer() {
    document.getElementById("imageViewerOverlay").classList.remove("active")
  }

  // ===== ОБРАБОТКА ЗАПИСИ К ВРАЧУ =====
  handleBookingClick(doctorName) {
    try {
      const message = `${this.translations[this.currentLanguage].modal_whatsapp_message_prefix} ${doctorName}. ${this.translations[this.currentLanguage].modal_whatsapp_message_suffix}`
      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/77054026181?text=${encodedMessage}`

      window.open(whatsappUrl, "_blank")
      console.log("Открыт WhatsApp для записи к врачу:", doctorName)
    } catch (error) {
      console.error("Ошибка при открытии WhatsApp:", error)
    }
  }

  // ===== ОБНОВЛЕНИЕ ФИЛЬТРОВ =====
  updateFilters() {
    const filtersContainer = document.getElementById("doctorsFilterButtons")
    if (!filtersContainer) return

    const specializations = Array.from(this.specializations)
    const allDoctorsCount = this.doctorsData.length

    let filterButtonsHtml = `
      <button class="doctors-filter-btn ${this.currentFilter === "all" ? "active" : ""}" data-filter="all">
        <i class="fa-solid fa-users"></i>
        <span>${this.translations[this.currentLanguage].filter_all_doctors}</span>
        <div class="filter-count">${allDoctorsCount}</div>
      </button>
    `

    specializations.forEach((spec) => {
      const count = this.doctorsData.filter((doctor) => doctor.specialization.toLowerCase().includes(spec)).length

      const icon = this.getSpecializationIcon(spec)
      const name = this.getSpecializationName(spec)

      filterButtonsHtml += `
        <button class="doctors-filter-btn ${this.currentFilter === spec ? "active" : ""}" data-filter="${spec}">
          <i class="fa-solid fa-${icon}"></i>
          <span>${name}</span>
          <div class="filter-count">${count}</div>
        </button>
      `
    })

    filtersContainer.innerHTML = filterButtonsHtml
  }

  // ===== ПОЛУЧЕНИЕ ИКОНКИ СПЕЦИАЛИЗАЦИИ =====
  getSpecializationIcon(spec) {
    if (spec.includes("терапевт")) return "tooth"
    if (spec.includes("ортодонт")) return "grip-lines"
    if (spec.includes("эндодонт")) return "microscope"
    if (spec.includes("хирург")) return "scalpel"
    if (spec.includes("ортопед")) return "crown"
    return "user-doctor"
  }

  // ===== ПОЛУЧЕНИЕ НАЗВАНИЯ СПЕЦИАЛИЗАЦИИ =====
  getSpecializationName(spec) {
    if (spec.includes("терапевт")) return this.translations[this.currentLanguage].specialization_therapists
    if (spec.includes("ортодонт")) return this.translations[this.currentLanguage].specialization_orthodontists
    if (spec.includes("эндодонт")) return this.translations[this.currentLanguage].specialization_endodontists
    if (spec.includes("хирург")) return this.translations[this.currentLanguage].specialization_surgeons
    if (spec.includes("ортопед")) return this.translations[this.currentLanguage].specialization_orthopedists
    return spec.charAt(0).toUpperCase() + spec.slice(1)
  }

  // ===== ИНИЦИАЛИЗАЦИЯ ФИЛЬТРОВ =====
  initFilters() {
    document.addEventListener("click", (e) => {
      if (e.target.closest(".doctors-filter-btn")) {
        const btn = e.target.closest(".doctors-filter-btn")
        const filter = btn.getAttribute("data-filter")

        document.querySelectorAll(".doctors-filter-btn").forEach((b) => b.classList.remove("active"))
        btn.classList.add("active")

        this.currentFilter = filter
        this.renderDoctors()
      }
    })
  }

  // ===== ОБНОВЛЕНИЕ СТАТИСТИКИ =====
  updateStats() {
    this.animateStatsCounter()
    this.updateExperienceRange()
  }

  // ===== АНИМАЦИЯ СЧЕТЧИКОВ СТАТИСТИКИ =====
  animateStatsCounter() {
    const doctorsCount = this.doctorsData.length
    const maxExperience = this.getMaxExperience()

    // Анимация количества врачей
    this.animateCounter("doctorsCount", doctorsCount, "+")

    // Анимация максимального опыта
    this.animateCounter("experienceYears", maxExperience, "")

    // Процент довольных пациентов остается статичным (98%)
    const satisfiedElement = document.getElementById("satisfiedPatients")
    if (satisfiedElement) {
      satisfiedElement.textContent = "98%"
    }
  }

  // ===== АНИМАЦИЯ ОТДЕЛЬНОГО СЧЕТЧИКА =====
  animateCounter(elementId, targetValue, suffix = "") {
    const element = document.getElementById(elementId)
    if (!element || targetValue === 0) return

    const startValue = 0
    const duration = 2000 // 2 секунды
    const startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Используем easing функцию для плавной анимации
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart)

      element.textContent = currentValue + suffix

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        element.textContent = targetValue + suffix
      }
    }

    requestAnimationFrame(animate)
  }

  // ===== ПОЛУЧЕНИЕ МАКСИМАЛЬНОГО ОПЫТА =====
  getMaxExperience() {
    if (this.doctorsData.length === 0) return 0

    const experiences = this.doctorsData.map((doctor) => doctor.experienceYears || 0).filter((years) => years > 0)

    return experiences.length > 0 ? Math.max(...experiences) : 0
  }

  // ===== ПОЛУЧЕНИЕ ДИАПАЗОНА ОПЫТА =====
  getExperienceRange() {
    if (this.doctorsData.length === 0) return { min: 0, max: 0 }

    const experiences = this.doctorsData.map((doctor) => doctor.experienceYears || 0).filter((years) => years > 0)

    if (experiences.length === 0) return { min: 0, max: 0 }

    return {
      min: Math.min(...experiences),
      max: Math.max(...experiences),
    }
  }

  // ===== ОБНОВЛЕНИЕ ДИАПАЗОНА ОПЫТА В FEATURES =====
  updateExperienceRange() {
    const experienceRangeElement = document.getElementById("experienceRange")
    if (!experienceRangeElement) return

    const range = this.getExperienceRange()

    if (range.min === 0 && range.max === 0) {
      return // Оставляем текст по умолчанию
    }

    // Обновляем текст в зависимости от языка
    const currentLang = this.currentLanguage
    let rangeText = ""

    if (range.min === range.max) {
      // Если у всех врачей одинаковый опыт
      switch (currentLang) {
        case "en":
          rangeText = `${range.max} years of experience`
          break
        case "kz":
          rangeText = `${range.max} жылдық тәжірибе`
          break
        case "ru":
        default:
          rangeText = `${range.max} лет опыта`
          break
      }
    } else {
      // Если опыт разный
      switch (currentLang) {
        case "en":
          rangeText = `${range.min} to ${range.max} years of experience`
          break
        case "kz":
          rangeText = `${range.min}-тен ${range.max} жылға дейінгі тәжірибе`
          break
        case "ru":
        default:
          rangeText = `Стаж от ${range.min} до ${range.max} лет`
          break
      }
    }

    experienceRangeElement.textContent = rangeText
  }

  // ===== ИЗМЕНЕНИЕ РАЗМЕРА ИЗОБРАЖЕНИЙ =====
  changeImageSize(newSize) {
    this.imageSize = newSize
    console.log(`Изменен размер изображений на: ${newSize}`)

    this.doctorsData.forEach((doctor) => {
      if (doctor.originalPhotoUrl) {
        doctor.photoUrl = GoogleDriveConverter.convertToThumbnail(doctor.originalPhotoUrl, newSize)
      }

      if (doctor.originalCertificates) {
        doctor.certificates = GoogleDriveConverter.convertUrlsArray(doctor.originalCertificates, newSize)
      }

      if (doctor.originalBeforeAfterPhotos) {
        doctor.beforeAfterPhotos = GoogleDriveConverter.convertUrlsArray(doctor.originalBeforeAfterPhotos, newSize)
      }
    })

    this.renderDoctors()
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

  // ===== ОБНОВЛЕНИЕ СТАТУСА ЗАГРУЗКИ =====
  updateLoadingStatus(status) {
    const statusElement = document.getElementById("doctorsDataStatus")
    const lastUpdateElement = document.getElementById("doctorsLastUpdate")

    if (!statusElement) return

    statusElement.className = `status-${status}`

    switch (status) {
      case "loading":
        statusElement.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${this.translations[this.currentLanguage].status_loading}`
        break
      case "success":
        statusElement.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${this.translations[this.currentLanguage].status_updated}`
        if (lastUpdateElement && this.lastUpdateTime) {
          lastUpdateElement.textContent = `${this.translations[this.currentLanguage].last_update_label} ${this.lastUpdateTime.toLocaleTimeString(this.currentLanguage)}`
        }
        break
      case "error":
        statusElement.innerHTML = `<i class="fa-solid fa-exclamation-triangle"></i> ${this.translations[this.currentLanguage].status_error}`
        break
    }
  }

  // ===== ОБРАБОТКА ОШИБОК ЗАГРУЗКИ =====
  handleLoadError(error) {
    this.retryCount++

    if (this.retryCount <= this.maxRetries) {
      console.log(`Повторная попытка загрузки данных врачей (${this.retryCount}/${this.maxRetries})`)
      setTimeout(() => {
        this.loadDoctorsData()
      }, 2000 * this.retryCount)
    } else {
      this.updateLoadingStatus("error")
      this.showError(
        `${this.translations[this.currentLanguage].error_loading_text} ${this.maxRetries} ${this.translations[this.currentLanguage].retry_button.toLowerCase().includes("попыток") ? "попыток" : "attempts"}`,
      )
    }
  }

  // ===== ПОКАЗ ОШИБКИ =====
  showError(message) {
    console.error("Ошибка:", message)

    const doctorsList = document.getElementById("doctorsList")
    if (doctorsList) {
      doctorsList.innerHTML = `
        <div class="error-doctors">
          <div class="error-icon">
            <i class="fa-solid fa-exclamation-triangle"></i>
          </div>
          <h3>${this.translations[this.currentLanguage].error_loading_title}</h3>
          <p>${message}</p>
          <button onclick="window.location.reload()" class="retry-btn">
            <i class="fa-solid fa-refresh"></i>
            ${this.translations[this.currentLanguage].retry_button}
          </button>
        </div>
      `
    }
  }
}

// ===== УТИЛИТЫ ДЛЯ СТРАНИЦЫ ВРАЧЕЙ =====
class DoctorsPageUtils {
  static scrollToDoctors() {
    try {
      const doctorsSection = document.querySelector(".doctors-filter-section")
      if (doctorsSection) {
        doctorsSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    } catch (error) {
      console.error("Ошибка прокрутки:", error)
    }
  }

  static convertGoogleDriveLink(url, size = "w1000") {
    return GoogleDriveConverter.convertToThumbnail(url, size)
  }

  static changeImageSize(size) {
    if (window.doctorsManager) {
      window.doctorsManager.changeImageSize(size)
    }
  }
}

// ===== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ =====
document.addEventListener("DOMContentLoaded", () => {
  try {
    console.log("DOM загружен, начинаем инициализацию страницы врачей...")

    // Создаем глобальный экземпляр менеджера врачей
    // Ensure translations and currentLanguage are available before creating manager
    if (window.translations_doctors && window.currentLanguage_doctors) {
      window.doctorsManager = new DoctorsPageManager()
    } else {
      console.error("Translations or current language not available for DoctorsPageManager.")
    }

    // Делаем GoogleDriveConverter доступным глобально
    window.GoogleDriveConverter = GoogleDriveConverter

    console.log("Страница врачей инициализирована успешно")
  } catch (error) {
    console.error("Критическая ошибка инициализации страницы врачей:", error)
  }
})

// ===== ЭКСПОРТ ДЛЯ ГЛОБАЛЬНОГО ИСПОЛЬЗОВАНИЯ =====
window.DoctorsPageUtils = DoctorsPageUtils

// ===== ПЕРЕВОДЫ ДЛЯ СТРАНИЦЫ ВРАЧЕЙ =====
const translations_doctors = {
  ru: {
    // Общие элементы
    doctors_page_title: "Врачи - Nelly dental clinic",
    address: "Улы Дала, 35, Город Астана",
    schedule: "Пн-Пт 10:00-19:00  Сб, Вс 10:00-16:00",

    // Навигация
    nav_home: "ГЛАВНАЯ",
    nav_prices: "ЦЕНЫ",
    nav_cases: "КЕЙСЫ",
    nav_doctors: "ВРАЧИ",
    nav_contacts: "КОНТАКТЫ",
    nav_reviews: "ОТЗЫВЫ",
    nav_media: "МЕДИА",

    // Герой секция
    hero_title_part1: "НАШИ",
    hero_title_part2: "ВРАЧИ",
    hero_title_accent: "профессионалы своего дела",
    hero_subtitle:
      "Команда опытных специалистов с многолетним стажем, которые используют современные технологии и индивидуальный подход к каждому пациенту.",
    stat_specialists: "Специалистов",
    stat_years_experience: "Лет опыта",
    stat_satisfied_patients: "Довольных пациентов",
    scroll_to_doctors_btn: "Познакомиться с врачами",
    team_showcase_title: "Наша команда",
    team_showcase_subtitle: "Профессионалы с многолетним опытом",
    feature_experienced_doctors_title: "Опытные врачи",
    feature_experienced_doctors_desc: "Стаж от 3 до 14 лет",
    feature_continuous_learning_title: "Постоянное обучение",
    feature_continuous_learning_desc: "Повышение квалификации",
    feature_recommended_title: "Рекомендуют",
    feature_recommended_desc: "98% пациентов",

    // Статус загрузки данных
    status_loading: "Загрузка информации о врачах...",
    status_updated: "Информация о врачах обновлена",
    status_error: "Ошибка загрузки информации о врачах",
    last_update_label: "Обновлено:",

    // Фильтры
    filter_header_title: "Наши специалисты",
    filter_header_subtitle: "Выберите специализацию для поиска нужного врача",
    filter_all_doctors: "Все врачи",
    filter_count_label: "Врачей", // This is for the count inside the button, not used directly as data-translate
    specialization_therapists: "Терапевты",
    specialization_orthodontists: "Ортодонты",
    specialization_endodontists: "Эндодонтисты",
    specialization_surgeons: "Хирурги",
    specialization_orthopedists: "Ортопеды",
    specialization_default: "Стоматолог", // For default specialty tag

    // Сетка врачей
    loading_doctors_text: "Загружаем информацию о врачах...",
    no_doctors_title: "Врачи не найдены",
    no_doctors_text: "В данный момент информация о врачах недоступна",
    error_loading_title: "Ошибка загрузки",
    error_loading_text: "Не удалось загрузить информацию о врачах после",
    retry_button: "Попробовать снова",

    // Карточки врачей
    card_view_details: "Подробнее",
    card_book_appointment: "Записаться",
    card_featured_doctor: "Главный врач",
    card_experience_label: "стажа",
    card_default_description: "Опытный специалист с индивидуальным подходом к каждому пациенту.",
    card_stat_experience: "стажа",
    card_stat_satisfied_patients: "Довольные пациенты",

    // Модальное окно врача
    modal_book_appointment_btn: "Записаться на прием",
    modal_about_doctor: "О враче",
    modal_certificates_title: "Сертификаты и дипломы",
    modal_works_title: "Работы врача",
    modal_experience_label: "Стаж:",
    modal_certificate_label: "Сертификат",
    modal_work_label: "Работа врача",
    modal_empty_section: "Нет данных",
    modal_whatsapp_message_prefix: "Здравствуйте! Хочу записаться на прием к врачу",
    modal_whatsapp_message_suffix: "Подскажите, пожалуйста, удобное время.",

    // Футер
    footer_description: "Стоматология 5 звезд",
    footer_navigation: "Навигация",
    footer_social: "Мы в соцсетях",
    copyright: "© 2025 Nelly dental clinic. Все права защищены.",
  },

  kz: {
    // Общие элементы
    doctors_page_title: "Дәрігерлер - Nelly dental clinic",
    address: "Ұлы Дала, 35, Астана қаласы",
    schedule: "Дс-Жм 10:00-19:00  Сб, Жс 10:00-16:00",

    // Навигация
    nav_home: "БАСТЫ БЕТ",
    nav_prices: "БАҒАЛАР",
    nav_cases: "ЖҰМЫСТАР",
    nav_doctors: "ДӘРІГЕРЛЕР",
    nav_contacts: "БАЙЛАНЫС",
    nav_reviews: "ПІКІРЛЕР",
    nav_media: "МЕДИА",

    // Герой секция
    hero_title_part1: "БІЗДІҢ",
    hero_title_part2: "ДӘРІГЕРЛЕР",
    hero_title_accent: "өз ісінің кәсіпқойлары",
    hero_subtitle:
      "Көпжылдық тәжірибесі бар білікті мамандар командасы, олар заманауи технологияларды және әр пациентке жеке көзқарасты қолданады.",
    stat_specialists: "Мамандар",
    stat_years_experience: "Жылдық тәжірибе",
    stat_satisfied_patients: "Қанағаттанған пациенттер",
    scroll_to_doctors_btn: "Дәрігерлермен танысу",
    team_showcase_title: "Біздің команда",
    team_showcase_subtitle: "Көпжылдық тәжірибесі бар кәсіпқойлар",
    feature_experienced_doctors_title: "Тәжірибелі дәрігерлер",
    feature_experienced_doctors_desc: "3-тен 14 жылға дейінгі тәжірибе",
    feature_continuous_learning_title: "Үздіксіз оқыту",
    feature_continuous_learning_desc: "Біліктілікті арттыру",
    feature_recommended_title: "Ұсынады",
    feature_recommended_desc: "98% пациенттер",

    // Статус загрузки данных
    status_loading: "Дәрігерлер туралы ақпарат жүктелуде...",
    status_updated: "Дәрігерлер туралы ақпарат жаңартылды",
    status_error: "Дәрігерлер туралы ақпаратты жүктеу қатесі",
    last_update_label: "Жаңартылды:",

    // Фильтры
    filter_header_title: "Біздің мамандар",
    filter_header_subtitle: "Қажетті дәрігерді табу үшін мамандықты таңдаңыз",
    filter_all_doctors: "Барлық дәрігерлер",
    filter_count_label: "Дәрігерлер",
    specialization_therapists: "Терапевттер",
    specialization_orthodontists: "Ортодонттар",
    specialization_endodontists: "Эндодонтисттер",
    specialization_surgeons: "Хирургтар",
    specialization_orthopedists: "Ортопедтер",
    specialization_default: "Стоматолог",

    // Сетка врачей
    loading_doctors_text: "Дәрігерлер туралы ақпарат жүктелуде...",
    no_doctors_title: "Дәрігерлер табылмады",
    no_doctors_text: "Қазіргі уақытта дәрігерлер туралы ақпарат қолжетімді емес",
    error_loading_title: "Жүктеу қатесі",
    error_loading_text: "Дәрігерлер туралы ақпаратты жүктеу мүмкін болмады",
    retry_button: "Қайталау",

    // Карточки врачей
    card_view_details: "Толығырақ",
    card_book_appointment: "Жазылу",
    card_featured_doctor: "Бас дәрігер",
    card_experience_label: "тәжірибе",
    card_default_description: "Әр пациентке жеке көзқараспен тәжірибелі маман.",
    card_stat_experience: "тәжірибе",
    card_stat_satisfied_patients: "Қанағаттанған пациенттер",

    // Модальное окно врача
    modal_book_appointment_btn: "Қабылдауға жазылу",
    modal_about_doctor: "Дәрігер туралы",
    modal_certificates_title: "Сертификаттар мен дипломдар",
    modal_works_title: "Дәрігер жұмыстары",
    modal_experience_label: "Тәжірибе:",
    modal_certificate_label: "Сертификат",
    modal_work_label: "Дәрігер жұмысы",
    modal_empty_section: "Деректер жоқ",
    modal_whatsapp_message_prefix: "Сәлеметсіз бе! Дәрігер",
    modal_whatsapp_message_suffix: "қабылдауына жазылғым келеді. Ыңғайлы уақытты айтыңызшы.",

    // Футер
    footer_description: "5 жұлдызды стоматология",
    footer_navigation: "Навигация",
    footer_social: "Біз әлеуметтік желілерде",
    copyright: "© 2025 Nelly dental clinic. Барлық құқықтар қорғалған.",
  },

  en: {
    // Общие элементы
    doctors_page_title: "Doctors - Nelly dental clinic",
    address: "Uly Dala, 35, Astana City",
    schedule: "Mon-Fri 10:00-19:00  Sat, Sun 10:00-16:00",

    // Навигация
    nav_home: "HOME",
    nav_prices: "PRICES",
    nav_cases: "CASES",
    nav_doctors: "DOCTORS",
    nav_contacts: "CONTACTS",
    nav_reviews: "REVIEWS",
    nav_media: "MEDIA",

    // Hero Section
    hero_title_part1: "OUR",
    hero_title_part2: "DOCTORS",
    hero_title_accent: "true professionals",
    hero_subtitle:
      "A team of experienced specialists with many years of experience, who use modern technologies and an individual approach to each patient.",
    stat_specialists: "Specialists",
    stat_years_experience: "Years of Experience",
    stat_satisfied_patients: "Satisfied Patients",
    scroll_to_doctors_btn: "Meet the Doctors",
    team_showcase_title: "Our Team",
    team_showcase_subtitle: "Professionals with many years of experience",
    feature_experienced_doctors_title: "Experienced Doctors",
    feature_experienced_doctors_desc: "3 to 14 years of experience",
    feature_continuous_learning_title: "Continuous Learning",
    feature_continuous_learning_desc: "Advanced training",
    feature_recommended_title: "Recommended",
    feature_recommended_desc: "98% of patients",

    // Data Loading Status
    status_loading: "Loading doctors information...",
    status_updated: "Doctors information updated",
    status_error: "Error loading doctors information",
    last_update_label: "Updated:",

    // Filters
    filter_header_title: "Our Specialists",
    filter_header_subtitle: "Select a specialization to find the right doctor",
    filter_all_doctors: "All Doctors",
    filter_count_label: "Doctors",
    specialization_therapists: "Therapists",
    specialization_orthodontists: "Orthodontists",
    specialization_endodontists: "Endodontists",
    specialization_surgeons: "Surgeons",
    specialization_orthopedists: "Orthopedists",
    specialization_default: "Dentist",

    // Doctors Grid
    loading_doctors_text: "Loading doctors information...",
    no_doctors_title: "No Doctors Found",
    no_doctors_text: "Currently, information about doctors is unavailable",
    error_loading_title: "Loading Error",
    error_loading_text: "Failed to load doctors information after",
    retry_button: "Try Again",

    // Doctor Cards
    card_view_details: "View Details",
    card_book_appointment: "Book Appointment",
    card_featured_doctor: "Chief Doctor",
    card_experience_label: "experience",
    card_default_description: "An experienced specialist with an individual approach to each patient.",
    card_stat_experience: "years of experience",
    card_stat_satisfied_patients: "Satisfied patients",

    // Doctor Modal
    modal_book_appointment_btn: "Book an Appointment",
    modal_about_doctor: "About the Doctor",
    modal_certificates_title: "Certificates and Diplomas",
    modal_works_title: "Doctor's Works",
    modal_experience_label: "Experience:",
    modal_certificate_label: "Certificate",
    modal_work_label: "Doctor's Work",
    modal_empty_section: "No data",
    modal_whatsapp_message_prefix: "Hello! I would like to book an appointment with Dr.",
    modal_whatsapp_message_suffix: "Could you please suggest a convenient time?",

    // Footer
    footer_description: "5-star dentistry",
    footer_navigation: "Navigation",
    footer_social: "Find us on social media",
    copyright: "© 2025 Nelly dental clinic. All rights reserved.",
  },
}

// ===== ТЕКУЩИЙ ЯЗЫК =====
let currentLanguage_doctors = localStorage.getItem("language_doctors") || "ru"

// ===== СИСТЕМА ПЕРЕВОДОВ =====
function translateDoctorsPage() {
  const elements = document.querySelectorAll("[data-translate]")
  elements.forEach((element) => {
    const key = element.getAttribute("data-translate")
    if (translations_doctors[currentLanguage_doctors] && translations_doctors[currentLanguage_doctors][key]) {
      // For elements with HTML content, use innerHTML
      if (key.includes("hero_subtitle") || key.includes("card_default_description")) {
        element.innerHTML = translations_doctors[currentLanguage_doctors][key]
      } else {
        element.textContent = translations_doctors[currentLanguage_doctors][key]
      }
    }
  })

  // Update page title
  document.title =
    translations_doctors[currentLanguage_doctors].doctors_page_title || translations_doctors.ru.doctors_page_title

  // Update lang attribute
  document.documentElement.lang = currentLanguage_doctors

  // Trigger re-render of doctors if DoctorsPageManager is available
  if (window.doctorsManager) {
    window.doctorsManager.reloadDoctorsDataForLanguage(currentLanguage_doctors)
  }
}

function switchLanguage_doctors(lang) {
  currentLanguage_doctors = lang
  localStorage.setItem("language_doctors", lang)

  // Update active language buttons
  document.querySelectorAll(".lang-btn, .mobile-lang-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  document.querySelectorAll(`[data-lang="${lang}"]`).forEach((btn) => {
    btn.classList.add("active")
  })

  translateDoctorsPage()
}

// ===== ИНИЦИАЛИЗАЦИЯ ЯЗЫКОВЫХ ПЕРЕКЛЮЧАТЕЛЕЙ =====
function initLanguageSwitchers_doctors() {
  // Desktop language buttons
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang")
      switchLanguage_doctors(lang)
    })
  })

  // Mobile language buttons
  document.querySelectorAll(".mobile-lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang")
      switchLanguage_doctors(lang)
    })
  })

  // Set active language on load
  document.querySelectorAll(`[data-lang="${currentLanguage_doctors}"]`).forEach((btn) => {
    btn.classList.add("active")
  })
}

// Make currentLanguage_doctors and translations_doctors globally accessible
window.currentLanguage_doctors = currentLanguage_doctors
window.translations_doctors = translations_doctors

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener("DOMContentLoaded", () => {
  // Initialize translations
  translateDoctorsPage()

  // Initialize language switchers
  initLanguageSwitchers_doctors()
})
