const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// URL'e bir şey yazılmazsa ana sayfayı göster (opsiyonel)
app.get('/', (req, res) => {
    res.send('Davetiye sistemi çalışıyor. Örnek: domain.com/davetiye-tulin-kutay');
});

// Gelen her isteği (URL kısmını) bir klasör ismi olarak kabul et
app.get('/:folder', (req, res) => {
    const folder = req.params.folder;
    const folderPath = path.join(__dirname, folder);
    const indexPath = path.join(folderPath, 'index.html');

    // Klasör ve içindeki index.html var mı kontrol et
    if (fs.existsSync(folderPath) && fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Böyle bir davetiye bulunamadı.');
    }
});

// CSS, JS ve resim dosyalarının düzgün yüklenmesi için statik klasörleri aç
app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`Sistem aktif: http://localhost:${PORT}`);
});