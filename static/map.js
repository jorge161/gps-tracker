const map = L.map('map').setView([14.0723, -87.1921], 13);

// Crear el ícono personalizado
const customIcon = L.icon({
    iconUrl: '/static/icono_gps.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

async function loadPositions() {
  const response = await fetch('/api/positions');
  const data = await response.json();

  data.forEach(d => {
    // Aplicar el ícono personalizado aquí
    L.marker([d.lat, d.lon], { icon: customIcon }).addTo(map)
      .bindPopup(`<b>${d.device_id}</b><br>${d.event}<br>${d.timestamp}`);
  });
}

loadPositions();

