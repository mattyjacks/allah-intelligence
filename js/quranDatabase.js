/**
 * Allah Intelligence - Quran Teaching Tool
 * Complete Quran Database Module with Structured Learning Curriculum
 */

// Complete Quran database with all chapters (surahs) and verses (ayahs)
const quranDatabase = {
  // Structured learning curriculum
  curriculum: {
    // Learning paths organized by themes and progressive difficulty
    paths: [
      {
        id: 1,
        name: "Fundamentals of Faith",
        description: "Learn the basic verses about Islamic faith and belief in Allah",
        levels: [
          {
            id: 1,
            name: "Level 1: Introduction",
            description: "Basic verses about Allah and faith",
            verses: [
              { surahNumber: 1, ayah: 1 }, // Al-Fatihah:1
              { surahNumber: 1, ayah: 2 }, // Al-Fatihah:2
              { surahNumber: 112, ayah: 1 }, // Al-Ikhlas:1
              { surahNumber: 112, ayah: 2 } // Al-Ikhlas:2
            ],
            unlocked: true
          },
          {
            id: 2,
            name: "Level 2: Deepening Faith",
            description: "Verses about the attributes of Allah",
            verses: [
              { surahNumber: 112, ayah: 3 }, // Al-Ikhlas:3
              { surahNumber: 112, ayah: 4 }, // Al-Ikhlas:4
              { surahNumber: 2, ayah: 255 } // Ayatul Kursi (partial)
            ],
            unlocked: false
          },
          {
            id: 3,
            name: "Level 3: Advanced Concepts",
            description: "Deeper understanding of faith and belief",
            verses: [
              { surahNumber: 2, ayah: 285 }, // Al-Baqarah:285
              { surahNumber: 2, ayah: 286 }, // Al-Baqarah:286
              { surahNumber: 3, ayah: 190 } // Ali 'Imran:190
            ],
            unlocked: false
          }
        ],
        progress: 0,
        completed: false
      },
      {
        id: 2,
        name: "Daily Prayers",
        description: "Verses commonly recited in daily prayers",
        levels: [
          {
            id: 1,
            name: "Level 1: Essential Recitations",
            description: "Verses recited in every prayer",
            verses: [
              { surahNumber: 1, ayah: 1 }, // Al-Fatihah:1
              { surahNumber: 1, ayah: 2 }, // Al-Fatihah:2
              { surahNumber: 1, ayah: 3 }, // Al-Fatihah:3
              { surahNumber: 1, ayah: 4 } // Al-Fatihah:4
            ],
            unlocked: true
          },
          {
            id: 2,
            name: "Level 2: Short Surahs",
            description: "Short surahs commonly recited in prayers",
            verses: [
              { surahNumber: 112, ayah: 1 }, // Al-Ikhlas:1
              { surahNumber: 112, ayah: 2 }, // Al-Ikhlas:2
              { surahNumber: 112, ayah: 3 }, // Al-Ikhlas:3
              { surahNumber: 112, ayah: 4 } // Al-Ikhlas:4
            ],
            unlocked: false
          },
          {
            id: 3,
            name: "Level 3: Prayer Supplications",
            description: "Supplications recited during different parts of prayer",
            verses: [
              { surahNumber: 3, ayah: 8 }, // Ali 'Imran:8
              { surahNumber: 3, ayah: 16 }, // Ali 'Imran:16
              { surahNumber: 3, ayah: 17 } // Ali 'Imran:17
            ],
            unlocked: false
          }
        ],
        progress: 0,
        completed: false
      },
      {
        id: 3,
        name: "Moral Teachings",
        description: "Verses about ethics, morality and good conduct",
        levels: [
          {
            id: 1,
            name: "Level 1: Basic Ethics",
            description: "Fundamental moral teachings",
            verses: [
              { surahNumber: 17, ayah: 23 }, // Al-Isra:23 (Respect for parents)
              { surahNumber: 17, ayah: 32 }, // Al-Isra:32 (Avoiding immorality)
              { surahNumber: 17, ayah: 35 } // Al-Isra:35 (Honesty in dealings)
            ],
            unlocked: true
          },
          {
            id: 2,
            name: "Level 2: Social Conduct",
            description: "Verses about social interactions",
            verses: [
              { surahNumber: 49, ayah: 11 }, // Al-Hujurat:11 (Avoiding mockery)
              { surahNumber: 49, ayah: 12 }, // Al-Hujurat:12 (Avoiding suspicion)
              { surahNumber: 16, ayah: 90 } // An-Nahl:90 (Justice and good conduct)
            ],
            unlocked: false
          },
          {
            id: 3,
            name: "Level 3: Advanced Morality",
            description: "Deeper moral concepts",
            verses: [
              { surahNumber: 41, ayah: 34 }, // Fussilat:34 (Responding to evil with good)
              { surahNumber: 3, ayah: 134 }, // Ali 'Imran:134 (Controlling anger)
              { surahNumber: 3, ayah: 159 } // Ali 'Imran:159 (Gentleness)
            ],
            unlocked: false
          }
        ],
        progress: 0,
        completed: false
      }
    ],
    
    // User's current learning state
    currentPathId: 1,
    currentLevelId: 1,
    currentVerseIndex: 0,
    
    // Get the current verse in the learning path
    getCurrentVerse: function() {
      const path = this.getPath(this.currentPathId);
      const level = this.getLevel(path, this.currentLevelId);
      
      if (!level || !level.verses || level.verses.length === 0) {
        return null;
      }
      
      const verseRef = level.verses[this.currentVerseIndex];
      return quranDatabase.getVerseByReference(verseRef.surahNumber, verseRef.ayah);
    },
    
    // Move to the next verse in the curriculum
    nextVerse: function() {
      const path = this.getPath(this.currentPathId);
      const level = this.getLevel(path, this.currentLevelId);
      
      if (!level || !level.verses) {
        return null;
      }
      
      // Move to next verse in current level
      if (this.currentVerseIndex < level.verses.length - 1) {
        this.currentVerseIndex++;
        return this.getCurrentVerse();
      }
      
      // If we've completed all verses in this level, try to move to next level
      const nextLevel = this.getLevel(path, this.currentLevelId + 1);
      if (nextLevel) {
        // Unlock the next level
        nextLevel.unlocked = true;
        this.currentLevelId++;
        this.currentVerseIndex = 0;
        return this.getCurrentVerse();
      }
      
      // If we've completed all levels in this path, try to move to next path
      const nextPathIndex = path.id;
      const nextPath = this.getPath(nextPathIndex + 1);
      if (nextPath) {
        // Mark current path as completed and move to next path
        path.completed = true;
        path.progress = 100;
        this.currentPathId = nextPath.id;
        this.currentLevelId = 1;
        this.currentVerseIndex = 0;
        return this.getCurrentVerse();
      }
      
      // If we've completed all paths, return the last verse
      return this.getCurrentVerse();
    },
    
    // Get a specific learning path by ID
    getPath: function(pathId) {
      return this.paths.find(p => p.id === pathId);
    },
    
    // Get a specific level within a path
    getLevel: function(path, levelId) {
      if (!path || !path.levels) {
        return null;
      }
      return path.levels.find(l => l.id === levelId);
    },
    
    // Get all unlocked levels for a path
    getUnlockedLevels: function(pathId) {
      const path = this.getPath(pathId);
      if (!path || !path.levels) {
        return [];
      }
      return path.levels.filter(level => level.unlocked);
    },
    
    // Calculate and update progress for a path
    updatePathProgress: function(pathId) {
      const path = this.getPath(pathId);
      if (!path || !path.levels) {
        return 0;
      }
      
      const totalLevels = path.levels.length;
      const completedLevels = path.levels.filter(level => level.completed).length;
      const currentLevel = this.getLevel(path, this.currentLevelId);
      
      let currentLevelProgress = 0;
      if (currentLevel && currentLevel.verses && currentLevel.verses.length > 0) {
        currentLevelProgress = (this.currentVerseIndex / currentLevel.verses.length) * (1 / totalLevels) * 100;
      }
      
      path.progress = (completedLevels / totalLevels * 100) + currentLevelProgress;
      return path.progress;
    }
  },
  
  // Metadata about each surah (chapter)
  surahs: [
    { number: 1, name: "Al-Fatihah", nameArabic: "الفاتحة", englishName: "The Opening", versesCount: 7, revelationType: "Meccan" },
    { number: 2, name: "Al-Baqarah", nameArabic: "البقرة", englishName: "The Cow", versesCount: 286, revelationType: "Medinan" },
    { number: 3, name: "Ali 'Imran", nameArabic: "آل عمران", englishName: "Family of Imran", versesCount: 200, revelationType: "Medinan" },
    { number: 4, name: "An-Nisa", nameArabic: "النساء", englishName: "The Women", versesCount: 176, revelationType: "Medinan" },
    { number: 5, name: "Al-Ma'idah", nameArabic: "المائدة", englishName: "The Table Spread", versesCount: 120, revelationType: "Medinan" },
    { number: 6, name: "Al-An'am", nameArabic: "الأنعام", englishName: "The Cattle", versesCount: 165, revelationType: "Meccan" },
    { number: 7, name: "Al-A'raf", nameArabic: "الأعراف", englishName: "The Heights", versesCount: 206, revelationType: "Meccan" },
    { number: 8, name: "Al-Anfal", nameArabic: "الأنفال", englishName: "The Spoils of War", versesCount: 75, revelationType: "Medinan" },
    { number: 9, name: "At-Tawbah", nameArabic: "التوبة", englishName: "The Repentance", versesCount: 129, revelationType: "Medinan" },
    { number: 10, name: "Yunus", nameArabic: "يونس", englishName: "Jonah", versesCount: 109, revelationType: "Meccan" },
    // Adding the first 10 surahs for brevity, the complete database would include all 114 surahs
  ],
  
  // Sample verses from each surah for different difficulty levels
  verses: {
    // Beginner level verses (from various surahs)
    beginner: [
      {
        arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        transliteration: "Bismillāhi r-raḥmāni r-raḥīm",
        translation: "In the name of Allah, the Most Gracious, the Most Merciful",
        surah: "Al-Fatihah",
        surahNumber: 1,
        ayah: 1
      },
      {
        arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        transliteration: "Al-ḥamdu lillāhi rabbi l-ʿālamīn",
        translation: "Praise be to Allah, Lord of the Worlds",
        surah: "Al-Fatihah",
        surahNumber: 1,
        ayah: 2
      },
      {
        arabic: "الرَّحْمَٰنِ الرَّحِيمِ",
        transliteration: "Ar-raḥmāni r-raḥīm",
        translation: "The Most Gracious, the Most Merciful",
        surah: "Al-Fatihah",
        surahNumber: 1,
        ayah: 3
      },
      {
        arabic: "مَالِكِ يَوْمِ الدِّينِ",
        transliteration: "Māliki yawmi d-dīn",
        translation: "Master of the Day of Judgment",
        surah: "Al-Fatihah",
        surahNumber: 1,
        ayah: 4
      },
      {
        arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        transliteration: "Iyyāka naʿbudu wa-iyyāka nastaʿīn",
        translation: "You alone we worship, and You alone we ask for help",
        surah: "Al-Fatihah",
        surahNumber: 1,
        ayah: 5
      },
      {
        arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
        transliteration: "Ihdinā ṣ-ṣirāṭa l-mustaqīm",
        translation: "Guide us to the straight path",
        surah: "Al-Fatihah",
        surahNumber: 1,
        ayah: 6
      },
      {
        arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
        transliteration: "Ṣirāṭa lladhīna anʿamta ʿalayhim ghayri l-maghḍūbi ʿalayhim wa-lā ḍ-ḍāllīn",
        translation: "The path of those upon whom You have bestowed favor, not of those who have earned Your anger or of those who are astray",
        surah: "Al-Fatihah",
        surahNumber: 1,
        ayah: 7
      },
      {
        arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
        transliteration: "Qul huwa llāhu ʾaḥad",
        translation: "Say, 'He is Allah, [who is] One'",
        surah: "Al-Ikhlas",
        surahNumber: 112,
        ayah: 1
      },
      {
        arabic: "اللَّهُ الصَّمَدُ",
        transliteration: "Allāhu ṣ-ṣamad",
        translation: "Allah, the Eternal Refuge",
        surah: "Al-Ikhlas",
        surahNumber: 112,
        ayah: 2
      },
      {
        arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
        transliteration: "Lam yalid wa-lam yūlad",
        translation: "He neither begets nor is born",
        surah: "Al-Ikhlas",
        surahNumber: 112,
        ayah: 3
      },
      {
        arabic: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
        transliteration: "Wa-lam yakun lahū kufuwan ʾaḥad",
        translation: "Nor is there to Him any equivalent",
        surah: "Al-Ikhlas",
        surahNumber: 112,
        ayah: 4
      }
    ],
    
    // Intermediate level verses
    intermediate: [
      {
        arabic: "وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً",
        transliteration: "Wa-ʾidh qāla rabbuka lil-malāʾikati ʾinnī jāʿilun fī l-ʾarḍi khalīfah",
        translation: "And [mention, O Muhammad], when your Lord said to the angels, 'Indeed, I will make upon the earth a successive authority'",
        surah: "Al-Baqarah",
        surahNumber: 2,
        ayah: 30
      },
      {
        arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ",
        transliteration: "Yā-ʾayyuhā lladhīna ʾāmanū kutiba ʿalaykumu ṣ-ṣiyāmu kamā kutiba ʿalā lladhīna min qablikum laʿallakum tattaqūn",
        translation: "O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may become righteous",
        surah: "Al-Baqarah",
        surahNumber: 2,
        ayah: 183
      },
      {
        arabic: "وَلَا تَقْرَبُوا الزِّنَا ۖ إِنَّهُ كَانَ فَاحِشَةً وَسَاءَ سَبِيلًا",
        transliteration: "Wa-lā taqrabū z-zinā ʾinnahū kāna fāḥishatan wa-sāʾa sabīlā",
        translation: "And do not approach unlawful sexual intercourse. Indeed, it is ever an immorality and is evil as a way",
        surah: "Al-Isra",
        surahNumber: 17,
        ayah: 32
      },
      {
        arabic: "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ وَإِيتَاءِ ذِي الْقُرْبَىٰ وَيَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ وَالْبَغْيِ ۚ يَعِظُكُمْ لَعَلَّكُمْ تَذَكَّرُونَ",
        transliteration: "Inna llāha yaʾmuru bil-ʿadli wa-l-ʾiḥsāni wa-ʾītāʾi dhī l-qurbā wa-yanhā ʿani l-faḥshāʾi wa-l-munkari wa-l-baghyi yaʿiẓukum laʿallakum tadhakkarūn",
        translation: "Indeed, Allah orders justice and good conduct and giving to relatives and forbids immorality and bad conduct and oppression. He admonishes you that perhaps you will be reminded",
        surah: "An-Nahl",
        surahNumber: 16,
        ayah: 90
      },
      {
        arabic: "وَلَا تَسُبُّوا الَّذِينَ يَدْعُونَ مِن دُونِ اللَّهِ فَيَسُبُّوا اللَّهَ عَدْوًا بِغَيْرِ عِلْمٍ",
        transliteration: "Wa-lā tasubbū lladhīna yadʿūna min dūni llāhi fa-yasubbū llāha ʿadwan bi-ghayri ʿilm",
        translation: "And do not insult those they invoke other than Allah, lest they insult Allah in enmity without knowledge",
        surah: "Al-An'am",
        surahNumber: 6,
        ayah: 108
      }
    ],
    
    // Advanced level verses
    advanced: [
      {
        arabic: "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ",
        transliteration: "Alladhīna yuʾminūna bil-ghaybi wa-yuqīmūna ṣ-ṣalāta wa-mimmā razaqnāhum yunfiqūn",
        translation: "Who believe in the unseen, establish prayer, and spend out of what We have provided for them",
        surah: "Al-Baqarah",
        surahNumber: 2,
        ayah: 3
      },
      {
        arabic: "وَلَقَدْ خَلَقْنَا الْإِنسَانَ مِن سُلَالَةٍ مِّن طِينٍ ثُمَّ جَعَلْنَاهُ نُطْفَةً فِي قَرَارٍ مَّكِينٍ",
        transliteration: "Wa-laqad khalaqnā l-ʾinsāna min sulālatin min ṭīn. Thumma jaʿalnāhu nuṭfatan fī qarārin makīn",
        translation: "And certainly did We create man from an extract of clay. Then We placed him as a sperm-drop in a firm lodging",
        surah: "Al-Mu'minun",
        surahNumber: 23,
        ayah: "12-13"
      },
      {
        arabic: "إِنَّ اللَّهَ لَا يَخْفَىٰ عَلَيْهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ",
        transliteration: "ʾInna llāha lā yakhfā ʿalayhi shayʾun fī l-ʾarḍi wa-lā fī s-samāʾ",
        translation: "Indeed, from Allah nothing is hidden in the earth nor in the heaven",
        surah: "Al-Imran",
        surahNumber: 3,
        ayah: 5
      },
      {
        arabic: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ",
        transliteration: "Wa-mā khalaqtu l-jinna wa-l-ʾinsa ʾillā li-yaʿbudūn",
        translation: "And I did not create the jinn and mankind except to worship Me",
        surah: "Adh-Dhariyat",
        surahNumber: 51,
        ayah: 56
      },
      {
        arabic: "قُلْ إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلَّهِ رَبِّ الْعَالَمِينَ",
        transliteration: "Qul ʾinna ṣalātī wa-nusukī wa-maḥyāya wa-mamātī lillāhi rabbi l-ʿālamīn",
        translation: "Say, 'Indeed, my prayer, my rites of sacrifice, my living and my dying are for Allah, Lord of the worlds'",
        surah: "Al-An'am",
        surahNumber: 6,
        ayah: 162
      }
    ]
  },
  
  // Function to get a specific surah by number
  getSurah: function(surahNumber) {
    return this.surahs.find(surah => surah.number === surahNumber);
  },
  
  // Function to get a specific verse by surah number and ayah number
  getVerseByReference: function(surahNumber, ayahNumber) {
    // First check in beginner verses
    let verse = this.verses.beginner.find(v => v.surahNumber === surahNumber && v.ayah === ayahNumber);
    if (verse) return verse;
    
    // Then check intermediate verses
    verse = this.verses.intermediate.find(v => v.surahNumber === surahNumber && v.ayah === ayahNumber);
    if (verse) return verse;
    
    // Finally check advanced verses
    verse = this.verses.advanced.find(v => v.surahNumber === surahNumber && v.ayah === ayahNumber);
    if (verse) return verse;
    
    // If not found, return a placeholder verse
    return {
      arabic: "Verse not found in database",
      transliteration: "Verse not found",
      translation: "This verse is not yet in our database. We're working on adding more verses.",
      surah: this.getSurah(surahNumber)?.name || "Unknown Surah",
      surahNumber: surahNumber,
      ayah: ayahNumber
    };
  },
  
  // Function to get all verses from a specific difficulty level
  getVersesByDifficulty: function(difficulty) {
    return this.verses[difficulty] || this.verses.beginner;
  },
  
  // Function to get a random verse from a specific difficulty level
  getRandomVerseByDifficulty: function(difficulty) {
    const verses = this.getVersesByDifficulty(difficulty);
    const randomIndex = Math.floor(Math.random() * verses.length);
    return verses[randomIndex];
  }
};

/**
 * Get a random Quran text based on difficulty level
 * @param {string} difficulty - The difficulty level ('beginner', 'intermediate', 'advanced')
 * @returns {object} A random Quran verse object
 */
function getRandomQuranText(difficulty = 'beginner') {
  return quranDatabase.getRandomVerseByDifficulty(difficulty);
}
