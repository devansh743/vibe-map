import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Vibe {
  _id?: string;
  user: string;
  message: string;
  coords: number[];
  createdAt?: Date;
}

@Injectable({ providedIn: 'root' })
export class VibeService {
  // Use the RELATIVE path for Render, or localhost for your PC
  private readonly baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://vibe-map.onrender.com';

  private readonly apiUrl = `${this.baseUrl}/api/vibes`;
  private socket: Socket;

  private vibesSubject = new BehaviorSubject<Vibe[]>([]);
  public vibes$ = this.vibesSubject.asObservable();

  constructor(private http: HttpClient) {
    // FORCE POLLING: This is the fix for many deployment sync issues
    this.socket = io(this.baseUrl, {
      transports: ['polling', 'websocket']
    });
    this.initSocket();
  }

  fetchVibes() {
    this.http.get<Vibe[]>(this.apiUrl).subscribe((v: Vibe[]) => {
      this.vibesSubject.next(v);
    });
  }

  private initSocket() {
    this.socket.on('connect', () => console.log('✅ Connected to Real-time Server'));

    this.socket.on('vibe-appeared', (newVibe: Vibe) => {
      console.log('✨ New Vibe received via Socket:', newVibe);
      const currentVibes = this.vibesSubject.value;
      this.vibesSubject.next([newVibe, ...currentVibes]);
    });

    this.socket.on('vibe-deleted', (id: string) => {
      const filtered = this.vibesSubject.value.filter(v => v._id !== id);
      this.vibesSubject.next(filtered);
    });
  }

  addVibe(vibe: Vibe): Observable<Vibe> {
    return this.http.post<Vibe>(this.apiUrl, vibe);
  }

  deleteVibe(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}