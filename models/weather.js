import { EmbedBuilder } from 'discord.js';
import weather from 'weather-js';

// Map weather conditions to hex colors for embed styling
const skyColors = {
    'Thunderstorm': 0xFF0000,   // Red
    'Rain snow': 0x00BFFF,      // Deep sky blue
    'Sleet': 0xB0C4DE,         // Light steel blue
    'Icy': 0xADD8E6,           // Light blue
    'Showers': 0x4682B4,       // Steel blue
    'Rain': 0x1E90FF,          // Dodger blue
    'Flurries': 0xD3D3D3,      // Light gray
    'Snow': 0xFFFFFF,          // White
    'Dust': 0xD2B48C,          // Tan
    'Fog': 0x708090,           // Slate gray
    'Haze': 0xD8BFD8,          // Thistle
    'Windy': 0xA9A9A9,         // Dark gray
    'Cloudy': 0x808080,        // Gray
    'Mostly cloudy': 0x778899,  // Light slate gray
    'Partly cloudy': 0xB0E0E6,  // Powder blue
    'Sunny': 0xFFD700,         // Gold
    'Mostly sunny': 0xFFA500,   // Orange
    'Hot': 0xFF6347,           // Tomato
    'Chance of tstorm': 0xFF4500, // Orange red
    'Chance of rain': 0x32CD32,   // Lime green
    'Chance of snow': 0x00CED1,   // Dark turquoise
    'Clear': 0xFFFFFF,         // White
    'Partly sunny': 0xFFD700    // Gold
};

// Handle weather forecast requests
export function GetForecast(message) {
    // Extract city name from command
    const city = message.content.replace(".weather  ", "");

    // Query weather service
    weather.find({search: city, degreeType: 'C'}, function(err, result) {
        if (err) {
            console.log(err);
            sendErrorEmbed(message);
            return;
        }
        
        if (!result?.length) {
            sendNoCityEmbed(message);
            return;
        }

        // Build weather embed
        const [data] = result;
        sendWeatherEmbed(message, data);
    });
}

// Helper functions for embed responses
function sendErrorEmbed(message) {
    const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle("Oops! Something went wrong!")
        .setDescription("⚠️ There was an issue fetching the weather data. Please try again later.");
    message.channel.send({ embeds: [errorEmbed] });
}

function sendNoCityEmbed(message) {
    const noCityEmbed = new EmbedBuilder()
        .setColor(0xFF6347)
        .setTitle("Hmm... City not found!")
        .setDescription("❓ I couldn't find that city. Could you check the spelling or try another one?");
    message.channel.send({ embeds: [noCityEmbed] });
}

function sendWeatherEmbed(message, data) {
    const { location, current, forecast } = data;
    const color = skyColors[current.skytext] || 0x0099FF;

    const weatherEmbed = new EmbedBuilder()
        .setColor(color)
        .setTitle(location.name)
        .setThumbnail(current.imageUrl)
        .setImage(current.imageUrl)
        .addFields(
            { name: 'Current Temperature', value: `${current.temperature}°C`, inline: true },
            { name: 'Feels Like', value: `${current.feelslike}°C`, inline: true },
            { name: 'Condition', value: current.skytext, inline: true },
            { name: 'Humidity', value: `${current.humidity}%`, inline: true },
            { name: 'Wind Speed', value: current.windspeed, inline: true },
            { name: 'Wind Direction', value: current.winddisplay, inline: true }
        )
        .addFields(
            { name: 'Today\'s Forecast', value: `${forecast[0].skytextday} with a high of ${forecast[0].high}°C and a low of ${forecast[0].low}°C`, inline: false },
            { name: 'Tomorrow\'s Forecast', value: `${forecast[1].skytextday} with a high of ${forecast[1].high}°C and a low of ${forecast[1].low}°C`, inline: false }
        )
        .setTimestamp();

    message.channel.send({ embeds: [weatherEmbed] });
}
