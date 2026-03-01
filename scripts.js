// 1. JAM LOKAL
function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString('en-US', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock(); 

// 2. LOGIKA KERJA, WEEKEND & PULANG
function updateWorkTimer() {
    const now = new Date();
    const day = now.getDay(); 
    const hour = now.getHours();
    const timerElement = document.getElementById('countdown');

    if (day === 0 || (day === 6 && hour >= 12)) {
        timerElement.innerText = "WAKTU WEEKEND 🌴";
        timerElement.style.color = "#1E56A0"; // Aegean Blue
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
        timerElement.style.color = "#0F172A"; // Hitam Gelap (Light mode)
    } 
    else if (now > end) {
        timerElement.innerText = "BUKAN WAKTU KERJA LAGI 🌙";
        timerElement.style.color = "#E11D48"; // Merah
    } 
    else {
        timerElement.innerText = "BELUM JAM KERJA ☕";
        timerElement.style.color = "#64748b"; // Abu-abu
    }
}
setInterval(updateWorkTimer, 1000);
updateWorkTimer();

// 3. TELEGRAM BOT (LALAMOVE)
function sendToTelegram() {
    const fare = document.getElementById('lalamoveFare').value;
    if (!fare) { alert('Masukkan jumlah pendapatan dulu!'); return; }

    const botToken = '8627626249:AAGjBvea4P0iRPSr1ffXz94wFe6ZgWi64VI'; 
    const chatId = '209931220'; 

    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID');
    const dateString = now.toLocaleDateString('id-ID');

    const message = `🚚 *LAPORAN LALAMOVE (@artandobot)*\n\n📅 Tanggal: ${dateString}\n⏰ Jam: ${timeString}\n💰 Pendapatan: Rp ${Number(fare).toLocaleString('id-ID')}\n\nData tersimpan, Bos! 🚀`;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}&parse_mode=Markdown`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                alert('Berhasil dikirim ke HP!');
                document.getElementById('lalamoveFare').value = '';
            } else { alert('Gagal mengirim! Cek console.'); }
        });
}

// 4. API BOLA & BERITA
async function fetchMUFCData() {
    const table = document.getElementById('mufcTable');
    try {
        const targetUrl = 'https://api.football-data.org/v4/teams/66/matches?status=SCHEDULED,FINISHED&limit=4';
        const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(targetUrl);

        const response = await fetch(proxyUrl, { headers: { 'X-Auth-Token': '5d1e024b10614ac58935d5306304b077' } });
        const data = await response.json();
        
        if(data.matches) {
            table.innerHTML = ''; 
            const recentMatches = data.matches.slice(-3); 
            recentMatches.forEach(match => {
                const isFinished = match.status === "FINISHED";
                const homeTeam = match.homeTeam.shortName || match.homeTeam.name;
                const awayTeam = match.awayTeam.shortName || match.awayTeam.name;
                const score = isFinished ? `${match.score.fullTime.home} - ${match.score.fullTime.away}` : 'VS';
                const date = new Date(match.utcDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'});
                let rowClass = isFinished ? "result-win" : "";
                
                table.innerHTML += `
                    <tr class="${rowClass}">
                        <td style="color: #64748b;">${isFinished ? 'FT' : date}</td>
                        <td>${homeTeam} ${score} ${awayTeam}</td>
                        <td style="font-size: 0.9rem; color: #94A3B8;">${match.competition.name}</td>
                    </tr>
                `;
            });
        }
    } catch (error) { table.innerHTML = `<tr><td style="color:#E11D48;">Gagal muat data bola.</td></tr>`; }
}

async function fetchWorldNews() {
    const container = document.getElementById('newsContainer');
    try {
        const targetUrl = 'https://api.rss2json.com/v1/api.json?rss_url=http://feeds.bbci.co.uk/news/world/rss.xml';
        const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(targetUrl);
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        if(data.items) {
            container.innerHTML = ''; 
            for(let i = 0; i < 6; i++) {
                const news = data.items[i];
                container.innerHTML += `
                    <div class="news-item">
                        <a href="${news.link}" target="_blank">${news.title}</a>
                        <div class="news-date">${news.pubDate.split(' ')[0]}</div>
                    </div>
                `;
            }
        }
    } catch (error) { container.innerHTML = '<p>Gagal memuat berita terkini.</p>'; }
}

fetchMUFCData();
fetchWorldNews();