export enum UserRole {
  Caretaker = 'caretaker',
  Family = 'family',
}

export enum Language {
  English = 'en',
  Malayalam = 'ml',
  Hindi = 'hi',
}

export enum AppView {
    Home = 'home',
    Add = 'add',
    Messages = 'messages',
    AI = 'ai',
    Profile = 'profile',
}

export type Theme = 'light' | 'dark';

export interface NotificationSettings {
  medicineSound: 'default' | 'chime' | 'alert';
  medicineVibration: 'default' | 'pulse' | 'none';
  appointmentSound: 'default' | 'chime' | 'alert';
  appointmentVibration: 'default' | 'pulse' | 'none';
  appointmentInterval: 15 | 30 | 60; // in minutes
}

export interface TranslationSet {
  [key: string]: string;
}

export interface Translations {
  [Language.English]: TranslationSet;
  [Language.Malayalam]: TranslationSet;
  [Language.Hindi]: TranslationSet;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  time: string;
  stock: number;
  stockThreshold: number;
}

export interface Appointment {
  id: string;
  doctor: string;
  clinic: string;
  date: string;
  time: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'caretaker' | 'family';
  timestamp: string;
  read?: boolean;
}

export enum Feeling {
    Good = 'Good',
    Tired = 'Tired',
    InPain = 'In Pain',
    Energetic = 'Energetic',
}

export interface HealthLogEntry {
  id: string;
  timestamp: string; // ISO string
  feeling: Feeling;
  note?: string;
  prompt: string;
}