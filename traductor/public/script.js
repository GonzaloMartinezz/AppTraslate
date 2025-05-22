document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const sourceText = document.getElementById("source-text")
  const sourceLanguage = document.getElementById("source-language")
  const targetLanguage = document.getElementById("target-language")
  const detectedLanguageEl = document.getElementById("detected-language")
  const charCount = document.getElementById("char-count")
  const translationPlaceholder = document.getElementById("translation-placeholder")
  const translationText = document.getElementById("translation-text")
  const translationLoading = document.getElementById("translation-loading")
  const swapLanguagesBtn = document.getElementById("swap-languages")
  const speakSourceBtn = document.getElementById("speak-source")
  const speakTargetBtn = document.getElementById("speak-target")
  const copySourceBtn = document.getElementById("copy-source")
  const copyTargetBtn = document.getElementById("copy-target")
  const clearSourceBtn = document.getElementById("clear-source")
  const tabButtons = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  // Variables
  let translationTimeout = null
  const MAX_CHARS = 5000

  // Tab functionality
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.getAttribute("data-tab")

      // Update active tab button
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      button.classList.add("active")

      // Show active tab content
      tabContents.forEach((content) => content.classList.remove("active"))
      document.getElementById(`${tabName}-tab`).classList.add("active")
    })
  })

  // Update character count
  sourceText.addEventListener("input", () => {
    const text = sourceText.value
    charCount.textContent = text.length

    // Clear previous timeout
    if (translationTimeout) {
      clearTimeout(translationTimeout)
    }

    // Set new timeout to translate after typing stops
    if (text) {
      translationTimeout = setTimeout(() => {
        translateText(text)
      }, 1000)
    } else {
      // Clear translation if input is empty
      showTranslationPlaceholder()
      detectedLanguageEl.textContent = ""
    }
  })

  // Swap languages
  swapLanguagesBtn.addEventListener("click", () => {
    if (sourceLanguage.value !== "auto") {
      const tempLang = sourceLanguage.value
      sourceLanguage.value = targetLanguage.value
      targetLanguage.value = tempLang

      // Swap text if there's a translation
      if (translationText.textContent && !translationText.classList.contains("hidden")) {
        sourceText.value = translationText.textContent
        charCount.textContent = sourceText.value.length
        translateText(sourceText.value)
      }
    }
  })

  // Update swap button state
  sourceLanguage.addEventListener("change", () => {
    swapLanguagesBtn.disabled = sourceLanguage.value === "auto"
    if (sourceText.value) {
      translateText(sourceText.value)
    }
  })

  // Update translation when target language changes
  targetLanguage.addEventListener("change", () => {
    if (sourceText.value) {
      translateText(sourceText.value)
    }
  })

  // Text-to-speech for source text
  speakSourceBtn.addEventListener("click", () => {
    if (sourceText.value) {
      speakText(sourceText.value, sourceLanguage.value === "auto" ? "en" : sourceLanguage.value)
    }
  })

  // Text-to-speech for translated text
  speakTargetBtn.addEventListener("click", () => {
    if (translationText.textContent) {
      speakText(translationText.textContent, targetLanguage.value)
    }
  })

  // Copy source text
  copySourceBtn.addEventListener("click", () => {
    if (sourceText.value) {
      copyToClipboard(sourceText.value)
      showCopiedFeedback(copySourceBtn)
    }
  })

  // Copy translated text
  copyTargetBtn.addEventListener("click", () => {
    if (translationText.textContent) {
      copyToClipboard(translationText.textContent)
      showCopiedFeedback(copyTargetBtn)
    }
  })

  // Clear source text
  clearSourceBtn.addEventListener("click", () => {
    sourceText.value = ""
    charCount.textContent = "0"
    showTranslationPlaceholder()
    detectedLanguageEl.textContent = ""
  })

  // Translation function
  async function translateText(text) {
    if (!text || (targetLanguage.value === sourceLanguage.value && sourceLanguage.value !== "auto")) {
      return
    }

    showTranslationLoading()

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          sourceLanguage: sourceLanguage.value,
          targetLanguage: targetLanguage.value,
        }),
      })

      if (!response.ok) {
        throw new Error("Translation failed")
      }

      const data = await response.json()

      // Update translation
      translationText.textContent = data.translatedText
      showTranslationText()

      // Update detected language if applicable
      if (data.detectedLanguage && sourceLanguage.value === "auto") {
        const languageName = getLanguageName(data.detectedLanguage)
        detectedLanguageEl.textContent = `Detected: ${languageName}`
      } else {
        detectedLanguageEl.textContent = ""
      }

      // Enable buttons
      speakTargetBtn.disabled = false
      copyTargetBtn.disabled = false
    } catch (error) {
      console.error("Translation error:", error)
      translationText.textContent = "Translation error occurred"
      showTranslationText()
    }
  }

  // Helper functions
  function showTranslationPlaceholder() {
    translationPlaceholder.classList.remove("hidden")
    translationText.classList.add("hidden")
    translationLoading.classList.add("hidden")
    speakTargetBtn.disabled = true
    copyTargetBtn.disabled = true
  }

  function showTranslationText() {
    translationPlaceholder.classList.add("hidden")
    translationText.classList.remove("hidden")
    translationLoading.classList.add("hidden")
  }

  function showTranslationLoading() {
    translationPlaceholder.classList.add("hidden")
    translationText.classList.add("hidden")
    translationLoading.classList.remove("hidden")
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch((err) => console.error("Failed to copy text: ", err))
  }

  function showCopiedFeedback(button) {
    const originalIcon = button.innerHTML
    button.innerHTML = '<i class="fas fa-check"></i>'

    setTimeout(() => {
      button.innerHTML = originalIcon
    }, 1500)
  }

  function speakText(text, lang) {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      window.speechSynthesis.speak(utterance)
    }
  }

  function getLanguageName(code) {
    const languages = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ru: "Russian",
      zh: "Chinese",
      ja: "Japanese",
      ko: "Korean",
      ar: "Arabic",
    }

    return languages[code] || code
  }

  // Initialize
  showTranslationPlaceholder()
  speakTargetBtn.disabled = true
  copyTargetBtn.disabled = true
})
