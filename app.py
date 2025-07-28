

from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///gps_data.db'
db = SQLAlchemy(app)

class GpsData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.String(50))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    event = db.Column(db.String(100))

@app.route('/')
def index():
    print("Ruta raíz solicitada")
    return render_template('index.html')

@app.route('/api/positions', methods=['GET'])
def get_positions():
    data = GpsData.query.order_by(GpsData.timestamp.desc()).all()
    return jsonify([
        {
            "device_id": d.device_id,
            "lat": d.latitude,
            "lon": d.longitude,
            "event": d.event,
            "timestamp": d.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        }
        for d in data
    ])

@app.route('/api/send', methods=['POST'])
def receive_position():
    content = request.json
    gps = GpsData(
        device_id=content['device_id'],
        latitude=content['latitude'],
        longitude=content['longitude'],
        event=content.get('event', '')
    )
    db.session.add(gps)
    db.session.commit()
    return jsonify({"status": "ok"})

def create_tables():
    with app.app_context():
        db.create_all()

# ✅ Solo un bloque para arrancar todo
if __name__ == '__main__':
    create_tables()
    app.run(debug=True)
