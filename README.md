# RecrutApp — Applicant Tracking System (ATS)

Application web complète de gestion du recrutement construite avec Spring Boot 3 + React 18.

---

## Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Java  | 21              |
| Maven | 3.9+            |
| MySQL | 8.0+            |
| Node.js | 18+           |
| npm   | 9+              |

---

## Lancer le Backend

### 1. Créer la base de données (optionnel — créée automatiquement)

```sql
CREATE DATABASE IF NOT EXISTS recrutement_db;
```

### 2. Configurer MySQL

Éditez `backend/src/main/resources/application.properties` si nécessaire :

```properties
spring.datasource.username=root
spring.datasource.password=VOTRE_MOT_DE_PASSE
```

### 3. Démarrer le serveur

```bash
cd backend
mvn spring-boot:run
```

Le serveur démarre sur **http://localhost:8080**

---

## Lancer le Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application est accessible sur **http://localhost:5173**

---

## Identifiants admin par défaut

| Champ | Valeur |
|-------|--------|
| Email | `admin@app.com` |
| Mot de passe | `admin123` |

---

## Tester l'API avec Postman/curl

### Login (récupérer le JWT)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@app.com","password":"admin123"}'
```

Réponse :
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "admin@app.com",
  "name": "Administrateur",
  "role": "ADMIN"
}
```

### Utiliser le token dans les requêtes suivantes
```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:8080/api/candidates
```

### Dashboard stats
```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:8080/api/dashboard/stats
```

---

## Architecture

```
backend/
├── config/          # SecurityConfig, DataInitializer (admin par défaut)
├── security/        # JwtUtils, JwtAuthFilter, UserDetailsServiceImpl
├── controller/      # AuthController, CandidateController, JobOfferController...
├── service/         # Logique métier
├── repository/      # Interfaces JPA
├── entity/          # Entités JPA (User, Candidate, JobOffer, Application, Interview, Evaluation)
├── dto/             # Objets de transfert (aucune entité exposée en API)
├── mapper/          # Conversions Entity ↔ DTO
└── exception/       # ResourceNotFoundException, GlobalExceptionHandler

frontend/
├── src/
│   ├── api/         # Un fichier par ressource (Axios + intercepteurs JWT)
│   ├── components/  # Layout, Sidebar, ProtectedRoute, ConfirmDialog, StatusBadge, StarRating, Spinner
│   ├── context/     # AuthContext (user + token persisté en localStorage)
│   └── pages/       # Une page par écran (Login, Dashboard, Candidats, Offres, Candidatures, Entretiens, Évaluation)
```

---

## Flux de navigation

1. **Login** → JWT stocké en localStorage
2. **Dashboard** → stats + 5 dernières candidatures
3. **Candidats** → CRUD + upload/download CV PDF
4. **Offres** → CRUD avec statut OPEN/CLOSED
5. **Candidatures** → Création + changement de statut en ligne
6. **Entretiens** → Planification + lien vers l'évaluation
7. **Évaluation** → Note 1-5 étoiles + commentaire

---

## Sécurité

- JWT dans header `Authorization: Bearer <token>`
- Expiration : 24h
- Mots de passe hashés BCrypt
- Création de recruteur réservée aux admins (`POST /api/auth/register`)
- CORS configuré pour `http://localhost:5173` uniquement
