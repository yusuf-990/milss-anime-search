//++++++++++++++++++++++++++++++++
//+    search anime              +
//++++++++++++++++++++++++++++++++

//refaktor untuk tampil anime

//ambil element
let cariBtn = document.querySelector('.cari-anime');
let isiHasilAnime = document.querySelector('.anime');

//variabel universal 
let page = 1;
let lastPage = 1; // untuk menyimpan batas halaman terakhir

//nilai default saat pertama dibuka
getAnimeData('naruto', page);

//event tombol cari
cariBtn.addEventListener('click', function () {
  let input = document.querySelector('.input-anime').value.trim() || 'naruto';
  page = 1; // reset ke halaman 1
  isiHasilAnime.innerHTML = '';
  getAnimeData(input, page);
});

//event handler pagination (prev/next)
document.addEventListener('click', function (e) {
  let target = e.target;
  let action = target.dataset.pageAction;

  if (!action) return;

  let input = document.querySelector('.input-anime').value.trim() || 'naruto';

  switch (action) {
    case 'next':
      if (page < lastPage) page++;
      break;
    case 'prev':
      if (page > 1) page--;
      break;
    default:
      if (!isNaN(action)) {
        page = parseInt(action);
      }
  }

  isiHasilAnime.innerHTML = '';
  getAnimeData(input, page);
});

//fungsi utama ambil data anime (event handler search anime)
async function getAnimeData(keyword, page) {
  const loading = document.getElementById('loading');
  loading.classList.remove('d-none');

  try {
    const AnimeFetch = await fetchAnime(keyword, page);
    const hasilAnime = AnimeFetch.data;
    console.log(AnimeFetch)

    // ambil nilai last page dari API
    lastPage = AnimeFetch.pagination?.last_visible_page || 1;

    if (!hasilAnime || hasilAnime.length === 0) {
      isiHasilAnime.innerHTML = `<p class="text-center text-warning">Anime tidak ditemukan untuk keyword: <strong>${keyword}</strong></p>`;
      return;
    }

    const cards = hasilAnime.map(item => anime(item) + modal(item)).join('');
    isiHasilAnime.innerHTML = cards;

    // kontrol tombol prev/next
    const prevBtn = document.querySelector('[data-page-action="prev"]');
    const nextBtn = document.querySelector('[data-page-action="next"]');

    if (prevBtn) {
      page <= 1 ? prevBtn.setAttribute('disabled', true) : prevBtn.removeAttribute('disabled');
    }

    if (nextBtn) {
      page >= lastPage ? nextBtn.setAttribute('disabled', true) : nextBtn.removeAttribute('disabled');
    }

    // update indikator halaman
    const pageInfo = document.getElementById('page-info');
    if (pageInfo) {
      pageInfo.textContent = `Halaman ${page} dari ${lastPage}`;
    }

  } catch (error) {
    isiHasilAnime.innerHTML = `<p class="text-danger">Terjadi kesalahan saat mengambil data. Coba lagi nanti.</p>`;
    console.error('Gagal mengambil data anime:', error);

  } finally {
    loading.classList.add('d-none');
  }
}

//ambil data dari API
function fetchAnime(m, page) {
  return fetch(`https://api.jikan.moe/v4/anime?q=${m}&limit=20&page=${page}&sfw=1`)
    .then(x => x.json())
    .then(x => x);
}


//+++++++++++++++++++++++
//buat sintaks anyar untuk ambil data anime stream
let isiStream = document.querySelector('.isiStream');
 let tombolStream = document.querySelectorAll('.streamBtn')


// buat ambil value data set button stream
document.addEventListener('click', function(e) {
  // Cari tombol terdekat yang punya class .streamBtn dan data-stream
  const tombol = e.target.closest('.streamBtn');

  // Kalau tidak ketemu (klik di area lain), abaikan
  if (!tombol || !tombol.dataset.stream) return;

  const target = tombol.dataset.stream;
  console.log('DATA STREAM:', target);
  callStream(target);
});

//core fungsi pemanggilnya 
async function  callStream(m) {
  
  isiStream.innerHTML = '';

  let fetchStream = await fetchStreamAnime(m);
  let hasil = fetchStream.map(x => modalStream(x)).join('');

    
  isiStream.innerHTML = hasil;
  
}


// function fetchnya 
function fetchStreamAnime(id){
  return fetch(`https://api.jikan.moe/v4/anime/${id}/streaming`)
  .then(x => x.json())
  .then(x => x.data);
}


//++++++++++++++++++++++++++++++
// evnt buat nampilin episode anime

//buat ambil element
let olEpisode = document.querySelector('.epsAnime');
let btnModal = document.querySelector('.epsBtn')


//event listener
document.addEventListener('click', function(e) {
  const tombol = e.target.closest('.epsBtn');
  if (!tombol || !tombol.dataset.episode) return;

  const target = tombol.dataset.episode;
  console.log('DATA EPISODE:', target);
  callEpisode(target);
});


//core fungsinya
async function callEpisode(id) {
  olEpisode.innerHTML = `<li class="list-group-item text-center">Loading episode...</li>
                         <li>
                            <div class="text-center">
                              <div class="spinner-border text-warning" role="status">
                                <span class="visually-hidden">Loading...</span>
                              </div>
                            </div>
                         </li>`;

  let hasilEpisode = await fetchEpisode(id, '?');
  let detailAnime = await fetchAnimeById(id);
  let panjangPage = hasilEpisode.pagination.last_visible_page;

  let hasil = '';
  hasil += aDetailEpisode(detailAnime);

  for (let i = 1; i <= panjangPage; i++) {
    let AmbilEps = await fetchEpisode(id, `?page=${i}`);
    AmbilEps.data.forEach(x => {
      hasil += modalEpisode(x);   
    });

    await delay(350);

  }

  olEpisode.innerHTML = hasil;
}


//pro,ise untuk delay hit api,can recycle
function delay(ms){
   return new Promise(resolve => setTimeout(resolve,ms));
}


//fetch data
//fetch untuk anime detail
function fetchEpisode(id,page){
   return fetch(`https://api.jikan.moe/v4/anime/${id}/episodes`+ page)
     .then( x => x.json())
     .then(x => x)
}

//fetch untuk anime detailnya
function fetchAnimeById(id){
  return fetch(`https://api.jikan.moe/v4/anime/${id}/full`)
     .then(x => x.json())
     .then(x => x.data);
}





//+++++++++++++++++++++++
//bab inject hasil anime
//+++++++++++++++++++++++

//inject anime detail untuk eps anime
function aDetailEpisode(hasil){
  let title = hasil.title;
  return `<p class="fw-bolder fs-4">${title}</p>`
  
}

//inject episode anime 
function modalEpisode(hasil){
  let namaEps = hasil.title;
  let nomorEps = hasil.mal_id;

  return `
            <li class="list-group-item d-flex justify-content-between align-items-start">
                <div class="ms-2 me-auto">
                  <div class="fw-bold">Episode ${nomorEps}</div>
                  ${namaEps}
                </div>
            </li>`;
}


//untuk inject hasil streamnya
function modalStream(m){
  let source = m.name;
  let link = m.url;
  return `<div class="modal-body">
        <div class="link row d-flex justify-content-center mt-2">
          <p class="text-center col-12 fs-4">${source}</p>
          <a href="${link}" class="btn btn-warning stretched-link col-6" target="_blank">Kunjungi</a>
        </div>`
}
        

//buat inject anime cards
function anime(m) {
  let imageUrl = m.images?.jpg?.image_url || 'https://via.placeholder.com/300x400?text=No+Cover';
  let trailerUrl = m.trailer?.youtube_id ? `https://www.youtube.com/watch?v=${m.trailer.youtube_id}` : '#';

  return `
    <div class="col-12 col-md-3 mb-4 d-flex justify-content-evenly" data-mal-id="${m.mal_id}">
      <div class="card border-warning bg-secondary text-white" style="width: 20rem;">
        <img src="${imageUrl}" class="card-img-top object-fit-cover" style="height: 300px; object-fit: cover;" alt="${m.title}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${m.title}</h5>
          <p class="card-text">Rating: ${m.rating || 'N/A'}</p>
          <div class="mt-auto row">
            <button type="button" class="btn btn-danger mb-2 streamBtn" data-bs-toggle="modal" data-bs-target="#animeStream" data-stream="${m.mal_id}" >Stream Now</button>
            <a href="${trailerUrl}" class="btn btn-primary btn-sm w-100 mb-2 col-6" target="_blank">Trailer</a>
            <button class="btn btn-warning btn-sm w-100 col-6" data-bs-toggle="modal" data-bs-target="#anime-${m.mal_id}">Detail</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

//buat inject anime modal
function modal(m){
  let imageUrl = m.images?.jpg?.image_url || 'https://via.placeholder.com/300x400?text=No+Cover';
  let genres = m.genres.map(m => m.name).join(', ');
  let studio = m.studios.map(m => m.name)

  return `
  <div class="modal fade" id="anime-${m.mal_id}" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">${m.title}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body row">
          <div class="col-12 col-md-4 mb-3 mb-md-0 ">
            <img src="${imageUrl}" class="img-fluid  mx-auto d-flex align-items-center" alt="${m.title}">
          </div>
          <div class="col-12 col-md-8">
            <dl class="row">
              <dt class="col-md-4 col-4">Title</dt>
              <dd class="col-md-8 col-6">${m.title}</dd>

              <dt class="col-md-4 col-4">Studio</dt>
              <dd class="col-md-8 col-6">${studio}</dd>

              <dt class="col-md-4 col-4">Rating</dt>
              <dd class="col-md-8 col-6">${m.rating || 'N/A'}</dd>

              <dt class="col-md-4 col-4">Genre</dt>
              <dd class="col-md-8 col-6">${genres}</dd>

              <dt class="col-md-4">Synopsis</dt>
              <dd class="col-md-8">${m.synopsis || 'No synopsis available.'}</dd>
            </dl>
          </div>
        </div>
        <div class="modal-footer btnModal">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-warning epsBtn" data-bs-toggle="modal" data-bs-target="#showEpisode" data-episode="${m.mal_id}">Lihat Episode</button>
        </div>
      </div>
    </div>
  </div>
  `;
}




//++++++++++++++++++++++++++++
//     aplikasi cuaca        +
//++++++++++++++++++++++++++++

//Refactor untuk cuaca

// ambil elemen
let cuaca_up = document.querySelector('.cuaca-up');

   //buat jalanin si function core nya
window.addEventListener('DOMContentLoaded',() =>{
    tampilkanCuaca();
})

cuaca_up.addEventListener('click', () => {
    tampilkanCuaca();
});

  //function core 
  async function tampilkanCuaca(){
    let lokasi = document.querySelector('.lok-cuaca').value;
    let hasilFetch = await getApiCuaca(lokasi);
    let injectModal = injectHasilCuacaModal(hasilFetch);
    let InjectUi = injectHasilCuacaUi(hasilFetch);
    let injectGambar = injectImageCuaca(hasilFetch)


    // ambil element
   let isiData = document.querySelector('.isi');
   let picCuaca = document.querySelector('.image-cuaca');
   let uiCuaca = document.querySelector('.cuaca-simple');

    // disini kita akan inject hasilnya
   isiData.innerHTML = injectModal;
   picCuaca.innerHTML = injectGambar;
   uiCuaca.innerHTML = InjectUi; 
  }


// untuk fetch datanya
function getApiCuaca(m){
  return  fetch('https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4='+ m)
             .then(m => m.json())
             .then(m => m)
     
}

//return untuk isinya
function injectHasilCuacaModal(m){
  let { kotkab: lokasiKab, kecamatan: lokasiKecamatan } = m.lokasi;
  let cuaca = m.data[0].cuaca[0][0];
  let { t: temp, hu: kelembapan, local_datetime: jam, ws: kecAngin, weather_desc: kondisiLangit, tcc: kepAwan } = cuaca;
  
  return` 
          <dt class="col-5 col-md-4">Lokasi</dt>
          <dd class="col-7 col-md-8">${lokasiKecamatan},${lokasiKab}</dd>

          <dt class="col-5 col-md-4">Kondisi</dt>
          <dd class="col-7 col-md-8">${kondisiLangit}</dd>

          <dt class="col-5 col-md-4">Update jam</dt>
          <dd class="col-7 col-md-8">${jam}</dd>

          <dt class="col-5 col-md-4">Temperatur</dt>
          <dd class="col-7 col-md-8">${temp}°C</dd>
 
          <dt class="col-5 col-md-4">Kelembapan</dt>
          <dd class="col-7 col-md-8">${kelembapan}%</dd>
 
          <dt class="col-5 col-md-4">Kecepatan Angin</dt>
          <dd class="col-7 col-md-8">🌬️ ${kecAngin} km/h</dd>

          <dt class="col-5 col-md-4">Kepadatan Awan</dt>
          <dd class="col-7 col-md-8">${kepAwan}%</dd>`;

}

function injectHasilCuacaUi(m){
  let lokasiKecamatan = m.lokasi.kecamatan;
  let cuaca = m.data[0].cuaca[0][0];
  let { t : temp, image ,weather_desc : kondisiLangit} = cuaca
  return  `
          <p style="margin-right: 3px;">${lokasiKecamatan},</p>
          <img src="${image}" class="img-fluid" style="max-height: 25px; max-width: 50px; margin-right: 3px;" alt="${kondisiLangit}">
          <p style="margin-right: 2px;">${temp}°C</p>
          <p style="margin-left: 4px;">${kondisiLangit}</p>`;

 
}

function injectImageCuaca(m){
  let cuaca = m.data[0].cuaca[0][0];
  let {image, weather_desc : kondisiLangit} = cuaca;
  return `
         <img src="${image}" class="img-fluid mx-auto d-flex align-items-center" alt="${kondisiLangit}">`;
}
