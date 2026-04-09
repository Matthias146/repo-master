import { Injectable, signal } from '@angular/core';
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Supabase {
  private supabase: SupabaseClient;
  public session = signal<Session | null>(null);

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.key);
    this.supabase.auth.getSession().then(({ data }) => {
      this.session.set(data.session);
    });
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
    });
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  async signInWithGithub() {
    await this.supabase.auth.signInWithOAuth({
      provider: 'github',
    });
  }

  async signOut() {
    await this.supabase.auth.signOut();
  }
}
