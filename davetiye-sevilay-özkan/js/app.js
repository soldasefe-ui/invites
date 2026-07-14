const RSVP_API_URL = "https://script.google.com/macros/s/AKfycbz08-U49lGrUO96G6pe7ihFt8ZHvvH5W_2mXL69nVinPLhXzlvIZwZstGNFiqAgXdNPxQ/exec";
const MEMORY_UPLOAD_API_URL = "https://script.google.com/macros/s/AKfycbxT_fkcN_oAftLizFxjEMzDF6D_0C7yDG1i49VHidveyaVkRWFAfiioOwbp85Kk7OCncQ/exec";

document.addEventListener("DOMContentLoaded", function () {

    [
        setupOpeningAnimation,
        setupMusicPlayer,
        setupCountdown,
        setupModal,
        setupMemoryUploadModal,
        setupRsvpForm,
        setupMemoryUploadForm
    ].forEach(fn => {
        try{
            fn();
        }catch(e){
            console.error(fn.name,e);
        }
    });

});

function setupOpeningAnimation() {
    const openingOverlay = document.getElementById("openingOverlay");
    const waxSealButton = document.getElementById("waxSealButton");
    const mainContent = document.getElementById("mainContent");

    if (!openingOverlay || !waxSealButton || !mainContent) {
        return;
    }

    let isOpening = false;

    waxSealButton.addEventListener("click", function () {
        if (isOpening) return;
        isOpening = true;

        waxSealButton.classList.add("broken");

        setTimeout(function () {
            openingOverlay.style.opacity = "0";
            openingOverlay.style.pointerEvents = "none";
        }, 280);

        setTimeout(function () {
            openingOverlay.style.display = "none";
            mainContent.classList.remove("hidden");
            document.body.classList.add("content-visible");
        }, 780);
    });
}

function setupMusicPlayer() {
    const music = document.getElementById("bgMusic");
    const musicStartBtn = document.getElementById("musicStartBtn");

    if (!music || !musicStartBtn) return;

    music.volume = 0.35;

    musicStartBtn.addEventListener("click", async function () {
        try {
            if (music.paused) {
                await music.play();
                musicStartBtn.classList.add("is-playing");
            } else {
                music.pause();
                musicStartBtn.classList.remove("is-playing");
            }
        } catch (err) {
            console.log("Müzik başlatılamadı:", err);
        }
    });
}

function setupCountdown() {
    const eventDate = new Date("2026-09-27T20:00:00").getTime();

    const daysElement = document.getElementById("days");
    const hoursElement = document.getElementById("hours");
    const minutesElement = document.getElementById("minutes");
    const secondsElement = document.getElementById("seconds");

    if (!daysElement || !hoursElement || !minutesElement || !secondsElement) return;

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = eventDate - now;

        if (distance <= 0) {
            daysElement.textContent = "00";
            hoursElement.textContent = "00";
            minutesElement.textContent = "00";
            secondsElement.textContent = "00";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysElement.textContent = String(days).padStart(2, "0");
        hoursElement.textContent = String(hours).padStart(2, "0");
        minutesElement.textContent = String(minutes).padStart(2, "0");
        secondsElement.textContent = String(seconds).padStart(2, "0");
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function setupModal() {
    const openBtn = document.getElementById("openRsvpBtn");
    const closeBtn = document.getElementById("closeModalBtn");
    const modal = document.getElementById("rsvpModal");

    if (!openBtn || !closeBtn || !modal) return;

    openBtn.addEventListener("click", function () {
        modal.classList.remove("hidden");
    });

    closeBtn.addEventListener("click", function () {
        modal.classList.add("hidden");
    });

    modal.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.classList.add("hidden");
        }
    });
}

function setupMemoryUploadModal() {
    const openBtn = document.getElementById("openMemoryUploadBtn");
    const closeBtn = document.getElementById("closeMemoryUploadBtn");
    const modal = document.getElementById("memoryUploadModal");

    if (!openBtn || !closeBtn || !modal) return;

    openBtn.addEventListener("click", function () {
        modal.classList.remove("hidden");
    });

    closeBtn.addEventListener("click", function () {
        modal.classList.add("hidden");
    });

    modal.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.classList.add("hidden");
        }
    });
}

function setupRsvpForm() {
    const form = document.getElementById("rsvpForm");
    const resultBox = document.getElementById("rsvpResult");
    const modal = document.getElementById("rsvpModal");
    const submitBtn = document.getElementById("rsvpSubmitBtn");

    if (!form || !resultBox || !modal || !submitBtn) return;

    const submitText = submitBtn.querySelector(".submit-text");
    const submitSpinner = submitBtn.querySelector(".submit-spinner");

    let isSubmitting = false;

    function showResult(message, type) {
        resultBox.textContent = message;
        resultBox.className = "rsvp-result " + type;
        resultBox.classList.remove("hidden");
    }

    function clearResult() {
        resultBox.textContent = "";
        resultBox.className = "rsvp-result hidden";
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        if (isSubmitting) return;

        const payload = {
            fullName: document.getElementById("fullName").value.trim(),
            attendanceStatus: document.getElementById("attendanceStatus").value,
            guestCount: document.getElementById("guestCount").value.trim(),
            note: document.getElementById("note").value.trim()
        };

        if (!payload.fullName) {
            showResult("Ad soyad giriniz.", "error");
            return;
        }

        if (!payload.attendanceStatus) {
            showResult("Katılım seçiniz.", "error");
            return;
        }

        isSubmitting = true;
        submitBtn.disabled = true;
        submitText.textContent = "Gönderiliyor...";
        submitSpinner.classList.remove("hidden");

        try {
            const res = await fetch(RSVP_API_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(payload)
            });

            const data = JSON.parse(await res.text());

            if (!data.success) {
                throw new Error(data.message || "Gönderim başarısız.");
            }

            showResult("Gönderildi", "success");
            form.reset();

            setTimeout(function () {
                modal.classList.add("hidden");
                clearResult();
            }, 1200);

        } catch (err) {
            showResult(err.message || "Gönderim sırasında hata oluştu.", "error");
        } finally {
            isSubmitting = false;
            submitBtn.disabled = false;
            submitText.textContent = "Gönder";
            submitSpinner.classList.add("hidden");
        }
    });
}

function setupMemoryUploadForm() {
    const form = document.getElementById("memoryUploadForm");
    const resultBox = document.getElementById("memoryUploadResult");
    const submitBtn = document.getElementById("memoryUploadBtn");
    const modal = document.getElementById("memoryUploadModal");
    const fileInput = document.getElementById("memoryFile");
    const customBtn = document.getElementById("customFileBtn");
    const fileText = document.getElementById("fileNameText");

    if (customBtn && fileInput) {
        customBtn.addEventListener("click", function () {
            fileInput.click();
        });
    }

    if (fileInput && fileText) {
        fileInput.addEventListener("change", function () {
            if (fileInput.files.length > 0) {
                fileText.textContent = fileInput.files.length + " fotoğraf seçildi";
            } else {
                fileText.textContent = "Dosya seçilmedi";
            }
        });
    }

    if (!form || !resultBox || !submitBtn || !modal) return;

    const submitText = submitBtn.querySelector(".submit-text");
    const submitSpinner = submitBtn.querySelector(".submit-spinner");

    let isSubmitting = false;

    function showResult(message, type) {
        resultBox.textContent = message;
        resultBox.className = "rsvp-result " + type;
        resultBox.classList.remove("hidden");
    }

    function clearResult() {
        resultBox.textContent = "";
        resultBox.className = "rsvp-result hidden";
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function () {
                resolve(reader.result.split(",")[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        if (isSubmitting) return;

        const fullName = document.getElementById("memoryFullName").value.trim();
        const note = document.getElementById("memoryNote").value.trim();
        const files = document.getElementById("memoryFile").files;

        if (!fullName) {
            showResult("Ad soyad giriniz.", "error");
            return;
        }

        if (!files || files.length === 0) {
            showResult("Fotoğraf seçiniz.", "error");
            return;
        }

        isSubmitting = true;
        submitBtn.disabled = true;
        submitText.textContent = "Yükleniyor...";
        submitSpinner.classList.remove("hidden");

        let successCount = 0;

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                if (!file.type.startsWith("image/")) continue;
                if (file.size > 10 * 1024 * 1024) continue;

                showResult(`Yükleniyor (${i + 1}/${files.length})`, "info");

                const base64 = await fileToBase64(file);

                const res = await fetch(MEMORY_UPLOAD_API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify({
                        fullName,
                        note,
                        fileName: file.name,
                        mimeType: file.type,
                        base64Data: base64
                    })
                });

                const data = JSON.parse(await res.text());

                if (data.success) {
                    successCount++;
                }
            }

            showResult(`${successCount} fotoğraf yüklendi`, "success");
            form.reset();
            fileText.textContent = "Dosya seçilmedi";

            setTimeout(function () {
                modal.classList.add("hidden");
                clearResult();
            }, 1500);

        } catch (err) {
            showResult("Yükleme sırasında hata oluştu", "error");
        } finally {
            isSubmitting = false;
            submitBtn.disabled = false;
            submitText.textContent = "Fotoğraf Yükle";
            submitSpinner.classList.add("hidden");
        }
    });
}

window.addEventListener("load", () => {

    setTimeout(() => {

        const overlay=document.getElementById("openingOverlay");
        const main=document.getElementById("mainContent");

        if(!overlay||!main) return;

        if(getComputedStyle(overlay).display!=="none"){

            overlay.style.opacity="0";

            setTimeout(()=>{

                overlay.style.display="none";
                main.classList.remove("hidden");
                document.body.classList.add("content-visible");

            },300);

        }

    },8000);

});