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
  // Use your live Render URL
  private readonly baseUrl = 'https://vibe-map.onrender.com';
  private readonly apiUrl = `${this.baseUrl}/api/vibes`;
  private socket: Socket;

  // This Subject holds the "Source of Truth" for your data
  private vibesSubject = new BehaviorSubject<Vibe[]>([]);
  public vibes$ = this.vibesSubject.asObservable();

  constructor(private http: HttpClient) {
    // Connect to the WebSocket server
    this.socket = io(this.baseUrl);
    this.initSocket();
  }

  fetchVibes() {
    this.http.get<Vibe[]>(this.apiUrl).subscribe((v: Vibe[]) => {
      this.vibesSubject.next(v);
    });
  }

  private initSocket() {
    // Listen for the broadcast from the server
    this.socket.on('vibe-appeared', (newVibe: Vibe) => {
      const currentVibes = this.vibesSubject.value;
      // Add the new vibe to the top of the list
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