const map = L.map('map').setView([14.0723, -87.1921], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

async function loadPositions() {
  const response = await fetch('/api/positions');
  const data = await response.json();

  data.forEach(d => {
    L.marker([d.lat, d.lon]).addTo(map)
      .bindPopup(`<b>${d.device_id}</b><br>${d.event}<br>${d.timestamp}`);
  });
}

loadPositions();
