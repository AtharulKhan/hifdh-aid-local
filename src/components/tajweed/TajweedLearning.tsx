
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Comprehensive Tajweed data
const tajweedData = {
  title: "Comprehensive Guide to Tajweed Rules",
  description: "A collection of Tajweed rules compiled from 'QARI Tajweed Basics', 'Reach the Goal Via Tajweed Rules', and 'Advanced Tajweed' resources, designed for application development.",
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
              ruling_description: "Recited at the beginning of every Surah, except for Surah At-Tawbah. It is optional when starting from the middle of a Surah."
            }
          ],
          connection_rules: [
            {
              title: "Connecting Isti'adha, Basmalah, and the Surah",
              permissible_ways: [
                {
                  name: "Cut All",
                  description: "Stop after each part, taking a breath. (Isti'adha (stop), Basmalah (stop), Start of Surah)."
                },
                {
                  name: "Join All",
                  description: "Recite all three parts together in one single breath."
                },
                {
                  name: "Cut First, Join Second and Third",
                  description: "Stop after Isti'adha, then join Basmalah and the Surah in one breath."
                },
                {
                  name: "Join First and Second, Cut Third",
                  description: "Join Isti'adha and Basmalah in one breath, stop, then begin the Surah."
                }
              ]
            },
            {
              title: "Connecting Two Surahs with the Basmalah",
              permissible_ways: [
                {
                  name: "Cut All",
                  description: "Stop at the end of the first Surah, stop after the Basmalah, then begin the new Surah."
                },
                {
                  name: "Join All",
                  description: "Connect the end of the first Surah, the Basmalah, and the start of the new Surah in one breath."
                },
                {
                  name: "Cut First, Join Second and Third",
                  description: "Stop at the end of the first Surah, then join the Basmalah with the new Surah."
                }
              ],
              impermissible_way: {
                name: "Join End of Surah with Basmalah and Stop",
                description: "It is not allowed to join the end of the first Surah with the Basmalah and then stop, as it may imply the Basmalah is the last verse of the preceding Surah."
              }
            }
          ]
        }
      ]
    },
    {
      category_name_en: "Rules of Ghunnah (Noon/Meem Mushaddad)",
      category_name_ar: "أحكام الغنة (النون والميم المشددتين)",
      description: "Ghunnah is a nasal sound produced from the nasal cavity. Its most complete form is on a Noon (نّ) or Meem (مّ) with a Shaddah.",
      rules: [
        {
          name_en: "Noon and Meem Mushaddad",
          name_ar: "النون والميم المشددتين",
          meaning_en: "Noon/Meem with a Shaddah",
          ruling_description: "If a Meem (مّ) or Noon (نّ) has a shaddah, the reader must produce a Ghunnah (nasal sound) for a duration of two counts. This is the most complete level of Ghunnah. The rule applies whether in the middle or at the end of a word (when stopping).",
          letters: [
            { ar: "نّ", en: "nn" },
            { ar: "مّ", en: "mm" }
          ],
          examples: [
            { arabic_text: "إِنَّ", transliteration: "inna" },
            { arabic_text: "مِنَ الْجِنَّةِ وَالنَّاسِ", transliteration: "minal jinnati wan-naas" },
            { arabic_text: "عَمَّ", transliteration: "amma" },
            { arabic_text: "ثُمَّ", transliteration: "thumma" }
          ]
        }
      ]
    },
    {
      category_name_en: "Rules of Noon Saakinah and Tanween",
      category_name_ar: "أحكام النون الساكنة والتنوين",
      description: "A Noon Saakinah (نْ) or a Tanween (ـًـــٍـــٌ) are followed by one of four rules, depending on the letter that comes after them. They share the same rules because Tanween produces an 'n' sound.",
      rules: [
        {
          name_en: "Al-Idh'har (The Clarification)",
          name_ar: "الإِظْهَار الحَلْقِي",
          meaning_en: "To make clear or apparent.",
          ruling_description: "Pronounce the 'n' sound of the Noon Saakinah or Tanween clearly and distinctly, without any Ghunnah (nasalization). This occurs when followed by one of the six throat letters.",
          letters: [
            { ar: "ء", en: "Hamza" },
            { ar: "ه", en: "Haa" },
            { ar: "ع", en: "'Ayn" },
            { ar: "ح", en: "Haa" },
            { ar: "غ", en: "Ghayn" },
            { ar: "خ", en: "Khaa" }
          ],
          examples: [
            { arabic_text: "مِنْهُمْ", transliteration: "minhum" },
            { arabic_text: "يَنْأَوْنَ", transliteration: "yan-awna" },
            { arabic_text: "عَذَابٌ أَلِيمٌ", transliteration: "'adhaabun aleem" },
            { arabic_text: "جُرُفٍ هَارٍ", transliteration: "jurufin haarin" }
          ]
        },
        {
          name_en: "Al-Idgham (The Merging)",
          name_ar: "الإِدْغَام",
          meaning_en: "To merge or mix.",
          ruling_description: "Merge the 'n' sound of the Noon Saakinah or Tanween into the following letter. The letters of Idgham are collected in the word يَرْمَلُون. This rule is split into two sub-types.",
          sub_rules: [
            {
              name_en: "Idgham bi Ghunnah (Merging with Nasalization)",
              name_ar: "إدغام بغنة",
              ruling_description: "Merge the 'n' sound into the next letter while holding a Ghunnah for two counts.",
              letters: [
                { ar: "ي", en: "Yaa" },
                { ar: "ن", en: "Noon" },
                { ar: "م", en: "Meem" },
                { ar: "و", en: "Waw" }
              ],
              examples: [
                { arabic_text: "مَنْ يَعْمَلْ", transliteration: "mayy-ya'mal" },
                { arabic_text: "مِنْ وَالٍ", transliteration: "miw-waalin" },
                { arabic_text: "خَيْرٌ وَأَبْقَىٰ", transliteration: "khayruw-wa abqaa" }
              ],
              note: "Idgham only occurs between two words. If a Noon Saakinah is followed by an Idgham letter within the same word (e.g., الدُّنْيَا, قِنْوَانٌ), it is pronounced with Idh'har (clarification). This is called Idh'har Mutlaq."
            },
            {
              name_en: "Idgham bila Ghunnah (Merging without Nasalization)",
              name_ar: "إدغام بلا غنة",
              ruling_description: "Merge the 'n' sound completely into the next letter without any Ghunnah. The 'n' sound disappears entirely.",
              letters: [
                { ar: "ل", en: "Laam" },
                { ar: "ر", en: "Raa" }
              ],
              examples: [
                { arabic_text: "مِنْ رَبِّهِمْ", transliteration: "mir-rabbihim" },
                { arabic_text: "هُدًى لِلْمُتَّقِينَ", transliteration: "hudallil-muttaqeen" }
              ]
            }
          ]
        },
        {
          name_en: "Al-Iqlab (The Conversion)",
          name_ar: "الإِقْلَاب",
          meaning_en: "To turn over or convert.",
          ruling_description: "Convert the 'n' sound of the Noon Saakinah or Tanween into a hidden Meem (م) sound when it is followed by the letter Baa' (ب). This converted Meem is held with a Ghunnah for two counts. In the Mus'haf, this is often indicated by a small 'م' above the letter.",
          letters: [
            { ar: "ب", en: "Baa" }
          ],
          examples: [
            { arabic_text: "مِنْ بَعْدِ", transliteration: "mim-ba'di" },
            { arabic_text: "سَمِيعٌ بَصِيرٌ", transliteration: "samee'um-baseer" }
          ]
        },
        {
          name_en: "Al-Ikhfa' (The Hiding)",
          name_ar: "الإِخْفَاء الحَقِيقِي",
          meaning_en: "To hide.",
          ruling_description: "Pronounce the 'n' sound from a state between Idh'har (clarification) and Idgham (merging), while maintaining a light Ghunnah for two counts. The mouth is prepared for the articulation of the following letter. This applies to the remaining 15 letters of the alphabet.",
          letters: [
            { ar: "ص", en: "Saad" }, { ar: "ذ", en: "Dhaal" }, { ar: "ث", en: "Thaa" }, { ar: "ك", en: "Kaaf" }, { ar: "ج", en: "Jeem" },
            { ar: "ش", en: "Sheen" }, { ar: "ق", en: "Qaaf" }, { ar: "س", en: "Seen" }, { ar: "د", en: "Daal" }, { ar: "ط", en: "Taa" },
            { ar: "ز", en: "Zay" }, { ar: "ف", en: "Faa" }, { ar: "ت", en: "Taa" }, { ar: "ض", en: "Daad" }, { ar: "ظ", en: "Dhaa" }
          ],
          examples: [
            { arabic_text: "مِنْ شَرِّ", transliteration: "min sharri" },
            { arabic_text: "إِنْ كُنْتُمْ", transliteration: "in kuntum" },
            { arabic_text: "رِيحٍ صَرْصَرٍ", transliteration: "reehin sarsarin" }
          ],
          note: "The heaviness (Tafkheem) or lightness (Tarqeeq) of the Ikhfa' Ghunnah depends on the following letter. If the letter is heavy (ص, ض, ط, ظ, ق), the Ghunnah is heavy. Otherwise, it is light."
        }
      ]
    },
    {
      category_name_en: "Rules of Meem Saakinah",
      category_name_ar: "أحكام الميم الساكنة",
      description: "Rules that apply to a Meem with a sukoon (مْ), determined by the letter that follows it. These are also called 'Shafawi' (labial) as Meem is articulated with the lips.",
      rules: [
        {
          name_en: "Al-Ikhfa' ash-Shafawi (Labial Hiding)",
          name_ar: "الإِخْفَاء الشَّفَوِي",
          meaning_en: "To hide the Meem.",
          ruling_description: "When a Meem Saakinah (مْ) is followed by a Baa' (ب), the Meem sound is 'hidden' by lightly touching the lips and holding a Ghunnah for two counts.",
          letters: [
            { ar: "ب", en: "Baa" }
          ],
          examples: [
            { arabic_text: "تَرْمِيهِمْ بِحِجَارَةٍ", transliteration: "tarmeehim bihijarah" },
            { arabic_text: "هُمْ بَارِزُونَ", transliteration: "hum baarizoon" }
          ]
        },
        {
          name_en: "Al-Idgham ash-Shafawi (Labial Merging)",
          name_ar: "الإِدْغَام الشَّفَوِي",
          meaning_en: "To merge the Meem.",
          ruling_description: "When a Meem Saakinah (مْ) is followed by another Meem (م), the first Meem is merged into the second, creating a single, stressed Meem (مّ) which is held with a Ghunnah for two counts. Also known as Idgham Mutamathilayn Sagheer.",
          letters: [
            { ar: "م", en: "Meem" }
          ],
          examples: [
            { arabic_text: "لَهُمْ مَا", transliteration: "lahum-maa" },
            { arabic_text: "أَطْعَمَهُمْ مِنْ جُوعٍ", transliteration: "at'amahum-min joo'" }
          ]
        },
        {
          name_en: "Al-Idh'har ash-Shafawi (Labial Clarification)",
          name_ar: "الإِظْهَار الشَّفَوِي",
          meaning_en: "To make the Meem clear.",
          ruling_description: "When a Meem Saakinah (مْ) is followed by any letter other than Baa' (ب) or Meem (م), the Meem is pronounced clearly and distinctly from its point of articulation, without any Ghunnah.",
          letters: [
            { ar: "All letters except ب and م", en: "The remaining 26 letters" }
          ],
          examples: [
            { arabic_text: "لَكُمْ دِينُكُمْ", transliteration: "lakum deenukum" },
            { arabic_text: "أَلَمْ تَرَ", transliteration: "alam tara" }
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
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.ruling_description?.toLowerCase().includes(searchTerm.toLowerCase())
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
                        {rule.meaning_en && (
                          <p className="text-sm text-gray-600 italic">Meaning: {rule.meaning_en}</p>
                        )}
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Rule
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{rule.description || rule.ruling_description}</p>
                    
                    {/* Parts Section */}
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

                    {/* Connection Rules Section */}
                    {rule.connection_rules && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">Connection Rules:</h4>
                        <Accordion type="single" collapsible className="w-full">
                          {rule.connection_rules.map((connectionRule, connIndex) => (
                            <AccordionItem key={connIndex} value={`connection-${connIndex}`}>
                              <AccordionTrigger className="text-left">
                                {connectionRule.title}
                              </AccordionTrigger>
                              <AccordionContent className="space-y-3">
                                <div className="space-y-2">
                                  <h6 className="font-medium text-green-700">Permissible Ways:</h6>
                                  {connectionRule.permissible_ways.map((way, wayIndex) => (
                                    <div key={wayIndex} className="bg-green-50 p-3 rounded border-l-4 border-green-300">
                                      <h6 className="font-medium text-green-800">{way.name}</h6>
                                      <p className="text-sm text-green-700">{way.description}</p>
                                    </div>
                                  ))}
                                </div>
                                {connectionRule.impermissible_way && (
                                  <div className="space-y-2">
                                    <h6 className="font-medium text-red-700">Impermissible Way:</h6>
                                    <div className="bg-red-50 p-3 rounded border-l-4 border-red-300">
                                      <h6 className="font-medium text-red-800">{connectionRule.impermissible_way.name}</h6>
                                      <p className="text-sm text-red-700">{connectionRule.impermissible_way.description}</p>
                                    </div>
                                  </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    )}

                    {/* Sub Rules Section */}
                    {rule.sub_rules && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">Sub-Rules:</h4>
                        <Accordion type="single" collapsible className="w-full">
                          {rule.sub_rules.map((subRule, subIndex) => (
                            <AccordionItem key={subIndex} value={`sub-rule-${subIndex}`}>
                              <AccordionTrigger className="text-left">
                                <div className="space-y-1">
                                  <div>{subRule.name_en}</div>
                                  <div className="text-blue-600 font-arabic text-sm">{subRule.name_ar}</div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="space-y-3">
                                <p className="text-gray-700">{subRule.ruling_description}</p>
                                {subRule.letters && (
                                  <div className="space-y-2">
                                    <h6 className="font-semibold text-gray-800">Letters:</h6>
                                    <div className="flex flex-wrap gap-2">
                                      {subRule.letters.map((letter, letterIndex) => (
                                        <Badge key={letterIndex} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                          <span className="font-arabic text-lg mr-1">{letter.ar}</span>
                                          <span className="text-sm">({letter.en})</span>
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {subRule.examples && (
                                  <div className="space-y-2">
                                    <h6 className="font-semibold text-gray-800">Examples:</h6>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {subRule.examples.map((example, exampleIndex) => (
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
                                {subRule.note && (
                                  <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-300">
                                    <p className="text-sm text-yellow-800"><strong>Note:</strong> {subRule.note}</p>
                                  </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    )}

                    {/* Examples Section */}
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

                    {/* Letters Section */}
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

                    {/* Note Section */}
                    {rule.note && (
                      <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-300">
                        <p className="text-sm text-yellow-800"><strong>Note:</strong> {rule.note}</p>
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
