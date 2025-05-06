/**
 * Allah Intelligence - Quran Teaching Tool
 * Quran Data Module
 */

// Sample Quran verses with different difficulty levels
const quranData = {
    beginner: [
        {
            arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
            transliteration: "Bismillāhi r-raḥmāni r-raḥīm",
            translation: "In the name of Allah, the Most Gracious, the Most Merciful",
            surah: "Al-Fatihah",
            ayah: 1
        },
        {
            arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
            transliteration: "Al-ḥamdu lillāhi rabbi l-ʿālamīn",
            translation: "Praise be to Allah, Lord of the Worlds",
            surah: "Al-Fatihah",
            ayah: 2
        },
        {
            arabic: "الرَّحْمَٰنِ الرَّحِيمِ",
            transliteration: "Ar-raḥmāni r-raḥīm",
            translation: "The Most Gracious, the Most Merciful",
            surah: "Al-Fatihah",
            ayah: 3
        },
        {
            arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
            transliteration: "Qul huwa llāhu ʾaḥad",
            translation: "Say, 'He is Allah, [who is] One'",
            surah: "Al-Ikhlas",
            ayah: 1
        },
        {
            arabic: "اللَّهُ الصَّمَدُ",
            transliteration: "Allāhu ṣ-ṣamad",
            translation: "Allah, the Eternal Refuge",
            surah: "Al-Ikhlas",
            ayah: 2
        }
    ],
    intermediate: [
        {
            arabic: "وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً",
            transliteration: "Wa-ʾidh qāla rabbuka lil-malāʾikati ʾinnī jāʿilun fī l-ʾarḍi khalīfah",
            translation: "And [mention, O Muhammad], when your Lord said to the angels, 'Indeed, I will make upon the earth a successive authority'",
            surah: "Al-Baqarah",
            ayah: 30
        },
        {
            arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ",
            transliteration: "Yā-ʾayyuhā lladhīna ʾāmanū kutiba ʿalaykumu ṣ-ṣiyāmu kamā kutiba ʿalā lladhīna min qablikum laʿallakum tattaqūn",
            translation: "O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may become righteous",
            surah: "Al-Baqarah",
            ayah: 183
        },
        {
            arabic: "وَلَا تَقْرَبُوا الزِّنَا ۖ إِنَّهُ كَانَ فَاحِشَةً وَسَاءَ سَبِيلًا",
            transliteration: "Wa-lā taqrabū z-zinā ʾinnahū kāna fāḥishatan wa-sāʾa sabīlā",
            translation: "And do not approach unlawful sexual intercourse. Indeed, it is ever an immorality and is evil as a way",
            surah: "Al-Isra",
            ayah: 32
        }
    ],
    advanced: [
        {
            arabic: "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ",
            transliteration: "Alladhīna yuʾminūna bil-ghaybi wa-yuqīmūna ṣ-ṣalāta wa-mimmā razaqnāhum yunfiqūn",
            translation: "Who believe in the unseen, establish prayer, and spend out of what We have provided for them",
            surah: "Al-Baqarah",
            ayah: 3
        },
        {
            arabic: "وَلَقَدْ خَلَقْنَا الْإِنسَانَ مِن سُلَالَةٍ مِّن طِينٍ ثُمَّ جَعَلْنَاهُ نُطْفَةً فِي قَرَارٍ مَّكِينٍ",
            transliteration: "Wa-laqad khalaqnā l-ʾinsāna min sulālatin min ṭīn. Thumma jaʿalnāhu nuṭfatan fī qarārin makīn",
            translation: "And certainly did We create man from an extract of clay. Then We placed him as a sperm-drop in a firm lodging",
            surah: "Al-Mu'minun",
            ayah: "12-13"
        },
        {
            arabic: "إِنَّ اللَّهَ لَا يَخْفَىٰ عَلَيْهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ",
            transliteration: "ʾInna llāha lā yakhfā ʿalayhi shayʾun fī l-ʾarḍi wa-lā fī s-samāʾ",
            translation: "Indeed, from Allah nothing is hidden in the earth nor in the heaven",
            surah: "Al-Imran",
            ayah: 5
        }
    ]
};

/**
 * Get a random Quran text based on difficulty level
 * @param {string} difficulty - The difficulty level ('beginner', 'intermediate', 'advanced')
 * @returns {object} A random Quran verse object
 */
function getRandomQuranText(difficulty = 'beginner') {
    // Default to beginner if invalid difficulty is provided
    if (!quranData[difficulty]) {
        difficulty = 'beginner';
    }
    
    // Get random index
    const randomIndex = Math.floor(Math.random() * quranData[difficulty].length);
    
    // Return the random verse
    return quranData[difficulty][randomIndex];
}
