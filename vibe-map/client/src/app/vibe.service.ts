import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io } from 'socket.io-client';
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
  // If we are on Render, use empty string (relative path). If local, use localhost:3000
  private isProd = window.location.hostname !== 'localhost';
  private baseUrl = this.isProd ? '' : 'http://localhost:3000';

  private apiUrl = `${this.baseUrl}/api/vibes`;
  private socket = io(this.baseUrl || window.location.origin);

  // BehaviorSubject stores the current list and broadcasts it to the component
  private vibesSubject = new BehaviorSubject<Vibe[]>([]);
  public vibes$ = this.vibesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initSocket();
  }

  fetchVibes() {
    this.http.get<Vibe[]>(this.apiUrl).subscribe((v: Vibe[]) => this.vibesSubject.next(v));
  }

  private initSocket() {
    this.socket.on('vibe-appeared', (v: Vibe) => {
      this.vibesSubject.next([v, ...this.vibesSubject.value]);
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