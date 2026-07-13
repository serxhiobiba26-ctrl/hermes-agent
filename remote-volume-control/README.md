# 🎵 Remote Volume Control

Controlla il volume del tuo **PC Windows** da qualsiasi browser (telefono Android,
tablet, un altro computer) sulla stessa rete Wi-Fi.

Il PC fa da host: avvia un piccolo server Flask che espone una pagina web con due
pulsanti (Alza / Abbassa) e mostra il livello del volume in tempo reale.

## Requisiti

- **PC host: Windows** (il controllo volume usa `pycaw`, disponibile solo su Windows).
- Python 3.9+.
- PC e dispositivo remoto sulla **stessa rete locale**.

## Installazione

```bash
cd remote-volume-control
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

## Avvio

```bash
python app.py
```

All'avvio la console mostra l'indirizzo da aprire sul telefono, per esempio:

```
📱 Apri nel browser di Android:
   http://192.168.1.42:5000
```

Apri quell'URL dal browser del telefono e usa i pulsanti.

## Configurazione

Nel file `app.py`:

- `STEP_VOLUME` — di quanti punti percentuali sale/scende ogni pressione (default `10`).
- `PORT` — la porta del server (default `5000`).

## API

| Metodo | Endpoint             | Descrizione                          |
|--------|----------------------|--------------------------------------|
| GET    | `/`                  | Interfaccia web                      |
| POST   | `/api/volume/up`     | Alza il volume di `STEP_VOLUME%`     |
| POST   | `/api/volume/down`   | Abbassa il volume di `STEP_VOLUME%`  |
| GET    | `/api/volume`        | Volume corrente in percentuale       |

## ⚠️ Note importanti

- **Nessuna autenticazione**: il server ascolta su `0.0.0.0`, quindi *chiunque*
  sulla stessa rete può controllare il volume. Usalo solo su reti fidate (casa),
  non su Wi-Fi pubblici.
- **Solo Windows**: su Linux/macOS il server parte ma il controllo volume non
  funziona (manca `pycaw`). Per il supporto cross-platform servirebbe un backend
  diverso (es. `amixer`/`pactl` su Linux, `osascript` su macOS).
- Se il volume non cambia, controlla che `pycaw` e `comtypes` siano installati e
  che tu stia eseguendo lo script su Windows.
