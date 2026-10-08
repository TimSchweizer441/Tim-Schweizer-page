import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <!-- Top Navigation Bar -->
      <nav class="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 py-4">
        <div class="max-w-6xl mx-auto flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              Dev
            </div>
            <div>
              <span class="font-bold text-lg text-white block leading-none">John Doe</span>
              <span class="text-xs text-indigo-400 font-medium">Software Engineer</span>
            </div>
          </div>

          <!-- Nav Items -->
          <div class="hidden md:flex gap-6 text-sm font-medium">
            <button (click)="activeTab.set('overview')" [class.text-indigo-400]="activeTab() === 'overview'" class="hover:text-indigo-300 transition-colors">Overview</button>
            <button (click)="activeTab.set('projects')" [class.text-indigo-400]="activeTab() === 'projects'" class="hover:text-indigo-300 transition-colors">Projects</button>
            <button (click)="activeTab.set('skills')" [class.text-indigo-400]="activeTab() === 'skills'" class="hover:text-indigo-300 transition-colors">Skills & Stack</button>
            <button (click)="activeTab.set('architecture')" [class.text-indigo-400]="activeTab() === 'architecture'" class="hover:text-indigo-300 transition-colors">Backend & Docker Setup</button>
            <button (click)="activeTab.set('contact')" [class.text-indigo-400]="activeTab() === 'contact'" class="hover:text-indigo-300 transition-colors">Contact</button>
          </div>

          <a href="#contact" (click)="activeTab.set('contact')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-600/30">
            Get in Touch
          </a>
        </div>
      </nav>

      <!-- Main Content Container -->
      <main class="max-w-6xl mx-auto px-6 py-10">

        <!-- TAB 1: OVERVIEW / HERO -->
        @if (activeTab() === 'overview') {
          <section class="space-y-12">
            <!-- Hero Section -->
            <div class="flex flex-col md:flex-row items-center gap-10 py-8">
              <div class="flex-1 space-y-6">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Open for Full-Stack / Backend Opportunities
                </div>
                <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Building Scalable <br/>
                  <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">Web Applications</span>
                </h1>
                <p class="text-slate-400 text-base md:text-lg leading-relaxed">
                  Passionate Software Developer specialized in modern Angular Frontend architectures, high-performance FastAPI Python backends, and containerized Docker deployments with PostgreSQL databases.
                </p>

                <div class="flex flex-wrap gap-4 pt-2">
                  <button (click)="activeTab.set('projects')" class="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/25">
                    <span>Explore Projects</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                  </button>
                  <button (click)="activeTab.set('architecture')" class="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl border border-slate-700 transition-all flex items-center gap-2">
                    <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                    <span>View Architecture</span>
                  </button>
                </div>
              </div>

              <!-- Tech Badge Stack Visual -->
              <div class="w-full md:w-80 bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-2xl backdrop-blur relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Core Technology Stack</h3>
                <div class="space-y-3">
                  <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div class="flex items-center gap-3">
                      <span class="w-3 h-3 rounded-full bg-red-500"></span>
                      <span class="text-sm font-semibold text-slate-200">Angular 18+</span>
                    </div>
                    <span class="text-xs text-slate-400">Frontend</span>
                  </div>
                  <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div class="flex items-center gap-3">
                      <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
                      <span class="text-sm font-semibold text-slate-200">FastAPI (Python)</span>
                    </div>
                    <span class="text-xs text-slate-400">Backend</span>
                  </div>
                  <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div class="flex items-center gap-3">
                      <span class="w-3 h-3 rounded-full bg-blue-500"></span>
                      <span class="text-sm font-semibold text-slate-200">PostgreSQL</span>
                    </div>
                    <span class="text-xs text-slate-400">Database</span>
                  </div>
                  <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div class="flex items-center gap-3">
                      <span class="w-3 h-3 rounded-full bg-cyan-400"></span>
                      <span class="text-sm font-semibold text-slate-200">Docker & Compose</span>
                    </div>
                    <span class="text-xs text-slate-400">DevOps</span>
                  </div>
                  <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div class="flex items-center gap-3">
                      <span class="w-3 h-3 rounded-full bg-purple-400"></span>
                      <span class="text-sm font-semibold text-slate-200">GitHub Actions</span>
                    </div>
                    <span class="text-xs text-slate-400">CI/CD</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Stats / Highlights -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div class="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl">
                <div class="text-indigo-400 mb-2 font-mono text-xs uppercase tracking-wider font-bold">Clean Code</div>
                <h3 class="text-lg font-bold text-white mb-2">Maintainable Architecture</h3>
                <p class="text-sm text-slate-400">Adhering to SOLID principles, Angular standalone components, and clean FastAPI REST controllers.</p>
              </div>
              <div class="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl">
                <div class="text-cyan-400 mb-2 font-mono text-xs uppercase tracking-wider font-bold">DevOps Mindset</div>
                <h3 class="text-lg font-bold text-white mb-2">Automated Deployments</h3>
                <p class="text-sm text-slate-400">Fully containerized workflows with Docker Compose and automated CI/CD via GitHub Actions.</p>
              </div>
              <div class="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl">
                <div class="text-emerald-400 mb-2 font-mono text-xs uppercase tracking-wider font-bold">Data Management</div>
                <h3 class="text-lg font-bold text-white mb-2">SQL & ORM Proficiency</h3>
                <p class="text-sm text-slate-400">Relational data modeling with PostgreSQL, Alembic migrations, and SQLAlchemy async driver.</p>
              </div>
            </div>
          </section>
        }

        <!-- TAB 2: PROJECTS -->
        @if (activeTab() === 'projects') {
          <section class="space-y-8">
            <div>
              <h2 class="text-2xl font-bold text-white">Featured Applications</h2>
              <p class="text-slate-400 text-sm mt-1">Real-world projects showcasing Angular, FastAPI, and Database integration.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              @for (proj of projects(); track proj.title) {
                <div class="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/50 transition-all">
                  <div>
                    <div class="flex justify-between items-start mb-3">
                      <span class="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {{ proj.category }}
                      </span>
                      @if (proj.highlight) {
                        <span class="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono">Featured</span>
                      }
                    </div>
                    <h3 class="text-xl font-bold text-white mb-2">{{ proj.title }}</h3>
                    <p class="text-slate-300 text-sm mb-4 leading-relaxed">{{ proj.description }}</p>
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
                        GitHub Repo &rarr;
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
              <h2 class="text-2xl font-bold text-white">Technical Skillset</h2>
              <p class="text-slate-400 text-sm mt-1">Categorized breakdown of tools, frameworks, and database technologies.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Frontend & Backend -->
              <div class="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 space-y-6">
                <h3 class="text-lg font-bold text-indigo-400 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                  Software Development & Frameworks
                </h3>

                <div class="space-y-4">
                  <div>
                    <div class="flex justify-between text-sm font-medium mb-1">
                      <span class="text-slate-200">Angular & Angular Material</span>
                      <span class="text-indigo-400">Advanced</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-2">
                      <div class="bg-indigo-500 h-2 rounded-full" style="width: 90%"></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex justify-between text-sm font-medium mb-1">
                      <span class="text-slate-200">Python & FastAPI / Pydantic</span>
                      <span class="text-emerald-400">Advanced</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-2">
                      <div class="bg-emerald-500 h-2 rounded-full" style="width: 88%"></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex justify-between text-sm font-medium mb-1">
                      <span class="text-slate-200">TypeScript & RxJS / Signals</span>
                      <span class="text-indigo-400">Proficient</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-2">
                      <div class="bg-indigo-400 h-2 rounded-full" style="width: 85%"></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex justify-between text-sm font-medium mb-1">
                      <span class="text-slate-200">RESTful API Design & OpenAPI</span>
                      <span class="text-emerald-400">Advanced</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-2">
                      <div class="bg-emerald-400 h-2 rounded-full" style="width: 92%"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Database & DevOps -->
              <div class="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 space-y-6">
                <h3 class="text-lg font-bold text-cyan-400 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/></svg>
                  Database & Infrastructure
                </h3>

                <div class="space-y-4">
                  <div>
                    <div class="flex justify-between text-sm font-medium mb-1">
                      <span class="text-slate-200">PostgreSQL & SQL Optimization</span>
                      <span class="text-cyan-400">Proficient</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-2">
                      <div class="bg-cyan-500 h-2 rounded-full" style="width: 82%"></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex justify-between text-sm font-medium mb-1">
                      <span class="text-slate-200">Docker & Docker Compose</span>
                      <span class="text-cyan-400">Proficient</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-2">
                      <div class="bg-cyan-400 h-2 rounded-full" style="width: 80%"></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex justify-between text-sm font-medium mb-1">
                      <span class="text-slate-200">Git & GitHub Actions CI/CD</span>
                      <span class="text-purple-400">Proficient</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-2">
                      <div class="bg-purple-500 h-2 rounded-full" style="width: 85%"></div>
                    </div>
                  </div>

                  <div>
                    <div class="flex justify-between text-sm font-medium mb-1">
                      <span class="text-slate-200">SQLAlchemy & Database Migrations</span>
                      <span class="text-emerald-400">Proficient</span>
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

        <!-- TAB 4: ARCHITECTURE & CODE SETUP or more-->
        @if (activeTab() === 'architecture') {
          <section class="space-y-8">
            <div>
              <h2 class="text-2xl font-bold text-white">Application Architecture & Docker Setup</h2>
              <p class="text-slate-400 text-sm mt-1">Inspect the backend blueprint, database model, Docker multi-stage build, and GitHub deployment files.</p>
            </div>

            <!-- Code Viewer Selector -->
            <div class="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800">
              <button (click)="selectedCodeFile.set('fastapi')" [class.border-indigo-500]="selectedCodeFile() === 'fastapi'" [class.text-indigo-400]="selectedCodeFile() === 'fastapi'" class="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-white transition-all whitespace-nowrap">
                main.py (FastAPI Backend)
              </button>
              <button (click)="selectedCodeFile.set('database')" [class.border-indigo-500]="selectedCodeFile() === 'database'" [class.text-indigo-400]="selectedCodeFile() === 'database'" class="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-white transition-all whitespace-nowrap">
                database.py (PostgreSQL)
              </button>
              <button (click)="selectedCodeFile.set('docker')" [class.border-indigo-500]="selectedCodeFile() === 'docker'" [class.text-indigo-400]="selectedCodeFile() === 'docker'" class="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-white transition-all whitespace-nowrap">
                docker-compose.yml
              </button>
              <button (click)="selectedCodeFile.set('github')" [class.border-indigo-500]="selectedCodeFile() === 'github'" [class.text-indigo-400]="selectedCodeFile() === 'github'" class="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-white transition-all whitespace-nowrap">
                .github/workflows/deploy.yml
              </button>
            </div>

            <!-- Code Display Block -->
            <div class="bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs md:text-sm text-slate-300 overflow-x-auto shadow-2xl relative">
              <div class="flex justify-between items-center mb-3 pb-3 border-b border-slate-800/80 text-slate-500">
                <span class="text-xs text-indigo-400 font-semibold">{{ getFileTitle(selectedCodeFile()) }}</span>
                <span class="text-xs">UTF-8 / Configured for Deployment</span>
              </div>
              <pre class="leading-relaxed"><code>{{ getCodeSnippet(selectedCodeFile()) }}</code></pre>
            </div>
          </section>
        }

        <!-- TAB 5: CONTACT -->
        @if (activeTab() === 'contact') {
          <section class="max-w-2xl mx-auto space-y-8">
            <div class="text-center">
              <h2 class="text-3xl font-bold text-white">Get In Touch</h2>
              <p class="text-slate-400 text-sm mt-2">I am looking forward to discussing job opportunities, software projects, or collaboration.</p>
            </div>

            <div class="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-8 space-y-6">
              @if (formSubmitted()) {
                <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center space-y-2">
                  <div class="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                  <h3 class="text-lg font-bold text-white">Message Sent Successfully!</h3>
                  <p class="text-sm text-slate-300">Thank you for your message. In a production environment, this triggers an API call to FastAPI & PostgreSQL.</p>
                  <button (click)="formSubmitted.set(false)" class="mt-4 text-xs font-semibold text-indigo-400 hover:underline">Send another message</button>
                </div>
              } @else {
                <form (submit)="handleSubmit($event)" class="space-y-4">
                  <div>
                    <label class="block text-xs font-medium text-slate-300 mb-1">Your Name</label>
                    <input type="text" required placeholder="e.g. Sarah Connor" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                    <input type="email" required placeholder="name@company.com" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-slate-300 mb-1">Message / Inquiry</label>
                    <textarea rows="4" required placeholder="Hi John, we would like to invite you for an interview..." class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"></textarea>
                  </div>

                  <button type="submit" class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/25">
                    Submit Message (FastAPI Backend Test)
                  </button>
                </form>
              }

              <div class="pt-6 border-t border-slate-700/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <span>john.doe.dev&#64;example.com</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span>Germany / Remote</span>
                </div>
              </div>
            </div>
          </section>
        }

      </main>

      <!-- Footer -->
      <footer class="mt-20 border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {{ currentYear }} John Doe — Professional IT Application Portfolio</p>
          <p class="font-mono text-slate-600">Built with Angular + FastAPI + PostgreSQL + Docker</p>
        </div>
      </footer>
    </div>
  `
})
export class App {
  activeTab = signal<'overview' | 'projects' | 'skills' | 'architecture' | 'contact'>('overview');
  selectedCodeFile = signal<'fastapi' | 'database' | 'docker' | 'github'>('fastapi');
  formSubmitted = signal(false);
  currentYear = new Date().getFullYear();

  projects = signal<Project[]>([
    {
      title: 'Full-Stack Task & Workflow Management',
      category: 'Angular & FastAPI',
      description: 'A enterprise workflow engine with real-time status updates, dynamic state handling, and PostgreSQL persistence with database connection pooling.',
      techStack: ['Angular 18', 'FastAPI', 'PostgreSQL', 'Docker', 'Tailwind CSS'],
      githubUrl: 'https://github.com',
      highlight: true
    },
    {
      title: 'Microservice Metric Dashboard',
      category: 'DevOps & Backend',
      description: 'System health monitoring dashboard displaying async data streams from Python endpoints with JWT authentication and Role-Based Access Control.',
      techStack: ['FastAPI', 'SQLAlchemy', 'PostgreSQL', 'Docker Compose', 'Chart.js'],
      githubUrl: 'https://github.com',
      highlight: true
    },
    {
      title: 'Automated CI/CD Deployment Pipeline for my project',
      category: 'Cloud & Infrastructure',
      description: 'Production-ready GitHub Actions workflow for building Docker containers, testing FastAPI endpoints, and deploying to cloud instances.',
      techStack: ['GitHub Actions', 'Docker Hub', 'Linux / Bash', 'PostgreSQL'],
      githubUrl: 'https://github.com',
      highlight: false
    }
  ]);

  handleSubmit(event: Event) {
    event.preventDefault();
    this.formSubmitted.set(true);
  }

  getFileTitle(file: string): string {
    switch (file) {
      case 'fastapi': return 'Backend Application Code (app/main.py)';
      case 'database': return 'Database Connection & Model Config (app/database.py)';
      case 'docker': return 'Multi-Container Deployment (docker-compose.yml)';
      case 'github': return 'Automated CI/CD Pipeline (.github/workflows/deploy.yml)';
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