import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-container">
      <div class="sidebar">
        <div class="header">
          <h1>VibeMap</h1>
          <p>Explorer: <b>{{userName}}</b></p>
          <div class="stats-badge">
            <span>Total Vibes: <b>{{ vibes.length }}</b></span>
          </div>
        </div>
        <div class="vibe-list">
          <div *ngFor="let v of vibes" class="vibe-card" (click)="flyToVibe(v.coords)">
            <span class="badge">{{v.type}}</span>
            <strong>{{v.user}}</strong>
            <p>{{v.message}}</p>
            <small class="time">{{ v.createdAt | date:'shortTime' }}</small>
          </div>
          <div *ngIf="vibes.length === 0" class="empty-state">
            <p>No vibes here yet. Right-click the map to start!</p>
          </div>
        </div>
      </div>
      <div id="map"></div>
    </div>
  `,
  styles: [`
    .app-container { display: flex; height: 100vh; background: #121212; font-family: sans-serif; }
    .sidebar { width: 320px; color: white; display: flex; flex-direction: column; border-right: 1px solid #333; z-index: 1000; }
    .header { padding: 20px; background: #1a1a1a; }
    .stats-badge { margin-top: 10px; color: #3498db; border: 1px solid #3498db; padding: 4px 12px; border-radius: 20px; font-size: 13px; }
    .vibe-list { flex: 1; overflow-y: auto; padding: 15px; }
    .vibe-card { background: #1e1e1e; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #3498db; cursor: pointer; transition: 0.2s; }
    .vibe-card:hover { background: #252525; }
    #map { flex: 1; background: #222; }
    .badge { font-size: 10px; background: #3498db; padding: 2px 6px; border-radius: 4px; float: right; }
    .time { color: #666; font-size: 11px; display: block; margin-top: 5px; text-align: right; }
  `]
})
export class AppComponent implements OnInit {
  private map!: L.Map;
  private socket = io('http://localhost:3000');
  public vibes: any[] = [];
  public userName: string = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.userName = localStorage.getItem('vibe-user') || prompt("Explorer Name?") || "Explorer";
    localStorage.setItem('vibe-user', this.userName);
    this.initMap();
    this.map.on('contextmenu', (e: L.LeafletMouseEvent) => {
    const msg = prompt("What's the vibe here?");
    const type = prompt("Category? (chill, party, alert)")?.toLowerCase() || 'chill';
    
    if (msg) {
      this.socket.emit('drop-vibe', {
        user: this.userName,
        message: msg,
        type: type, // Now sending the chosen type
        coords: [e.latlng.lat, e.latlng.lng]
      });
    }
  });
    this.setupSocket();
  }

  private initMap() {
    this.map = L.map('map').setView([20.5937, 78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    this.map.on('contextmenu', (e: L.LeafletMouseEvent) => {
      const msg = prompt("What's the vibe here?");
      if (msg) {
        this.socket.emit('drop-vibe', {
          user: this.userName,
          message: msg,
          coords: [e.latlng.lat, e.latlng.lng]
        });
      }
    });
  }

  private setupSocket() {
    // 1. Initial Load: Get history from DB
    fetch('http://localhost:3000/api/vibes')
      .then(res => res.json())
      .then(data => {
        this.vibes = [...data];
        this.vibes.forEach(v => this.addMarker(v));
        this.cdr.detectChanges();
      });

    // 2. Live Listener: Add new vibes as they happen
    this.socket.on('vibe-appeared', (vibe: any) => {
      this.vibes = [vibe, ...this.vibes];
      this.addMarker(vibe);
      this.cdr.detectChanges();
    });
  }

  private addMarker(vibe: any) {
  // Logic to determine color
  let markerColor = '#3498db'; // Default Blue (Chill)
  if (vibe.type === 'party') markerColor = '#e74c3c'; // Red
  if (vibe.type === 'alert') markerColor = '#f1c40f'; // Yellow

  L.circleMarker([vibe.coords[0], vibe.coords[1]], {
    radius: 12,
    fillColor: markerColor,
    color: '#fff',
    weight: 2,
    fillOpacity: 0.9
  }).addTo(this.map).bindPopup(`<b>${vibe.user} [${vibe.type}]</b>: ${vibe.message}`);
}

  public flyToVibe(coords: number[]) {
    this.map.flyTo([coords[0], coords[1]], 14);
  }
}