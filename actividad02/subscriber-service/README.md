# Subscriber Service - Redis Pub/Sub

## 📌 Descripción
Este proyecto implementa un servicio suscriptor usando Redis Pub/Sub.

Escucha eventos en el canal:
studysync:notificaciones

y muestra mensajes en tiempo real en consola.

---

## ⚙️ Tecnologías
- Node.js
- Redis (Upstash)
- dotenv
- Git

---

## 🚀 Cómo ejecutar

npm install  
npm start  

---

## 🔧 Configuración

Crear archivo .env:

REDIS_URL=tu_url_de_upstash

---

## 🧪 Funcionamiento

Cuando el publisher envía un mensaje:

→ Redis lo recibe  
→ Redis lo envía al subscriber  
→ Se imprime en consola

---

## 👥 Integrantes
- Camila Gutierrez (Subscriber)
- Dorian (Publisher)

---

## 📊 Arquitectura

Cliente → API Publisher → Supabase → Redis → Subscriber
