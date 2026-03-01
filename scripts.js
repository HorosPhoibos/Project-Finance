// ==========================================
// 1. JAM LOKAL
// ==========================================
function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString('en-US', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock(); 

// ==========================================
// 2. LOGIKA KERJA & WEEKEND OTOMATIS
// ==========================================
function updateWorkTimer() {
    const now = new Date();
    const day = now.getDay(); 
    const hour = now.getHours();
    const timerElement = document.getElementById('countdown');

    // Deteksi Weekend: Sabtu (6) di atas jam 12 siang ATAU Minggu (0) seharian penuh
    if (day === 0 || (day === 6 && hour >= 12)) {
        timerElement.innerText = "WAKTU WEEKEND 🌴";
        timerElement.style.color = "#1E56A0"; 
        return; 
    }

    const end = new Date(); end.setHours(17, 30, 0, 0); 
    const start = new Date(); start.setHours(8, 0, 0, 0); 

    if (now >= start && now <= end) {
        let diff = end - now;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        timerElement.innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        timerElement.style.color = "#0F172A"; 
    } 
    else if (now > end) {
        timerElement.innerText = "BUKAN WAKTU KERJA LAGI 🌙";
        timerElement.style.color = "#E11D48"; 
    } 
    else {
        timerElement.innerText = "BELUM JAM KERJA ☕";
        timerElement.style.color = "#64748b"; 
    }
}
setInterval(updateWorkTimer, 1000);
updateWorkTimer();

// ==========================================
// 3. TELEGRAM BOT LALAMOVE
// ==========================================
function sendToTelegram() {
    const fare = document.getElementById('lalamoveFare').value;
    if (!fare) { alert('Masukkan jumlah pendapatan dulu, Bos!'); return; }

    const botToken = '8627626249:AAGjBvea4P0iRPSr1ffXz94wFe6ZgWi64VI'; 
    const chatId = '209931220'; 

    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID');
    const dateString = now.toLocaleDateString('id-ID');

    const message = `🚚 *LAPORAN LALAMOVE (@artandobot)*\n\n📅 Tanggal: ${dateString}\n⏰ Jam: ${timeString}\n💰 Pendapatan: Rp ${Number(fare).toLocaleString('id-ID')}\n\nData tersimpan, siap lanjut rute! 🚀`;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}&parse_mode=Markdown`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                alert('Laporan berhasil dikirim ke HP!');
                document.getElementById('lalamoveFare').value = '';
            } else { alert('Gagal mengirim! Cek console.'); }
        });
}

// ==========================================
// 4. API BOLA (MAN UTD) - FOOTBALL-DATA
// ==========================================
async function fetchMUFCData() {
    const table = document.getElementById('mufcTable');
    try {
        // Menggunakan target langsung dengan proxy corsproxy.io yang di-encode dengan benar
        const targetUrl = 'https://api.football-data.org/v4/teams/66/matches?status=SCHEDULED,FINISHED&limit=4';
        const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(targetUrl);

        const response = await fetch(proxyUrl, { 
            headers: { 
                'X-Auth-Token': '5d1e024b10614ac58935d5306304b077',
                'Accept': 'application/json'
            } 
        });
        
        const data = await response.json();
        
        if(data.matches) {
            table.innerHTML = ''; 
            const recentMatches = data.matches.slice(-3); 
            recentMatches.forEach(match => {
                const isFinished = match.status === "FINISHED";
                const homeTeam = match.homeTeam.shortName || match.homeTeam.name;
                const awayTeam = match.awayTeam.shortName || match.awayTeam.name;
                const score = isFinished ? `${match.score.fullTime.home} - ${match.score.fullTime.away}` : 'VS';
                
                const dateObj = new Date(match.utcDate);
                const dateStr = dateObj.toLocaleDateString('id-ID', {day: 'numeric', month: 'short'});
                
                let rowClass = isFinished ? "result-win" : "";
                
                table.innerHTML += `
                    <tr class="${rowClass}">
                        <td style="color: #64748b;">${isFinished ? 'FT' : dateStr}</td>
                        <td style="font-weight: 700;">${homeTeam} ${score} ${awayTeam}</td>
                        <td style="font-size: 0.85rem; color: #94A3B8;">${match.competition.name}</td>
                    </tr>
                `;
            });
        } else {
            table.innerHTML = `<tr><td style="color:#E11D48;">Menunggu update server bola...</td></tr>`;
        }
    } catch (error) { 
        table.innerHTML = `<tr><td style="color:#64748b;">Sistem keamanan browser memblokir live skor di HP.</td></tr>`; 
    }
}

// ==========================================
// 5. API BERITA DUNIA - GNEWS (SANGAT STABIL)
// ==========================================
async function fetchWorldNews() {
    const container = document.getElementById('newsContainer');
    try {
        // Menggunakan GNews API Key milik Anda langsung tanpa proxy
        const apikey = '330c4524949a323d82659df746a05672'; 
        const url = `https://gnews.io/api/v4/top-headlines?category=business&lang=en&max=6&apikey=${apikey}`;

        const response = await fetch(url);
        const data = await response.json();
        
        if(data.articles) {
            container.innerHTML = ''; 
            data.articles.forEach(news => {
                const dateObj = new Date(news.publishedAt);
                const dateStr = dateObj.toLocaleDateString('id-ID', {day: 'numeric', month: 'short'});

                container.innerHTML += `
                    <div class="news-item">
                        <a href="${news.url}" target="_blank">${news.title}</a>
                        <div class="news-date">${dateStr} • ${news.source.name}</div>
                    </div>
                `;
            });
        } else {
            container.innerHTML = '<p>Gagal memuat berita. API Key mungkin limit.</p>';
        }
    } catch (error) { 
        container.innerHTML = '<p>Koneksi ke server berita terputus.</p>'; 
    }
}

// Jalankan fungsi
fetchMUFCData();
fetchWorldNews();