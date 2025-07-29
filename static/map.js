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

  data.forEach((d, index) => {
    if (d.event && d.event.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("intrusion")) {
      // Icono animado
      const alertIcon = L.divIcon({
        className: '',
        html: '<div class="alert-circle"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([d.lat, d.lon], { icon: alertIcon }).addTo(map)
        .bindPopup(`<b>${d.device_id}</b><br><strong style="color:red">${d.event}</strong><br>${d.timestamp}`);

      // Mostrar modal automáticamente
      showModal(d, marker);

    } else {
      // Icono normal
      L.marker([d.lat, d.lon], { icon: customIcon }).addTo(map)
        .bindPopup(`<b>${d.device_id}</b><br>${d.event}<br>${d.timestamp}`);
    }
  });
}



loadPositions();

function showModal(data, marker) {
  const modal = document.getElementById('alertModal');
  const details = document.getElementById('modalDetails');
  const dismissBtn = document.getElementById('dismissBtn');

  // Llena el contenido del modal
  details.innerHTML = `
    <strong>Dispositivo:</strong> ${data.device_id}<br>
    <strong>Evento:</strong> ${data.event}<br>
    <strong>Latitud:</strong> ${data.lat}<br>
    <strong>Longitud:</strong> ${data.lon}<br>
    <strong>Fecha/Hora:</strong> ${data.timestamp}
  `;

  // Muestra el modal
  modal.classList.remove('hidden');

  // Eliminar marcador con confirmación
  dismissBtn.onclick = () => {
    const confirmDelete = confirm("¿Deseas eliminar esta alarma?");
    if (confirmDelete) {
      map.removeLayer(marker);
      closeModal();
    }
  };
}

function closeModal() {
  document.getElementById('alertModal').classList.add('hidden');
}



