export interface SurahJuzPageInfo {
    juz: number;
    surahName: string;
    startPage: number;
    endPage: number;
}
export const surahJuzPageMapData: SurahJuzPageInfo[] = [
    { juz: 1, surahName: "Al-Fatihah", startPage: 1, endPage: 1 },
    { juz: 1, surahName: "Al-Baqarah", startPage: 2, endPage: 21 },
    { juz: 2, surahName: "Al-Baqarah", startPage: 22, endPage: 41 },
    { juz: 3, surahName: "Al-Baqarah", startPage: 42, endPage: 49 },
    { juz: 3, surahName: "Aal-E-Imran", startPage: 50, endPage: 61 },
    { juz: 4, surahName: "Aal-E-Imran", startPage: 62, endPage: 74 },
    { juz: 4, surahName: "An-Nisa", startPage: 75, endPage: 81 },
    { juz: 5, surahName: "An-Nisa", startPage: 82, endPage: 101 },
    { juz: 6, surahName: "An-Nisa", startPage: 102, endPage: 105 },
    { juz: 6, surahName: "Al Ma'idah", startPage: 106, endPage: 120 },
    { juz: 7, surahName: "Al Ma'idah", startPage: 121, endPage: 128 },
    { juz: 7, surahName: "Al-An'am", startPage: 129, endPage: 141 },
    { juz: 8, surahName: "Al-An'am", startPage: 142, endPage: 150 },
    { juz: 8, surahName: "Al-A'raf", startPage: 151, endPage: 161 },
    { juz: 9, surahName: "Al-A'raf", startPage: 162, endPage: 176 },
    { juz: 9, surahName: "Al-Anfal", startPage: 177, endPage: 181 },
    { juz: 10, surahName: "Al-Anfal", startPage: 182, endPage: 186 },
    { juz: 10, surahName: "At-Tawbah", startPage: 187, endPage: 200 },
    { juz: 11, surahName: "At-Tawbah", startPage: 201, endPage: 208 },
    { juz: 11, surahName: "Yunus", startPage: 209, endPage: 221 },
    { juz: 12, surahName: "Hud", startPage: 221, endPage: 235 },
    { juz: 12, surahName: "Yusuf", startPage: 235, endPage: 241 },
    { juz: 13, surahName: "Yusuf", startPage: 242, endPage: 248 },
    { juz: 13, surahName: "Ar-Ra'd", startPage: 249, endPage: 254 },
    { juz: 13, surahName: "Ibrahim", startPage: 255, endPage: 261 },
    { juz: 14, surahName: "Al-Hijr", startPage: 262, endPage: 266 },
    { juz: 14, surahName: "An-Nahl", startPage: 267, endPage: 281 },
    { juz: 15, surahName: "Al-Isra", startPage: 282, endPage: 294 },
    { juz: 15, surahName: "Al-Kahf", startPage: 294, endPage: 301 },
    { juz: 16, surahName: "Al-Kahf", startPage: 302, endPage: 304 },
    { juz: 16, surahName: "Maryam", startPage: 305, endPage: 311 },
    { juz: 16, surahName: "Ta-Ha", startPage: 312, endPage: 321 },
    { juz: 17, surahName: "Al-Anbiya", startPage: 322, endPage: 331 },
    { juz: 17, surahName: "Al-Hajj", startPage: 332, endPage: 341 },
    { juz: 18, surahName: "Al-Mu'minun", startPage: 342, endPage: 349 },
    { juz: 18, surahName: "An-Nur", startPage: 350, endPage: 358 },
    { juz: 18, surahName: "Al-Furqan", startPage: 359, endPage: 361 },
    { juz: 19, surahName: "Al-Furqan", startPage: 362, endPage: 366 },
    { juz: 19, surahName: "Ash-Shu'ara", startPage: 367, endPage: 376 },
    { juz: 19, surahName: "An-Naml", startPage: 377, endPage: 381 },
    { juz: 20, surahName: "An-Naml", startPage: 382, endPage: 384 },
    { juz: 20, surahName: "Al-Qasas", startPage: 385, endPage: 395 },
    { juz: 20, surahName: "Al-Ankabut", startPage: 396, endPage: 401 },
    { juz: 21, surahName: "Al-Ankabut", startPage: 402, endPage: 403 },
    { juz: 21, surahName: "Ar-Rum", startPage: 404, endPage: 410 },
    { juz: 21, surahName: "Luqman", startPage: 411, endPage: 414 },
    { juz: 21, surahName: "As-Sajdah", startPage: 415, endPage: 417 },
    { juz: 21, surahName: "Al-Ahzab", startPage: 418, endPage: 421 },
    { juz: 22, surahName: "Al-Ahzab", startPage: 422, endPage: 427 },
    { juz: 22, surahName: "Saba", startPage: 428, endPage: 433 },
    { juz: 22, surahName: "Fatir", startPage: 434, endPage: 439 },
    { juz: 23, surahName: "Ya-Sin", startPage: 440, endPage: 445 },
    { juz: 23, surahName: "As-Saffat", startPage: 446, endPage: 452 },
    { juz: 23, surahName: "Sad", startPage: 453, endPage: 457 },
    { juz: 23, surahName: "Az-Zumar", startPage: 458, endPage: 461 },
    { juz: 24, surahName: "Az-Zumar", startPage: 462, endPage: 466 },
    { juz: 24, surahName: "Ghafir", startPage: 467, endPage: 476 },
    { juz: 24, surahName: "Fussilat", startPage: 477, endPage: 481 },
    { juz: 25, surahName: "Fussilat", startPage: 482, endPage: 483 },
    { juz: 25, surahName: "Ash-Shura", startPage: 483, endPage: 488 },
    { juz: 25, surahName: "Az-Zukhruf", startPage: 489, endPage: 495 },
    { juz: 25, surahName: "Ad-Dukhan", startPage: 496, endPage: 498 },
    { juz: 25, surahName: "Al-Jathiyah", startPage: 499, endPage: 502 },
    { juz: 26, surahName: "Al-Ahqaf", startPage: 502, endPage: 506 },
    { juz: 26, surahName: "Muhammad", startPage: 507, endPage: 510 },
    { juz: 26, surahName: "Al-Fath", startPage: 511, endPage: 514 },
    { juz: 26, surahName: "Al-Hujurat", startPage: 515, endPage: 517 },
    { juz: 26, surahName: "Qaf", startPage: 518, endPage: 520 },
    { juz: 26, surahName: "Adh-Dhariyat", startPage: 520, endPage: 521 },
    { juz: 27, surahName: "Adh-Dhariyat", startPage: 522, endPage: 523 },
    { juz: 27, surahName: "At-Tur", startPage: 523, endPage: 525 },
    { juz: 27, surahName: "An-Najm", startPage: 526, endPage: 527 },
    { juz: 27, surahName: "Al-Qamar", startPage: 528, endPage: 530 },
    { juz: 27, surahName: "Ar-Rahman", startPage: 531, endPage: 533 },
    { juz: 27, surahName: "Al-Waqi'ah", startPage: 534, endPage: 536 },
    { juz: 27, surahName: "Al-Hadid", startPage: 537, endPage: 541 },
    { juz: 28, surahName: "Al-Mujadila", startPage: 541, endPage: 544 },
    { juz: 28, surahName: "Al-Hashr", startPage: 545, endPage: 548 },
    { juz: 28, surahName: "Al-Mumtahanah", startPage: 549, endPage: 550 },
    { juz: 28, surahName: "As-Saff", startPage: 551, endPage: 552 },
    { juz: 28, surahName: "Al-Jumu'ah", startPage: 553, endPage: 553 },
    { juz: 28, surahName: "Al-Munafiqun", startPage: 554, endPage: 555 },
    { juz: 28, surahName: "At-Taghabun", startPage: 556, endPage: 557 },
    { juz: 28, surahName: "At-Talaq", startPage: 558, endPage: 559 },
    { juz: 28, surahName: "At-Tahrim", startPage: 560, endPage: 561 },
    { juz: 29, surahName: "Al-Mulk", startPage: 562, endPage: 563 },
    { juz: 29, surahName: "Al-Qalam", startPage: 564, endPage: 566 },
    { juz: 29, surahName: "Al-Haqqah", startPage: 566, endPage: 567 },
    { juz: 29, surahName: "Al-Ma'arij", startPage: 568, endPage: 570 },
    { juz: 29, surahName: "Nuh", startPage: 570, endPage: 571 },
    { juz: 29, surahName: "Al-Jinn", startPage: 572, endPage: 573 },
    { juz: 29, surahName: "Al-Muzzammil", startPage: 574, endPage: 575 },
    { juz: 29, surahName: "Al-Muddaththir", startPage: 575, endPage: 576 },
    { juz: 29, surahName: "Al-Qiyamah", startPage: 577, endPage: 578 },
    { juz: 29, surahName: "Al-Insan", startPage: 577, endPage: 580 },
    { juz: 29, surahName: "Al-Mursalat", startPage: 580, endPage: 581 },
    { juz: 30, surahName: "An-Naba", startPage: 582, endPage: 583 },
    { juz: 30, surahName: "An-Nazi'at", startPage: 583, endPage: 584 },
    { juz: 30, surahName: "Abasa", startPage: 585, endPage: 585 },
    { juz: 30, surahName: "At-Takwir", startPage: 586, endPage: 586 },
    { juz: 30, surahName: "Al-Infitar", startPage: 587, endPage: 587 },
    { juz: 30, surahName: "Al-Mutaffifin", startPage: 587, endPage: 589 },
    { juz: 30, surahName: "Al-Inshiqaq", startPage: 589, endPage: 589 },
    { juz: 30, surahName: "Al-Buruj", startPage: 590, endPage: 590 },
    { juz: 30, surahName: "At-Tariq", startPage: 591, endPage: 591 },
    { juz: 30, surahName: "Al-A'la", startPage: 591, endPage: 592 },
    { juz: 30, surahName: "Al-Ghashiyah", startPage: 592, endPage: 592 },
    { juz: 30, surahName: "Al-Fajr", startPage: 593, endPage: 594 },
    { juz: 30, surahName: "Al-Balad", startPage: 594, endPage: 594 },
    { juz: 30, surahName: "Ash-Shams", startPage: 595, endPage: 595 },
    { juz: 30, surahName: "Al-Lail", startPage: 595, endPage: 596 },
    { juz: 30, surahName: "Ad-Duha", startPage: 596, endPage: 596 },
    { juz: 30, surahName: "Ash-Sharh", startPage: 596, endPage: 596 },
    { juz: 30, surahName: "At-Tin", startPage: 597, endPage: 597 },
    { juz: 30, surahName: "Al-Alaq", startPage: 597, endPage: 597 },
    { juz: 30, surahName: "Al-Qadr", startPage: 598, endPage: 598 },
    { juz: 30, surahName: "Al-Bayyinah", startPage: 598, endPage: 599 },
    { juz: 30, surahName: "Az-Zalzalah", startPage: 599, endPage: 599 },
    { juz: 30, surahName: "Al-Adiyat", startPage: 599, endPage: 600 },
    { juz: 30, surahName: "Al-Qari'ah", startPage: 600, endPage: 600 },
    { juz: 30, surahName: "At-Takathur", startPage: 600, endPage: 600 },
    { juz: 30, surahName: "Al-Asr", startPage: 601, endPage: 601 },
    { juz: 30, surahName: "Al-Humazah", startPage: 601, endPage: 601 },
    { juz: 30, surahName: "Al-Fil", startPage: 601, endPage: 601 },
    { juz: 30, surahName: "Quraish", startPage: 602, endPage: 602 },
    { juz: 30, surahName: "Al-Ma'un", startPage: 602, endPage: 602 },
    { juz: 30, surahName: "Al-Kawthar", startPage: 602, endPage: 602 },
    { juz: 30, surahName: "Al-Kafirun", startPage: 603, endPage: 603 },
    { juz: 30, surahName: "An-Nasr", startPage: 603, endPage: 603 },
    { juz: 30, surahName: "Al-Masad", startPage: 603, endPage: 603 },
    { juz: 30, surahName: "Al-Ikhlas", startPage: 604, endPage: 604 },
    { juz: 30, surahName: "Al-Falaq", startPage: 604, endPage: 604 },
    { juz: 30, surahName: "An-Nas", startPage: 604, endPage: 604 },
];

export const getSurahForPage = (page: number): string => {
    const surahs = surahJuzPageMapData
        .filter(item => page >= item.startPage && page <= item.endPage)
        .map(item => item.surahName);

    const uniqueSurahs = [...new Set(surahs)];
    
    if (uniqueSurahs.length === 0) {
        return "Unknown Surah";
    }
    return uniqueSurahs.join(' / ');
}
