// Fungsi untuk menampilkan SweetAlert dengan berbagai jenis pesan
const showAlert = (type, message) => {
  const swalConfig = {
    position: "center",
    timer: 1500,
  };

  if (type === "success") {
    swalConfig.icon = "success";
  } else if (type === "info") {
    swalConfig.icon = "info";
    swalConfig.title = "Info";
    swalConfig.text = message;
  }

  Swal.fire(swalConfig);
};

// fungsi untuk mengosongkan input
function clearFormInputs() {
  const judul = document.getElementById("image-title");
  const komentar = document.getElementById("komentar");
  const gambarKartu = document.getElementById("gambar");
  const profil = document.getElementById("profil");

  judul.value = "";
  komentar.value = "";
  gambarKartu.value = "";
  profil.value = "";
}

// fungsi untuk menyimpan data dari user
function posting() {
  const judul = document.getElementById("image-title");
  const komentar = document.getElementById("komentar");
  let gambarKartu = $("#gambar").prop("files")[0];
  let profil = $("#profil").prop("files")[0];

  if (!judul.value || !komentar.value || !gambarKartu || !profil) {
    showAlert("info", "Silahkan isi semua form.");
    return;
  }

  const saveBtn = document.getElementById("save-btn");
  saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
  saveBtn.disabled = true;


  let form_data = new FormData();
  form_data.append("profil", profil);
  form_data.append("gambarKartu", gambarKartu);
  form_data.append("judul", judul.value);
  form_data.append("komentar", komentar.value);

  $.ajax({
    type: "POST",
    url: "/diary",
    data: form_data,
    contentType: false,
    processData: false,
    success: (response) => {
      showAlert(response["type"], response["msg"]);
      listing();
      saveBtn.innerHTML = "Save";
      saveBtn.disabled = false;
      clearFormInputs();
    },
    error: () => {
      showAlert("error", "Terjadi kesalahan saat menyimpan data.");
      saveBtn.innerHTML = "Save";
      saveBtn.disabled = false;
    },
  });
}


// Fungsi untuk mendapatkan data dari server (get request) dan menampilkan dalam bentuk card
function listing() {
  const cardBox = $("#card-box");
  cardBox.empty(); // Bersihkan konten di dalam card-box sebelum memuat data baru

  $.ajax({
    type: "GET",
    url: "/diary",
    data: {},
    success: (response) => {
      response.forEach((data) => {
        const judul = data["judul"];
        const komentar = data["komentar"];
        const cardImage = data["cardImageName"];
        const profileImage = data["profileImageName"];
        const uploadTime = data['uploadTime'] || '??.??.????'

        // Buat elemen card HTML menggunakan template literal
        const cardHTML = `
            <div class="col-4 mb-2">
              <div class="card">
                <img src="../static/img/card/${cardImage}" />
                <div class="card-body">
                <img src="../static/img/profile/${profileImage}" alt="Gambar" class="card-img-top rounded-circle mb-2" style="width: 60px; height: 60px; object-fit: cover;">
                <h5 class="card-title">${judul}</h5>
                  <p class="card-text">${komentar}</p>
                  <h6 class="card-subtitle mb-2 text-body-secondary">${uploadTime}</h6>
                </div>
              </div>
            </div>
          `;

        cardBox.append(cardHTML); // Tambahkan elemen card ke dalam card-box
      });
    },
  });
}

$(document).ready(function () {
  listing();
  bsCustomFileInput.init();
});
