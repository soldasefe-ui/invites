const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Önce genel statik dosyaları tanımla
app.use(express.static(__dirname));

// 2. Özel klasör yönlendirmeleri
app.use('/:folder', (req, res, next) => {
    const folder = req.params.folder;
    const folderPath = path.join(__dirname, folder);

    if (fs.existsSync(folderPath)) {
        express.static(folderPath)(req, res, next);
    } else {
        next();
    }
});

app.get('/:folder', (req, res) => {
    const folder = req.params.folder;
    const indexPath = path.join(__dirname, folder, 'index.html');

    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Davetiye bulunamadı.');
    }
});

app.listen(PORT, () => {
    console.log(`Sunucu aktif: http://localhost:${PORT}`);
});