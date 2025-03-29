import { EmbedBuilder } from 'discord.js';
import translateGoogle from 'translate-google';

// Map country/region flags to language codes
const emojiLanguageMap = new Map([
    // English speaking countries
    ['🇬🇧', { langCode: 'en' }],  // United Kingdom
    ['🇺🇸', { langCode: 'en' }],  // United States
    ['🇦🇺', { langCode: 'en' }],  // Australia
    ['🇨🇦', { langCode: 'en' }],  // Canada
    ['🇳🇿', { langCode: 'en' }],  // New Zealand
    ['🇮🇪', { langCode: 'en' }],  // Ireland
    ['🇿🇦', { langCode: 'en' }],  // South Africa
    
    // European languages
    ['🇫🇷', { langCode: 'fr' }],  // France
    ['🇩🇪', { langCode: 'de' }],  // Germany
    ['🇦🇹', { langCode: 'de' }],  // Austria
    ['🇨🇭', { langCode: 'de' }],  // Switzerland
    ['🇮🇹', { langCode: 'it' }],  // Italy
    ['🇪🇸', { langCode: 'es' }],  // Spain
    ['🇵🇹', { langCode: 'pt' }],  // Portugal
    ['🇧🇪', { langCode: 'nl' }],  // Belgium
    ['🇳🇱', { langCode: 'nl' }],  // Netherlands
    ['🇷🇺', { langCode: 'ru' }],  // Russia
    ['🇵🇱', { langCode: 'pl' }],  // Poland
    ['🇷🇴', { langCode: 'ro' }],  // Romania
    ['🇬🇷', { langCode: 'el' }],  // Greece
    ['🇨🇾', { langCode: 'el' }],  // Cyprus
    
    // Nordic countries
    ['🇸🇪', { langCode: 'sv' }],  // Sweden
    ['🇳🇴', { langCode: 'no' }],  // Norway
    ['🇩🇰', { langCode: 'da' }],  // Denmark
    ['🇫🇮', { langCode: 'fi' }],  // Finland
    ['🇮🇸', { langCode: 'is' }],  // Iceland
    
    // Baltic states
    ['🇪🇪', { langCode: 'et' }],  // Estonia
    ['🇱🇹', { langCode: 'lt' }],  // Lithuania
    ['🇱🇻', { langCode: 'lv' }],  // Latvia
    
    // Asian languages
    ['🇨🇳', { langCode: 'zh-CN' }], // China
    ['🇭🇰', { langCode: 'zh-TW' }], // Hong Kong
    ['🇹🇼', { langCode: 'zh-TW' }], // Taiwan
    ['🇯🇵', { langCode: 'ja' }],    // Japan
    ['🇰🇷', { langCode: 'ko' }],    // Korea
    ['🇮🇳', { langCode: 'hi' }],    // India
    ['🇵🇰', { langCode: 'ur' }],    // Pakistan
    ['🇧🇩', { langCode: 'bn' }],    // Bangladesh
    ['🇻🇳', { langCode: 'vi' }],    // Vietnam
    ['🇰🇭', { langCode: 'km' }],    // Cambodia
    ['🇱🇰', { langCode: 'si' }],    // Sri Lanka
    ['🇹🇭', { langCode: 'th' }],    // Thailand
    ['🇲🇾', { langCode: 'ms' }],    // Malaysia
    ['🇮🇩', { langCode: 'id' }],    // Indonesia
    ['🇵🇭', { langCode: 'tl' }],    // Philippines
    
    // Middle Eastern
    ['🇮🇱', { langCode: 'he' }],    // Israel
    ['🇸🇦', { langCode: 'ar' }],    // Saudi Arabia
    ['🇦🇪', { langCode: 'ar' }],    // UAE
    ['🇪🇬', { langCode: 'ar' }],    // Egypt
    ['🇯🇴', { langCode: 'ar' }],    // Jordan
    ['🇰🇼', { langCode: 'ar' }],    // Kuwait
    
    // Latin American Spanish
    ['🇲🇽', { langCode: 'es' }],    // Mexico
    ['🇦🇷', { langCode: 'es' }],    // Argentina
    ['🇨🇴', { langCode: 'es' }],    // Colombia
    ['🇨🇱', { langCode: 'es' }],    // Chile
    ['🇵🇪', { langCode: 'es' }],    // Peru
    
    // Portuguese speaking
    ['🇧🇷', { langCode: 'pt' }],    // Brazil
    ['🇵🇹', { langCode: 'pt' }],    // Portugal
]);

const languageMap = {
    english: "en",
    portuguese: "pt",
    chinese: "zh-CN",
    german: "de",
    hindi: "hi",
    italian: "it",
    japanese: "ja",
    korean: "ko",
    spanish: "es",
    dutch: "nl",
    hebrew: "he",
    swahili: "sw",
    polish: "pl",
    russian: "ru",
    arabic: "ar",
    afrikaans: "af",
    french: "fr",
    danish: "da",
    icelandic: "is",
    swedish: "sv",
    norwegian: "no",
    estonian: "et",
    lithuanian: "lt",
    romanian: "ro",
    bulgarian: "bg",
    khmer: "km",
    greek: "el",
    serbian: "sr",
    slovenian: "sl",
    sinhala: "si",
    malay: "ms",
    urdu: "ur",
    vietnamese: "vi",
    tagalog: "tl",
    turkish: "tr",
    irish: "ga",
    bengali: "bn",
    finnish: "fi",
    indonesian: "id",
    thai: "th",
};

// Handle text command translations (.t)
export function TranslateToRequestedLanguage(message) {
    const str = message.content.replace(".t  ", "");
    const words = str.split(" ");
    const language = words[1].toLowerCase();
    const sentence = words.slice(2).join(" ");

    if (!languageMap[language]) {
        sendErrorEmbed(message, "Invalid language specified.");
        return;
    }

    translateText(sentence, languageMap[language], message);
}

// Helper function to check if emoji is a flag
function isFlag(emoji) {
    return /\p{Regional_Indicator}{2}/u.test(emoji);
}

// Handle flag reaction translations
export function TranslateFromCode(message, reactionEmojiName) {
    // Check if reaction is a flag emoji
    if (!isFlag(reactionEmojiName)) {
        return; // Silently ignore non-flag reactions
    }

    const flag = emojiLanguageMap.get(reactionEmojiName);

    if (!flag?.langCode) {
        // Only send error if it was a flag but not supported
        sendErrorEmbed(message, "This flag's language is not supported yet.");
        return;
    }

    translateText(message.content, flag.langCode, message);
}

// Helper function for translation
function translateText(text, targetLang, message) {
    translateGoogle(text, { to: targetLang })
        .then(res => {
            const embed = new EmbedBuilder()
                .setDescription(res)
                .setFooter({ 
                    text: message.author.username, 
                    iconURL: message.author.displayAvatarURL() 
                });
            message.channel.send({ embeds: [embed] });
        })
        .catch(err => {
            console.error('Translation error:', err);
            sendErrorEmbed(message, "Error translating text.");
        });
}

// Helper for error messages
function sendErrorEmbed(message, errorText) {
    const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setDescription(`❌ ${errorText}`)
        .setFooter({ 
            text: message.author.username, 
            iconURL: message.author.displayAvatarURL() 
        });
    message.channel.send({ embeds: [embed] });
}