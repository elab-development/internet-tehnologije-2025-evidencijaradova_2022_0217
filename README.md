# TrueWrite -- Plagiarism Detection System

## 📌 Opis aplikacije

TrueWrite je web aplikacija za detekciju plagijarizma u studentskim i
akademskim radovima. Korisnici mogu da upload-uju dokumente (PDF, DOCX
ili TXT), nakon čega sistem analizira sadržaj i vrši poređenje sa
postojećim radovima u bazi podataka.

Aplikacija omogućava: - Registraciju i autentifikaciju korisnika -
Upload dokumenata - Automatsku analizu sličnosti - Prikaz procenta
podudarnosti - Administratorski pregled svih dokumenata

Cilj aplikacije je unapređenje akademske čestitosti i automatizacija
procesa provere autentičnosti radova.

---

## 🛠️ Tehnologije

Frontend: - React (Vite) - TailwindCSS - Axios

Backend: - Node.js - Express.js - Prisma ORM

Baza podataka: - PostgreSQL

Cloud storage: - Cloudinary (za čuvanje upload-ovanih fajlova)

DevOps: - Docker - Docker Compose - GitHub Actions (CI/CD)

---

## 🚀 Lokalno pokretanje aplikacije

### 1️⃣ Kloniranje repozitorijuma

```bash
git clone https://github.com/your-username/truewrite.git
cd truewrite
```

### 2️⃣ Backend setup

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

Backend će biti dostupan na:

    http://localhost:5000

### 3️⃣ Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend će biti dostupan na:

    http://localhost:5173

---

## 🐳 Pokretanje pomoću Docker-a

Aplikacija je dockerizovana i može se pokrenuti pomoću Docker Compose-a.

### 1️⃣ Pokretanje svih servisa

```bash
docker-compose up --build
```

Ova komanda pokreće: - Frontend servis - Backend servis - PostgreSQL
bazu

### 2️⃣ Zaustavljanje servisa

```bash
docker-compose down
```