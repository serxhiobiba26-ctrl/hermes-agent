# 📖 Guida: provare Remote Volume Control sul telefono

Due scenari:

- **A) In casa, stessa rete wifi** → non serve nulla di speciale, gratis.
- **B) Fuori casa (dati mobili)** → serve un *tunnel* + una password.

In entrambi i casi l'app gira **sul tuo PC Windows**: è quello il "server" che
controlla il volume. Il telefono è solo il telecomando.

---

## Passo 0 — Avviare l'app sul PC Windows (serve sempre)

1. Apri il **Prompt dei comandi** o **PowerShell** nella cartella del progetto.
2. Installa le dipendenze (solo la prima volta):

   ```
   pip install -r requirements.txt
   ```

3. Avvia:

   ```
   python app.py
   ```

4. Nella console leggi una riga tipo:

   ```
   📱 Apri nel browser di Android:
      http://192.168.1.42:5000
   ```

   Quello è l'indirizzo del tuo PC sulla rete di casa. Tienilo lì aperto.

> Se Windows Firewall chiede il permesso alla prima esecuzione, consenti
> l'accesso sulle **reti private**.

---

## A) Provarlo in casa (stessa rete wifi) — gratis

1. Assicurati che **telefono e PC siano sullo stesso wifi** (quello di casa).
2. Sul telefono apri il browser e digita l'indirizzo che compare nella
   console del PC, es. `http://192.168.1.42:5000`.
3. Usa i pulsanti **Alza / Abbassa**: senti il volume del PC cambiare. ✅

Qui **non serve password**: la rete di casa è già la tua barriera.

---

## B) Usarlo fuori casa (dati mobili) — tunnel + password

Fuori dal wifi di casa il telefono non "vede" più l'IP `192.168.x.x`. Un
tunnel crea un link pubblico `https://...` che punta al tuo PC.

### B.1 — Imposta PRIMA una password (obbligatorio)

Senza password, chiunque avesse il link potrebbe cambiarti il volume.
Nella stessa finestra dove avvii l'app, prima di `python app.py`:

- **PowerShell:**

  ```
  $env:VOLUME_PASSWORD="scegli-una-password"
  python app.py
  ```

- **Prompt dei comandi (CMD):**

  ```
  set VOLUME_PASSWORD=scegli-una-password
  python app.py
  ```

All'avvio deve comparire `🔒 Password: ATTIVA`. Il browser, aprendo il link,
chiederà login: **utente qualsiasi**, password quella che hai scelto.

### B.2 — Avvia il tunnel

Scegli **uno** dei due (cloudflared è gratis e senza registrazione).

**Opzione 1 — Cloudflare Tunnel (consigliato, gratis)**

1. Scarica `cloudflared` per Windows:
   <https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/>
2. In una **seconda** finestra del terminale:

   ```
   cloudflared tunnel --url http://localhost:5000
   ```

3. Stampa un link tipo `https://qualcosa-a-caso.trycloudflare.com`.
   Aprilo sul telefono (anche con i dati mobili), inserisci la password. ✅

**Opzione 2 — ngrok**

1. Registrati su <https://ngrok.com> e installa ngrok (ti danno un authtoken
   da configurare una volta con `ngrok config add-authtoken IL_TUO_TOKEN`).
2. In una seconda finestra:

   ```
   ngrok http 5000
   ```

3. Copia l'URL `https://....ngrok-free.app`, aprilo sul telefono, inserisci
   la password. ✅

### B.3 — Fine sessione

Quando hai finito, chiudi la finestra del tunnel: il link pubblico smette
subito di funzionare. L'app sul PC la fermi con **CTRL+C**.

---

## Problemi comuni

| Sintomo | Causa probabile | Soluzione |
|---|---|---|
| Sul telefono la pagina non si apre (wifi locale) | Telefono e PC su reti diverse, o firewall | Stesso wifi; consenti l'app nel Windows Firewall (reti private) |
| Pagina si apre ma i pulsanti danno errore | `pycaw`/`comtypes` non installati, o non sei su Windows | `pip install -r requirements.txt`; l'app funziona solo su Windows |
| Il link del tunnel chiede login e non lo accetta | Password diversa da `VOLUME_PASSWORD` | Usa la stessa password mostrata all'avvio; utente qualsiasi |
| Il link del tunnel non apre nulla | Tunnel chiuso o porta sbagliata | Il tunnel deve puntare alla stessa `PORT` dell'app (default 5000) |

---

## Nota di sicurezza

Il tunnel espone il tuo PC su internet finché resta aperto. Tienilo attivo
solo quando ti serve, usa **sempre** una password quando usi un tunnel, e
chiudilo a fine sessione. In wifi locale la password è facoltativa.
