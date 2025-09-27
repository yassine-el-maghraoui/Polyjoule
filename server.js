const express = require('express');
const { exec } = require('child_process'); // Pour exécuter update-calendar.js
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

// Exécuter update-calendar.js
function runUpdateCalendar() {
  return new Promise((resolve, reject) => {
    exec('node update-calendar.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Erreur d'exécution de update-calendar.js: ${error}`);
        reject(error);
      } else {
        console.log(`Résultat de update-calendar.js: ${stdout}`);
        resolve(stdout);
      }
    });
  });
}

app.use(express.static(path.join(__dirname))); // Servir les fichiers statiques (HTML, CSS, JS, images)

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html')); // Servir home.html à la racine
});

app.get('/calendrier', async (req, res) => {
  try {
    await runUpdateCalendar(); // Mettre à jour le calendrier
    const calendrierHtml = await fs.readFile(path.join(__dirname, 'calendrier-updated.html'), 'utf8');
    res.send(calendrierHtml); // Envoyer le HTML du calendrier
  } catch (error) {
    res.status(500).send('Erreur lors de la récupération du calendrier.');
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});