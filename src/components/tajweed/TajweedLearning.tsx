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
    },
    {
      category_name_en: "Rules of Madd (Elongation)",
      category_name_ar: "أحكام المد",
      description: "Madd is the lengthening of the sound of the three Madd letters: Alif Saakinah preceded by a Fatha (ـَا), Waw Saakinah preceded by a Dammah (ـُو), and Yaa Saakinah preceded by a Kasrah (ـِي).",
      sub_categories: [
        {
          category_name_en: "Natural Madd (Al-Madd al-Asli)",
          category_name_ar: "المد الأصلي",
          description: "The basic, natural elongation of a Madd letter for 2 counts, occurring when not followed by a Hamza (ء) or a Sukoon (ـْـ).",
          rules: [
            {
              name_en: "Al-Madd at-Tabi'i (Natural Madd)",
              name_ar: "المد الطبيعي",
              length: "2 counts",
              ruling_description: "The fundamental Madd. It exists as long as the Madd letter is not followed by a Hamza or a Sukoon.",
              examples: [
                { arabic_text: "قَالَ", transliteration: "qaala" },
                { arabic_text: "يَقُولُ", transliteration: "yaqoolu" },
                { arabic_text: "قِيلَ", transliteration: "qeela" }
              ]
            },
            {
              name_en: "Madd al-Badal (Substitute Madd)",
              name_ar: "مد البدل",
              length: "2 counts",
              ruling_description: "Occurs when a Hamza precedes a Madd letter. It is called 'substitute' because in many cases, the Madd letter is a substitute for an original Hamza Saakinah (e.g., آمَنُوا was originally أَأْمَنُوا).",
              examples: [
                { arabic_text: "آمَنُوا", transliteration: "aamanoo" },
                { arabic_text: "أُوتُوا", transliteration: "ootoo" },
                { arabic_text: "إِيمَانًا", transliteration: "eemaanan" }
              ]
            },
            {
              name_en: "Madd al-'Iwad (Substitute Madd on Stopping)",
              name_ar: "مد العوض",
              length: "2 counts",
              ruling_description: "Occurs only when stopping on a word that ends in Tanween Fatha (ـًـا). The Tanween sound and the second Fatha are dropped, and the sound is substituted with an Alif Madd of 2 counts. This does not apply if the word ends with a Taa Marbutah (ةً).",
              examples: [
                { arabic_text: "عَلِيمًا", transliteration: "When stopping, it becomes 'aleemaa'" },
                { arabic_text: "غَفُورًا رَحِيمًا", transliteration: "Stopping on غَفُورًا becomes ghafooraa" }
              ]
            },
            {
              name_en: "Madd as-Silah as-Sughra (Lesser Connecting Madd)",
              name_ar: "مد الصلة الصغرى",
              length: "2 counts",
              ruling_description: "Occurs when the pronoun Haa (ه) representing a third-person masculine singular falls between two voweled letters and is not followed by a Hamza. The Dammah on the 'hu' (ـهُ) is elongated to sound like ـهُو, and the Kasrah on the 'hi' (ـهِ) is elongated to sound like ـهِـي. This rule applies only when continuing recitation, not when stopping on the word.",
              examples: [
                { arabic_text: "إِنَّهُ كَانَ", transliteration: "innahu kaana" },
                { arabic_text: "بِهِ بَصِيرًا", transliteration: "bihi baseera" }
              ]
            }
          ]
        },
        {
          category_name_en: "Secondary Madd (Al-Madd al-Far'i)",
          category_name_ar: "المد الفرعي",
          description: "Elongation longer than 2 counts, caused by a Hamza (ء) or a Sukoon (ـْـ) following the Madd letter.",
          sub_categories: [
            {
              category_name_en: "Madd Caused by Hamza",
              category_name_ar: "المد بسبب الهمزة",
              rules: [
                {
                  name_en: "Madd al-Muttasil (Attached Madd)",
                  name_ar: "المد الواجب المتصل",
                  length: "4 or 5 counts (obligatory)",
                  ruling_description: "Occurs when a Madd letter is followed by a Hamza within the same word.",
                  examples: [
                    { arabic_text: "جَاءَ", transliteration: "jaaa'a" },
                    { arabic_text: "السَّمَاءِ", transliteration: "as-samaaa'i" },
                    { arabic_text: "سُوءَ", transliteration: "sooo'a" }
                  ]
                },
                {
                  name_en: "Madd al-Munfasil (Detached Madd)",
                  name_ar: "المد الجائز المنفصل",
                  length: "2, 4, or 5 counts (permissible)",
                  ruling_description: "Occurs when a Madd letter is at the end of a word and a Hamza is at the beginning of the very next word. The reciter must be consistent with the chosen length throughout their recitation.",
                  examples: [
                    { arabic_text: "يَا أَيُّهَا", transliteration: "yaa ayyuha" },
                    { arabic_text: "فِي أَنْفُسِكُمْ", transliteration: "fee anfusikum" },
                    { arabic_text: "قُوا أَنْفُسَكُمْ", transliteration: "qoo anfusakum" }
                  ]
                },
                {
                  name_en: "Madd as-Silah al-Kubra (Greater Connecting Madd)",
                  name_ar: "مد الصلة الكبرى",
                  length: "Same as Munfasil (2, 4, or 5 counts)",
                  ruling_description: "Occurs when the pronoun Haa (ه) falls between two voweled letters and is followed by a Hamza at the beginning of the next word. It is treated like Madd al-Munfasil and only applies when continuing recitation.",
                  examples: [
                    { arabic_text: "مَالَهُ أَخْلَدَهُ", transliteration: "maalahooo akhladah" },
                    { arabic_text: "عِنْدَهُ إِلَّا", transliteration: "indahooo illaa" }
                  ]
                }
              ]
            },
            {
              category_name_en: "Madd Caused by Sukoon",
              category_name_ar: "المد بسبب السكون",
              rules: [
                {
                  name_en: "Madd 'Arid lis-Sukoon (Temporary Madd for Stopping)",
                  name_ar: "المد العارض للسكون",
                  length: "2, 4, or 6 counts (permissible)",
                  ruling_description: "Occurs when stopping on a word where a temporary sukoon is placed on the last letter, and the letter immediately preceding it is a Madd letter. The length is chosen by the reciter, but should be kept consistent.",
                  examples: [
                    { arabic_text: "الْعَالَمِينَ", transliteration: "Stopping becomes al-'aalameen" },
                    { arabic_text: "نَسْتَعِينُ", transliteration: "Stopping becomes nasta'een" }
                  ]
                },
                {
                  name_en: "Madd Leen (The Easy Madd)",
                  name_ar: "مد اللين",
                  length: "2, 4, or 6 counts (permissible)",
                  ruling_description: "Occurs when stopping on a word where a temporary sukoon is placed on the last letter, and the letter before it is a 'Leen' letter (Waw Saakinah or Yaa Saakinah preceded by a Fatha).",
                  examples: [
                    { arabic_text: "خَوْفٍ", transliteration: "Stopping becomes khawf" },
                    { arabic_text: "الْبَيْتِ", transliteration: "Stopping becomes al-bayt" }
                  ]
                },
                {
                  name_en: "Madd Lazim (Necessary Madd)",
                  name_ar: "المد اللازم",
                  length: "6 counts (obligatory)",
                  ruling_description: "The strongest Madd. It occurs when a Madd letter is followed by a permanent, original Sukoon (not a temporary one from stopping). It is always elongated for 6 counts.",
                  sub_rules: [
                    {
                      name_en: "Madd Lazim Kalimi Muthakkal (Heavy Word Madd)",
                      name_ar: "مد لازم كلمي مثقل",
                      ruling_description: "Occurs when the Madd letter is followed by a permanent sukoon that is part of a Shaddah (ـّـ) within a word.",
                      examples: [
                        { arabic_text: "الضَّالِّينَ", transliteration: "Ad-Daaallleen" },
                        { arabic_text: "الْحَاقَّةُ", transliteration: "Al-Haaaqqah" }
                      ]
                    },
                    {
                      name_en: "Madd Lazim Kalimi Mukhaffaf (Light Word Madd)",
                      name_ar: "مد لازم كلمي مخفف",
                      ruling_description: "Occurs when the Madd letter is followed by a permanent sukoon that is not part of a Shaddah. This only occurs in one word in the Qur'an, in two places in Surah Yunus.",
                      examples: [
                        { arabic_text: "آلْآنَ", transliteration: "Aaal-aana" }
                      ]
                    },
                    {
                      name_en: "Madd Lazim Harfi Muthakkal (Heavy Letter Madd)",
                      name_ar: "مد لازم حرفي مثقل",
                      ruling_description: "Occurs in the individual letters (Huroof Muqatta'at) at the start of some Surahs. It applies to a letter whose 3-letter spelling ends in a saakin letter that is then merged (Idgham) into the first letter of the next letter's spelling. Example: ل (spelled لام) in الٓمٓ. The 'م' at the end of لام merges with the 'م' at the beginning of ميم.",
                      examples: [
                        { arabic_text: "الٓمٓ", transliteration: "In the Laam (ل)" },
                        { arabic_text: "طسٓمٓ", transliteration: "In the Seen (س)" }
                      ]
                    },
                    {
                      name_en: "Madd Lazim Harfi Mukhaffaf (Light Letter Madd)",
                      name_ar: "مد لازم حرفي مخفف",
                      ruling_description: "Occurs in the individual letters at the start of some Surahs. It applies to a letter whose 3-letter spelling contains a Madd letter followed by a final saakin letter that is NOT merged. The letters are: ن, ق, ص, ع, س, ل, ك, م (نقص عسلكم).",
                      examples: [
                        { arabic_text: "صٓ", transliteration: "Saaad" },
                        { arabic_text: "قٓ", transliteration: "Qaaaf" },
                        { arabic_text: "نٓ", transliteration: "Nooon" }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      category_name_en: "Letter Characteristics",
      category_name_ar: "صفات الحروف",
      description: "The intrinsic qualities of each Arabic letter that differentiate it from others, especially those with the same or similar articulation points (Makhraj).",
      sub_categories: [
        {
          category_name_en: "Characteristics with Opposites",
          rules: [
            { name_en: "Al-Hams (The Whisper)", opposite: "Al-Jahr (The Audibility)", description: "Continuation of breath when pronouncing the letter due to weakness in its origin.", letters: "فَحَثَّهُ شَخْصٌ سَكَتَ" },
            { name_en: "Al-Jahr (The Audibility)", opposite: "Al-Hams (The Whisper)", description: "Imprisonment/stoppage of breath when pronouncing the letter due to strength in its origin.", letters: "The remaining 19 letters" },
            { name_en: "Ash-Shiddah (The Strength)", opposite: "Ar-Rakhawa / At-Tawasut", description: "Imprisonment/stoppage of the flow of sound when pronouncing the letter due to complete reliance on the makhraj.", letters: "أَجِدْ قَطٍ بَكَتْ" },
            { name_en: "Ar-Rakhawa (The Softness)", opposite: "Ash-Shiddah", description: "Continuation of the flow of sound when pronouncing the letter.", letters: "All letters except those of Shiddah and Tawasut" },
            { name_en: "At-Tawasut (The In-Between)", opposite: "Ash-Shiddah / Ar-Rakhawa", description: "A state between strength and softness; the sound is neither completely stopped nor does it flow completely.", letters: "لِنْ عُمَرْ" },
            { name_en: "Al-Isti'la (The Elevation)", opposite: "Al-Istifal (The Lowering)", description: "The elevation of the back of the tongue towards the roof of the mouth when pronouncing the letter, causing a heavy sound (Tafkheem).", letters: "خُصَّ ضَغْطٍ قِظْ" },
            { name_en: "Al-Istifal (The Lowering)", opposite: "Al-Isti'la (The Elevation)", description: "The lowering of the back of the tongue away from the roof of the mouth, causing a light sound (Tarqeeq).", letters: "The remaining 22 letters" },
            { name_en: "Al-Itbaq (The Adhesion)", opposite: "Al-Infitah (The Openness)", description: "The adhesion of a part of the tongue to the roof of the mouth, compressing the sound. These are the heaviest letters.", letters: "ص, ض, ط, ظ" },
            { name_en: "Al-Infitah (The Openness)", opposite: "Al-Itbaq (The Adhesion)", description: "The separation of the tongue from the roof of the mouth, allowing the sound to be open.", letters: "The remaining 25 letters" }
          ]
        },
        {
          category_name_en: "Characteristics without Opposites",
          rules: [
            { name_en: "As-Safeer (The Whistle)", description: "A sharp, whistling sound that accompanies the letter.", letters: "ص, ز, س" },
            { name_en: "Al-Qalqalah (The Vibration/Echo)", description: "A disturbance or vibration in the makhraj when the letter is saakin, creating a slight echo. It has levels: Weak (middle of a word), Strong (end of a word, stopping on a saakin letter), and Strongest (end of a word, stopping on a mushaddad letter).", letters: "قُطْبُ جَدٍّ", examples: [
              { arabic_text: "يَطْبَعُ", transliteration: "yatba'u (Weak)"},
              { arabic_text: "مُحِيطٌ", transliteration: "muheet (Strong, when stopping)"},
              { arabic_text: "الْبَيْتِ", transliteration: "al-bayt (Strongest, when stopping)"}
            ]},
            { name_en: "Al-Leen (The Ease)", description: "The articulation of the letter with ease and softness.", letters: "و and ي when they are saakin and preceded by a fatha" },
            { name_en: "Al-Inhiraf (The Deviation)", description: "The deviation of the sound of the letter from its makhraj towards another.", letters: "ل, ر" },
            { name_en: "At-Takreer (The Repetition)", description: "The light trilling of the tongue when pronouncing the letter. This characteristic should be noted in order to be avoided, not exaggerated.", letters: "ر" },
            { name_en: "At-Tafasshy (The Spreading)", description: "The spreading of the sound of the letter around the mouth.", letters: "ش" },
            { name_en: "Al-Istitalah (The Elongation)", description: "The elongation of the makhraj of the letter, from the beginning of the side of the tongue to its end.", letters: "ض" }
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
      category.rules?.some(rule =>
        rule.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.name_ar.includes(searchTerm) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.ruling_description?.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      category.sub_categories?.some(subCat => 
        subCat.category_name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subCat.rules?.some(rule =>
          rule.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rule.name_ar?.includes(searchTerm)
        )
      )
    );
  }, [searchTerm]);

  const renderRule = (rule: any, ruleIndex: number) => {
    return (
      <Card key={ruleIndex} className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-400 hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-800">{rule.name_en}</h3>
              <p className="text-blue-600 font-arabic text-lg">{rule.name_ar}</p>
              {rule.meaning_en && (
                <p className="text-sm text-gray-600 italic">Meaning: {rule.meaning_en}</p>
              )}
              {rule.length && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  Length: {rule.length}
                </Badge>
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
              {rule.parts.map((part: any, partIndex: number) => (
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
                {rule.connection_rules.map((connectionRule: any, connIndex: number) => (
                  <AccordionItem key={connIndex} value={`connection-${connIndex}`}>
                    <AccordionTrigger className="text-left">
                      {connectionRule.title}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="space-y-2">
                        <h6 className="font-medium text-green-700">Permissible Ways:</h6>
                        {connectionRule.permissible_ways.map((way: any, wayIndex: number) => (
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
                {rule.sub_rules.map((subRule: any, subIndex: number) => (
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
                            {subRule.letters.map((letter: any, letterIndex: number) => (
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
                            {subRule.examples.map((example: any, exampleIndex: number) => (
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
                {rule.examples.map((example: any, exampleIndex: number) => (
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
                {typeof rule.letters === 'string' ? (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    <span className="font-arabic text-lg">{rule.letters}</span>
                  </Badge>
                ) : (
                  rule.letters.map((letter: any, letterIndex: number) => (
                    <Badge key={letterIndex} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      <span className="font-arabic text-lg mr-1">{letter.ar}</span>
                      <span className="text-sm">({letter.en})</span>
                    </Badge>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Note Section */}
          {rule.note && (
            <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-300">
              <p className="text-sm text-yellow-800"><strong>Note:</strong> {rule.note}</p>
            </div>
          )}

          {/* Opposite Section */}
          {rule.opposite && (
            <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-300">
              <p className="text-sm text-orange-800"><strong>Opposite:</strong> {rule.opposite}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

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
        {filteredCategories.map((category: any, categoryIndex: number) => (
          <div key={categoryIndex} className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">{category.category_name_en}</h2>
              <p className="text-xl text-blue-600 font-arabic">{category.category_name_ar}</p>
              {category.description && (
                <p className="text-gray-600 max-w-3xl mx-auto">{category.description}</p>
              )}
            </div>

            {/* Regular Rules */}
            {category.rules && (
              <div className="grid gap-4">
                {category.rules.map((rule: any, ruleIndex: number) => renderRule(rule, ruleIndex))}
              </div>
            )}

            {/* Sub Categories (for Madd and Letter Characteristics) */}
            {category.sub_categories && (
              <div className="space-y-6">
                {category.sub_categories.map((subCategory: any, subCatIndex: number) => (
                  <div key={subCatIndex} className="space-y-4">
                    <div className="text-center space-y-2 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                      <h3 className="text-xl font-bold text-gray-800">{subCategory.category_name_en}</h3>
                      <p className="text-lg text-purple-600 font-arabic">{subCategory.category_name_ar}</p>
                      {subCategory.description && (
                        <p className="text-gray-600 max-w-2xl mx-auto">{subCategory.description}</p>
                      )}
                    </div>

                    {/* Sub Category Rules */}
                    {subCategory.rules && (
                      <div className="grid gap-4">
                        {subCategory.rules.map((rule: any, ruleIndex: number) => renderRule(rule, ruleIndex))}
                      </div>
                    )}

                    {/* Nested Sub Categories (for Madd Far'i) */}
                    {subCategory.sub_categories && (
                      <div className="space-y-6">
                        {subCategory.sub_categories.map((nestedSubCat: any, nestedIndex: number) => (
                          <div key={nestedIndex} className="space-y-4">
                            <div className="text-center space-y-2 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                              <h4 className="text-lg font-bold text-gray-800">{nestedSubCat.category_name_en}</h4>
                              <p className="text-base text-green-600 font-arabic">{nestedSubCat.category_name_ar}</p>
                            </div>
                            {nestedSubCat.rules && (
                              <div className="grid gap-4">
                                {nestedSubCat.rules.map((rule: any, ruleIndex: number) => renderRule(rule, ruleIndex))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
