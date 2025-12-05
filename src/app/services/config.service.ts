import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface CustomShapeConfig {
    name: string;
    grid: number[][];
}

export interface AppConfig {
    sequence: string;
    customShape: CustomShapeConfig;
}

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private config: AppConfig | null = null;

    constructor(private http: HttpClient) { }

    async loadConfig(): Promise<void> {
        try {
            this.config = await firstValueFrom(this.http.get<AppConfig>('assets/config.json'));
        } catch (error) {
            console.error('Failed to load configuration', error);
            // Fallback configuration if load fails
            this.config = {
                sequence: '|#countdown 3|-|Feliz|Cumple|a ti|❤|#customShape|',
                customShape: {
                    name: 'customShape',
                    grid: [] // Empty grid as fallback
                }
            };
        }
    }

    getConfig(): AppConfig | null {
        return this.config;
    }
}
