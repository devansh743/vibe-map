import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf, NgFor } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: '../app.component.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  vibes: any[] = [];
  explorerName: string = '';
  private apiUrl = 'http://localhost:3000/api/vibes';
  private map: L.Map | undefined;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    const name = window.prompt('Enter your name:');
    this.explorerName = name ? name : 'Anonymous';

    this.loadVibes();
  }

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap(): void {
    const iconDefault = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    this.map = L.map('map').setView([20.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('contextmenu', (e: L.LeafletMouseEvent) => {
      this.onMapRightClick(e.latlng);
    });
  }

  loadVibes() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.vibes = data;
        this.renderVibes();
      },
      error: (err) => console.error('❌ Could not load vibes:', err)
    });
  }

  private renderVibes() {
    if (!this.map || !this.vibes) return;

    this.vibes.forEach(vibe => {
      if (vibe.coords && vibe.coords.length === 2) {
        L.marker([vibe.coords[0], vibe.coords[1]])
          .bindPopup(`<b>${vibe.user}</b><br>${vibe.message}`)
          .addTo(this.map!);
      }
    });
  }

  onMapRightClick(latlng: L.LatLng) {
    const message = window.prompt('Drop a vibe here:');
    if (!message) return;

    const newVibe = {
      user: this.explorerName,
      message: message,
      coords: [latlng.lat, latlng.lng]
    };

    this.http.post(this.apiUrl, newVibe).subscribe({
      next: (savedVibe: any) => {
        this.vibes.push(savedVibe);
        L.marker([latlng.lat, latlng.lng])
          .bindPopup(`<b>${this.explorerName}</b><br>${message}`)
          .addTo(this.map!);
      },
      error: (err) => alert('Failed to save vibe!')
    });
  }
}