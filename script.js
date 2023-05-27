const tanggalInput = document.getElementById('tanggal');
const jamInputContainer = document.getElementById('jamInputContainer');
const masukInput = document.getElementById('masuk');
const pulangInput = document.getElementById('pulang');
const submitBtn = document.getElementById('submitBtn');
const form = document.forms['submit-to-google-sheet'];
const scriptURL = 'https://script.google.com/macros/s/AKfycbxuzoMeTRw5213FEsJFM0R343fZr5qSGCI5dr9BF4kn7TEuyBzqhvmlUBoRUyxtQ9HKMg/exec';
const kodeInput = document.getElementById('kode');

//merubah 'kode' menjadi uppercase
kodeInput.addEventListener('input', function () {
    this.value = this.value.toUpperCase();
  });

// Set tanggal default dengan hari ini
const today = new Date().toISOString().split('T')[0];
tanggalInput.value = today;

// Batasi pemilihan tanggal hanya pada hari ini dan 1 hari sebelumnya
const oneDayAgo = new Date();
oneDayAgo.setDate(oneDayAgo.getDate() - 1);
const minDate = oneDayAgo.toISOString().split('T')[0];
tanggalInput.setAttribute('max', today);
tanggalInput.setAttribute('min', minDate);

// Tampilkan atau sembunyikan field masuk dan pulang berdasarkan pilihan kehadiran
const kehadiranRadioButtons = document.querySelectorAll('input[name="kehadiran"]');
kehadiranRadioButtons.forEach(function (radio) {
  radio.addEventListener('change', function () {
    if (radio.value === 'hadir') {
      jamInputContainer.style.display = 'block';
      masukInput.disabled = false;
      pulangInput.disabled = false;
    } else {
      jamInputContainer.style.display = 'none';
      masukInput.disabled = true;
      pulangInput.disabled = true;
    }
  });
});

// Tambahkan event listener untuk tombol Submit
form.addEventListener('submit', e => {
  e.preventDefault();
  submitBtn.innerHTML = 'Loading...'; // Tampilkan teks "Loading..."

  // Kirim data ke Google Sheets menggunakan Fetch API
  fetch(scriptURL, { method: 'POST', body: new FormData(form) })
    .then(response => {
      console.log('Success!', response);
      submitBtn.innerHTML = 'Submit'; // Kembalikan tombol Submit ke keadaan semula
      showAlert('Terima kasih ! Absensi Anda sudah dicatat.', 'success');
      form.reset(); // Reset formulir setelah berhasil disubmit
      hideElements();
    })
    .catch(error => {
      console.error('Error!', error.message);
      submitBtn.innerHTML = 'Submit'; // Kembalikan tombol Submit ke keadaan semula
      alert('Terjadi kesalahan. Mohon coba lagi.');
    });
});

function hitungSelisihJam() {
    const masukValue = masukInput.value;
    const pulangValue = pulangInput.value;
  
    if (masukValue && pulangValue) {
      const masukTime = new Date(`2000-01-01 ${masukValue}`);
      const pulangTime = new Date(`2000-01-01 ${pulangValue}`);
  
      let masukHour = masukTime.getHours();
      const masukMinutes = masukTime.getMinutes();
      let pulangHour = pulangTime.getHours();
      const pulangMinutes = pulangTime.getMinutes();
  
      // Bulatkan nilai masuk ke jam terdekat
      if (masukMinutes >= 30) {
        masukHour += 1;
      }
      masukTime.setHours(masukHour);
      masukTime.setMinutes(0);
  
      // Bulatkan nilai pulang ke jam terdekat
      if (pulangMinutes >= 30) {
        pulangHour += 1;
      }
      pulangTime.setHours(pulangHour);
      pulangTime.setMinutes(0);
  
      let selisihJam = pulangTime.getHours() - masukTime.getHours();
      const selisihMenit = pulangTime.getMinutes() - masukTime.getMinutes();
  
      // Tambahkan kondisi-kondisi tambahan
      if (masukHour <= 12 && pulangHour >= 13 && pulangHour <= 17) {
        selisihJam -= 1;
      } else if (masukHour >= 13 && masukHour <= 17 && pulangHour >= 18) {
        selisihJam -= 1;
      } else if (masukHour <= 12 && pulangHour >= 18) {
        selisihJam -= 2;
      }
  
      // Tampilkan hasil perhitungan
      // Update nilai input tersembunyi
        const jamEfektifInput = document.getElementById('jamEfektif');
        jamEfektifInput.value = selisihJam;
      //alert(`Selisih Jam: ${selisihJam} jam ${selisihMenit} menit`);
    }
  }

let masukEdited = false;
let pulangEdited = false;

masukInput.addEventListener('input', function () {
  masukEdited = true;
});

pulangInput.addEventListener('input', function () {
  pulangEdited = true;
});

masukInput.addEventListener('focusout', function () {
  if (masukEdited) {
    hitungSelisihJam();
    masukEdited = false;
  }
});

pulangInput.addEventListener('focusout', function () {
  if (pulangEdited) {
    hitungSelisihJam();
    pulangEdited = false;
  }
});

  // Fungsi untuk menyembunyikan semua elemen
function hideElements() {
    form.style.display = 'none';
    submitBtn.style.display = 'none';
    document.querySelectorAll('h1, p, input').forEach(element => {
      element.style.display = 'none';
    });
  }

  // Fungsi untuk membuat alert
  function showAlert(message, type) {
    const alertElement = document.createElement('div');
    alertElement.className = `alert ${type}`;
    alertElement.textContent = message;
    alertContainer.appendChild(alertElement);
    alertContainer.style.display = 'block';

    // Hilangkan alert setelah beberapa detik
    setTimeout(() => {
      alertContainer.removeChild(alertElement);
      if (alertContainer.childElementCount === 0) {
        alertContainer.style.display = 'none';
      }
    }, 30000);
  }