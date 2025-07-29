const map = L.map('map').setView([14.0723, -87.1921], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const customIcon = L.icon({
  iconUrl: '/static/icono_gps.png',
  iconSize: [60, 60],
  iconAnchor: [60, 60],
  popupAnchor: [0, -32]
});



async function loadPositions() {
  const response = await fetch('/api/positions');
  const data = await response.json();

  data.forEach(d => {
    // Verificamos si el evento contiene "Intrusión"
    if (d.event && d.event.toLowerCase().includes("intrusión")) {
      // Crear un ícono HTML personalizado con animación
      const alertIcon = L.divIcon({
        className: '',  // No clases adicionales
        html: '<div class="alert-circle"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker([d.lat, d.lon], { icon: alertIcon }).addTo(map)
        .bindPopup(`<b>${d.device_id}</b><br><strong style="color:red">${d.event}</strong><br>${d.timestamp}`);
    } else {
      // Ícono normal
      L.marker([d.lat, d.lon], { icon: customIcon }).addTo(map)
        .bindPopup(`<b>${d.device_id}</b><br>${d.event}<br>${d.timestamp}`);
    }
  });
}


loadPositions();


