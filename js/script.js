// Enhanced JavaScript for Nelly Dental Clinic - Mobile Optimized

document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu elements
  const burger = document.getElementById("burger")
  const mobileNav = document.getElementById("mobileNav")
  const menuOverlay = document.getElementById("menuOverlay")
  const closeMenu = document.getElementById("closeMenu")
  const body = document.body

  // Mobile menu functionality
  function openMenu() {
    mobileNav.classList.add("open")
    menuOverlay.classList.add("active")
    burger.classList.add("active")
    body.style.overflow = "hidden"

    // Add focus to first menu item for accessibility
    const firstMenuItem = mobileNav.querySelector("a")
    if (firstMenuItem) {
      setTimeout(() => firstMenuItem.focus(), 300)
    }
  }

  function closeMenuFunc() {
    mobileNav.classList.remove("open")
    menuOverlay.classList.remove("active")
    burger.classList.remove("active")
    body.style.overflow = ""

    // Return focus to burger button
    burger.focus()
  }

  // Event listeners for menu
  if (burger) {
    burger.addEventListener("click", openMenu)
  }

  if (closeMenu) {
    closeMenu.addEventListener("click", closeMenuFunc)
  }

  if (menuOverlay) {
    menuOverlay.addEventListener("click", closeMenuFunc)
  }

  // Close menu when clicking on navigation links
  const navLinks = mobileNav?.querySelectorAll("a") || []
  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenuFunc)
  })

  // Close menu with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileNav?.classList.contains("open")) {
      closeMenuFunc()
    }
  })

  // Touch gestures for mobile menu
  let touchStartX = 0
  let touchEndX = 0

  mobileNav?.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX
  })

  mobileNav?.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX
    handleSwipe()
  })

  function handleSwipe() {
    const swipeThreshold = 100
    const swipeDistance = touchEndX - touchStartX

    // Swipe right to close menu
    if (swipeDistance > swipeThreshold) {
      closeMenuFunc()
    }
  }

  // Header scroll effects
  const header = document.querySelector(".header")
  let lastScrollTop = 0
  let scrollTimeout

  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    // Add background blur effect when scrolling
    if (scrollTop > 100) {
      header.style.background = "rgba(255, 255, 255, 0.95)"
      header.style.backdropFilter = "blur(10px)"
      header.style.boxShadow = "0 2px 20px rgba(0,0,0,0.1)"
    } else {
      header.style.background = "#fff"
      header.style.backdropFilter = "none"
      header.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)"
    }

    // Hide/show header on scroll (only on mobile)
    if (window.innerWidth <= 768) {
      if (scrollTop > lastScrollTop && scrollTop > 200) {
        header.style.transform = "translateY(-100%)"
      } else {
        header.style.transform = "translateY(0)"
      }
    }

    lastScrollTop = scrollTop
  }

  // Throttled scroll handler for better performance
  function throttledScroll() {
    if (scrollTimeout) {
      return
    }

    scrollTimeout = setTimeout(() => {
      handleScroll()
      scrollTimeout = null
    }, 16) // ~60fps
  }

  window.addEventListener("scroll", throttledScroll)

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))

      if (target) {
        const headerHeight = header?.offsetHeight || 0
        const targetPosition = target.offsetTop - headerHeight - 20

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        })

        // Close mobile menu if open
        if (mobileNav?.classList.contains("open")) {
          closeMenuFunc()
        }
      }
    })
  })

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("animate-in")
        }, index * 100)
      }
    })
  }, observerOptions)

  // Observe elements for animation
  const animatedElements = document.querySelectorAll(
    ".hero-title, .hero-subtitle, .service-item, .testimonial-card, .rating-card, .about-text, .about-image"
  );
  animatedElements.forEach((el) => {
    observer.observe(el)
  })

  // Phone number formatting for mobile
  function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, "")
    if (value.startsWith("7")) {
      value = "+7 " + value.slice(1, 4) + " " + value.slice(4, 7) + " " + value.slice(7, 9) + " " + value.slice(9, 11)
    }
    input.value = value
  }

  // Add phone formatting to phone inputs
  document.querySelectorAll('input[type="tel"]').forEach((input) => {
    input.addEventListener("input", () => formatPhoneNumber(input))
  })

  // Lazy loading for images
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        if (img.dataset.src) {
          img.src = img.dataset.src
          img.classList.add("loaded")
          imageObserver.unobserve(img)
        }
      }
    })
  })

  // Observe images with data-src attribute
  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img)
  })

  // Resize handler
  function handleResize() {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768 && mobileNav?.classList.contains("open")) {
      closeMenuFunc()
    }

    // Reset header transform on desktop
    if (window.innerWidth > 768) {
      header.style.transform = "translateY(0)"
    }
  }

  window.addEventListener("resize", handleResize)

  // Touch-friendly hover effects for mobile
  if ("ontouchstart" in window) {
    document.querySelectorAll(".service-item, .testimonial-card, .cta-button").forEach((el) => {
      el.addEventListener("touchstart", function () {
        this.classList.add("touch-active")
      })

      el.addEventListener("touchend", function () {
        setTimeout(() => {
          this.classList.remove("touch-active")
        }, 300)
      })
    })
  }

  // Prevent zoom on input focus (iOS Safari)
  const inputs = document.querySelectorAll("input, textarea, select")
  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      if (window.innerWidth < 768) {
        const viewport = document.querySelector('meta[name="viewport"]')
        if (viewport) {
          viewport.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no")
        }
      }
    })

    input.addEventListener("blur", () => {
      if (window.innerWidth < 768) {
        const viewport = document.querySelector('meta[name="viewport"]')
        if (viewport) {
          viewport.setAttribute("content", "width=device-width, initial-scale=1.0")
        }
      }
    })
  })

  // Add loading class to body when page loads
  window.addEventListener("load", () => {
    body.classList.add("loaded")
  })

  // Focus trap for mobile menu accessibility
  function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select',
    )
    const firstFocusableElement = focusableElements[0]
    const lastFocusableElement = focusableElements[focusableElements.length - 1]

    element.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus()
            e.preventDefault()
          }
        }
      }
    })
  }

  // Apply focus trap to mobile menu
  if (mobileNav) {
    trapFocus(mobileNav)
  }

  // Performance optimization: Reduce animations on low-end devices
  const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2
  if (isLowEndDevice) {
    document.documentElement.style.setProperty("--animation-duration", "0.2s")
  }

  // Service Worker registration for offline functionality (optional)
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration)
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError)
        })
    })
  }

  console.log("Nelly Dental Clinic - Mobile Optimized Version Loaded Successfully!")
})

// Utility functions
const NellyDentalUtils = {
  // Debounce function for performance
  debounce: (func, wait, immediate) => {
    let timeout
    return function executedFunction() {
      
      const args = arguments
      const later = () => {
        timeout = null
        if (!immediate) func.apply(this, args)
      }
      const callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func.apply(this, args)
    }
  },

  // Throttle function for scroll events
  throttle: (func, limit) => {
    let inThrottle
    return function () {
      const args = arguments
      
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },

  // Check if element is in viewport
  isInViewport: (element) => {
    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  },

  // Get device type
  getDeviceType: () => {
    const width = window.innerWidth
    if (width <= 480) return "mobile"
    if (width <= 768) return "tablet"
    return "desktop"
  },
}

// Export utils for global use
window.NellyDentalUtils = NellyDentalUtils

// Contacts page specific functionality
document.addEventListener("DOMContentLoaded", () => {
  // Contact form handling
  const contactForm = document.getElementById("contactForm")
  const formSuccess = document.getElementById("formSuccess")

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault()

      // Get form data
      const formData = new FormData(this)
      const name = formData.get("name")
      const phone = formData.get("phone")
      const email = formData.get("email")
      const service = formData.get("service")
      const message = formData.get("message")

      // Basic validation
      if (!name || !phone || !service) {
        alert("Пожалуйста, заполните обязательные поля")
        return
      }

      // Phone validation
      const phoneRegex = /^[\+]?[7]?[\s\-]?[$$]?[0-9]{3}[$$]?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/
      if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
        alert("Пожалуйста, введите корректный номер телефона")
        return
      }

      // Email validation (if provided)
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          alert("Пожалуйста, введите корректный email")
          return
        }
      }

      // Simulate form submission
      const submitBtn = this.querySelector(".submit-btn")
      const originalText = submitBtn.innerHTML
      
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ОТПРАВКА...'
      submitBtn.disabled = true

      // Simulate API call
      setTimeout(() => {
        // Show success message
        formSuccess.classList.add("show")
        
        // Reset form
        this.reset()
        
        // Reset button
        submitBtn.innerHTML = originalText
        submitBtn.disabled = false

        // Hide success message after 5 seconds
        setTimeout(() => {
          formSuccess.classList.remove("show")
        }, 5000)

        // In real implementation, you would send data to your server
        console.log("Form submitted:", {
          name,
          phone,
          email,
          service,
          message,
        })
      }, 2000)
    })
  }

  // Phone number formatting
  const phoneInput = document.getElementById("phone")
  if (phoneInput) {
    phoneInput.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\D/g, "")
      
      if (value.startsWith("7")) {
        value = "+7 " + value.slice(1)
      } else if (value.startsWith("8")) {
        value = "+7 " + value.slice(1)
      } else if (value.length > 0 && !value.startsWith("7")) {
        value = "+7 " + value
      }

      // Format: +7 XXX XXX XX XX
      if (value.length > 2) {
        value = value.slice(0, 2) + " " + value.slice(2)
      }
      if (value.length > 6) {
        value = value.slice(0, 6) + " " + value.slice(6)
      }
      if (value.length > 10) {
        value = value.slice(0, 10) + " " + value.slice(10)
      }
      if (value.length > 13) {
        value = value.slice(0, 13) + " " + value.slice(13, 15)
      }

      e.target.value = value
    })
  }

  // Smooth scroll to form when clicking contact buttons
  const contactButtons = document.querySelectorAll('a[href*="contact"]')
  contactButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      const contactFormSection = document.querySelector(".contact-form-section")
      if (contactFormSection) {
        e.preventDefault()
        contactFormSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // Map interaction improvements for mobile
  const mapContainer = document.querySelector(".map-container")
  if (mapContainer) {
    let isMapActive = false

    mapContainer.addEventListener("click", function () {
      if (!isMapActive) {
        this.style.pointerEvents = "auto"
        isMapActive = true
        
        // Add overlay message for mobile
        if (window.innerWidth <= 768) {
          const overlay = document.createElement("div")
          overlay.className = "map-overlay-message"
          overlay.innerHTML = "Используйте два пальца для перемещения карты"
          overlay.style.cssText = `
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 10;
            pointer-events: none;
          `
          this.appendChild(overlay)
          
          setTimeout(() => {
            overlay.remove()
          }, 3000)
        }
      }
    })

    // Reset map interaction when clicking outside
    document.addEventListener("click", function (e) {
      if (!mapContainer.contains(e.target) && isMapActive) {
        mapContainer.style.pointerEvents = "none"
        isMapActive = false
      }
    })
  }

  console.log("Contacts page functionality loaded successfully!")
})
// Cases page specific functionality
document.addEventListener("DOMContentLoaded", () => {
  // Counter animation for hero stats
  function animateCounters() {
    const counters = document.querySelectorAll('.stat-beautiful')
    
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.count)
      const numberElement = counter.querySelector('.stat-number')
      const isPercentage = numberElement.textContent.includes('%')
      
      let current = 0
      const increment = target / 100
      const timer = setInterval(() => {
        current += increment
        if (current >= target) {
          current = target
          clearInterval(timer)
        }
        
        if (isPercentage) {
          numberElement.textContent = Math.floor(current) + '%'
        } else {
          numberElement.textContent = Math.floor(current) + '+'
        }
      }, 20)
    })
  }

  // Trigger counter animation when hero section is visible
  const heroSection = document.querySelector('.cases-hero-beautiful')
  if (heroSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(animateCounters, 1000)
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.5 })
    
    observer.observe(heroSection)
  }

  // Before/After slider functionality
  function initBeforeAfterSliders() {
    const sliders = document.querySelectorAll('.before-after-slider')
    
    sliders.forEach(slider => {
      const handle = slider.querySelector('.slider-handle')
      const beforeImg = slider.querySelector('.before-img')
      let isDragging = false
      
      function updateSlider(x) {
        const rect = slider.getBoundingClientRect()
        const percentage = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100))
        
        beforeImg.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`
        handle.style.left = percentage + '%'
      }
      
      // Mouse events
      handle.addEventListener('mousedown', (e) => {
        isDragging = true
        e.preventDefault()
      })
      
      document.addEventListener('mousemove', (e) => {
        if (isDragging) {
          updateSlider(e.clientX)
        }
      })
      
      document.addEventListener('mouseup', () => {
        isDragging = false
      })
      
      // Touch events for mobile
      handle.addEventListener('touchstart', (e) => {
        isDragging = true
        e.preventDefault()
      })
      
      document.addEventListener('touchmove', (e) => {
        if (isDragging) {
          const touch = e.touches[0]
          updateSlider(touch.clientX)
        }
      })
      
      document.addEventListener('touchend', () => {
        isDragging = false
      })
      
      // Click to position
      slider.addEventListener('click', (e) => {
        if (!isDragging) {
          updateSlider(e.clientX)
        }
      })
    })
  }

  // Filter functionality
  function initCaseFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn')
    const caseCards = document.querySelectorAll('.case-card-beautiful')
    
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'))
        button.classList.add('active')
        
        const filter = button.dataset.filter
        
        // Filter cards with animation
        caseCards.forEach((card, index) => {
          const categories = card.dataset.category || ''
          const shouldShow = filter === 'all' || categories.includes(filter)
          
          setTimeout(() => {
            if (shouldShow) {
              card.classList.remove('filter-hidden')
              card.classList.add('filter-visible')
              card.style.display = 'block'
            } else {
              card.classList.add('filter-hidden')
              card.classList.remove('filter-visible')
              setTimeout(() => {
                if (card.classList.contains('filter-hidden')) {
                  card.style.display = 'none'
                }
              }, 300)
            }
          }, index * 50)
        })
      })
    })
  }

  // Showcase thumbnails functionality
  function initShowcaseThumbnails() {
    const thumbnails = document.querySelectorAll('.thumbnail')
    const showcaseImages = document.querySelector('.before-after-showcase')
    
    // Sample data for different cases
 const caseData = {
  1: {
    before: "/img/do6.jfif",
    after: "/img/posle6.jfif",
    titleKey: "showcase_case_1_title", // Используем ключи вместо текста
    tagKeys: ["tag_emax", "tag_crowns_general"]
  },
  2: {
    before: "/img/do7.jfif", 
    after: "/img/posle7.jfif",
    titleKey: "showcase_case_2_title",
    tagKeys: ["tag_braces", "tag_orthodontics"]
  },
  3: {
    before: "/img/do4.jfif",
    after: "/img/posle4.jfif", 
    titleKey: "showcase_case_3_title",
    tagKeys: ["tag_orthodontics", "tag_braces_system"]
  }
}
    
    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', () => {
        // Update active thumbnail
        thumbnails.forEach(t => t.classList.remove('active'))
        thumbnail.classList.add('active')
        
        const caseId = thumbnail.dataset.case
        const data = caseData[caseId]
        
        if (data && showcaseImages) {
          // Update images with fade effect
          const beforeImg = showcaseImages.querySelector('.before img')
          const afterImg = showcaseImages.querySelector('.after img')
          const title = document.querySelector('.showcase-info h3')
          const tags = document.querySelector('.showcase-tags')
          
          // Fade out
          showcaseImages.style.opacity = '0.5'
          
          setTimeout(() => {
            beforeImg.src = data.before
            afterImg.src = data.after
            title.textContent = data.title
            
            // Update tags
            tags.innerHTML = data.tags.map(tag => 
              `<span class="tag">${tag}</span>`
            ).join('')
            
            // Fade in
            showcaseImages.style.opacity = '1'
          }, 200)
        }
      })
    })
  }

  

  // Load more functionality
  function initLoadMore() {
    const loadMoreBtn = document.querySelector('.load-more-btn')
    const casesGrid = document.querySelector('.cases-grid-beautiful')
    
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        // Add loading state
        loadMoreBtn.classList.add('loading')
        loadMoreBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Загрузка...'
        
        // Simulate loading delay
        setTimeout(() => {
          // In a real application, you would fetch more cases from an API
          // For demo purposes, we'll just show a message
          loadMoreBtn.innerHTML = '<i class="fa-solid fa-check"></i> Все кейсы загружены'
          loadMoreBtn.disabled = true
          loadMoreBtn.style.opacity = '0.6'
        }, 2000)
      })
    }
  }

  // Smooth reveal animation for case cards
  function initCaseRevealAnimation() {
    const caseCards = document.querySelectorAll('.case-card-beautiful')
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1'
            entry.target.style.transform = 'translateY(0)'
          }, index * 100)
          observer.unobserve(entry.target)
        }
      })
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    })
    
    caseCards.forEach(card => {
      observer.observe(card)
    })
  }

  // Enhanced case card interactions
  function initCaseCardInteractions() {
    const caseCards = document.querySelectorAll('.case-card-beautiful')
    
    caseCards.forEach(card => {
      const viewBtn = card.querySelector('.view-case-btn')
      
      if (viewBtn) {
        viewBtn.addEventListener('click', (e) => {
          e.stopPropagation()
          
          // Add click animation
          viewBtn.style.transform = 'scale(0.95)'
          setTimeout(() => {
            viewBtn.style.transform = 'scale(1)'
          }, 150)
          
          // In a real application, this would open a modal or navigate to a detailed page
          console.log('Opening case details...')
          
          // For demo, show an alert
          const title = card.querySelector('h3').textContent
          alert(`Открытие подробной информации о кейсе: "${title}"`)
        })
      }
    })
  }

  // Initialize all functionality
  initBeforeAfterSliders()
  initCaseFilters()
  initShowcaseThumbnails()
  initLoadMore()
  initCaseRevealAnimation()
  initCaseCardInteractions()

  console.log('Cases page functionality loaded successfully!')
})

// Utility functions for cases page
const CasesPageUtils = {
  // Smooth scroll to cases section
  scrollToCases: () => {
    const casesSection = document.querySelector('.cases-gallery-beautiful')
    if (casesSection) {
      casesSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  },

  // Filter cases by category
  filterCases: (category) => {
    const filterBtn = document.querySelector(`[data-filter="${category}"]`)
    if (filterBtn) {
      filterBtn.click()
    }
  },

  // Get case statistics
  getCaseStats: () => {
    const caseCards = document.querySelectorAll('.case-card-beautiful')
    const categories = {}
    
    caseCards.forEach(card => {
      const category = card.dataset.category || 'other'
      category.split(' ').forEach(cat => {
        categories[cat] = (categories[cat] || 0) + 1
      })
    })
    
    return {
      total: caseCards.length,
      categories: categories
    }
  }
}

// Export utils for global use
window.CasesPageUtils = CasesPageUtils

// Media page specific functionality
document.addEventListener("DOMContentLoaded", () => {
  // Counter animation for hero stats
  function animateCounters() {
    const counters = document.querySelectorAll('.stat-media, .stat-card-beautiful')
    
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.count || counter.querySelector('[data-count]')?.dataset.count)
      if (!target) return
      
      const numberElement = counter.querySelector('.stat-number-media, .stat-number-big')
      if (!numberElement) return
      
      const isPercentage = numberElement.textContent.includes('%')
      const isThousands = target >= 1000
      
      let current = 0
      const increment = target / 100
      const timer = setInterval(() => {
        current += increment
        if (current >= target) {
          current = target
          clearInterval(timer)
        }
        
        let displayValue = Math.floor(current)
        
        if (isPercentage) {
          numberElement.textContent = displayValue + '%'
        } else if (isThousands && displayValue >= 1000) {
          numberElement.textContent = (displayValue / 1000).toFixed(1) + 'K+'
        } else {
          numberElement.textContent = displayValue + '+'
        }
      }, 20)
    })
  }

  // Trigger counter animation when sections are visible
  const heroSection = document.querySelector('.media-hero-beautiful')
  const statsSection = document.querySelector('.video-stats-beautiful')
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(animateCounters, 500)
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.5 })
  
  if (heroSection) observer.observe(heroSection)
  if (statsSection) observer.observe(statsSection)

  // Video modal functionality
  function initVideoModal() {
    const videoCards = document.querySelectorAll('.video-card-beautiful')
    const modal = document.getElementById('videoModal')
    const modalIframe = document.getElementById('modalIframe')
    const modalTitle = document.getElementById('modalTitle')
    const closeBtn = document.getElementById('closeModal')
    const prevBtn = document.getElementById('prevVideo')
    const nextBtn = document.getElementById('nextVideo')
    const modalOverlay = document.querySelector('.modal-overlay-beautiful')
    
    let currentVideoIndex = 0
    let videoData = []
    
    // Collect video data
    videoCards.forEach((card, index) => {
      const videoUrl = card.dataset.video
      const title = card.querySelector('h3').textContent
      const category = card.dataset.category
      
      videoData.push({
        url: videoUrl,
        title: title,
        category: category,
        element: card
      })
    })
    
    function openModal(index) {
      currentVideoIndex = index
      const video = videoData[index]
      
      modalIframe.src = video.url
      modalTitle.textContent = video.title
      modal.classList.add('active')
      document.body.style.overflow = 'hidden'
      
      // Update navigation buttons
      prevBtn.disabled = index === 0
      nextBtn.disabled = index === videoData.length - 1
      
      // Add modal open animation
      setTimeout(() => {
        modal.querySelector('.modal-content-beautiful').style.transform = 'scale(1)'
      }, 10)
    }
    
    function closeModal() {
      modal.classList.remove('active')
      modalIframe.src = ''
      document.body.style.overflow = 'auto'
      
      // Reset modal position
      modal.querySelector('.modal-content-beautiful').style.transform = 'scale(0.8)'
    }
    
    function showPrevVideo() {
      if (currentVideoIndex > 0) {
        openModal(currentVideoIndex - 1)
      }
    }
    
    function showNextVideo() {
      if (currentVideoIndex < videoData.length - 1) {
        openModal(currentVideoIndex + 1)
      }
    }
    
    // Event listeners
    videoCards.forEach((card, index) => {
      card.addEventListener('click', () => {
        openModal(index)
      })
    })
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal)
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal)
    if (prevBtn) prevBtn.addEventListener('click', showPrevVideo)
    if (nextBtn) nextBtn.addEventListener('click', showNextVideo)
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (modal.classList.contains('active')) {
        switch(e.key) {
          case 'Escape':
            closeModal()
            break
          case 'ArrowLeft':
            showPrevVideo()
            break
          case 'ArrowRight':
            showNextVideo()
            break
        }
      }
    })
  }

  // Filter functionality
  function initVideoFilters() {
    const filterButtons = document.querySelectorAll('.media-filter-btn')
    const videoCards = document.querySelectorAll('.video-card-beautiful')
    
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'))
        button.classList.add('active')
        
        const filter = button.dataset.filter
        
        // Filter cards with animation
        videoCards.forEach((card, index) => {
          const category = card.dataset.category || ''
          const shouldShow = filter === 'all' || category.includes(filter)
          
          setTimeout(() => {
            if (shouldShow) {
              card.classList.remove('filter-hidden')
              card.classList.add('filter-visible')
              card.style.display = 'block'
            } else {
              card.classList.add('filter-hidden')
              card.classList.remove('filter-visible')
              setTimeout(() => {
                if (card.classList.contains('filter-hidden')) {
                  card.style.display = 'none'
                }
              }, 300)
            }
          }, index * 50)
        })
      })
    })
  }

  // Load more functionality
  function initLoadMore() {
    const loadMoreBtn = document.querySelector('.load-more-btn-media')
    
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        // Add loading state
        loadMoreBtn.classList.add('loading')
        loadMoreBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Загрузка...</span>'
        
        // Simulate loading delay
        setTimeout(() => {
          // In a real application, you would fetch more videos from an API
          loadMoreBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Все видео загружены</span>'
          loadMoreBtn.disabled = true
          loadMoreBtn.style.opacity = '0.6'
        }, 2000)
      })
    }
  }

  // Video card hover effects
  function initVideoCardEffects() {
    const videoCards = document.querySelectorAll('.video-card-beautiful')
    
    videoCards.forEach(card => {
      const thumbnail = card.querySelector('.video-thumbnail-beautiful')
      const overlay = card.querySelector('.video-overlay-beautiful')
      const playButton = card.querySelector('.play-button-beautiful')
      
      card.addEventListener('mouseenter', () => {
        // Add hover animation to play button
        if (playButton) {
          playButton.style.transform = 'scale(1.1)'
        }
      })
      
      card.addEventListener('mouseleave', () => {
        // Reset play button
        if (playButton) {
          playButton.style.transform = 'scale(1)'
        }
      })
      
      // Add click ripple effect
      card.addEventListener('click', (e) => {
        const ripple = document.createElement('div')
        ripple.className = 'click-ripple'
        
        const rect = card.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height)
        const x = e.clientX - rect.left - size / 2
        const y = e.clientY - rect.top - size / 2
        
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(102, 126, 234, 0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s ease-out;
          pointer-events: none;
          z-index: 10;
        `
        
        card.style.position = 'relative'
        card.appendChild(ripple)
        
        setTimeout(() => {
          ripple.remove()
        }, 600)
      })
    })
    
    // Add ripple animation CSS
    const style = document.createElement('style')
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)
  }

  // Smooth reveal animation for video cards
  function initVideoRevealAnimation() {
    const videoCards = document.querySelectorAll('.video-card-beautiful')
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1'
            entry.target.style.transform = 'translateY(0)'
          }, index * 100)
          observer.unobserve(entry.target)
        }
      })
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    })
    
    videoCards.forEach(card => {
      observer.observe(card)
    })
  }

  // Video lazy loading
  function initVideoLazyLoading() {
    const videoThumbnails = document.querySelectorAll('.video-thumbnail-beautiful img')
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          
          // Add loading animation
          img.style.opacity = '0'
          img.style.transition = 'opacity 0.3s ease'
          
          img.onload = () => {
            img.style.opacity = '1'
          }
          
          // If image is already cached, show it immediately
          if (img.complete) {
            img.style.opacity = '1'
          }
          
          imageObserver.unobserve(img)
        }
      })
    })
    
    videoThumbnails.forEach(img => {
      imageObserver.observe(img)
    })
  }

  // Search functionality (if needed)
  function initVideoSearch() {
    const searchInput = document.getElementById('videoSearch')
    const videoCards = document.querySelectorAll('.video-card-beautiful')
    
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase()
        
        videoCards.forEach(card => {
          const title = card.querySelector('h3').textContent.toLowerCase()
          const description = card.querySelector('p').textContent.toLowerCase()
          const tags = Array.from(card.querySelectorAll('.tag-beautiful')).map(tag => tag.textContent.toLowerCase())
          
          const matches = title.includes(searchTerm) || 
                         description.includes(searchTerm) || 
                         tags.some(tag => tag.includes(searchTerm))
          
          if (matches || searchTerm === '') {
            card.style.display = 'block'
            card.classList.remove('filter-hidden')
          } else {
            card.style.display = 'none'
            card.classList.add('filter-hidden')
          }
        })
      })
    }
  }

  // Video view tracking (for analytics)
  function trackVideoView(videoTitle, videoCategory) {
    // In a real application, you would send this data to your analytics service
    console.log('Video viewed:', {
      title: videoTitle,
      category: videoCategory,
      timestamp: new Date().toISOString()
    })
    
    // Example: Google Analytics event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'video_view', {
        'video_title': videoTitle,
        'video_category': videoCategory
      })
    }
  }

  // Initialize all functionality
  initVideoModal()
  initVideoFilters()
  initLoadMore()
  initVideoCardEffects()
  initVideoRevealAnimation()
  initVideoLazyLoading()
  initVideoSearch()

  console.log('Media page functionality loaded successfully!')
})

// Utility functions for media page
const MediaPageUtils = {
  // Smooth scroll to videos section
  scrollToVideos: () => {
    const videosSection = document.querySelector('.video-gallery-beautiful')
    if (videosSection) {
      videosSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  },

  // Filter videos by category
  filterVideos: (category) => {
    const filterBtn = document.querySelector(`[data-filter="${category}"]`)
    if (filterBtn) {
      filterBtn.click()
    }
  },

  // Get video statistics
  getVideoStats: () => {
    const videoCards = document.querySelectorAll('.video-card-beautiful')
    const categories = {}
    
    videoCards.forEach(card => {
      const category = card.dataset.category || 'other'
      categories[category] = (categories[category] || 0) + 1
    })
    
    return {
      total: videoCards.length,
      categories: categories
    }
  },

  // Play specific video by index
  playVideo: (index) => {
    const videoCards = document.querySelectorAll('.video-card-beautiful')
    if (videoCards[index]) {
      videoCards[index].click()
    }
  },

  // Share video functionality
  shareVideo: (videoTitle, videoUrl) => {
    if (navigator.share) {
      navigator.share({
        title: videoTitle,
        text: `Посмотрите это видео от Nelly dental clinic: ${videoTitle}`,
        url: videoUrl
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(videoUrl).then(() => {
        alert('Ссылка на видео скопирована в буфер обмена!')
      })
    }
  }
}

// Export utils for global use
window.MediaPageUtils = MediaPageUtils

// Add some additional CSS for enhanced animations
const additionalStyles = `
  .video-card-beautiful {
    will-change: transform, opacity;
  }
  
  .play-button-beautiful {
    will-change: transform;
  }
  
  .video-thumbnail-beautiful img {
    will-change: transform;
  }
  
  .modal-content-beautiful {
    will-change: transform, opacity;
  }
  
  /* Enhanced loading animation */
  .video-card-beautiful.loading {
    position: relative;
    overflow: hidden;
  }
  
  .video-card-beautiful.loading::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: shimmer 1.5s infinite;
  }
  
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
  
  /* Smooth transitions for all interactive elements */
  .media-filter-btn,
  .video-card-beautiful,
  .play-button-beautiful,
  .control-btn-beautiful,
  .cta-btn-media {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
`

// Inject additional styles
const styleSheet = document.createElement('style')
styleSheet.textContent = additionalStyles
document.head.appendChild(styleSheet)


// Doctors page specific functionality
document.addEventListener("DOMContentLoaded", () => {
  // Counter animation for hero stats
  function animateCounters() {
    const counters = document.querySelectorAll('.stat-doctors')
    
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.count)
      const numberElement = counter.querySelector('.stat-number-doctors')
      const isPercentage = numberElement.textContent.includes('%')
      
      let current = 0
      const increment = target / 100
      const timer = setInterval(() => {
        current += increment
        if (current >= target) {
          current = target
          clearInterval(timer)
        }
        
        if (isPercentage) {
          numberElement.textContent = Math.floor(current) + '%'
        } else {
          numberElement.textContent = Math.floor(current) + (target > 10 ? '+' : '')
        }
      }, 20)
    })
  }

  // Trigger counter animation when hero section is visible
  const heroSection = document.querySelector('.doctors-hero-beautiful')
  if (heroSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(animateCounters, 1000)
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.5 })
    
    observer.observe(heroSection)
  }

  // Doctor data for modal
  const doctorsData = {
    nelly: {
      name: "Нелли Курмаева Ринатовна",
      position: "Стоматолог-терапевт, Главный врач",
      photo: "../img/nellyvrach.JPG",
      experience: "14 лет стажа",
      rating: 5.0,
      specialties: ["Терапия", "Эстетика", "Эндодонтия", "Управление"],
      description: "Опытный стоматолог-терапевт с 14-летним стажем. Специализируется на лечении кариеса, пульпита и периодонтита, прямых эстетических реставрациях, контроле качества лечения, а также координации работы команды и повышении стандартов клинической практики. Главный врач клиники.",
      achievements: [
        "14 лет успешной практики",
        "Главный врач клиники",
        "Более 500 довольных пациентов",
        "Специализация в эстетической стоматологии",
        "Эксперт в эндодонтическом лечении"
      ],
      schedule: {
        "Понедельник": "10:00-19:00",
        "Вторник": "10:00-19:00", 
        "Среда": "10:00-19:00",
        "Четверг": "10:00-19:00",
        "Пятница": "10:00-19:00",
        "Суббота": "10:00-16:00",
        "Воскресенье": "Выходной"
      }
    },
    erik: {
      name: "Ерік Оңдабаев Қуанышұлы",
      position: "Эндодонтист",
      photo: "../img/eric.png",
      experience: "5 лет стажа",
      rating: 4.9,
      specialties: ["Эндодонтия", "Микроскоп", "Каналы", "Реставрация"],
      description: "Специализируется на лечении корневых каналов под микроскопом, проводит первичное и повторное эндодонтическое лечение, удаление сломанных инструментов, устранение перфораций, апексификация, лечение сложной анатомии каналов и обеспечивает высокую точность и сохранность тканей зуба.",
      achievements: [
        "5 лет специализации в эндодонтии",
        "Работа под микроскопом",
        "Сложные клинические случаи",
        "Высокая точность лечения",
        "Современные методики"
      ],
      schedule: {
        "Понедельник": "10:00-19:00",
        "Вторник": "Выходной",
        "Среда": "10:00-19:00",
        "Четверг": "10:00-19:00",
        "Пятница": "10:00-19:00",
        "Суббота": "10:00-16:00",
        "Воскресенье": "Выходной"
      }
    },
    yernar: {
      name: "Ернар Ержанович",
      position: "Стоматолог-ортодонт",
      photo: "../img/yernar.JPG",
      experience: "3 года стажа",
      rating: 4.8,
      specialties: ["Ортодонтия", "Брекеты", "Элайнеры", "Прикус"],
      description: "Специализируется на выравнивании зубов, коррекции прикуса, улучшении эстетики улыбки и восстановлении правильной функции жевания с помощью брекетов, элайнеров и других ортодонтических аппаратов.",
      achievements: [
        "3 года ортодонтической практики",
        "Более 200 исправленных улыбок",
        "Работа с брекет-системами",
        "Элайнеры и капы",
        "Коррекция сложных случаев"
      ],
      schedule: {
        "Понедельник": "Выходной",
        "Вторник": "10:00-19:00",
        "Среда": "10:00-19:00",
        "Четверг": "Выходной",
        "Пятница": "10:00-19:00",
        "Суббота": "10:00-16:00",
        "Воскресенье": "10:00-16:00"
      }
    },
    akmaral: {
      name: "Акмарал Айдарбековна",
      position: "Стоматолог-терапевт",
      photo: "../img/akmaral.JPG",
      experience: "3 года стажа",
      rating: 4.9,
      specialties: ["Терапия", "Реставрация", "Эндодонтия", "Профилактика"],
      description: "Специализируется на лечении кариеса, пульпита и периодонтита, проводит прямые эстетические реставрации, повторное эндодонтическое лечение, восстановление формы и функции зубов и профилактикой осложнений.",
      achievements: [
        "3 года клинической практики",
        "Индивидуальный подход к пациентам",
        "Эстетические реставрации",
        "Профилактическая стоматология",
        "Комфортное лечение"
      ],
      schedule: {
        "Понедельник": "10:00-19:00",
        "Вторник": "10:00-19:00",
        "Среда": "Выходной",
        "Четверг": "10:00-19:00",
        "Пятница": "10:00-19:00",
        "Суббота": "Выходной",
        "Воскресенье": "10:00-16:00"
      }
    },
    merey: {
      name: "Мерей Амирулловна",
      position: "Стоматолог-терапевт",
      photo: "../img/merey.PNG",
      experience: "8 лет стажа",
      rating: 4.9,
      specialties: ["Терапия", "Диагностика", "Профилактика", "Эндодонтия"],
      description: "Проводит диагностику и лечение кариеса и его осложнений (пульпита и периодонтита). Выполняет прямые эстетические реставрации, повторное эндодонтическое лечение, восстановление формы и функции зубов. Особое внимание уделяет сохранению здоровых тканей и профилактике осложнений.",
      achievements: [
        "8 лет успешной практики",
        "Экспертиза в диагностике",
        "Профилактическая стоматология",
        "Сохранение здоровых тканей",
        "Комплексный подход к лечению"
      ],
      schedule: {
        "Понедельник": "10:00-19:00",
        "Вторник": "Выходной",
        "Среда": "10:00-19:00",
        "Четверг": "10:00-19:00",
        "Пятница": "Выходной",
        "Суббота": "10:00-16:00",
        "Воскресенье": "10:00-16:00"
      }
    },
    ulmeken: {
      name: "Улмекен Аширханова Тенелбаевна",
      position: "Стоматолог-терапевт",
      photo: "../img/ulmeken.JPG",
      experience: "5 лет стажа",
      rating: 4.8,
      specialties: ["Терапия", "Реставрация", "Эндодонтия", "Эстетика"],
      description: "Специализируется на лечении кариеса, пульпита и периодонтита, проводит прямые эстетические реставрации, повторное эндодонтическое лечение, восстановление формы и функции зубов и профилактикой осложнений.",
      achievements: [
        "5 лет клинической практики",
        "Эстетические реставрации",
        "Качественное эндодонтическое лечение",
        "Восстановление функции зубов",
        "Профилактика осложнений"
      ],
      schedule: {
        "Понедельник": "Выходной",
        "Вторник": "10:00-19:00",
        "Среда": "10:00-19:00",
        "Четверг": "10:00-19:00",
        "Пятница": "10:00-19:00",
        "Суббота": "Выходной",
        "Воскресенье": "10:00-16:00"
      }
    }
  }

  // Doctor modal functionality
  function initDoctorModal() {
    const modal = document.getElementById('doctorModal')
    const closeBtn = document.getElementById('closeDoctorModal')
    const modalOverlay = document.querySelector('.modal-overlay-doctors')
    
    // Open modal buttons
    const viewButtons = document.querySelectorAll('.view-doctor-btn, .secondary-btn-doctors')
    const bookButtons = document.querySelectorAll('.book-doctor-btn, .primary-btn-doctors')
    
    function openModal(doctorId) {
      const doctor = doctorsData[doctorId]
      if (!doctor) return
      
      // Populate modal content
      document.getElementById('modalDoctorName').textContent = doctor.name
      document.getElementById('modalDoctorPhoto').src = doctor.photo
      document.getElementById('modalDoctorPhoto').alt = doctor.name
      document.getElementById('modalExperience').textContent = doctor.experience
      document.getElementById('modalDoctorFullName').textContent = doctor.name
      document.getElementById('modalDoctorPosition').textContent = doctor.position
      document.getElementById('modalDoctorDescription').textContent = doctor.description
      
      // Rating
      const ratingContainer = document.getElementById('modalRating')
      ratingContainer.innerHTML = ''
      for (let i = 0; i < 5; i++) {
        const star = document.createElement('i')
        star.className = i < Math.floor(doctor.rating) ? 'fa-solid fa-star' : 'fa-regular fa-star'
        ratingContainer.appendChild(star)
      }
      document.getElementById('modalRatingText').textContent = doctor.rating
      
      // Specialties
      const specialtiesContainer = document.getElementById('modalSpecialties')
      specialtiesContainer.innerHTML = doctor.specialties.map((specialty, index) => 
        `<span class="specialty-tag ${index === 0 ? 'primary' : ''}">${specialty}</span>`
      ).join('')
      
      // Achievements
      const achievementsContainer = document.getElementById('modalAchievements')
      achievementsContainer.innerHTML = doctor.achievements.map(achievement => 
        `<li>${achievement}</li>`
      ).join('')
      
      // Schedule
      const scheduleContainer = document.getElementById('modalSchedule')
      scheduleContainer.innerHTML = Object.entries(doctor.schedule).map(([day, time]) => 
        `<div class="schedule-item ${time !== 'Выходной' ? 'available' : ''}">
          <div style="font-weight: 600; margin-bottom: 4px;">${day}</div>
          <div>${time}</div>
        </div>`
      ).join('')
      
      // Show modal
      modal.classList.add('active')
      document.body.style.overflow = 'hidden'
    }
    
    function closeModal() {
      modal.classList.remove('active')
      document.body.style.overflow = 'auto'
    }
    
    // Event listeners
    viewButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        const doctorId = btn.dataset.doctor || btn.closest('.doctor-card-beautiful').querySelector('[data-doctor]').dataset.doctor
        openModal(doctorId)
      })
    })
    
    bookButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        const doctorId = btn.dataset.doctor || btn.closest('.doctor-card-beautiful').querySelector('[data-doctor]').dataset.doctor
        // In a real application, this would open a booking form
        alert(`Запись к врачу: ${doctorsData[doctorId]?.name}. Позвоните +7 705 402 61 81 для записи.`)
      })
    })
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal)
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal)
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (modal.classList.contains('active') && e.key === 'Escape') {
        closeModal()
      }
    })
  }

  // Filter functionality
  function initDoctorFilters() {
    const filterButtons = document.querySelectorAll('.doctors-filter-btn')
    const doctorCards = document.querySelectorAll('.doctor-card-beautiful')
    
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'))
        button.classList.add('active')
        
        const filter = button.dataset.filter
        
        // Filter cards with animation
        doctorCards.forEach((card, index) => {
          const specialization = card.dataset.specialization || ''
          const shouldShow = filter === 'all' || specialization.includes(filter)
          
          setTimeout(() => {
            if (shouldShow) {
              card.classList.remove('filter-hidden')
              card.classList.add('filter-visible')
              card.style.display = 'block'
            } else {
              card.classList.add('filter-hidden')
              card.classList.remove('filter-visible')
              setTimeout(() => {
                if (card.classList.contains('filter-hidden')) {
                  card.style.display = 'none'
                }
              }, 300)
            }
          }, index * 100)
        })
        
        // Update filter counts
        updateFilterCounts()
      })
    })
  }

  // Update filter counts
  function updateFilterCounts() {
    const filterButtons = document.querySelectorAll('.doctors-filter-btn')
    const doctorCards = document.querySelectorAll('.doctor-card-beautiful')
    
    filterButtons.forEach(button => {
      const filter = button.dataset.filter
      const countElement = button.querySelector('.filter-count')
      
      if (filter === 'all') {
        countElement.textContent = doctorCards.length
      } else {
        const count = Array.from(doctorCards).filter(card => 
          card.dataset.specialization && card.dataset.specialization.includes(filter)
        ).length
        countElement.textContent = count
      }
    })
  }

  // Doctor card hover effects
  function initDoctorCardEffects() {
    const doctorCards = document.querySelectorAll('.doctor-card-beautiful')
    
    doctorCards.forEach(card => {
      const image = card.querySelector('.doctor-image-beautiful img')
      const overlay = card.querySelector('.doctor-overlay-beautiful')
      
      card.addEventListener('mouseenter', () => {
        // Add hover animation
        if (image) {
          image.style.transform = 'scale(1.05)'
        }
      })
      
      card.addEventListener('mouseleave', () => {
        // Reset image
        if (image) {
          image.style.transform = 'scale(1)'
        }
      })
      
      // Add click ripple effect
      card.addEventListener('click', (e) => {
        // Only add ripple if not clicking on buttons
        if (e.target.closest('button')) return
        
        const ripple = document.createElement('div')
        ripple.className = 'click-ripple-doctors'
        
        const rect = card.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height)
        const x = e.clientX - rect.left - size / 2
        const y = e.clientY - rect.top - size / 2
        
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(102, 126, 234, 0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: rippleDoctors 0.6s ease-out;
          pointer-events: none;
          z-index: 10;
        `
        
        card.style.position = 'relative'
        card.appendChild(ripple)
        
        setTimeout(() => {
          ripple.remove()
        }, 600)
      })
    })
    
    // Add ripple animation CSS
    const style = document.createElement('style')
    style.textContent = `
      @keyframes rippleDoctors {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)
  }

  // Smooth reveal animation for doctor cards
  function initDoctorRevealAnimation() {
    const doctorCards = document.querySelectorAll('.doctor-card-beautiful')
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1'
            entry.target.style.transform = 'translateY(0)'
          }, index * 150)
          observer.unobserve(entry.target)
        }
      })
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    })
    
    doctorCards.forEach(card => {
      observer.observe(card)
    })
  }

  // Doctor search functionality
  function initDoctorSearch() {
    const searchInput = document.getElementById('doctorSearch')
    const doctorCards = document.querySelectorAll('.doctor-card-beautiful')
    
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase()
        
        doctorCards.forEach(card => {
          const name = card.querySelector('h3').textContent.toLowerCase()
          const position = card.querySelector('.doctor-position-beautiful').textContent.toLowerCase()
          const description = card.querySelector('.doctor-description-beautiful').textContent.toLowerCase()
          const specialties = Array.from(card.querySelectorAll('.specialty-tag')).map(tag => tag.textContent.toLowerCase())
          
          const matches = name.includes(searchTerm) || 
                         position.includes(searchTerm) || 
                         description.includes(searchTerm) ||
                         specialties.some(specialty => specialty.includes(searchTerm))
          
          if (matches || searchTerm === '') {
            card.style.display = 'block'
            card.classList.remove('filter-hidden')
          } else {
            card.style.display = 'none'
            card.classList.add('filter-hidden')
          }
        })
      })
    }
  }

  // Doctor booking tracking
  function trackDoctorBooking(doctorName, doctorSpecialty) {
    // In a real application, you would send this data to your analytics service
    console.log('Doctor booking initiated:', {
      doctor: doctorName,
      specialty: doctorSpecialty,
      timestamp: new Date().toISOString()
    })
    
    // Example: Google Analytics event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'doctor_booking', {
        'doctor_name': doctorName,
        'doctor_specialty': doctorSpecialty
      })
    }
  }

  // Initialize all functionality
  initDoctorModal()
  initDoctorFilters()
  initDoctorCardEffects()
  initDoctorRevealAnimation()
  initDoctorSearch()
  updateFilterCounts()

  console.log('Doctors page functionality loaded successfully!')
})

// Utility functions for doctors page
const DoctorsPageUtils = {
  // Smooth scroll to doctors section
  scrollToDoctors: () => {
    const doctorsSection = document.querySelector('.doctors-grid-beautiful')
    if (doctorsSection) {
      doctorsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  },

  // Filter doctors by specialization
  filterDoctors: (specialization) => {
    const filterBtn = document.querySelector(`[data-filter="${specialization}"]`)
    if (filterBtn) {
      filterBtn.click()
    }
  },

  // Get doctor statistics
  getDoctorStats: () => {
    const doctorCards = document.querySelectorAll('.doctor-card-beautiful')
    const specializations = {}
    
    doctorCards.forEach(card => {
      const specialization = card.dataset.specialization || 'other'
      specializations[specialization] = (specializations[specialization] || 0) + 1
    })
    
    return {
      total: doctorCards.length,
      specializations: specializations
    }
  },

  // Open specific doctor modal
  openDoctorModal: (doctorId) => {
    const viewBtn = document.querySelector(`[data-doctor="${doctorId}"]`)
    if (viewBtn) {
      viewBtn.click()
    }
  },

  // Book appointment with specific doctor
  bookDoctor: (doctorId) => {
    const bookBtn = document.querySelector(`[data-doctor="${doctorId}"].primary-btn-doctors`)
    if (bookBtn) {
      bookBtn.click()
    }
  }
}

// Export utils for global use
window.DoctorsPageUtils = DoctorsPageUtils

// Add some additional CSS for enhanced animations
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
    contacts_title: "КОНТАКТЫ",
    contacts_subtitle: "В АСТАНЕ",
    address_title: "УЛЫ ДАЛА 35",
    address_details: "Z05T9H7, г. Астана, Нура район",
    address_street: "Проспект Улы Дала, д. 35, НП: 9",
    whatsapp_btn: "НАПИСАТЬ В WHATSAPP",
    working_hours_title: "ВРЕМЯ РАБОТЫ",
    working_hours_weekdays: "Понедельник - Пятница: 10:00 до 19:00",
    working_hours_weekend: "Суббота - Воскресенье: 10:00 до 16:00",
    social_networks_title: "СОЦСЕТИ",
    footer_description: "Стоматология 5 звезд",
    footer_navigation: "Навигация",
    footer_social: "Мы в соцсетях",
    copyright: "© 2025 Nelly dental clinic. Все права защищены.",
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
    contacts_title: "БАЙЛАНЫС",
    contacts_subtitle: "АСТАНАДА",
    address_title: "ҰЛЫ ДАЛА 35",
    address_details: "Z05T9H7, Астана қ., Нұра ауданы",
    address_street: "Ұлы Дала даңғылы, 35 үй, НП: 9",
    whatsapp_btn: "WHATSAPP-КА ЖАЗУ",
    working_hours_title: "ЖҰМЫС УАҚЫТЫ",
    working_hours_weekdays: "Дүйсенбі - Жұма: 10:00-дан 19:00-ға дейін",
    working_hours_weekend: "Сенбі - Жексенбі: 10:00-дан 16:00-ға дейін",
    social_networks_title: "ӘЛЕУМЕТТІК ЖЕЛІЛЕР",
    footer_description: "5 жұлдызды стоматология",
    footer_navigation: "Навигация",
    footer_social: "Біз әлеуметтік желілерде",
    copyright: "© 2025 Nelly dental clinic. Барлық құқықтар қорғалған.",
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
    contacts_title: "CONTACTS",
    contacts_subtitle: "IN ASTANA",
    address_title: "ULY DALA 35",
    address_details: "Z05T9H7, Astana city, Nura district",
    address_street: "Uly Dala Avenue, 35, NP: 9",
    whatsapp_btn: "WRITE TO WHATSAPP",
    working_hours_title: "WORKING HOURS",
    working_hours_weekdays: "Monday - Friday: 10:00 to 19:00",
    working_hours_weekend: "Saturday - Sunday: 10:00 to 16:00",
    social_networks_title: "SOCIAL NETWORKS",
    footer_description: "5-star dentistry",
    footer_navigation: "Navigation",
    footer_social: "We are on social networks",
    copyright: "© 2025 Nelly dental clinic. All rights reserved.",
  },
}

// ===== ТЕКУЩИЙ ЯЗЫК =====
let currentLanguage = localStorage.getItem("language") || "ru"

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
    ru: "Контакты - Nelly dental clinic",
    kz: "Байланыс - Nelly dental clinic",
    en: "Contacts - Nelly dental clinic",
  }
  document.title = titles[currentLanguage] || titles.ru

  // Обновляем атрибут lang
  document.documentElement.lang = currentLanguage
}

function switchLanguage(lang) {
  currentLanguage = lang
  localStorage.setItem("language", lang)

  // Обновляем активные кнопки языка
  document.querySelectorAll(".lang-btn, .mobile-lang-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  document.querySelectorAll(`[data-lang="${lang}"]`).forEach((btn) => {
    btn.classList.add("active")
  })

  translatePage()
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

  // Устанавливаем активный язык при загрузке
  document.querySelectorAll(`[data-lang="${currentLanguage}"]`).forEach((btn) => {
    btn.classList.add("active")
  })
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener("DOMContentLoaded", () => {
  // Инициализируем переводы
  translatePage()

  // Инициализируем языковые переключатели
  initLanguageSwitchers()

  // Инициализируем мобильное меню
  initMobileMenu()
})

// ===== ПЕРЕВОДЫ =====
const translations_cases = {
  ru: {
    // Общие переводы
    address: "Улы Дала, 35, Город Астана",
    schedule: "Пн-Пт 10:00-19:00  Сб, Вс 10:00-16:00",
    nav_home: "ГЛАВНАЯ",
    nav_prices: "ЦЕНЫ",
    nav_cases: "КЕЙСЫ",
    nav_doctors: "ВРАЧИ",
    nav_contacts: "КОНТАКТЫ",
    nav_reviews: "ОТЗЫВЫ",
    nav_media: "МЕДИА",
    footer_description: "Стоматология 5 звезд",
    footer_navigation: "Навигация",
    footer_social: "Мы в соцсетях",
    copyright: "© 2025 Nelly dental clinic. Все права защищены.",

    // Переводы для страницы кейсов
    cases_breadcrumb: "Кейсы лечения",
    cases_title_1: "ИСТОРИИ",
    cases_title_2: "УСПЕХА", 
    cases_title_3: "наших пациентов",
    cases_subtitle: "Каждая улыбка — это уникальная история преображения. Посмотрите на реальные результаты работы наших специалистов.",
    cases_stat_1: "Успешных случаев",
    cases_stat_2: "Довольных пациентов",
    before_label: "ДО",
    after_label: "ПОСЛЕ",
    showcase_title: "Полная реконструкция улыбки",
    tag_rehabilitation: "Реабилитация",
    tag_crowns: "Коронки",
    tag_treatment: "Лечение",
    tag_therapy: "Терапия",
    tag_orthodontics: "Ортодонтия",
    tag_braces: "Брекет-система",
    tag_fillings: "Пломбы",
    tag_aesthetics: "Эстетика",
    tag_restoration: "Восстановление",
    tag_whitening: "Отбеливание",
    tag_endodontics: "Эндодонтия",
    tag_xray: "Рентген",
    tag_pediatric: "Детская",
    
    // Кейсы
    case_1_title: "Комплексное восстановление улыбки",
    case_1_description: "Пациентка обратилась в клинику с жалобами на неэстетичный вид старых реставраций и боль в одном из зубов💁🏻‍♀️<br>На первом этапе терапевтом было проведено качественное эндодонтическое лечение и полная замена реставраций.<br>Для восстановления функциональности и эстетики пациентка была направлена к врачу-ортопеду.<br>Финальный этап — установка коронок и виниров, возвращающих уверенность в улыбке🦷<br>Результат — заслуга командной работы врачей клиники: точность, согласованность и забота о каждом этапе лечения💪🏻",
    
    case_2_title: "Лечение контактного кариеса",
    case_2_description: "Пациент проходил ортодонтическое лечение, но из-за плохого ухода налёт скопился между зубами, с внутренней стороны, и развился контактный кариес.<br>Что сделали?<br>* Вылечили контактный кариес 1.1 и 2.1<br>* Местная анестезия + изоляция коффердамом<br>* Сняли дугу для качественной обработки<br>* Работа заняла 2 часа<br>* Материал: Micherium (Italy)",
    
    case_3_title: "Брекет-система: металлические лигатурные",
    case_3_description: "Пациентка обратилась на долечивание, и за это время мы уже достигли значительных улучшений! Исправление прикуса, выравнивание зубного ряда — уверенно движемся к красивой и здоровой улыбке.",
    case_3_duration: "Срок лечения: 8 месяцев",
    
    case_4_title: "Полная реконструкция улыбки",
    case_4_description: "Сложный случай:<br>Пациентка обратилась без зубов на верхней челюсти и с разрушенными зубами снизу.<br><br>🔧 Проведена большая работа:<br>• Установлено 8 имплантов сверху<br>• Подготовлено 8 нижних зубов под циркон<br>• Зафиксировано 16 коронок сверху и 8 снизу<br><br>✅ Результат — красивая, функциональная улыбка.<br>Пациентка теперь ест без дискомфорта и чувствует себя отлично!<br><br>Мы восстанавливаем не только зубы, но и уверенность 💪",
    
    case_5_title: "Восстановление жевательной поверхности",
    case_5_description: "На приёме — зуб с ранее установленной пломбой.<br>Визуально — лишь небольшое потемнение рядом с краем реставрации. Пациент не ощущает боли🤯<br>Но мы знаем: если есть хоть малейшее подозрение — лучше проверить глубже🙌🏻<br><br>После снятия старой пломбы открылась реальная картина — под ней развился глубокий кариес, который уже начал разрушать ткани😩<br><br>Аккуратно, шаг за шагом очищаем полость, сохраняя максимум здоровых тканей.<br>Работаем под коффердамом — это наша гарантия стерильности, точности и комфорта для пациента.<br><br>Результат — зуб как новый:<br>восстановлена форма, функция и естественная эстетика.<br>Даже при ближайшем рассмотрении — не скажешь, что он лечен.<br>Пациент уходит довольный и с благодарной улыбкой🤗",
    case_5_duration: "1 визит",
    
    case_6_title: "Эстетика зубов",
    case_6_description: "Пациент обратился с жалобами на внешний вид улыбки. Визуально — тёмные пятна на передних зубах.<br><br>Что выявили:<br>При осмотре диагностировали скрытые кариозные поражения, затрагивающие эстетику зоны улыбки.<br><br>Что сделали:<br>✔️ Удалили поражённые ткани<br>✔️ Провели очистку<br>✔️ Восстановили форму и цвет с помощью эстетичных реставраций<br><br>Результат:<br>Чистые, естественные, сияющие зубы — и довольный пациент с уверенной улыбкой 😁",
    
    case_7_title: "Закрытие диастемы путем реставрации композитом",
    case_7_description: "Пациент обратился с выраженной диастемой — щелью между передними зубами, которая давно вызывала дискомфорт и неуверенность.<br>🛠 Мы провели точную и аккуратную работу:<br>• Выполнена композитная реставрация без обтачивания<br>• Подобран идеальный цвет и форма под натуральные зубы<br>• Щель устранена всего за одно посещение<br><br>✅ Результат — аккуратная, естественная улыбка.<br>Пациент сразу отметил, как изменилось его восприятие себя: теперь улыбается свободно и с удовольствием.",
    
    case_8_title: "Отбеливание зубов",
    case_8_description: "Пациент обратился с пожеланием осветлить зубы — естественный цвет стал тусклым со временем из-за кофе.<br>💡 Проведено профессиональное отбеливание в клинике:<br>• Безопасная система с контролем чувствительности<br>• Один визит — до нескольких тонов светлее<br>• Эмаль не пострадала, эффект — мгновенный<br><br>✅ Результат — свежая, яркая улыбка, без искусственного \"перебела\".<br>Пациент остался доволен и отметил, что стал чаще улыбаться.<br>Отбеливание — это не только про эстетику, но и про уверенность в себе ✨",
    
    case_9_title: "Отбеливание зубов",
    case_9_description: "Мужчина обратился с желанием освежить цвет зубов — налёт от кофе и сигарет портил общий вид улыбки.<br>🦷 За одно посещение провели клиническое отбеливание:<br>• Использовали современную систему, щадящую эмаль<br>• Учитыли индивидуальную чувствительность зубов<br>• Оттенок стал светлее на 3–4 тона<br><br>✅ Результат — естественно белые зубы без «перебела».<br>Улыбка стала выразительнее, лицо — моложе.<br>Иногда достаточно одного шага, чтобы выглядеть свежее и увереннее 🔥",
    
    case_10_title: "Эндодонтическое лечение с рентген-контролем",
    case_10_description: "На данном клиническом случае представлено лечение корневого канала с обязательным рентген-контролем на этапах:<br>📍 В процессе — проводим рентген-снимок с инструментом внутри канала, чтобы точно определить длину и анатомию, избежать пропуска участков и контролировать глубину обработки.<br>📍 После — оцениваем качество пломбировки: плотность, герметичность и отсутствие пустот.<br><br>Такой подход помогает предотвратить осложнения в будущем и обеспечивает надёжный и долгосрочный результат.",
    
    case_11_title: "Механическая и медикаментозая обработка каналов",
    case_11_description: "Пациент обратился с жалобами на резкую боль и припухлость десны в области зуба.<br>После диагностики было выявлено воспаление в корневой системе. Мы провели качественную механическую и медикаментозную обработку каналов, соблюдая все современные протоколы.<br>✅ Лечение проводилось под микроскопом, что позволило точно обработать каналы даже при сложной анатомии.<br>На снимках динамика за 1 неделю. Видно положительное изменение: воспаление уходит, ткань восстанавливается.<br>Благодаря своевременному обращению и грамотному подходу, зуб удалось сохранить без удаления и имплантации.",
    
    case_12_title: "Лечение пульпита у подростка с несформированным корнем",
    case_12_description: "Сложный клинический случай, который требует высокой точности и опыта.<br>У подростков корень ещё не до конца сформирован, и стандартное лечение здесь неподходяще. Важно сохранить жизнеспособность окружающих тканей и не нарушить естественное развитие зуба.<br>✅ Работа проводилась под микроскопом это позволяет видеть мельчайшие анатомические детали, точно очистить и запломбировать каналы, не повредив незрелые структуры.",
    
    // Истории пациентов
    stories_title: "Истории наших пациентов",
    stories_subtitle: "Читайте реальные отзывы людей, которые изменили свою жизнь благодаря красивой улыбке",
    story_1_text: "\"Нужно было экстренно лечить зуб и искала ближайшую стоматологию. Очень высокий сервис, администратор, врач все очень эмпатичные люди. Вылечили очень тщательно. Цена- качество абсолютно соответствует. Плюс после лечения узнавали как самочувствие. Однозначно буду постоянным клиентом 😻\"",
    story_1_treatment: "Лечение кариеса",
    story_2_text: "\"Очень нравится доктор Нелли Ринатовна. Такое доброе сердце и золотые руки. Желаю процветания клинике. Кстати приезжаю я с Кокшетау\"",
    story_2_treatment: "Лечение кариеса",
    story_3_text: "\"Отличная стоматология. Вылечил себе здесь 10 зубов наверное, суммарно. Выбрал её после прохождения консультаций в 5 соседних клиниках. Ни разу не пожалел. Доктора настоящие профессионалы, все зубы сделали на вид как родные.\"",
    story_3_treatment: "Комплексное лечение",
    
    // CTA секция
    cta_title: "Готовы к преображению?",
    cta_subtitle: "Запишитесь на бесплатную консультацию и узнайте, как мы можем изменить вашу улыбку",
    cta_benefit_1: "Бесплатная консультация и план лечения",
    cta_benefit_2: "3D-моделирование будущей улыбки",
    cta_benefit_3: "Гарантия на все виды работ",
    cta_button: "Записаться на консультацию",
    cta_or_call: "Или позвоните:",
    tag_zirconia_crowns: "Коронки цирконевые",
    tag_emax: "E-max",
    tag_crowns_general: "Коронки",
    tag_braces_closure: "Закрытие тремы брекетами",
    tag_braces: "Брекеты",
    tag_orthodontics: "Ортодонтия",
    tag_metal_braces: "Брекет-система: металлические лигатурные",
    tag_braces_system: "Брекет-система",
  },

  kz: {
    // Общие переводы
    address: "Ұлы Дала, 35, Астана қаласы",
    schedule: "Дс-Жм 10:00-19:00  Сб, Жс 10:00-16:00",
    nav_home: "БАСТЫ БЕТ",
    nav_prices: "БАҒАЛАР",
    nav_cases: "ЖҰМЫСТАР",
    nav_doctors: "ДӘРІГЕРЛЕР",
    nav_contacts: "БАЙЛАНЫС",
    nav_reviews: "ПІКІРЛЕР",
    nav_media: "МЕДИА",
    footer_description: "5 жұлдызды стоматология",
    footer_navigation: "Навигация",
    footer_social: "Біз әлеуметтік желілерде",
    copyright: "© 2025 Nelly dental clinic. Барлық құқықтар қорғалған.",

    // Переводы для страницы кейсов
    cases_breadcrumb: "Емдеу жағдайлары",
    cases_title_1: "ТАБЫС",
    cases_title_2: "ТАРИХЫ",
    cases_title_3: "біздің пациенттердің",
    cases_subtitle: "Әрбір күлкі — бұл өзгерудің ерекше тарихы. Біздің мамандардың нақты нәтижелерін көріңіз.",
    cases_stat_1: "Табысты жағдайлар",
    cases_stat_2: "Қанағаттанған пациенттер",
    before_label: "ДЕЙІН",
    after_label: "КЕЙІН",
    showcase_title: "Күлкінің толық қайта құрылысы",
    tag_rehabilitation: "Оңалту",
    tag_crowns: "Тәждер",
    tag_treatment: "Емдеу",
    tag_therapy: "Терапия",
    tag_orthodontics: "Ортодонтия",
    tag_braces: "Брекет жүйесі",
    tag_fillings: "Пломбалар",
    tag_aesthetics: "Эстетика",
    tag_restoration: "Қалпына келтіру",
    tag_whitening: "Ағарту",
    tag_endodontics: "Эндодонтия",
    tag_xray: "Рентген",
    tag_pediatric: "Балалар",
    
    // Кейсы
    case_1_title: "Күлкінің кешенді қалпына келтірілуі",
    case_1_description: "Пациент клиникаға ескі реставрациялардың эстетикалық емес көрінісі және тістердің біреуіндегі ауырсыну туралы шағыммен жүгінді💁🏻‍♀️<br>Бірінші кезеңде терапевт сапалы эндодонтиялық емдеу және реставрацияларды толық ауыстыру жүргізді.<br>Функционалдық және эстетикалық қалпына келтіру үшін пациент ортопед дәрігерге жіберілді.<br>Соңғы кезең — күлкіге сенімділік қайтаратын тәждер мен винирлерді орнату🦷<br>Нәтиже — клиника дәрігерлерінің командалық жұмысының арқасы: дәлдік, үйлесімділік және емдеудің әрбір кезеңіне қамқорлық💪🏻",
    
    case_2_title: "Байланыс кариесін емдеу",
    case_2_description: "Пациент ортодонтиялық емдеуден өтті, бірақ нашар күтім салдарынан тістер арасында, ішкі жағынан налет жиналып, байланыс кариесі дамыды.<br>Не істедік?<br>* 1.1 және 2.1 байланыс кариесін емдедік<br>* Жергілікті анестезия + коффердаммен оқшаулау<br>* Сапалы өңдеу үшін доғаны алып тастадық<br>* Жұмыс 2 сағат уақыт алды<br>* Материал: Micherium (Italy)",
    
    case_3_title: "Брекет жүйесі: металл лигатуралы",
    case_3_description: "Пациент қосымша емдеуге жүгінді, және осы уақыт ішінде біз айтарлықтай жақсартуларға қол жеткіздік! Тістің түзетілуі, тіс қатарының тегістелуі — әдемі және дені сау күлкіге сенімді түрде жылжып жатырмыз.",
    case_3_duration: "Емдеу мерзімі: 8 ай",
    
    case_4_title: "Күлкінің толық қайта құрылысы",
    case_4_description: "Күрделі жағдай:<br>Пациент жоғарғы жақсыз тіссіз және төменгі жақтағы бүлінген тістермен жүгінді.<br><br>🔧 Үлкен жұмыс жүргізілді:<br>• Жоғарыға 8 имплант орнатылды<br>• Төменгі 8 тісті циркон астына дайындалды<br>• Жоғарыға 16 және төменгі жаққа 8 тәж бекітілді<br><br>✅ Нәтиже — әдемі, функционалды күлкі.<br>Пациент енді ыңғайсыздықсыз тамақ ішеді және өзін тамаша сезінеді!<br><br>Біз тек тістерді ғана емес, сенімділікті де қалпына келтіреміз 💪",
    
    case_5_title: "Шайнау бетінің қалпына келтірілуі",
    case_5_description: "Қабылдауда — бұрын орнатылған пломбасы бар тіс.<br>Көрнекі түрде — реставрация шетіндегі аз ғана қараю. Пациент ауырсынуды сезінбейді🤯<br>Бірақ біз білеміз: егер ең кішкентай күдік болса — тереңірек тексеру жақсы🙌🏻<br><br>Ескі пломбаны алып тастағаннан кейін нақты көрініс ашылды — астында терең кариес дамып, тіндерді бұзып бастаған😩<br><br>Ұқыпты, қадам сайын қуысты тазалаймыз, дені сау тіндердің максимумын сақтаймыз.<br>Коффердам астында жұмыс істейміз — бұл біздің стерильділік, дәлдік және пациент үшін жайлылықтың кепілдігі.<br><br>Нәтиже — тіс жаңадай:<br>пішін, функция және табиғи эстетика қалпына келтірілді.<br>Тіпті жақын қарағанда да — емделгенін айта алмайсың.<br>Пациент қанағаттанып және алғыс күлкісімен кетеді🤗",
    case_5_duration: "1 келу",
    
    case_6_title: "Тістердің эстетикасы",
    case_6_description: "Пациент күлкінің сыртқы түріне шағыммен жүгінді. Көрнекі түрде — алдыңғы тістердегі қараң дақтар.<br><br>Не анықтадық:<br>Тексеру кезінде күлкі аймағының эстетикасына әсер ететін жасырын кариозды зақымдануларды диагноздадық.<br><br>Не істедік:<br>✔️ Зақымданған тіндерді алып тастадық<br>✔️ Тазалау жүргіздік<br>✔️ Эстетикалық реставрациялар арқылы пішін мен түсті қалпына келтірдік<br><br>Нәтиже:<br>Таза, табиғи, жарқыраған тістер — және сенімді күлкісі бар қанағаттанған пациент 😁",
    
    case_7_title: "Диастеманы композитпен реставрациялау арқылы жабу",
    case_7_description: "Пациент айқын диастемамен — алдыңғы тістер арасындағы саңылаумен жүгінді, бұл ұзақ уақыт бойы ыңғайсыздық пен сенімсіздік тудырды.<br>🛠 Біз дәл және ұқыпты жұмыс жүргіздік:<br>• Тегістеусіз композитті реставрация орындалды<br>• Табиғи тістерге сәйкес мінсіз түс пен пішін таңдалды<br>• Саңылау бір ғана келуде жойылды<br><br>✅ Нәтиже — ұқыпты, табиғи күлкі.<br>Пациент өзінің өзін қабылдауы қалай өзгергенін бірден атап өтті: енді еркін және ләззатпен күледі.",
    
    case_8_title: "Тістерді ағарту",
    case_8_description: "Пациент тістерді ашу тілегімен жүгінді — табиғи түс уақыт өте келе кофе салдарынан күңгірт болды.<br>💡 Клиникада кәсіби ағарту жүргізілді:<br>• Сезімталдықты бақылаумен қауіпсіз жүйе<br>• Бір келу — бірнеше тон ашық<br>• Эмаль зақымданбады, әсер — лезде<br><br>✅ Нәтиже — жаңа, жарқын күлкі, жасанды \"ақтықсыз\".<br>Пациент қанағаттанды және жиі күлетінін атап өтті.<br>Ағарту — бұл тек эстетика туралы ғана емес, сонымен қатар өзіне сенімділік туралы ✨",
    
    case_9_title: "Тістерді ағарту",
    case_9_description: "Ер адам тістердің түсін жаңарту тілегімен жүгінді — кофе мен темекіден налет күлкінің жалпы түрін бұзды.<br>🦷 Бір келуде клиникалық ағарту жүргізілді:<br>• Эмальды аялайтын заманауи жүйені қолдандық<br>• Тістердің жеке сезімталдығын ескердік<br>• Реңк 3-4 тонға ашық болды<br><br>✅ Нәтиже — \"ақтықсыз\" табиғи ақ тістер.<br>Күлкі айқынырақ, бет — жасырақ болды.<br>Кейде жаңа және сенімді көрінуге бір қадам жеткілікті 🔥",
    
    case_10_title: "Рентген бақылауымен эндодонтиялық емдеу",
    case_10_description: "Бұл клиникалық жағдайда кезеңдерде міндетті рентген бақылауымен тамыр арнасын емдеу ұсынылған:<br>📍 Процесте — арна ішіндегі құралмен рентген суретін түсіреміз, ұзындық пен анатомияны дәл анықтау, учаскелерді өткізіп алмау және өңдеу тереңдігін бақылау үшін.<br>📍 Кейін — пломбалау сапасын бағалаймыз: тығыздық, герметикалық және бос орындардың жоқтығы.<br><br>Мұндай тәсіл болашақта асқынуларды болдырмауға көмектеседі және сенімді және ұзақ мерзімді нәтижені қамтамасыз етеді.",
    
    case_11_title: "Арналардың механикалық және дәрілік өңделуі",
    case_11_description: "Пациент тіс аймағындағы қызыл ауырсыну және қызыл ісінуге шағыммен жүгінді.<br>Диагностикадан кейін тамыр жүйесінде қабыну анықталды. Біз барлық заманауи хаттамаларды сақтай отырып, арналардың сапалы механикалық және дәрілік өңделуін жүргіздік.<br>✅ Емдеу микроскоп астында жүргізілді, бұл күрделі анатомия кезінде де арналарды дәл өңдеуге мүмкіндік берді.<br>Суреттерде 1 аптаға арналған динамика. Оң өзгеріс көрінеді: қабыну кетеді, тін қалпына келеді.<br>Уақтылы жүгіну және сауатты тәсіл арқасында тісті алып тастамай және имплантациясыз сақтауға мүмкіндік болды.",
    
    case_12_title: "Қалыптаспаған тамыры бар жасөспірімде пульпитті емдеу",
    case_12_description: "Жоғары дәлдік пен тәжірибе талап ететін күрделі клиникалық жағдай.<br>Жасөспірімдерде тамыр әлі толық қалыптаспаған, және стандартты емдеу мұнда жарамсыз. Қоршаған тіндердің өмір сүру қабілетін сақтау және тістің табиғи дамуын бұзбау маңызды.<br>✅ Жұмыс микроскоп астында жүргізілді, бұл ең кішкентай анатомиялық бөлшектерді көруге, жетілмеген құрылымдарды зақымдамай арналарды дәл тазалауға және пломбалауға мүмкіндік береді.",
    
    // Истории пациентов
    stories_title: "Біздің пациенттердің тарихы",
    stories_subtitle: "Әдемі күлкі арқасында өз өмірін өзгерткен адамдардың нақты пікірлерін оқыңыз",
    story_1_text: "\"Тісті шұғыл емдеу керек болды және ең жақын стоматологияны іздедім. Өте жоғары сервис, әкімші, дәрігер барлығы өте эмпатиялы адамдар. Өте мұқият емдеді. Баға-сапа мүлдем сәйкес келеді. Сонымен қатар емдеуден кейін жағдайды сұрады. Міндетті түрде тұрақты клиент боламын 😻\"",
    story_1_treatment: "Кариесті емдеу",
    story_2_text: "\"Дәрігер Нелли Ринатовна өте ұнайды. Мұндай мейірімді жүрек пен алтын қолдар. Клиникаға гүлденуді тілеймін. Айтпақшы, мен Көкшетауден келемін\"",
    story_2_treatment: "Кариесті емдеу",
    story_3_text: "\"Тамаша стоматология. Мұнда өзіме 10 тісті емдеттім шамамен, жалпы алғанда. Оны 5 көрші клиникада кеңес алғаннан кейін таңдадым. Ешқашан өкінбедім. Дәрігерлер нағыз кәсіпқойлар, барлық тістерді туған сияқты жасады.\"",
    story_3_treatment: "Кешенді емдеу",
    
    // CTA секция
    cta_title: "Өзгеруге дайынсыз ба?",
    cta_subtitle: "Тегін кеңесуге жазылыңыз және біз сіздің күлкіңізді қалай өзгерте алатынымызды біліңіз",
    cta_benefit_1: "Тегін кеңес және емдеу жоспары",
    cta_benefit_2: "Болашақ күлкінің 3D-модельдеуі",
    cta_benefit_3: "Барлық жұмыс түрлеріне кепілдік",
    cta_button: "Кеңесуге жазылу",
    cta_or_call: "Немесе телефон шалыңыз:",
    tag_zirconia_crowns: "Циркон тәждері",
    tag_emax: "E-max",
    tag_crowns_general: "Тәждер",
    tag_braces_closure: "Брекеттермен тремманы жабу",
    tag_braces: "Брекеттер",
    tag_orthodontics: "Ортодонтия",
    tag_metal_braces: "Брекет жүйесі: металл лигатуралы",
    tag_braces_system: "Брекет жүйесі",
  },

  en: {
    // Общие переводы
    address: "Uly Dala, 35, Astana City",
    schedule: "Mon-Fri 10:00-19:00  Sat, Sun 10:00-16:00",
    nav_home: "HOME",
    nav_prices: "PRICES",
    nav_cases: "CASES",
    nav_doctors: "DOCTORS",
    nav_contacts: "CONTACTS",
    nav_reviews: "REVIEWS",
    nav_media: "MEDIA",
    footer_description: "5-star dentistry",
    footer_navigation: "Navigation",
    footer_social: "We are on social networks",
    copyright: "© 2025 Nelly dental clinic. All rights reserved.",

    // Переводы для страницы кейсов
    cases_breadcrumb: "Treatment Cases",
    cases_title_1: "SUCCESS",
    cases_title_2: "STORIES",
    cases_title_3: "of our patients",
    cases_subtitle: "Every smile is a unique transformation story. See the real results of our specialists' work.",
    cases_stat_1: "Successful cases",
    cases_stat_2: "Satisfied patients",
    before_label: "BEFORE",
    after_label: "AFTER",
    showcase_title: "Complete smile reconstruction",
    tag_rehabilitation: "Rehabilitation",
    tag_crowns: "Crowns",
    tag_treatment: "Treatment",
    tag_therapy: "Therapy",
    tag_orthodontics: "Orthodontics",
    tag_braces: "Braces system",
    tag_fillings: "Fillings",
    tag_aesthetics: "Aesthetics",
    tag_restoration: "Restoration",
    tag_whitening: "Whitening",
    tag_endodontics: "Endodontics",
    tag_xray: "X-ray",
    tag_pediatric: "Pediatric",
    
    // Кейсы
    case_1_title: "Comprehensive smile restoration",
    case_1_description: "The patient came to the clinic with complaints about the unaesthetic appearance of old restorations and pain in one of the teeth💁🏻‍♀️<br>At the first stage, the therapist performed high-quality endodontic treatment and complete replacement of restorations.<br>To restore functionality and aesthetics, the patient was referred to an orthopedic doctor.<br>The final stage is the installation of crowns and veneers that restore confidence in the smile🦷<br>The result is the merit of the clinic doctors' teamwork: precision, coordination and care for each stage of treatment💪🏻",
    
    case_2_title: "Contact caries treatment",
    case_2_description: "The patient was undergoing orthodontic treatment, but due to poor care, plaque accumulated between the teeth, on the inner side, and contact caries developed.<br>What we did?<br>* Treated contact caries 1.1 and 2.1<br>* Local anesthesia + rubber dam isolation<br>* Removed the arch for quality processing<br>* Work took 2 hours<br>* Material: Micherium (Italy)",
    
    case_3_title: "Braces system: metal ligature",
    case_3_description: "The patient came for additional treatment, and during this time we have already achieved significant improvements! Bite correction, alignment of the dental row - we are confidently moving towards a beautiful and healthy smile.",
    case_3_duration: "Treatment period: 8 months",
    
    case_4_title: "Complete smile reconstruction",
    case_4_description: "Complex case:<br>The patient came without teeth on the upper jaw and with destroyed teeth below.<br><br>🔧 Great work was done:<br>• 8 implants installed on top<br>• 8 lower teeth prepared for zirconia<br>• 16 crowns fixed on top and 8 below<br><br>✅ Result - beautiful, functional smile.<br>The patient now eats without discomfort and feels great!<br><br>We restore not only teeth, but also confidence 💪",
    
    case_5_title: "Chewing surface restoration",
    case_5_description: "At the appointment - a tooth with a previously installed filling.<br>Visually - only a slight darkening near the edge of the restoration. The patient does not feel pain🤯<br>But we know: if there is even the slightest suspicion - it's better to check deeper🙌🏻<br><br>After removing the old filling, the real picture opened up - deep caries developed under it, which had already begun to destroy tissues😩<br><br>Carefully, step by step, we clean the cavity, preserving the maximum of healthy tissues.<br>We work under a rubber dam - this is our guarantee of sterility, precision and comfort for the patient.<br><br>Result - the tooth is like new:<br>shape, function and natural aesthetics are restored.<br>Even upon close examination - you can't tell it's been treated.<br>The patient leaves satisfied and with a grateful smile🤗",
    case_5_duration: "1 visit",
    
    case_6_title: "Dental aesthetics",
    case_6_description: "The patient complained about the appearance of the smile. Visually - dark spots on the front teeth.<br><br>What we found:<br>During examination, we diagnosed hidden carious lesions affecting the aesthetics of the smile zone.<br><br>What we did:<br>✔️ Removed affected tissues<br>✔️ Performed cleaning<br>✔️ Restored shape and color using aesthetic restorations<br><br>Result:<br>Clean, natural, shining teeth - and a satisfied patient with a confident smile 😁",
    
    case_7_title: "Diastema closure by composite restoration",
    case_7_description: "The patient came with a pronounced diastema - a gap between the front teeth, which had long caused discomfort and insecurity.<br>🛠 We performed precise and careful work:<br>• Composite restoration performed without grinding<br>• Perfect color and shape selected to match natural teeth<br>• Gap eliminated in just one visit<br><br>✅ Result - neat, natural smile.<br>The patient immediately noted how his self-perception changed: now he smiles freely and with pleasure.",
    
    case_8_title: "Teeth whitening",
    case_8_description: "The patient came with a desire to lighten teeth - the natural color became dull over time due to coffee.<br>💡 Professional whitening was performed in the clinic:<br>• Safe system with sensitivity control<br>• One visit - up to several tones lighter<br>• Enamel was not damaged, effect - instant<br><br>✅ Result - fresh, bright smile, without artificial \"over-whitening\".<br>The patient was satisfied and noted that he began to smile more often.<br>Whitening is not only about aesthetics, but also about self-confidence ✨",
    
    case_9_title: "Teeth whitening",
    case_9_description: "A man came with a desire to refresh the color of his teeth - plaque from coffee and cigarettes spoiled the overall appearance of his smile.<br>🦷 Clinical whitening was performed in one visit:<br>• Used a modern system that spares enamel<br>• Took into account individual tooth sensitivity<br>• Shade became 3-4 tones lighter<br><br>✅ Result - naturally white teeth without \"over-whitening\".<br>The smile became more expressive, the face - younger.<br>Sometimes one step is enough to look fresher and more confident 🔥",
    
    case_10_title: "Endodontic treatment with X-ray control",
    case_10_description: "This clinical case presents root canal treatment with mandatory X-ray control at stages:<br>📍 In process - we take an X-ray with the instrument inside the canal to accurately determine length and anatomy, avoid missing areas and control processing depth.<br>📍 After - we evaluate the quality of filling: density, tightness and absence of voids.<br><br>This approach helps prevent complications in the future and ensures reliable and long-term results.",
    
    case_11_title: "Mechanical and medicamental canal processing",
    case_11_description: "The patient complained of sharp pain and gum swelling in the tooth area.<br>After diagnosis, inflammation in the root system was detected. We performed high-quality mechanical and medicamental canal processing, following all modern protocols.<br>✅ Treatment was performed under a microscope, which allowed precise canal processing even with complex anatomy.<br>The images show dynamics over 1 week. Positive change is visible: inflammation goes away, tissue recovers.<br>Thanks to timely treatment and competent approach, the tooth was saved without extraction and implantation.",
    
    case_12_title: "Pulpitis treatment in adolescent with unformed root",
    case_12_description: "A complex clinical case that requires high precision and experience.<br>In adolescents, the root is not yet fully formed, and standard treatment is not suitable here. It's important to preserve the viability of surrounding tissues and not disrupt the natural development of the tooth.<br>✅ Work was performed under a microscope, which allows seeing the smallest anatomical details, precisely cleaning and filling canals without damaging immature structures.",
    
    // Истории пациентов
    stories_title: "Our patients' stories",
    stories_subtitle: "Read real reviews from people who changed their lives thanks to a beautiful smile",
    story_1_text: "\"I needed urgent dental treatment and was looking for the nearest dentistry. Very high service, administrator, doctor are all very empathetic people. They treated very carefully. Price-quality absolutely matches. Plus, after treatment they asked about well-being. I will definitely be a regular client 😻\"",
    story_1_treatment: "Caries treatment",
    story_2_text: "\"I really like Dr. Nelly Rinatovna. Such a kind heart and golden hands. I wish prosperity to the clinic. By the way, I come from Kokshetau\"",
    story_2_treatment: "Caries treatment",
    story_3_text: "\"Excellent dentistry. I treated about 10 teeth here, in total. I chose it after consultations in 5 neighboring clinics. Never regretted it. The doctors are real professionals, all teeth were made to look like native ones.\"",
    story_3_treatment: "Complex treatment",
    
    // CTA секция
    cta_title: "Ready for transformation?",
    cta_subtitle: "Book a free consultation and find out how we can change your smile",
    cta_benefit_1: "Free consultation and treatment plan",
    cta_benefit_2: "3D modeling of future smile",
    cta_benefit_3: "Guarantee for all types of work",
    cta_button: "Book consultation",
    cta_or_call: "Or call:",
    tag_zirconia_crowns: "Zirconia crowns",
    tag_emax: "E-max",
    tag_crowns_general: "Crowns",
    tag_braces_closure: "Gap closure with braces",
    tag_braces: "Braces",
    tag_orthodontics: "Orthodontics",
    tag_metal_braces: "Braces system: metal ligature",
    tag_braces_system: "Braces system",
  },
}

// ===== ТЕКУЩИЙ ЯЗЫК =====
let currentLanguage_cases = localStorage.getItem("language") || "ru"

// ===== СИСТЕМА ПЕРЕВОДОВ =====
function translatePage() {
  const elements = document.querySelectorAll("[data-translate]")
  elements.forEach((element) => {
    const key = element.getAttribute("data-translate")
    if (translations_cases[currentLanguage_cases] && translations_cases[currentLanguage_cases][key]) {
      // Для элементов с HTML содержимым используем innerHTML
      if (key.includes('description') || key.includes('text')) {
        element.innerHTML = translations_cases[currentLanguage_cases][key]
      } else {
        element.textContent = translations_cases[currentLanguage_cases][key]
      }
    }
  })

  // Обновляем заголовок страницы
  const titles = {
    ru: "Кейсы - Nelly dental clinic",
    kz: "Жағдайлар - Nelly dental clinic",
    en: "Cases - Nelly dental clinic",
  }
  document.title = titles[currentLanguage_cases] || titles.ru

  // Обновляем атрибут lang
  document.documentElement.lang = currentLanguage_cases

  // Обновляем data-text атрибуты для анимированных заголовков
  const titleWords = document.querySelectorAll('.title-word[data-text]')
  titleWords.forEach(word => {
    const key = word.getAttribute('data-translate')
    if (key && translations_cases[currentLanguage_cases] && translations_cases[currentLanguage_cases][key]) {
      word.setAttribute('data-text', translations_cases[currentLanguage_cases][key])
    }
  })
}

function switchLanguage(lang) {
  currentLanguage_cases = lang
  localStorage.setItem("language", lang)

  // Обновляем активные кнопки языка
  document.querySelectorAll(".lang-btn, .mobile-lang-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  document.querySelectorAll(`[data-lang="${lang}"]`).forEach((btn) => {
    btn.classList.add("active")
  })

  translatePage()
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

  // Устанавливаем активный язык при загрузке
  document.querySelectorAll(`[data-lang="${currentLanguage_cases}"]`).forEach((btn) => {
    btn.classList.add("active")
  })
}

// ===== АНИМАЦИЯ СЧЕТЧИКОВ =====
function initCounterAnimation() {
  const counters = document.querySelectorAll('.stat-beautiful[data-count]')
  
  const animateCounter = (counter) => {
    const target = parseInt(counter.getAttribute('data-count'))
    const numberElement = counter.querySelector('.stat-number')
    const duration = 2000 // 2 секунды
    const step = target / (duration / 16) // 60 FPS
    let current = 0
    
    const timer = setInterval(() => {
      current += step
      if (current >= target) {
        current = target
        clearInterval(timer)
      }
      
      if (target === 98) {
        numberElement.textContent = Math.floor(current) + '%'
      } else {
        numberElement.textContent = Math.floor(current) + '+'
      }
    }, 16)
  }
  
  // Intersection Observer для запуска анимации при появлении в viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target)
        observer.unobserve(entry.target)
      }
    })
  })
  
  counters.forEach(counter => observer.observe(counter))
}

// ===== СЛАЙДЕРЫ ДО/ПОСЛЕ =====
function initBeforeAfterSliders() {
  const sliders = document.querySelectorAll('.before-after-slider')
  
  sliders.forEach(slider => {
    const handle = slider.querySelector('.slider-handle')
    const afterImg = slider.querySelector('.after-img')
    
    if (!handle || !afterImg) return
    
    let isDragging = false
    
    const updateSlider = (x) => {
      const rect = slider.getBoundingClientRect()
      const position = Math.max(0, Math.min(1, (x - rect.left) / rect.width))
      
      afterImg.style.clipPath = `inset(0 ${100 - position * 100}% 0 0)`
      handle.style.left = `${position * 100}%`
    }
    
    // Mouse events
    handle.addEventListener('mousedown', (e) => {
      isDragging = true
      e.preventDefault()
    })
    
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        updateSlider(e.clientX)
      }
    })
    
    document.addEventListener('mouseup', () => {
      isDragging = false
    })
    
    // Touch events
    handle.addEventListener('touchstart', (e) => {
      isDragging = true
      e.preventDefault()
    })
    
    document.addEventListener('touchmove', (e) => {
      if (isDragging) {
        updateSlider(e.touches[0].clientX)
      }
    })
    
    document.addEventListener('touchend', () => {
      isDragging = false
    })
    
    // Click on slider
    slider.addEventListener('click', (e) => {
      if (e.target !== handle) {
        updateSlider(e.clientX)
      }
    })
    
    // Initialize at 50%
    updateSlider(slider.getBoundingClientRect().left + slider.getBoundingClientRect().width / 2)
  })
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener("DOMContentLoaded", () => {
  // Инициализируем переводы
  translatePage()

  // Инициализируем языковые переключатели
  initLanguageSwitchers()

  // Инициализируем мобильное меню
  initMobileMenu()

  // Инициализируем анимацию счетчиков
  initCounterAnimation()

  // Инициализируем слайдеры до/после
  initBeforeAfterSliders()
})

// ===== ПЛАВНАЯ ПРОКРУТКА =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute('href'))
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  })
})
