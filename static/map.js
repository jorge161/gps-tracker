const map = L.map('map').setView([14.0723, -87.1921], 13);
let markers = [];

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const customIcon = L.icon({
  iconUrl: '/static/icono_gps.png',
  iconSize: [60, 60],
  iconAnchor: [60, 60],
  popupAnchor: [0, -32]
});

const notifiedEvents = new Set();  // Para evitar repetir alertas

async function loadPositions() {
  // Limpiar marcadores previos
  markers.forEach(marker => map.removeLayer(marker));
  markers.length = 0;

  const response = await fetch('/api/positions');
  const data = await response.json();

  data.forEach(d => {
    // Normalizar el texto para detectar "intrusión" aunque tenga acentos
    const normalizedEvent = d.event ? d.event.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

    const eventKey = `${d.device_id}-${d.timestamp}`;  // Clave única por dispositivo y tiempo

    if (normalizedEvent.includes("intrusion")) {
      if (!notifiedEvents.has(eventKey)) {
        // Icono de alerta animada
        const alertIcon = L.divIcon({
          className: '',
          html: '<div class="alert-circle"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const marker = L.marker([d.lat, d.lon], { icon: alertIcon }).addTo(map)
          .bindPopup(`<b>${d.device_id}</b><br><strong style="color:red">${d.event}</strong><br>${d.timestamp}`);

        showModal(d, marker); // Mostrar modal con detalles
        notifiedEvents.add(eventKey); // Marcar como notificado
        markers.push(marker);
      }
    } else {
      // Icono normal
      const marker = L.marker([d.lat, d.lon], { icon: customIcon }).addTo(map)
        .bindPopup(`<b>${d.device_id}</b><br>${d.event}<br>${d.timestamp}`);
      markers.push(marker);
    }
  });
}

loadPositions();
setInterval(loadPositions, 10000); // cada 10 segundos

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
