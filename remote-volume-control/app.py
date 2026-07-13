#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Remote Volume Control - Web App
PC Host: Windows | Dispositivo remoto: Android (o qualsiasi browser)
"""

import os
import socket
from functools import wraps

from flask import Flask, Response, render_template_string, jsonify, request

app = Flask(__name__)

# ============================================================
# CONFIGURAZIONE
# ============================================================
STEP_VOLUME = int(os.environ.get("STEP_VOLUME", 10))  # Percentuale di incremento/decremento
PORT = int(os.environ.get("PORT", 5000))

# Password opzionale. Se imposti la variabile d'ambiente VOLUME_PASSWORD,
# l'app richiede login (HTTP Basic Auth) su TUTTE le route. Fondamentale
# quando esponi l'app su internet con un tunnel. Se non impostata, nessuna
# password (comodo sull'uso in wifi locale di casa).
#   Windows PowerShell:  $env:VOLUME_PASSWORD="lamiapassword"
#   Windows CMD:         set VOLUME_PASSWORD=lamiapassword
VOLUME_PASSWORD = os.environ.get("VOLUME_PASSWORD", "").strip()


def require_auth(view):
    """Protegge una route con HTTP Basic Auth se VOLUME_PASSWORD e' impostata."""
    @wraps(view)
    def wrapper(*args, **kwargs):
        if VOLUME_PASSWORD:
            auth = request.authorization
            if not auth or auth.password != VOLUME_PASSWORD:
                return Response(
                    "Autenticazione richiesta.",
                    401,
                    {"WWW-Authenticate": 'Basic realm="Remote Volume Control"'},
                )
        return view(*args, **kwargs)

    return wrapper

# ============================================================
# LOGICA VOLUME - WINDOWS (PC Host)
# ============================================================

def get_local_ip():
    """Ottiene l'indirizzo IP locale del PC."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def _get_endpoint_volume():
    """Restituisce l'interfaccia IAudioEndpointVolume di Windows."""
    from ctypes import cast, POINTER
    from comtypes import CLSCTX_ALL
    from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume

    devices = AudioUtilities.GetSpeakers()
    interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
    return cast(interface, POINTER(IAudioEndpointVolume))


def windows_volume_up():
    """Alza il volume su Windows di STEP_VOLUME%."""
    try:
        volume = _get_endpoint_volume()
        current = volume.GetMasterVolumeLevelScalar()
        new_vol = min(1.0, current + (STEP_VOLUME / 100.0))
        volume.SetMasterVolumeLevelScalar(new_vol, None)
        return round(new_vol * 100)
    except Exception as e:
        print(f"Errore volume up: {e}")
        return None


def windows_volume_down():
    """Abbassa il volume su Windows di STEP_VOLUME%."""
    try:
        volume = _get_endpoint_volume()
        current = volume.GetMasterVolumeLevelScalar()
        new_vol = max(0.0, current - (STEP_VOLUME / 100.0))
        volume.SetMasterVolumeLevelScalar(new_vol, None)
        return round(new_vol * 100)
    except Exception as e:
        print(f"Errore volume down: {e}")
        return None


def windows_get_volume():
    """Ottiene il volume attuale su Windows."""
    try:
        volume = _get_endpoint_volume()
        return round(volume.GetMasterVolumeLevelScalar() * 100)
    except Exception:
        return 50


def volume_up():
    return windows_volume_up()


def volume_down():
    return windows_volume_down()


def get_current_volume():
    return windows_get_volume()

# ============================================================
# ROUTE FLASK
# ============================================================

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎵 Controllo Volume</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #fff;
            overflow: hidden;
            touch-action: manipulation;
        }

        .container {
            width: 100%;
            max-width: 420px;
            padding: 20px;
            text-align: center;
        }

        h1 {
            font-size: 1.6rem;
            margin-bottom: 8px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .subtitle {
            font-size: 0.85rem;
            color: #a0a0c0;
            margin-bottom: 25px;
        }

        .volume-display {
            background: rgba(255,255,255,0.08);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            padding: 35px 25px;
            margin-bottom: 25px;
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }

        .volume-icon {
            font-size: 4rem;
            margin-bottom: 12px;
            display: block;
            filter: drop-shadow(0 0 15px rgba(255,255,255,0.2));
        }

        .volume-value {
            font-size: 4rem;
            font-weight: 800;
            background: linear-gradient(135deg, #00d2ff, #3a7bd5);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .volume-label {
            font-size: 0.95rem;
            color: #8888aa;
            margin-top: 5px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .volume-bar-container {
            width: 100%;
            height: 10px;
            background: rgba(255,255,255,0.08);
            border-radius: 5px;
            margin-top: 18px;
            overflow: hidden;
        }

        .volume-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #00d2ff, #3a7bd5);
            border-radius: 5px;
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 0 10px rgba(0, 210, 255, 0.3);
        }

        .buttons {
            display: flex;
            gap: 16px;
            justify-content: center;
        }

        .btn {
            flex: 1;
            border: none;
            border-radius: 20px;
            padding: 28px 15px;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s ease;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            user-select: none;
            position: relative;
            overflow: hidden;
        }

        .btn::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.4s, height 0.4s;
        }

        .btn:active::after {
            width: 200px;
            height: 200px;
        }

        .btn:active {
            transform: scale(0.94);
        }

        .btn-up {
            background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
            box-shadow: 0 10px 30px rgba(0, 184, 148, 0.35);
        }

        .btn-down {
            background: linear-gradient(135deg, #e94560 0%, #c73e54 100%);
            box-shadow: 0 10px 30px rgba(233, 69, 96, 0.35);
        }

        .btn-icon {
            font-size: 2.2rem;
        }

        .status {
            margin-top: 22px;
            font-size: 0.9rem;
            min-height: 22px;
            opacity: 0;
            transition: opacity 0.3s ease;
            font-weight: 500;
        }

        .status.visible {
            opacity: 1;
        }

        .status.success {
            color: #00b894;
        }

        .status.error {
            color: #e94560;
        }

        .ip-info {
            position: fixed;
            bottom: 18px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255,255,255,0.06);
            padding: 10px 22px;
            border-radius: 30px;
            font-size: 0.78rem;
            color: #6666aa;
            border: 1px solid rgba(255,255,255,0.05);
            white-space: nowrap;
        }

        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255,255,255,0.3);
            transform: scale(0);
            animation: ripple-anim 0.6s linear;
            pointer-events: none;
        }

        @keyframes ripple-anim {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        @media (max-height: 600px) {
            .volume-display { padding: 20px 15px; }
            .volume-icon { font-size: 3rem; }
            .volume-value { font-size: 3rem; }
            .btn { padding: 20px 10px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎵 Controllo Volume</h1>
        <p class="subtitle">{{ hostname }} • PC Windows</p>

        <div class="volume-display">
            <span class="volume-icon" id="volumeIcon">🔊</span>
            <div class="volume-value" id="volumeValue">{{ current_volume }}%</div>
            <div class="volume-label">Volume Sistema</div>
            <div class="volume-bar-container">
                <div class="volume-bar-fill" id="volumeBar" style="width: {{ current_volume }}%"></div>
            </div>
        </div>

        <div class="buttons">
            <button class="btn btn-down" id="btnDown" onclick="changeVolume('down', event)">
                <span class="btn-icon">🔉</span>
                <span>Abbassa</span>
            </button>
            <button class="btn btn-up" id="btnUp" onclick="changeVolume('up', event)">
                <span class="btn-icon">🔊</span>
                <span>Alza</span>
            </button>
        </div>

        <div class="status" id="status"></div>
    </div>

    <div class="ip-info">
        🌐 http://{{ local_ip }}:{{ port }}
    </div>

    <script>
        let currentVolume = {{ current_volume }};
        let isProcessing = false;

        function updateVolumeIcon(vol) {
            const icon = document.getElementById('volumeIcon');
            if (vol === 0) icon.textContent = '🔇';
            else if (vol < 30) icon.textContent = '🔈';
            else if (vol < 70) icon.textContent = '🔉';
            else icon.textContent = '🔊';
        }

        function updateDisplay(vol) {
            currentVolume = vol;
            document.getElementById('volumeValue').textContent = vol + '%';
            document.getElementById('volumeBar').style.width = vol + '%';
            updateVolumeIcon(vol);
        }

        function showStatus(message, isError = false) {
            const status = document.getElementById('status');
            status.textContent = message;
            status.className = 'status visible' + (isError ? ' error' : ' success');
            setTimeout(() => { status.className = 'status'; }, 2000);
        }

        function createRipple(e, btn) {
            const ripple = document.createElement('span');
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
            ripple.classList.add('ripple');
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        }

        async function changeVolume(direction, event) {
            if (isProcessing) return;
            isProcessing = true;

            const btnId = direction === 'up' ? 'btnUp' : 'btnDown';
            const btn = document.getElementById(btnId);

            if (event) createRipple(event, btn);
            btn.style.transform = 'scale(0.94)';
            setTimeout(() => btn.style.transform = '', 150);

            try {
                const response = await fetch('/api/volume/' + direction, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                const data = await response.json();

                if (data.success) {
                    updateDisplay(data.volume);
                    const action = direction === 'up' ? 'aumentato' : 'diminuito';
                    showStatus('✓ Volume ' + action + ' a ' + data.volume + '%');
                } else {
                    showStatus('✗ ' + (data.error || 'Errore sconosciuto'), true);
                }
            } catch (err) {
                showStatus('✗ Errore di connessione', true);
                console.error(err);
            } finally {
                isProcessing = false;
            }
        }

        // Tastiera
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') changeVolume('up', null);
            if (e.key === 'ArrowDown') changeVolume('down', null);
        });

        // Prevenire zoom doppio tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) e.preventDefault();
            lastTouchEnd = now;
        }, false);

        // Vibrazione feedback su mobile (se supportata)
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (navigator.vibrate) navigator.vibrate(30);
            });
        });
    </script>
</body>
</html>
"""


@app.route('/')
@require_auth
def index():
    return render_template_string(
        HTML_TEMPLATE,
        current_volume=get_current_volume(),
        local_ip=get_local_ip(),
        port=PORT,
        hostname=socket.gethostname()
    )


@app.route('/api/volume/<action>', methods=['POST'])
@require_auth
def api_volume(action):
    if action == 'up':
        new_vol = volume_up()
        if new_vol is not None:
            return jsonify({'success': True, 'volume': new_vol})
        return jsonify({'success': False, 'error': 'Impossibile alzare il volume'}), 500

    elif action == 'down':
        new_vol = volume_down()
        if new_vol is not None:
            return jsonify({'success': True, 'volume': new_vol})
        return jsonify({'success': False, 'error': 'Impossibile abbassare il volume'}), 500

    return jsonify({'success': False, 'error': 'Azione non valida'}), 400


@app.route('/api/volume', methods=['GET'])
@require_auth
def api_get_volume():
    return jsonify({'success': True, 'volume': get_current_volume()})

# ============================================================
# AVVIO
# ============================================================

if __name__ == '__main__':
    local_ip = get_local_ip()

    print("=" * 62)
    print("  🎵  REMOTE VOLUME CONTROL  🎵")
    print("=" * 62)
    print(f"  🖥️  PC Host: {socket.gethostname()} (Windows)")
    print(f"  🌐 IP Locale: {local_ip}")
    print(f"  🔌 Porta: {PORT}")
    if VOLUME_PASSWORD:
        print("  🔒 Password: ATTIVA (login richiesto)")
    else:
        print("  🔓 Password: NON impostata (ok in wifi locale, NON per un tunnel)")
    print("=" * 62)
    print("  📱 Apri nel browser di Android:")
    print(f"     http://{local_ip}:{PORT}")
    print("=" * 62)
    print("  Premi CTRL+C per fermare il server")
    print("=" * 62)

    app.run(host='0.0.0.0', port=PORT, debug=False)
