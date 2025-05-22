"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ReplaceIcon as SwapIcon, CopyIcon, VolumeIcon } from "lucide-react"
import { translateText, detectLanguage } from "@/lib/translation-service"

const MAX_CHARS = 5000

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
]

export default function TranslatorApp() {
  const [sourceText, setSourceText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [sourceLanguage, setSourceLanguage] = useState("auto")
  const [targetLanguage, setTargetLanguage] = useState("en")
  const [activeTab, setActiveTab] = useState("text")
  const [isTranslating, setIsTranslating] = useState(false)
  const [detectedLanguage, setDetectedLanguage] = useState("")
  const translationTimeoutRef = useRef(null)

  // Handle text input and trigger translation after a delay
  const handleTextChange = (text) => {
    if (text.length <= MAX_CHARS) {
      setSourceText(text)

      // Clear previous timeout
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current)
      }

      // Set new timeout to translate after typing stops
      if (text) {
        translationTimeoutRef.current = setTimeout(() => {
          handleTranslate(text)
        }, 1000)
      } else {
        setTranslatedText("")
      }
    }
  }

  // Swap languages
  const handleSwapLanguages = () => {
    if (sourceLanguage !== "auto") {
      const temp = sourceLanguage
      setSourceLanguage(targetLanguage)
      setTargetLanguage(temp)
      setSourceText(translatedText)
      setTranslatedText(sourceText)
    }
  }

  // Copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Could add a toast notification here
        console.log("Text copied to clipboard")
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err)
      })
  }

  // Text-to-speech function
  const speakText = (text, lang) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      window.speechSynthesis.speak(utterance)
    }
  }

  // Handle translation
  const handleTranslate = async (text = sourceText) => {
    if (!text || targetLanguage === sourceLanguage) return

    setIsTranslating(true)

    try {
      // If language is set to auto, detect it first
      let sourceLang = sourceLanguage
      if (sourceLang === "auto") {
        const detected = await detectLanguage(text)
        sourceLang = detected
        setDetectedLanguage(detected)
      }

      const result = await translateText(text, sourceLang, targetLanguage)
      setTranslatedText(result)
    } catch (error) {
      console.error("Translation error:", error)
      setTranslatedText("Translation error occurred")
    } finally {
      setIsTranslating(false)
    }
  }

  // Clear previous timeout on unmount
  useEffect(() => {
    return () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="w-full max-w-5xl">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">Language Translator</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 md:w-[400px]">
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="websites">Websites</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Source Language Section */}
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Detect language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Detect language</SelectItem>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {detectedLanguage && sourceLanguage === "auto" && (
                    <span className="text-sm text-muted-foreground">
                      Detected: {languages.find((l) => l.code === detectedLanguage)?.name || detectedLanguage}
                    </span>
                  )}
                </div>

                <Textarea
                  placeholder="Enter text to translate"
                  className="min-h-[200px] resize-none"
                  value={sourceText}
                  onChange={(e) => handleTextChange(e.target.value)}
                />

                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-muted-foreground">
                    {sourceText.length} / {MAX_CHARS}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        sourceText && speakText(sourceText, sourceLanguage === "auto" ? "en" : sourceLanguage)
                      }
                      disabled={!sourceText}
                    >
                      <VolumeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(sourceText)}
                      disabled={!sourceText}
                    >
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setSourceText("")} disabled={!sourceText}>
                      <span className="text-xs">✕</span>
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Target Language Section */}
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSwapLanguages}
                      className="ml-2"
                      disabled={sourceLanguage === "auto"}
                    >
                      <SwapIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="min-h-[200px] bg-muted/30 rounded-md p-3 relative">
                  {isTranslating ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-pulse">Translating...</div>
                    </div>
                  ) : (
                    <div>{translatedText || "Translation will appear here"}</div>
                  )}
                </div>

                <div className="flex justify-end items-center mt-2">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => translatedText && speakText(translatedText, targetLanguage)}
                      disabled={!translatedText}
                    >
                      <VolumeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(translatedText)}
                      disabled={!translatedText}
                    >
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <Card className="p-6 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <p className="text-muted-foreground">Document translation feature coming soon</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="mt-4">
            <Card className="p-6 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <p className="text-muted-foreground">Image translation feature coming soon</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="websites" className="mt-4">
            <Card className="p-6 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <p className="text-muted-foreground">Website translation feature coming soon</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
