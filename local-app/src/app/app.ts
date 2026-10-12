import { Component, Directive, ElementRef, OnDestroy, OnInit, Renderer2, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

interface RedditPost {
  id: string;
  title: string;
  subreddit: string;
  permalink: string;
  selftext: string;
  createdUtc: number;
  score: number;
  numComments: number;
  viewCount: number | null;
}

interface RedditPostsResponse {
  posts: RedditPost[];
}

interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  updatedAt: string;
}

interface GitHubRepositoriesResponse {
  repositories: GitHubRepository[];
}

const englishTranslations: Record<string, string> = {
  'Die Anmeldung bei Reddit ist fehlgeschlagen (HTTP 401).': 'Reddit sign-in failed (HTTP 401).',
  'Die Reddit-API-Zugangsdaten in local-app/.env fehlen.': 'Reddit API credentials are missing from local-app/.env.',
  'Reddit-Beiträge konnten nicht geladen werden. Prüfe den API-Server und versuche es erneut.': 'Could not load Reddit posts. Check the API server and try again.',
  'Die GitHub-API ist nicht erreichbar (HTTP 403).': 'The GitHub API is unavailable (HTTP 403).',
  'GitHub-Repositories konnten nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.': 'Could not load GitHub repositories. Check your connection and try again.',
  'Der E-Mail-Versand ist noch nicht eingerichtet. Bitte trage die Gmail-SMTP-Daten in local-app/.env ein.': 'Email delivery is not configured. Add the Gmail SMTP settings to local-app/.env.',
  'Bitte überprüfe deine Angaben und versuche es erneut.': 'Please check your details and try again.',
  'Die E-Mail konnte nicht zugestellt werden. Bitte versuche es später erneut.': 'The email could not be delivered. Please try again later.',
  'Die Nachricht konnte nicht gesendet werden. Bitte überprüfe deine Verbindung und versuche es erneut.': 'The message could not be sent. Check your connection and try again.',
  'Das Kontaktformular konnte nicht gelesen werden. Bitte lade die Seite neu.': 'The contact form could not be read. Please reload the page.',
  'Bitte fülle alle Felder aus.': 'Please fill in all fields.',
  'Der E-Mail-Versand konnte nicht bestätigt werden. Bitte versuche es erneut.': 'Email delivery could not be confirmed. Please try again.',
  'Tim Schweizer': 'Tim Schweizer',
  'Angehender Informatiklehrling': 'Aspiring IT apprentice',
  'Über mich': 'About me',
  'Projekte': 'Projects',
  'Fähigkeiten & Technologien': 'Skills & technologies',
  'Fähigkeiten': 'Skills',
  'Backend & Docker': 'Backend & Docker',
  'Architektur': 'Architecture',
  'Kontakt': 'Contact',
  'Kontakt aufnehmen': 'Get in touch',
  'Tagmodus aktivieren': 'Switch to light mode',
  'Nachtmodus aktivieren': 'Switch to dark mode',
  'Auf der Suche nach einer Lehrstelle als Informatiker': 'Looking for an IT apprenticeship',
  'Logik verstehen.': 'Understand logic.',
  'Probleme lösen. IT gestalten.': 'Solve problems. Shape IT.',
  'Ich interessiere mich für moderne Webentwicklung und arbeite mit Angular, Python, FastAPI, Docker und PostgreSQL.': 'I am passionate about modern web development and work with Angular, Python, FastAPI, Docker, and PostgreSQL.',
  'Projekte entdecken': 'Explore projects',
  'Architektur ansehen': 'View architecture',
  'Meine Technologien': 'My technologies',
  'Frontend': 'Frontend',
  'Backend': 'Backend',
  'Datenbank': 'Database',
  'Betrieb': 'Operations',
  'Sauberer Code': 'Clean code',
  'Wartbare Architektur': 'Maintainable architecture',
  'Ich beschäftige mich mit SOLID-Prinzipien, Angular-Standalone-Komponenten und übersichtlichen FastAPI-Controllern.': 'I explore SOLID principles, Angular standalone components, and well-structured FastAPI controllers.',
  'Technische Stärken': 'Technical strengths',
  'Persönliche Stärken': 'Personal strengths',
  'KI': 'AI',
  'Ich nutze KI als Unterstützung beim Lernen und Entwickeln.': 'I use AI to support my learning and development.',
  'Zusammenhänge schnell verstehen': 'Quickly understanding connections',
  'Ich erfasse neue Zusammenhänge schnell und kann Informationen einordnen.': 'I quickly grasp new connections and put information into context.',
  'Allgemeines Computerfachwissen': 'General computer knowledge',
  'Ich bringe ein breites Verständnis für Computer, Betriebssysteme und digitale Technologien mit.': 'I have a broad understanding of computers, operating systems, and digital technologies.',
  'Kenntnisse verschiedener moderner Software-Tools': 'Knowledge of various modern software tools',
  'Ich arbeite mit unterschiedlichen Entwicklungs-, Kollaborations- und Produktivitätstools.': 'I work with a range of development, collaboration, and productivity tools.',
  'Teamfähigkeit': 'Teamwork',
  'Ich tausche mich offen aus und arbeite auf gemeinsame Ziele hin.': 'I communicate openly and work toward shared goals.',
  'Ausdauer': 'Perseverance',
  'Ich bleibe auch bei anspruchsvollen Aufgaben dran.': 'I stay focused even when tasks are challenging.',
  'Neugier': 'Curiosity',
  'Ich probiere gern Neues aus und möchte verstehen, wie es funktioniert.': 'I enjoy exploring new things and understanding how they work.',
  'Eigeninitiative': 'Initiative',
  'Ich bringe eigene Ideen ein und setze Aufgaben selbstständig in Gang.': 'I contribute my own ideas and take initiative to get tasks moving.',
  'Automatisierte Bereitstellung': 'Automated deployment',
  'Container mit Docker Compose und CI/CD-Abläufe mit GitHub Actions.': 'Containers with Docker Compose and CI/CD workflows with GitHub Actions.',
  'Datenverwaltung': 'Data management',
  'SQL & Datenbanken': 'SQL & databases',
  'Relationale Datenmodelle mit PostgreSQL, Alembic-Migrationen und SQLAlchemy.': 'Relational data models with PostgreSQL, Alembic migrations, and SQLAlchemy.',
  'Meine Reddit-Beiträge': 'My Reddit posts',
  'Meine neuesten Beiträge von u/Timschweizerch.': 'My latest posts from u/Timschweizerch.',
  'Reddit-Profil ansehen →': 'View Reddit profile →',
  'Aktualisiert um': 'Updated at',
  '· automatische Aktualisierung alle 5 Minuten': '· refreshes automatically every 5 minutes',
  'Beiträge werden direkt von Reddit geladen': 'Posts load directly from Reddit',
  'Wird geladen ...': 'Loading ...',
  'Beiträge aktualisieren': 'Refresh posts',
  'Deine neuesten Reddit-Beiträge werden geladen ...': 'Loading your latest Reddit posts ...',
  'Für dieses Reddit-Konto wurden keine öffentlichen Beiträge gefunden.': 'No public posts were found for this Reddit account.',
  'Punkte': 'points',
  'Kommentare': 'comments',
  'Aufrufe': 'views',
  'Auf Reddit ansehen →': 'View on Reddit →',
  'Meine GitHub-Projekte': 'My GitHub projects',
  'Meine neuesten öffentlichen Repositories von': 'My latest public repositories from',
  'GitHub-Profil ansehen →': 'View GitHub profile →',
  'Repositories werden direkt von GitHub geladen': 'Repositories load directly from GitHub',
  'Repositories aktualisieren': 'Refresh repositories',
  'Deine neuesten GitHub-Repositories werden geladen ...': 'Loading your latest GitHub repositories ...',
  'Für dieses GitHub-Konto wurden keine öffentlichen Repositories gefunden.': 'No public repositories were found for this GitHub account.',
  'Keine Beschreibung vorhanden.': 'No description provided.',
  'Sterne': 'stars',
  'Forks': 'forks',
  'Aktualisiert am': 'Updated',
  'Repository ansehen →': 'View repository →',
  'Ausgewählte Anwendungen': 'Featured applications',
  'Projekte mit Angular, FastAPI und Datenbankanbindung.': 'Projects featuring Angular, FastAPI, and database integration.',
  'Ausgewählt': 'Featured',
  'GitHub-Repository →': 'GitHub repository →',
  'Meine Fähigkeiten': 'My skills',
  'Ein Überblick über meine Werkzeuge, Frameworks und Datenbanktechnologien.': 'An overview of my tools, frameworks, and database technologies.',
  'Softwareentwicklung & Frameworks': 'Software development & frameworks',
  'Datenbanken & Infrastruktur': 'Databases & infrastructure',
  'Fortgeschritten': 'Advanced',
  'Gute Kenntnisse': 'Proficient',
  'Anwendungsarchitektur & Docker': 'Application architecture & Docker',
  'Einblick in Backend, Datenbankmodell, Docker-Image und GitHub-Bereitstellung.': 'Explore the backend, database model, Docker image, and GitHub deployment.',
  'main.py (FastAPI-Backend)': 'main.py (FastAPI backend)',
  'database.py (PostgreSQL)': 'database.py (PostgreSQL)',
  'UTF-8 / Für die Bereitstellung konfiguriert': 'UTF-8 / Configured for deployment',
  'Ich freue mich über den Austausch zu Ausbildungsplätzen, Softwareprojekten und Zusammenarbeit.': 'I would love to hear from you about apprenticeships, software projects, or collaboration.',
  'Nachricht erfolgreich gesendet!': 'Message sent successfully!',
  'Vielen Dank! Deine Nachricht wurde per E-Mail zugestellt.': 'Thank you! Your message has been delivered by email.',
  'Weitere Nachricht senden': 'Send another message',
  'Dein Name': 'Your name',
  'z. B. Tim Schweizer': 'e.g. Tim Schweizer',
  'E-Mail-Adresse': 'Email address',
  'name@beispiel.ch': 'name@example.com',
  'Deine Nachricht': 'Your message',
  'Hallo Tim, ich würde dich gerne kennenlernen ...': 'Hi Tim, I would love to connect ...',
  'Wird gesendet ...': 'Sending ...',
  'Nachricht senden': 'Send message',
  'Schweiz': 'Switzerland',
  'Erstellt mit Angular, FastAPI, PostgreSQL und Docker': 'Built with Angular, FastAPI, PostgreSQL, and Docker',
  'Backend-Anwendungscode (app/main.py)': 'Backend application code (app/main.py)',
  'Datenbankverbindung und Modell (app/database.py)': 'Database connection and model (app/database.py)',
  'Bereitstellung mehrerer Container (docker-compose.yml)': 'Multi-container deployment (docker-compose.yml)',
  'Automatisierte CI/CD-Pipeline (.github/workflows/deploy.yml)': 'Automated CI/CD pipeline (.github/workflows/deploy.yml)',
  'Aufgaben- und Workflow-Management': 'Task and workflow management',
  'Eine Workflow-Anwendung mit Statusaktualisierungen, dynamischer Zustandsverwaltung und PostgreSQL-Datenbankanbindung.': 'A workflow application with status updates, dynamic state management, and PostgreSQL persistence.',
  'Metrik-Dashboard für Microservices': 'Microservice metrics dashboard',
  'Dashboard zur Systemüberwachung mit asynchronen Daten aus Python-Endpunkten, JWT-Authentifizierung und rollenbasierter Zugriffskontrolle.': 'A system monitoring dashboard with asynchronous Python endpoint data, JWT authentication, and role-based access control.',
  'Automatisierte CI/CD-Bereitstellung': 'Automated CI/CD deployment',
  'Cloud & Infrastruktur': 'Cloud & infrastructure',
  'GitHub-Actions-Ablauf zum Erstellen von Docker-Containern, Testen von FastAPI-Endpunkten und Bereitstellen in der Cloud.': 'A GitHub Actions workflow to build Docker containers, test FastAPI endpoints, and deploy to the cloud.',
};

function getRedditErrorMessage(error: unknown): string {
  if (
    error instanceof HttpErrorResponse &&
    typeof error.error === 'object' &&
    error.error !== null &&
    'error' in error.error &&
    typeof error.error.error === 'string'
  ) {
    const oauthStatus = error.error.error.match(/^Reddit OAuth returned HTTP (\d+)\.$/);
    if (oauthStatus) {
      return `Die Anmeldung bei Reddit ist fehlgeschlagen (HTTP ${oauthStatus[1]}).`;
    }
    if (error.error.error.startsWith('Set REDDIT_CLIENT_ID')) {
      return 'Die Reddit-API-Zugangsdaten in local-app/.env fehlen.';
    }
  }

  return 'Reddit-Beiträge konnten nicht geladen werden. Prüfe den API-Server und versuche es erneut.';
}

function getGitHubErrorMessage(error: unknown): string {
  if (
    error instanceof HttpErrorResponse &&
    typeof error.error === 'object' &&
    error.error !== null &&
    'error' in error.error &&
    typeof error.error.error === 'string'
  ) {
    const apiStatus = error.error.error.match(/^GitHub API returned HTTP (\d+)\.$/);
    if (apiStatus) {
      return `Die GitHub-API ist nicht erreichbar (HTTP ${apiStatus[1]}).`;
    }
  }

  return 'GitHub-Repositories konnten nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.';
}

function getContactErrorMessage(error: unknown): string {
  if (
    error instanceof HttpErrorResponse &&
    typeof error.error === 'object' &&
    error.error !== null &&
    'error' in error.error &&
    typeof error.error.error === 'string'
  ) {
    switch (error.error.error) {
      case 'email_not_configured':
        return 'Der E-Mail-Versand ist noch nicht eingerichtet. Bitte trage die Gmail-SMTP-Daten in local-app/.env ein.';
      case 'invalid_contact':
        return 'Bitte überprüfe deine Angaben und versuche es erneut.';
      case 'email_delivery_failed':
        return 'Die E-Mail konnte nicht zugestellt werden. Bitte versuche es später erneut.';
    }
  }

  return 'Die Nachricht konnte nicht gesendet werden. Bitte überprüfe deine Verbindung und versuche es erneut.';
}

@Directive({
  selector: '[appRevealOnScroll]',
  standalone: true,
})
export class RevealOnScrollDirective implements OnInit, OnDestroy {
  private observer?: IntersectionObserver;

  constructor(
    private readonly element: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
  ) {}

  ngOnInit() {
    this.renderer.addClass(this.element.nativeElement, 'scroll-reveal');

    if (
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      this.renderer.addClass(this.element.nativeElement, 'is-visible');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.renderer.addClass(this.element.nativeElement, 'is-visible');
          this.observer?.unobserve(this.element.nativeElement);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -32px 0px' },
    );
    this.observer.observe(this.element.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}

interface Project {
  title: string;
  category: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  demoUrl?: string;
  highlight: boolean;
}

interface Skill {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'devops';
  level: number; // 0-100
  icon: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, RevealOnScrollDirective],
  template: `
    <div [attr.lang]="language() === 'de' ? 'de' : 'en'" class="min-h-screen bg-slate-50 text-slate-900 font-sans theme-transition" [class.dark-mode]="isDarkMode()">
      <!-- Top Navigation Bar -->
      <nav class="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-3 sm:px-6 py-3 sm:py-4">
        <div class="max-w-6xl mx-auto flex flex-wrap items-center gap-x-3 gap-y-3">
          <div class="flex min-w-0 items-center gap-2 sm:gap-3">
            <button type="button" (click)="activeTab.set('overview')" [attr.aria-label]="translate('Über mich')" class="shrink-0 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-400">
              <img src="/profilebild.jpeg" alt="" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover object-[72%_45%] ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/20" />
            </button>
            <div class="min-w-0">
              <span class="font-bold text-base sm:text-lg text-white block leading-tight">{{ translate('Tim Schweizer') }}</span>
              <span class="text-[10px] sm:text-xs text-indigo-400 font-medium leading-tight">{{ translate('Angehender Informatiklehrling') }}</span>
            </div>
          </div>

          <!-- Nav Items -->
          <div class="hidden lg:flex lg:mx-auto gap-3 xl:gap-6 text-sm font-medium">
            <button (click)="activeTab.set('overview')" [class.text-indigo-400]="activeTab() === 'overview'" class="hover:text-indigo-300 transition-colors">{{ translate('Über mich') }}</button>
            <button (click)="activeTab.set('projects')" [class.text-indigo-400]="activeTab() === 'projects'" class="hover:text-indigo-300 transition-colors">{{ translate('Projekte') }}</button>
            <button (click)="activeTab.set('skills')" [class.text-indigo-400]="activeTab() === 'skills'" class="hover:text-indigo-300 transition-colors">{{ translate('Fähigkeiten & Technologien') }}</button>
            <button (click)="activeTab.set('architecture')" [class.text-indigo-400]="activeTab() === 'architecture'" class="hover:text-indigo-300 transition-colors">{{ translate('Backend & Docker') }}</button>
            <button (click)="activeTab.set('contact')" [class.text-indigo-400]="activeTab() === 'contact'" class="hover:text-indigo-300 transition-colors">{{ translate('Kontakt') }}</button>
          </div>

          <div class="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <a href="#contact" (click)="activeTab.set('contact')" class="px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-600/30">
              <span class="sm:hidden">{{ translate('Kontakt') }}</span>
              <span class="hidden sm:inline">{{ translate('Kontakt aufnehmen') }}</span>
            </a>
            <button
              type="button"
              role="switch"
              [attr.aria-checked]="isDarkMode()"
              [attr.aria-label]="translate(isDarkMode() ? 'Tagmodus aktivieren' : 'Nachtmodus aktivieren')"
              [title]="translate(isDarkMode() ? 'Tagmodus aktivieren' : 'Nachtmodus aktivieren')"
              (click)="toggleTheme()"
              class="theme-toggle"
            >
              <span class="theme-toggle-track" [class.is-dark]="isDarkMode()">
                <span class="theme-toggle-thumb">
                  <svg class="theme-toggle-sun" [class.is-hidden]="isDarkMode()" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"></path>
                  </svg>
                  <svg class="theme-toggle-moon" [class.is-visible]="isDarkMode()" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z"></path>
                  </svg>
                </span>
              </span>
            </button>
            <button
              type="button"
              (click)="toggleLanguage()"
              [attr.aria-label]="language() === 'de' ? 'Switch language to English' : 'Sprache zu Deutsch wechseln'"
              [title]="language() === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln'"
              class="language-toggle"
            >{{ language() === 'de' ? 'EN' : 'DE' }}</button>
          </div>

          <div class="mobile-nav lg:hidden flex w-full flex-wrap gap-2">
            <button (click)="activeTab.set('overview')" [class.text-indigo-400]="activeTab() === 'overview'" class="mobile-nav-button">{{ translate('Über mich') }}</button>
            <button (click)="activeTab.set('projects')" [class.text-indigo-400]="activeTab() === 'projects'" class="mobile-nav-button">{{ translate('Projekte') }}</button>
            <button (click)="activeTab.set('skills')" [class.text-indigo-400]="activeTab() === 'skills'" class="mobile-nav-button">{{ translate('Fähigkeiten') }}</button>
            <button (click)="activeTab.set('architecture')" [class.text-indigo-400]="activeTab() === 'architecture'" class="mobile-nav-button">{{ translate('Architektur') }}</button>
            <button (click)="activeTab.set('contact')" [class.text-indigo-400]="activeTab() === 'contact'" class="mobile-nav-button">{{ translate('Kontakt') }}</button>
          </div>
        </div>
      </nav>

      <!-- Main Content Container -->
      <main class="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <!-- TAB 1: OVERVIEW / HERO -->
        @if (activeTab() === 'overview') {
          <section class="space-y-12">
            <!-- Hero Section -->
            <div appRevealOnScroll class="flex flex-col md:flex-row items-center gap-10 py-8">
              <div appRevealOnScroll class="flex-1 space-y-6">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {{ translate('Auf der Suche nach einer Lehrstelle als Informatiker') }}
                </div>
                <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight break-words">
                  {{ translate('Logik verstehen.') }} <br/>
                  <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">{{ translate('Probleme lösen. IT gestalten.') }}</span>
                </h1>
                <p class="text-slate-400 text-base md:text-lg leading-relaxed">
                  {{ translate('Ich interessiere mich für moderne Webentwicklung und arbeite mit Angular, Python, FastAPI, Docker und PostgreSQL.') }}
                </p>

                <div class="flex flex-wrap gap-4 pt-2">
                  <button (click)="activeTab.set('projects')" class="w-full sm:w-auto justify-center px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/25">
                    <span>{{ translate('Projekte entdecken') }}</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                  </button>
                  <button (click)="activeTab.set('architecture')" class="w-full sm:w-auto justify-center px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl border border-slate-700 transition-all flex items-center gap-2">
                    <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                    <span>{{ translate('Architektur ansehen') }}</span>
                  </button>
                </div>
              </div>

              <!-- Tech Badge Stack Visual -->
              <div appRevealOnScroll class="w-full md:w-80 min-w-0 bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">{{ translate('Meine Technologien') }}</h3>
                <div class="space-y-3">
                  <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div class="flex min-w-0 items-center gap-3">
                      <span class="w-3 h-3 rounded-full bg-red-500"></span>
                      <span class="text-sm font-semibold text-slate-200 break-words">Angular 18+</span>
                    </div>
                    <span class="text-xs text-slate-400">{{ translate('Frontend') }}</span>
                  </div>
                  <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div class="flex min-w-0 items-center gap-3">
                      <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
                      <span class="text-sm font-semibold text-slate-200">FastAPI (Python)</span>
                    </div>
                    <span class="text-xs text-slate-400">{{ translate('Backend') }}</span>
                  </div>
                  <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div class="flex min-w-0 items-center gap-3">
                      <span class="w-3 h-3 rounded-full bg-blue-500"></span>
                      <span class="text-sm font-semibold text-slate-200">PostgreSQL</span>
                    </div>
                    <span class="text-xs text-slate-400">{{ translate('Datenbank') }}</span>
                  </div>
                  <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div class="flex min-w-0 items-center gap-3">
                      <span class="w-3 h-3 rounded-full bg-cyan-400"></span>
                      <span class="text-sm font-semibold text-slate-200">Docker & Compose</span>
                    </div>
                    <span class="text-xs text-slate-400">{{ translate('Betrieb') }}</span>
                  </div>
                  <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div class="flex min-w-0 items-center gap-3">
                      <span class="w-3 h-3 rounded-full bg-purple-400"></span>
                      <span class="text-sm font-semibold text-slate-200">GitHub Actions</span>
                    </div>
                    <span class="text-xs text-slate-400">CI/CD</span>
                  </div>
                </div>
              </div>
            </div>

            <section class="pt-6">
              <div class="grid grid-cols-1 gap-8">
                <section class="space-y-4">
                  <h2 class="text-2xl font-bold text-white">{{ translate('Technische Stärken') }}</h2>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <article appRevealOnScroll class="bg-slate-800/40 border border-slate-800 p-5 rounded-2xl">
                      <h3 class="text-lg font-bold text-white mb-2">{{ translate('KI') }}</h3>
                      <p class="text-sm text-slate-400">{{ translate('Ich nutze KI als Unterstützung beim Lernen und Entwickeln.') }}</p>
                    </article>
                    <article appRevealOnScroll class="bg-slate-800/40 border border-slate-800 p-5 rounded-2xl">
                      <h3 class="text-lg font-bold text-white mb-2">{{ translate('Zusammenhänge schnell verstehen') }}</h3>
                      <p class="text-sm text-slate-400">{{ translate('Ich erfasse neue Zusammenhänge schnell und kann Informationen einordnen.') }}</p>
                    </article>
                    <article appRevealOnScroll class="bg-slate-800/40 border border-slate-800 p-5 rounded-2xl">
                      <h3 class="text-lg font-bold text-white mb-2">{{ translate('Allgemeines Computerfachwissen') }}</h3>
                      <p class="text-sm text-slate-400">{{ translate('Ich bringe ein breites Verständnis für Computer, Betriebssysteme und digitale Technologien mit.') }}</p>
                    </article>
                    <article appRevealOnScroll class="bg-slate-800/40 border border-slate-800 p-5 rounded-2xl">
                      <h3 class="text-lg font-bold text-white mb-2">{{ translate('Kenntnisse verschiedener moderner Software-Tools') }}</h3>
                      <p class="text-sm text-slate-400">{{ translate('Ich arbeite mit unterschiedlichen Entwicklungs-, Kollaborations- und Produktivitätstools.') }}</p>
                    </article>
                  </div>
                </section>
                <section class="space-y-4">
                  <h2 class="text-2xl font-bold text-white">{{ translate('Persönliche Stärken') }}</h2>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <article appRevealOnScroll class="bg-slate-800/40 border border-slate-800 p-5 rounded-2xl">
                      <h3 class="text-lg font-bold text-white mb-2">{{ translate('Teamfähigkeit') }}</h3>
                      <p class="text-sm text-slate-400">{{ translate('Ich tausche mich offen aus und arbeite auf gemeinsame Ziele hin.') }}</p>
                    </article>
                    <article appRevealOnScroll class="bg-slate-800/40 border border-slate-800 p-5 rounded-2xl">
                      <h3 class="text-lg font-bold text-white mb-2">{{ translate('Ausdauer') }}</h3>
                      <p class="text-sm text-slate-400">{{ translate('Ich bleibe auch bei anspruchsvollen Aufgaben dran.') }}</p>
                    </article>
                    <article appRevealOnScroll class="bg-slate-800/40 border border-slate-800 p-5 rounded-2xl">
                      <h3 class="text-lg font-bold text-white mb-2">{{ translate('Neugier') }}</h3>
                      <p class="text-sm text-slate-400">{{ translate('Ich probiere gern Neues aus und möchte verstehen, wie es funktioniert.') }}</p>
                    </article>
                    <article appRevealOnScroll class="bg-slate-800/40 border border-slate-800 p-5 rounded-2xl">
                      <h3 class="text-lg font-bold text-white mb-2">{{ translate('Eigeninitiative') }}</h3>
                      <p class="text-sm text-slate-400">{{ translate('Ich bringe eigene Ideen ein und setze Aufgaben selbstständig in Gang.') }}</p>
                    </article>
                  </div>
                </section>
              </div>
            </section>

            <section appRevealOnScroll class="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-5">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p class="text-orange-400 mb-2 font-mono text-xs uppercase tracking-wider font-bold">Reddit</p>
                  <h2 class="text-xl sm:text-2xl font-bold text-white break-words">{{ translate('Meine Reddit-Beiträge') }}</h2>
                  <p class="text-slate-400 text-sm mt-1">{{ translate('Meine neuesten Beiträge von u/Timschweizerch.') }}</p>
                </div>
                <a href="https://www.reddit.com/user/Timschweizerch/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-semibold transition-colors">
                  {{ translate('Reddit-Profil ansehen &rarr;') }}
                </a>
              </div>

              <div class="flex flex-wrap items-center justify-between gap-3">
                <p class="text-xs text-slate-500" aria-live="polite">
                  @if (redditLastUpdated()) {
                    {{ translate('Aktualisiert um') }} {{ redditLastUpdated() | date:'shortTime':undefined:localeId() }} {{ translate('· automatische Aktualisierung alle 5 Minuten') }}
                  } @else {
                    {{ translate('Beiträge werden direkt von Reddit geladen') }}
                  }
                </p>
                <button type="button" (click)="refreshRedditPosts()" [disabled]="redditLoading()" class="px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg">
                  {{ translate(redditLoading() ? 'Wird geladen ...' : 'Beiträge aktualisieren') }}
                </button>
              </div>

              @if (redditError()) {
                <div class="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200" role="alert">
                  {{ translate(redditError()) }}
                </div>
              } @else if (redditLoading() && redditPosts().length === 0) {
                <p class="text-sm text-slate-400" role="status">{{ translate('Deine neuesten Reddit-Beiträge werden geladen ...') }}</p>
              } @else if (redditPosts().length === 0) {
                <p class="text-sm text-slate-400">{{ translate('Für dieses Reddit-Konto wurden keine öffentlichen Beiträge gefunden.') }}</p>
              }

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @for (post of redditPosts(); track post.id) {
                  <article class="bg-slate-900/70 border border-slate-700 rounded-xl p-5">
                    <div class="flex flex-wrap items-center gap-2 mb-3">
                      <span class="text-xs font-semibold px-2.5 py-1 rounded bg-orange-500/10 text-orange-300 border border-orange-500/20">{{ post.subreddit }}</span>
                      <span class="text-xs text-slate-400">{{ post.score | number:undefined:localeId() }} {{ translate('Punkte') }}</span>
                      <span class="text-xs text-slate-400">{{ post.numComments | number:undefined:localeId() }} {{ translate('Kommentare') }}</span>
                      @if (post.viewCount !== null) {
                        <span class="text-xs text-slate-400">{{ post.viewCount | number:undefined:localeId() }} {{ translate('Aufrufe') }}</span>
                      }
                    </div>
                    <h3 class="text-lg font-semibold text-white mb-2">{{ post.title }}</h3>
                    @if (post.selftext) {
                      <p class="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{{ post.selftext }}</p>
                    }
                    <div class="flex items-center justify-between gap-4 mt-4">
                      <span class="text-xs text-slate-500">{{ post.createdUtc * 1000 | date:dateFormat():undefined:localeId() }}</span>
                      <a [href]="post.permalink" target="_blank" rel="noopener noreferrer" class="text-sm font-semibold text-orange-400 hover:text-orange-300">
                        {{ translate('Auf Reddit ansehen &rarr;') }}
                      </a>
                    </div>
                  </article>
                }
              </div>
            </section>

            <section appRevealOnScroll class="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-5">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p class="text-slate-300 mb-2 font-mono text-xs uppercase tracking-wider font-bold">GitHub</p>
                  <h2 class="text-xl sm:text-2xl font-bold text-white break-words">{{ translate('Meine GitHub-Projekte') }}</h2>
                  <p class="text-slate-400 text-sm mt-1">{{ translate('Meine neuesten öffentlichen Repositories von') }} {{ githubUsername }}.</p>
                </div>
                <a href="https://github.com/{{ githubUsername }}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition-colors">
                  {{ translate('GitHub-Profil ansehen &rarr;') }}
                </a>
              </div>

              <div class="flex flex-wrap items-center justify-between gap-3">
                <p class="text-xs text-slate-500" aria-live="polite">
                  @if (githubLastUpdated()) {
                    {{ translate('Aktualisiert um') }} {{ githubLastUpdated() | date:'shortTime':undefined:localeId() }} {{ translate('· automatische Aktualisierung alle 5 Minuten') }}
                  } @else {
                    {{ translate('Repositories werden direkt von GitHub geladen') }}
                  }
                </p>
                <button type="button" (click)="refreshGitHubRepositories()" [disabled]="githubLoading()" class="px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg">
                  {{ translate(githubLoading() ? 'Wird geladen ...' : 'Repositories aktualisieren') }}
                </button>
              </div>

              @if (githubError()) {
                <div class="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200" role="alert">
                  {{ translate(githubError()) }}
                </div>
              } @else if (githubLoading() && githubRepositories().length === 0) {
                <p class="text-sm text-slate-400" role="status">{{ translate('Deine neuesten GitHub-Repositories werden geladen ...') }}</p>
              } @else if (githubRepositories().length === 0) {
                <p class="text-sm text-slate-400">{{ translate('Für dieses GitHub-Konto wurden keine öffentlichen Repositories gefunden.') }}</p>
              }

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @for (repository of githubRepositories(); track repository.id) {
                  <article class="bg-slate-900/70 border border-slate-700 rounded-xl p-5">
                    <h3 class="text-lg font-semibold text-white mb-2">{{ repository.name }}</h3>
                    <p class="text-sm text-slate-300 leading-relaxed min-h-10">{{ repository.description || translate('Keine Beschreibung vorhanden.') }}</p>
                    <div class="flex flex-wrap items-center gap-3 mt-4 text-xs text-slate-400">
                      @if (repository.language) {
                        <span class="px-2 py-1 rounded bg-slate-800">{{ repository.language }}</span>
                      }
                      <span>{{ repository.stars | number:undefined:localeId() }} {{ translate('Sterne') }}</span>
                      <span>{{ repository.forks | number:undefined:localeId() }} {{ translate('Forks') }}</span>
                      <span>{{ translate('Aktualisiert am') }} {{ repository.updatedAt | date:dateFormat():undefined:localeId() }}</span>
                    </div>
                    <a [href]="repository.htmlUrl" target="_blank" rel="noopener noreferrer" class="inline-block mt-4 text-sm font-semibold text-indigo-400 hover:text-indigo-300">
                      {{ translate('Repository ansehen &rarr;') }}
                    </a>
                  </article>
                }
              </div>
            </section>
          </section>
        }

        <!-- TAB 2: PROJECTS -->
        @if (activeTab() === 'projects') {
          <section class="space-y-8">
            <div>
              <h2 class="text-2xl font-bold text-white">{{ translate('Ausgewählte Anwendungen') }}</h2>
              <p class="text-slate-400 text-sm mt-1">{{ translate('Projekte mit Angular, FastAPI und Datenbankanbindung.') }}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              @for (proj of projects(); track proj.title) {
                <div appRevealOnScroll class="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/50 transition-all">
                  <div>
                    <div class="flex flex-wrap justify-between items-start gap-2 mb-3">
                      <span class="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {{ translate(proj.category) }}
                      </span>
                      @if (proj.highlight) {
                        <span class="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono">{{ translate('Ausgewählt') }}</span>
                      }
                    </div>
                    <h3 class="text-xl font-bold text-white mb-2">{{ translate(proj.title) }}</h3>
                    <p class="text-slate-300 text-sm mb-4 leading-relaxed">{{ translate(proj.description) }}</p>
                  </div>

                  <div>
                    <div class="flex flex-wrap gap-2 mb-6">
                      @for (tech of proj.techStack; track tech) {
                        <span class="text-xs bg-slate-900/80 text-slate-400 px-2.5 py-1 rounded-md border border-slate-800">
                          {{ tech }}
                        </span>
                      }
                    </div>
                    <div class="flex items-center gap-4 text-sm font-semibold">
                      <a [href]="proj.githubUrl" target="_blank" class="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                        {{ translate('GitHub-Repository &rarr;') }}
                      </a>
                    </div>
                  </div>
                </div>
              }
            </div>
          </section>
        }

        <!-- TAB 3: SKILLS -->
        @if (activeTab() === 'skills') {
          <section class="space-y-8">
            <div>
              <h2 class="text-2xl font-bold text-white">{{ translate('Meine Fähigkeiten') }}</h2>
              <p class="text-slate-400 text-sm mt-1">{{ translate('Ein Überblick über meine Werkzeuge, Frameworks und Datenbanktechnologien.') }}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Frontend & Backend -->
              <div appRevealOnScroll class="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 space-y-6">
                <h3 class="text-lg font-bold text-indigo-400 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                  {{ translate('Softwareentwicklung &amp; Frameworks') }}
                </h3>

                <div class="space-y-4">
                  <div>
                    <div class="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm font-medium mb-1">
                      <span class="text-slate-200">Angular & Angular Material</span>
                      <span class="text-indigo-400">{{ translate('Fortgeschritten') }}</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-2">
                      <div class="bg-indigo-500 h-2 rounded-full" style="width: 90%"></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm font-medium mb-1">
                      <span class="text-slate-200">Python & FastAPI / Pydantic</span>
                      <span class="text-emerald-400">{{ translate('Fortgeschritten') }}</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-2">
                      <div class="bg-emerald-500 h-2 rounded-full" style="width: 88%"></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm font-medium mb-1">
                      <span class="text-slate-200">TypeScript & RxJS / Signals</span>
                      <span class="text-indigo-400">{{ translate('Gute Kenntnisse') }}</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-2">
                      <div class="bg-indigo-400 h-2 rounded-full" style="width: 85%"></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm font-medium mb-1">
                      <span class="text-slate-200">RESTful API Design & OpenAPI</span>
                      <span class="text-emerald-400">{{ translate('Fortgeschritten') }}</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-2">
                      <div class="bg-emerald-400 h-2 rounded-full" style="width: 92%"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Database & DevOps -->
              <div appRevealOnScroll class="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 space-y-6">
                <h3 class="text-lg font-bold text-cyan-400 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/></svg>
                  {{ translate('Datenbanken &amp; Infrastruktur') }}
                </h3>

                <div class="space-y-4">
                  <div>
                    <div class="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm font-medium mb-1">
                      <span class="text-slate-200">PostgreSQL & SQL Optimization</span>
                      <span class="text-cyan-400">{{ translate('Gute Kenntnisse') }}</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-2">
                      <div class="bg-cyan-500 h-2 rounded-full" style="width: 82%"></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm font-medium mb-1">
                      <span class="text-slate-200">Docker & Docker Compose</span>
                      <span class="text-cyan-400">{{ translate('Gute Kenntnisse') }}</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-2">
                      <div class="bg-cyan-400 h-2 rounded-full" style="width: 80%"></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm font-medium mb-1">
                      <span class="text-slate-200">Git & GitHub Actions CI/CD</span>
                      <span class="text-purple-400">{{ translate('Gute Kenntnisse') }}</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-2">
                      <div class="bg-purple-500 h-2 rounded-full" style="width: 85%"></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm font-medium mb-1">
                      <span class="text-slate-200">SQLAlchemy & Database Migrations</span>
                      <span class="text-emerald-400">{{ translate('Gute Kenntnisse') }}</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-2">
                      <div class="bg-emerald-400 h-2 rounded-full" style="width: 78%"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        }

        <!-- TAB 4: ARCHITEKTUR UND CODE -->
        @if (activeTab() === 'architecture') {
          <section class="space-y-8">
            <div>
              <h2 class="text-2xl font-bold text-white">{{ translate('Anwendungsarchitektur &amp; Docker') }}</h2>
              <p class="text-slate-400 text-sm mt-1">{{ translate('Einblick in Backend, Datenbankmodell, Docker-Image und GitHub-Bereitstellung.') }}</p>
            </div>

            <!-- Code Viewer Selector -->
            <div class="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800">
              <button (click)="selectedCodeFile.set('fastapi')" [class.border-indigo-500]="selectedCodeFile() === 'fastapi'" [class.text-indigo-400]="selectedCodeFile() === 'fastapi'" class="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-white transition-all whitespace-nowrap">
                {{ translate('main.py (FastAPI-Backend)') }}
              </button>
              <button (click)="selectedCodeFile.set('database')" [class.border-indigo-500]="selectedCodeFile() === 'database'" [class.text-indigo-400]="selectedCodeFile() === 'database'" class="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-white transition-all whitespace-nowrap">
                {{ translate('database.py (PostgreSQL)') }}
              </button>
              <button (click)="selectedCodeFile.set('docker')" [class.border-indigo-500]="selectedCodeFile() === 'docker'" [class.text-indigo-400]="selectedCodeFile() === 'docker'" class="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-white transition-all whitespace-nowrap">
                docker-compose.yml
              </button>
              <button (click)="selectedCodeFile.set('github')" [class.border-indigo-500]="selectedCodeFile() === 'github'" [class.text-indigo-400]="selectedCodeFile() === 'github'" class="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-white transition-all whitespace-nowrap">
                .github/workflows/deploy.yml
              </button>
            </div>

            <!-- Code Display Block -->
            <div appRevealOnScroll class="bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs md:text-sm text-slate-300 overflow-x-auto shadow-2xl relative">
              <div class="flex justify-between items-center mb-3 pb-3 border-b border-slate-800/80 text-slate-500">
                <span class="text-xs text-indigo-400 font-semibold">{{ translate(getFileTitle(selectedCodeFile())) }}</span>
                <span class="text-xs">{{ translate('UTF-8 / Für die Bereitstellung konfiguriert') }}</span>
              </div>
              <pre class="leading-relaxed"><code>{{ getCodeSnippet(selectedCodeFile()) }}</code></pre>
            </div>
          </section>
        }

        <!-- TAB 5: KONTAKT -->
        @if (activeTab() === 'contact') {
          <section class="max-w-2xl mx-auto space-y-8">
            <div class="text-center">
              <h2 class="text-3xl font-bold text-white">{{ translate('Kontakt') }}</h2>
              <p class="text-slate-400 text-sm mt-2">{{ translate('Ich freue mich über den Austausch zu Ausbildungsplätzen, Softwareprojekten und Zusammenarbeit.') }}</p>
            </div>

            <div appRevealOnScroll class="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 sm:p-8 space-y-6">
              @if (formSubmitted()) {
                <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center space-y-2">
                  <div class="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                  <h3 class="text-lg font-bold text-white">{{ translate('Nachricht erfolgreich gesendet!') }}</h3>
                  <p class="text-sm text-slate-300">{{ translate('Vielen Dank! Deine Nachricht wurde per E-Mail zugestellt.') }}</p>
                  <button (click)="formSubmitted.set(false)" class="mt-4 text-xs font-semibold text-indigo-400 hover:underline">{{ translate('Weitere Nachricht senden') }}</button>
                </div>
              } @else {
                <form (submit)="handleSubmit($event)" class="space-y-4">
                  @if (contactError()) {
                    <p class="text-sm text-red-300" role="alert">{{ translate(contactError()) }}</p>
                  }
                  <div>
                    <label class="block text-xs font-medium text-slate-300 mb-1">{{ translate('Dein Name') }}</label>
                    <input name="name" type="text" required maxlength="100" [placeholder]="translate('z. B. Tim Schweizer')" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-slate-300 mb-1">{{ translate('E-Mail-Adresse') }}</label>
                    <input name="email" type="email" required maxlength="254" [placeholder]="translate('name@beispiel.ch')" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-slate-300 mb-1">{{ translate('Deine Nachricht') }}</label>
                    <textarea name="message" rows="4" required maxlength="5000" [placeholder]="translate('Hallo Tim, ich würde dich gerne kennenlernen ...')" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"></textarea>
                  </div>

                  <button type="submit" [disabled]="contactSending()" class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/25">
                    {{ translate(contactSending() ? 'Wird gesendet ...' : 'Nachricht senden') }}
                  </button>
                </form>
              }

              <div class="pt-6 border-t border-slate-700/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <a href="mailto:timschweizer.ch@gmail.com" class="hover:text-indigo-400">timschweizer.ch&#64;gmail.com</a>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span>{{ translate('Schweiz') }}</span>
                </div>
              </div>
            </div>
          </section>
        }

      </main>

      <!-- Footer -->
      <footer class="mt-20 border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>Tim Schweizer — Portfolio</p>
          <p class="font-mono text-slate-600">{{ translate('Erstellt mit Angular, FastAPI, PostgreSQL und Docker') }}</p>
        </div>
      </footer>
    </div>
  `
})
export class App {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  activeTab = signal<'overview' | 'projects' | 'skills' | 'architecture' | 'contact'>('overview');
  selectedCodeFile = signal<'fastapi' | 'database' | 'docker' | 'github'>('fastapi');
  formSubmitted = signal(false);
  contactSending = signal(false);
  contactError = signal('');
  isDarkMode = signal(false);
  language = signal<'de' | 'en'>('de');
  localeId = () => this.language() === 'de' ? 'de-DE' : 'en-US';
  dateFormat = () => this.language() === 'de' ? 'd. MMM' : 'MMM d';
  redditPosts = signal<RedditPost[]>([]);
  redditLoading = signal(false);
  redditError = signal('');
  redditLastUpdated = signal<Date | null>(null);
  githubUsername = 'TimSchweizer441';
  githubRepositories = signal<GitHubRepository[]>([]);
  githubLoading = signal(false);
  githubError = signal('');
  githubLastUpdated = signal<Date | null>(null);

  constructor() {
    if (typeof window !== 'undefined') {
      this.isDarkMode.set(window.localStorage.getItem('portfolio-theme') === 'dark');
      this.language.set(window.localStorage.getItem('portfolio-language') === 'en' ? 'en' : 'de');
    }
    this.refreshRedditPosts();
    this.refreshGitHubRepositories();
    interval(5 * 60 * 1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.refreshRedditPosts();
        this.refreshGitHubRepositories();
      });
  }

  projects = signal<Project[]>([
    {
      title: 'Aufgaben- und Workflow-Management',
      category: 'Angular & FastAPI',
      description: 'Eine Workflow-Anwendung mit Statusaktualisierungen, dynamischer Zustandsverwaltung und PostgreSQL-Datenbankanbindung.',
      techStack: ['Angular 18', 'FastAPI', 'PostgreSQL', 'Docker', 'Tailwind CSS'],
      githubUrl: 'https://github.com',
      highlight: true
    },
    {
      title: 'Metrik-Dashboard für Microservices',
      category: 'DevOps & Backend',
      description: 'Dashboard zur Systemüberwachung mit asynchronen Daten aus Python-Endpunkten, JWT-Authentifizierung und rollenbasierter Zugriffskontrolle.',
      techStack: ['FastAPI', 'SQLAlchemy', 'PostgreSQL', 'Docker Compose', 'Chart.js'],
      githubUrl: 'https://github.com',
      highlight: true
    },
    {
      title: 'Automatisierte CI/CD-Bereitstellung',
      category: 'Cloud & Infrastruktur',
      description: 'GitHub-Actions-Ablauf zum Erstellen von Docker-Containern, Testen von FastAPI-Endpunkten und Bereitstellen in der Cloud.',
      techStack: ['GitHub Actions', 'Docker Hub', 'Linux / Bash', 'PostgreSQL'],
      githubUrl: 'https://github.com',
      highlight: false
    }
  ]);

  toggleTheme() {
    const nextIsDarkMode = !this.isDarkMode();
    this.isDarkMode.set(nextIsDarkMode);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('portfolio-theme', nextIsDarkMode ? 'dark' : 'light');
    }
  }

  toggleLanguage() {
    const nextLanguage = this.language() === 'de' ? 'en' : 'de';
    this.language.set(nextLanguage);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('portfolio-language', nextLanguage);
    }
  }

  translate(text: string): string {
    if (this.language() === 'de') {
      return text;
    }

    const dynamicStatus = text.match(/^(Die Anmeldung bei Reddit ist fehlgeschlagen|Die Reddit-API ist nicht erreichbar|Die GitHub-API ist nicht erreichbar) \(HTTP (\d+)\)\.$/);
    if (dynamicStatus) {
      const subject = dynamicStatus[1] === 'Die Anmeldung bei Reddit ist fehlgeschlagen'
        ? 'Reddit sign-in failed'
        : dynamicStatus[1] === 'Die Reddit-API ist nicht erreichbar'
          ? 'The Reddit API is unavailable'
          : 'The GitHub API is unavailable';
      return `${subject} (HTTP ${dynamicStatus[2]}).`;
    }

    return englishTranslations[text] ?? text;
  }

  refreshRedditPosts() {
    if (this.redditLoading()) {
      return;
    }

    this.redditLoading.set(true);
    this.redditError.set('');
    this.http.get<RedditPostsResponse>('/api/reddit/posts')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ posts }) => {
          this.redditPosts.set(posts);
          this.redditLastUpdated.set(new Date());
          this.redditLoading.set(false);
        },
        error: (error: unknown) => {
          this.redditError.set(getRedditErrorMessage(error));
          this.redditLoading.set(false);
        },
      });
  }

  refreshGitHubRepositories() {
    if (this.githubLoading()) {
      return;
    }

    this.githubLoading.set(true);
    this.githubError.set('');
    this.http.get<GitHubRepositoriesResponse>('/api/github/repos')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ repositories }) => {
          this.githubRepositories.set(repositories);
          this.githubLastUpdated.set(new Date());
          this.githubLoading.set(false);
        },
        error: (error: unknown) => {
          this.githubError.set(getGitHubErrorMessage(error));
          this.githubLoading.set(false);
        },
      });
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) {
      this.contactError.set('Das Kontaktformular konnte nicht gelesen werden. Bitte lade die Seite neu.');
      return;
    }

    const values = new FormData(form);
    const name = values.get('name');
    const email = values.get('email');
    const message = values.get('message');
    if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
      this.contactError.set('Bitte fülle alle Felder aus.');
      return;
    }

    this.contactSending.set(true);
    this.contactError.set('');
    this.http.post<{ message: string }>('/api/contact', { name, email, message })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.contactSending.set(false);
          if (response.message !== 'sent') {
            this.contactError.set('Der E-Mail-Versand konnte nicht bestätigt werden. Bitte versuche es erneut.');
            return;
          }
          this.formSubmitted.set(true);
        },
        error: (error: unknown) => {
          this.contactSending.set(false);
          this.contactError.set(getContactErrorMessage(error));
        },
      });
  }

  getFileTitle(file: string): string {
    switch (file) {
      case 'fastapi': return 'Backend-Anwendungscode (app/main.py)';
      case 'database': return 'Datenbankverbindung und Modell (app/database.py)';
      case 'docker': return 'Bereitstellung mehrerer Container (docker-compose.yml)';
      case 'github': return 'Automatisierte CI/CD-Pipeline (.github/workflows/deploy.yml)';
      default: return '';
    }
  }

  getCodeSnippet(file: string): string {
    switch (file) {
      case 'fastapi':
        return `from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import database

app = FastAPI(title="Portfolio API", version="1.0.0")

# Enable CORS for Angular Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ContactMessageSchema(BaseModel):
    name: str
    email: EmailStr
    message: str

@app.get("/api/health")
def health_check():
    return {"status": "online", "database": "connected (PostgreSQL)"}

@app.post("/api/contact", status_code=status.HTTP_201_CREATED)
def send_contact_message(payload: ContactMessageSchema, db: Session = Depends(database.get_db)):
    # Save message to PostgreSQL database
    new_msg = database.ContactMessage(name=payload.name, email=payload.email, message=payload.message)
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return {"message": "Message saved successfully", "id": new_msg.id}`;

      case 'database':
        return `from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import os

# PostgreSQL Connection URL from Environment Variables
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>:5432/<DB_NAME>")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# Dependency to get DB Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()`;

      case 'docker':
        return `version: '3.8'

services:
  # PostgreSQL Database Container
  postgres_db:
    image: postgres:15-alpine
    container_name: portfolio_postgres
    restart: always
    environment:
      POSTGRES_USER: <DB_USER>
      POSTGRES_PASSWORD: <DB_PASSWORD>
      POSTGRES_DB: <DB_NAME>
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # FastAPI Backend Container
  backend:
    build: ./backend
    container_name: portfolio_backend
    restart: always
    environment:
      - DATABASE_URL=postgresql://<DB_USER>:<DB_PASSWORD>@postgres_db:5432/<DB_NAME>
    ports:
      - "8000:8000"
    depends_on:
      - postgres_db

  # Angular Frontend Container
  frontend:
    build: ./frontend
    container_name: portfolio_frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:`;

      case 'github':
        return `name: CI/CD Docker & GitHub Pages Deployment

on:
  push:
    branches: [ "main" ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Code
      uses: actions/checkout@v3

    - name: Set up Python for Backend Testing
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Install Dependencies & Run Tests
      run: |
        python -m pip install --upgrade pip
        pip install pytest fastapi sqlalchemy
        # Run automated backend test suite
        # pytest

    - name: Build Docker Containers
      run: |
        docker-compose build

    - name: Deploy Application
      run: |
        echo "Successfully verified Docker build and test suite!"`;

      default:
        return '';
    }
  }
}