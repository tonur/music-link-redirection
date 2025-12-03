document.addEventListener("DOMContentLoaded", async () => {
  const musicRadioGroup = document.getElementById("musicRadioGroup")

  const settings = await browser.storage.local.get({
    musicService: "spotify"
  });

  const savedRadioButton = document.getElementById(settings.musicService);
  savedRadioButton.checked = true;

  function saveSettings() {
    console.log(savedRadioButton)
    browser.storage.local.set({
      musicService: musicRadioGroup.querySelector('input[type=radio]:checked').value
    });
  }
  console.log(musicRadioGroup.querySelectorAll('input[type=radio]'))
  musicRadioGroup.querySelectorAll('input[type=radio]').forEach(inputRadio => {
    inputRadio.addEventListener("change", saveSettings);
  });
});

