// Script Node.js pour mettre à jour le calendrier HTML à partir de fichiers texte
const fs = require('fs');
const path = require('path');

// Chemins des fichiers
const htmlFilePath = path.join(__dirname, 'calendrier.html');
const upcomingEventsFilePath = path.join(__dirname, 'evenements-a-venir.txt');
const pastEventsFilePath = path.join(__dirname, 'evenements-passes.txt');
const outputHtmlPath = path.join(__dirname, 'calendrier-updated.html');

// Format attendu dans les fichiers texte:
/*
Nom de l'événement 1|Description de l'événement 1|assets/image1.jpg|https://lien-details-1
Nom de l'événement 2|Description de l'événement 2|assets/image2.jpg|https://lien-details-2
etc.
*/

// Fonction pour convertir le texte en objets d'événements
function parseEventsFromText(text) {
  return text.trim().split('\n').map(line => {
    const [title, description, imageUrl, detailsLink] = line.split('|');
    return { title, description, imageUrl, detailsLink };
  });
}

// Fonction pour générer le HTML d'un événement
function createEventHTML(event) {
  return `
                <div class="event-wrapper">
                  <div class="event-card">
                    <img src="${event.imageUrl}" alt="${event.title}">
                    <h3>${event.title}</h3>
                    <p>${event.description}</p>
                    <a href="${event.detailsLink}" class="details">Plus de détails</a>
                  </div>
                </div>`;
}

// Fonction principale pour mettre à jour le HTML
async function updateCalendarHTML() {
  try {
    // Lire le fichier HTML
    let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
    
    // Lire les fichiers texte
    const upcomingEventsText = fs.readFileSync(upcomingEventsFilePath, 'utf8');
    const pastEventsText = fs.readFileSync(pastEventsFilePath, 'utf8');
    
    // Parser les événements
    const upcomingEvents = parseEventsFromText(upcomingEventsText);
    const pastEvents = parseEventsFromText(pastEventsText);
    
    // Générer le HTML pour les événements à venir
    let upcomingEventsHTML = '';
    upcomingEvents.forEach(event => {
      upcomingEventsHTML += createEventHTML(event);
    });
    
    // Générer le HTML pour les événements passés
    let pastEventsHTML = '';
    pastEvents.forEach(event => {
      pastEventsHTML += createEventHTML(event);
    });
    
    // Rechercher et remplacer les sections dans le HTML
    const upcomingEventsRegex = /(<div class="upcoming-events">)[\s\S]*?(<\/div>\s*<h2>)/;
    htmlContent = htmlContent.replace(upcomingEventsRegex, `$1${upcomingEventsHTML}$2`);
    
    const pastEventsRegex = /(<div class="past-events">)[\s\S]*?(<\/div>\s*<\/div>\s*<footer)/;
    htmlContent = htmlContent.replace(pastEventsRegex, `$1${pastEventsHTML}$2`);
    
    // Écrire le HTML mis à jour
    fs.writeFileSync(outputHtmlPath, htmlContent);
    
    console.log('Calendrier HTML mis à jour avec succès!');
  } catch (error) {
    console.error('Erreur lors de la mise à jour du HTML:', error);
  }
}

// Surveiller les modifications des fichiers texte
fs.watchFile(upcomingEventsFilePath, (curr, prev) => {
  console.log('Fichier des événements à venir modifié, mise à jour du HTML...');
  updateCalendarHTML();
});

fs.watchFile(pastEventsFilePath, (curr, prev) => {
  console.log('Fichier des événements passés modifié, mise à jour du HTML...');
  updateCalendarHTML();
});

// Mise à jour initiale
updateCalendarHTML();
console.log(`Surveillance des fichiers ${upcomingEventsFilePath} et ${pastEventsFilePath}.`);
console.log('Modifiez-les pour mettre à jour le HTML automatiquement.');