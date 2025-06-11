
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data based on the JSON structure provided
const tajweedData = {
  title: "Comprehensive Guide to Tajweed Rules",
  description: "A collection of Tajweed rules compiled from 'QARI Tajweed Basics', 'Reach the Goal Via Tajweed Rules', and 'Advanced Tajweed' resources.",
  categories: [
    {
      category_name_en: "Foundations of Recitation",
      category_name_ar: "أُسُس التلاوة",
      rules: [
        {
          name_en: "Al-Isti'adha & Al-Basmalah",
          name_ar: "الإِسْتِعَاذَة والبَسْمَلَة",
          description: "The opening phrases of a Qur'an recitation session.",
          parts: [
            {
              name_en: "Al-Isti'adha",
              name_ar: "الإِسْتِعَاذَة",
              arabic_text: "أَعُوذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
              transliteration: "A'udhu billahi min-ash-shaytan-ir-rajeem",
              ruling_description: "Recited once at the very beginning of a recitation session to seek refuge in Allah from the cursed Satan."
            },
            {
              name_en: "Al-Basmalah",
              name_ar: "البَسْمَلَة",
              arabic_text: "بِسْمِ اللهِ الرَّحْمَٰنِ الرَّحِيمِ",
              transliteration: "Bismillah-ir-Rahman-ir-Raheem",
              ruling_description: "Recited at the beginning of every Surah, except for Surah At-Tawbah."
            }
          ]
        }
      ]
    },
    {
      category_name_en: "Rules of Ghunnah",
      category_name_ar: "أحكام الغنة",
      description: "Ghunnah is a nasal sound produced from the nasal cavity.",
      rules: [
        {
          name_en: "Noon and Meem Mushaddad",
          name_ar: "النون والميم المشددتين",
          meaning_en: "Noon/Meem with a Shaddah",
          ruling_description: "If a Meem (مّ) or Noon (نّ) has a shaddah, the reader must produce a Ghunnah (nasal sound) for a duration of two counts.",
          letters: [
            { ar: "نّ", en: "nn" },
            { ar: "مّ", en: "mm" }
          ],
          examples: [
            { arabic_text: "إِنَّ", transliteration: "inna" },
            { arabic_text: "عَمَّ", transliteration: "amma" }
          ]
        }
      ]
    }
  ]
};

export const TajweedLearning = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return tajweedData.categories;

    return tajweedData.categories.filter(category =>
      category.category_name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.category_name_ar.includes(searchTerm) ||
      category.rules.some(rule =>
        rule.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.name_ar.includes(searchTerm) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search Tajweed rules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {filteredCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">{category.category_name_en}</h2>
              <p className="text-xl text-blue-600 font-arabic">{category.category_name_ar}</p>
              {category.description && (
                <p className="text-gray-600 max-w-3xl mx-auto">{category.description}</p>
              )}
            </div>

            <div className="grid gap-4">
              {category.rules.map((rule, ruleIndex) => (
                <Card key={ruleIndex} className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-400 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-gray-800">{rule.name_en}</h3>
                        <p className="text-blue-600 font-arabic text-lg">{rule.name_ar}</p>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Rule
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{rule.description || rule.ruling_description}</p>
                    
                    {rule.parts && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">Parts:</h4>
                        {rule.parts.map((part, partIndex) => (
                          <Card key={partIndex} className="bg-white/70 border-blue-200">
                            <CardContent className="p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium text-gray-800">{part.name_en}</h5>
                                <span className="text-blue-600 font-arabic">{part.name_ar}</span>
                              </div>
                              <div className="text-center space-y-2">
                                <p className="text-2xl font-arabic text-gray-800 leading-loose">{part.arabic_text}</p>
                                <p className="text-gray-600 italic">{part.transliteration}</p>
                              </div>
                              <p className="text-sm text-gray-600">{part.ruling_description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {rule.examples && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">Examples:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {rule.examples.map((example, exampleIndex) => (
                            <Card key={exampleIndex} className="bg-green-50 border-green-200">
                              <CardContent className="p-3 text-center space-y-1">
                                <p className="text-xl font-arabic text-gray-800">{example.arabic_text}</p>
                                <p className="text-sm text-gray-600 italic">{example.transliteration}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {rule.letters && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-800">Letters:</h4>
                        <div className="flex flex-wrap gap-2">
                          {rule.letters.map((letter, letterIndex) => (
                            <Badge key={letterIndex} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              <span className="font-arabic text-lg mr-1">{letter.ar}</span>
                              <span className="text-sm">({letter.en})</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No Tajweed rules found matching your search.</p>
        </div>
      )}
    </div>
  );
};
