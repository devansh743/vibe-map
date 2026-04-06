import { Component, OnInit } from '@angular/core';
import { VibeService, Vibe } from './vibe.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  map!: L.Map;
  vibes: Vibe[] = [];
  explorerName: string = 'devansh';
  markers: { [key: string]: L.Marker } = {};

  constructor(private vibeService: VibeService) { }

  ngOnInit() {
    this.initMap();

    // FIXED: Added Vibe[] type to fix the terminal error
    this.vibeService.vibes$.subscribe((data: Vibe[]) => {
      this.vibes = data;
      this.updateMarkers(data);
    });

    this.vibeService.fetchVibes();
  }

  initMap() {
    // Fix for missing Leaflet marker icons in Angular
    const iconDefault = L.icon({
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      iconUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    this.map = L.map('map').setView([22.3072, 73.1812], 13);
    // ... rest of your code
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    this.map.on('contextmenu', (e: any) => {
      const msg = prompt("What's the vibe here?");
      if (msg) {
        this.vibeService.addVibe({
          user: this.explorerName,
          message: msg,
          coords: [e.latlng.lat, e.latlng.lng]
        }).subscribe();
      }
    });
  }
  updateMarkers(vibeList: Vibe[]) {
    // 1. Remove markers no longer in list
    Object.keys(this.markers).forEach(id => {
      if (!vibeList.find(v => v._id === id)) {
        this.map.removeLayer(this.markers[id]);
        delete this.markers[id];
      }
    });

    // 2. Add new markers
    vibeList.forEach(v => {
      if (v._id && !this.markers[v._id]) {
        const marker = L.marker([v.coords[0], v.coords[1]])
          .addTo(this.map)
          .bindPopup(`<b>${v.user}</b>: ${v.message}`);
        this.markers[v._id] = marker;
      }
    });
  }

  onDelete(id: string | undefined) {
    if (id && confirm("Delete this vibe?")) {
      this.vibeService.deleteVibe(id).subscribe();
    }
  }
}