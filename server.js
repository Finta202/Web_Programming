const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/slike', (req, res) => {
  const folderPath = path.join(__dirname, 'public', 'images');
  const files = fs.readdirSync(folderPath);

  const localImages = files
    .filter(file =>
      file.endsWith('.jpg') ||
      file.endsWith('.jpeg') ||
      file.endsWith('.png') ||
      file.endsWith('.svg') ||
      file.endsWith('.webp')
    )
    .map((file, index) => ({
      url: `/images/${file}`,
      id: `lokalna${index + 1}`,
      title: path.parse(file).name
    }));

  const randomImages = Array.from({ length: 3 }, (_, index) => ({
    url: `https://picsum.photos/400/300?random=${Date.now() + index}`,
    id: `random${index + 1}`,
    title: `Nasumična slika ${index + 1}`
  }));

  const images = [...localImages, ...randomImages];

  res.render('slike', { images });
});

app.listen(PORT, () => {
  console.log(`Server radi na http://localhost:${PORT}`);
});