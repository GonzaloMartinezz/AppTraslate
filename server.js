const express = require("express")
const cors = require("cors")
const path = require("path")
const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))

// Mock translation service
const translateText = async (text, sourceLanguage, targetLanguage) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // In a real app, you would call a translation API here
  // For demo purposes, we'll just append some text based on the target language

  // If source and target are the same, return the original text
  if (sourceLanguage === targetLanguage) {
    return text
  }

  // Simple mock translations for demonstration
  const mockTranslations = {
    en: {
      es: "Traducción al español: ",
      fr: "Traduction en français: ",
      de: "Deutsche Übersetzung: ",
    },
    es: {
      en: "English translation: ",
      fr: "Traduction en français: ",
      de: "Deutsche Übersetzung: ",
    },
    fr: {
      en: "English translation: ",
      es: "Traducción al español: ",
      de: "Deutsche Übersetzung: ",
    },
    de: {
      en: "English translation: ",
      es: "Traducción al español: ",
      fr: "Traduction en français: ",
    },
  }

  // Get the appropriate prefix based on source and target languages
  const prefix = mockTranslations[sourceLanguage]?.[targetLanguage] || ""

  // In a real app, this would be the actual translated text from an API
  return `${prefix}${text}`
}

// Mock language detection
const detectLanguage = async (text) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Simple detection based on common words
  // This is just for demonstration - a real app would use a proper API
  const lowerText = text.toLowerCase()

  if (/\b(the|is|and|in|to|have)\b/.test(lowerText)) return "en"
  if (/\b(el|la|los|las|es|y|en|de)\b/.test(lowerText)) return "es"
  if (/\b(le|la|les|et|en|dans|je|tu|il)\b/.test(lowerText)) return "fr"
  if (/\b(der|die|das|und|in|zu|ich|du|er)\b/.test(lowerText)) return "de"

  // Default to English if no match
  return "en"
}

// API Routes
app.post("/api/translate", async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body

    if (!text || !targetLanguage) {
      return res.status(400).json({ error: "Missing required parameters" })
    }

    let sourceLang = sourceLanguage

    // Detect language if set to auto
    if (sourceLang === "auto") {
      sourceLang = await detectLanguage(text)
    }

    const translatedText = await translateText(text, sourceLang, targetLanguage)

    res.json({
      translatedText,
      detectedLanguage: sourceLang === sourceLanguage ? null : sourceLang,
    })
  } catch (error) {
    console.error("Translation error:", error)
    res.status(500).json({ error: "Translation failed" })
  }
})

app.post("/api/detect", async (req, res) => {
  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ error: "Missing text parameter" })
    }

    const detectedLanguage = await detectLanguage(text)

    res.json({ detectedLanguage })
  } catch (error) {
    console.error("Language detection error:", error)
    res.status(500).json({ error: "Language detection failed" })
  }
})

// Serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Open http://localhost:${PORT} in your browser`)
})

// Using Google Translate API
const translateText = async (text, sourceLanguage, targetLanguage) => {
  const { Translate } = require('@google-cloud/translate').v2;
  
  // Your Google Cloud credentials
  const translate = new Translate({
    projectId: 'your-project-id',
    keyFilename: 'path/to/your/credentials.json'
  });
  
  const options = {
    from: sourceLanguage === 'auto' ? '' : sourceLanguage,
    to: targetLanguage
  };
  
  try {
    const [translation] = await translate.translate(text, options);
    return translation;
  } catch (error) {
    console.error('Error with Google Translate API:', error);
    throw error;
  }
};

