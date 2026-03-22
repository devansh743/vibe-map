import { Component, OnInit } from '@angular/core';
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
          <p>Logged in as: <b>{{userName}}</b></p>
        </div>
        <div class="vibe-list">
          <div *ngFor="let v of vibes" class="vibe-card" (click)="flyToVibe(v.coords)">
            <span class="badge" [ngClass]="v.type">{{v.type}}</span>
            <strong>{{v.user}}</strong>
            <p>{{v.message}}</p>
          </div>
        </div>
      </div>
      <div id="map"></div>
    </div>
  `,
  styles: [`
    .app-container { display: flex; height: 100vh; width: 100vw; font-family: sans-serif; }
    .sidebar { width: 320px; background: #1a1a1a; color: white; display: flex; flex-direction: column; z-index: 1000; box-shadow: 2px 0 10px rgba(0,0,0,0.5); }
    .header { padding: 20px; background: #222; border-bottom: 1px solid #333; }
    .vibe-list { flex-grow: 1; overflow-y: auto; padding: 10px; }
    .vibe-card { background: #2a2a2a; padding: 15px; margin-bottom: 10px; border-radius: 8px; cursor: pointer; transition: 0.2s; border-left: 4px solid #3498db; }
    .vibe-card:hover { background: #333; transform: scale(1.02); }
    #map { flex-grow: 1; }
    .badge { font-size: 10px; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; float: right; }
    .party { background: #e74c3c; } .food { background: #f1c40f; color: black; } .chill { background: #2ecc71; }
  `]
})
export class AppComponent implements OnInit {
  private map!: L.Map;
  private socket = io('http://localhost:3000');
  public vibes: any[] = [];
  public userName: string = '';

  ngOnInit() {
    this.checkUser();
    this.initMap();
    this.loadVibes();
    this.setupSocket();
  }

  private checkUser() {
    this.userName = localStorage.getItem('vibe-user') || '';
    if (!this.userName) {
      this.userName = prompt("Welcome! What's your name?") || "Newbie";
      localStorage.setItem('vibe-user', this.userName);
    }
  }

  private initMap() {
    this.map = L.map('map').setView([20.5937, 78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    this.map.on('contextmenu', (e: L.LeafletMouseEvent) => {
      const type = prompt("Type of vibe? (party, food, chill)") || 'chill';
      const msg = prompt("What's happening?");
      if (msg) {
        this.socket.emit('drop-vibe', {
          user: this.userName,
          message: msg,
          type: type,
          coords: [e.latlng.lat, e.latlng.lng]
        });
      }
    });
  }

  private loadVibes() {
    fetch('http://localhost:3000/api/vibes')
      .then(res => res.json())
      .then(data => {
        this.vibes = data;
        data.forEach((v: any) => this.addMarker(v));
      });
  }

  private setupSocket() {
    this.socket.on('vibe-appeared', (vibe: any) => {
      this.vibes.unshift(vibe); // Add to top of list
      this.addMarker(vibe);
    });
  }

  private addMarker(vibe: any) {
    const colors: any = { party: '#e74c3c', food: '#f1c40f', chill: '#2ecc71' };
    const markerColor = colors[vibe.type] || '#3498db';

    // Minimalist circle marker
    L.circleMarker([vibe.coords[0], vibe.coords[1]], {
      radius: 8,
      fillColor: markerColor,
      color: "#fff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(this.map).bindPopup(`<b>${vibe.user}</b>: ${vibe.message}`);
  }

  public flyToVibe(coords: number[]) {
    this.map.flyTo([coords[0], coords[1]], 14);
  }
}