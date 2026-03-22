# 📍 VibeMap - Real-Time Geo-Social Map

VibeMap is a full-stack **MEAN (MongoDB, Express, Angular, Node.js)** application that allows users to "drop a vibe" (a message with a mood/category) anywhere on a global map. Using **Socket.io**, these vibes appear instantly for all connected users without needing to refresh the page.

## 🚀 Features
- **Interactive Map:** Right-click anywhere on the Leaflet-powered map to drop a message.
- **Real-Time Updates:** Seamless synchronization across all clients using WebSockets.
- **Persistent Storage:** All "vibes" are stored in MongoDB and reloaded on page refresh.
- **Live Counter:** Real-time tracking of the total number of vibes dropped globally.
- **Smooth Navigation:** Click on a vibe card in the sidebar to "fly" the map to that specific location.

## 🛠️ Tech Stack
- **Frontend:** Angular 17+, Leaflet.js (Maps), CSS3 (Dark Theme)
- **Backend:** Node.js, Express.js
- **Real-Time:** Socket.io
- **Database:** MongoDB (Mongoose ODM)

## 📋 Prerequisites
Before running this project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running locally on port 27017)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone [https://github.com/devansh743/vibe-map.git](https://github.com/devansh743/vibe-map.git)
cd vibe-map
