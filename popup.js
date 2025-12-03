document.addEventListener("DOMContentLoaded", async () => {
    const musicRadioGroup = document.getElementById("musicRadioGroup")
    
    const settings = await browser.storage.local.get({
        musicService: "spotify"
    });

    const savedRadioButton = musicRadioGroup.getElementById(settings.musicService);
    savedRadioButton.checked = true;

    function saveSettings() {
        browser.storage.local.set({
            musicService: musicRadioGroup.querySelector('input[type=radio]:checked').value
        });
    }

    musicRadioGroup.querySelectorAll('input[type=radio]').forEach(inputRadio => {
        inputRadio.addEventListener("change", saveSettings);
    });
});

