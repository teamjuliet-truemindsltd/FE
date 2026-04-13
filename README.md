# 🎓 TrueMinds TalentFlow LMS - Frontend

Welcome to the frontend of the **TrueMinds TalentFlow LMS**, a state-of-the-art educational platform designed for a seamless learning and teaching experience. Built with **React**, **TypeScript**, and **Vite**, this application features a premium, responsive UI with a focus on accessibility and performance.

---

### 🌐 Live Preview
The frontend is currently deployed and accessible at:
👉 **[https://talents-flow-lms.vercel.app/](https://talents-flow-lms.vercel.app/)**

---

## 🌟 Core Features

- **Premium UI/UX Design**
  - **Glassmorphism Aesthetic**: Modern, translucent UI elements with subtle blurs and gradients.
  - **Dynamic Animations**: Smooth transitions and micro-interactions powered by **Framer Motion**.
  - **Responsive Layout**: Optimized for desktop, tablet, and mobile devices.

- **Seamless Authentication**
  - **Multi-Role Support**: Tailored experiences for Students and Instructors.
  - **Secure Onboarding**: Registration flow with integrated **Email OTP Verification**.
  - **Protected Routes**: Secure navigation ensuring only authorized users access sensitive dashboards.

- **Immersive Learning Experience**
  - **Custom Video Player**: A specialized lesson viewer for high-quality educational streaming.
  - **Course Discovery**: intuitive search and filtering to find the perfect course.
  - **Progress Visuals**: Real-time progress bars and "Lesson Completed" indicators.

- **Advanced Dashboards**
  - **Instructor Command Center**: Tools for course creation, module management, and assignment grading.
  - **Student Workspace**: A centralized hub for enrolled courses, upcoming tasks, and personal progress.

- **Collaboration & Community**
  - **In-Course Discussions**: Discussion boards for students to ask questions and instructors to provide answers.
  - **Contributor Showcase**: A dedicated "Teams" page highlighting the architects of the platform.

---

## 🛠 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [React 18+](https://reactjs.org/) |
| **Build Tool**| [Vite](https://vitejs.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling**   | [Tailwind CSS](https://tailwindcss.com/) |
| **Animations**| [Framer Motion](https://www.framer.com/motion/) |
| **Icons**     | [Lucide React](https://lucide.dev/) |
| **State**     | React Context API (Auth & Logic) |
| **API Client**| Axios |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher (v22 recommended)
- **Package Manager**: npm

### Step 1: Environment Setup

Create a `.env.local` file in the root directory and configure the backend URL:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

### Step 2: Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 📂 Project Structure

```text
src/
├── components/         # Reusable UI components (Hero, Layout, Nav)
│   ├── ui/             # Core UI atoms (Buttons, Inputs, Cards)
│   └── layout/         # Shared layouts (Dashboard, Landing)
├── contexts/           # Global state (AuthContext)
├── services/           # API communication layer (Auth, Courses, Lessons)
├── pages/              # Main application views
│   ├── LandingPage     # Hero, Features, Testimonials
│   ├── DashboardPage   # Role-based workspace
│   ├── CourseDetails   # Course overview and enrollment
│   ├── LessonViewer    # Video player and content
│   └── Discussions     # Collaborative boards
├── lib/                # Utility functions and configurations
└── assets/             # Static images, icons, and fonts
```

---

## 🏗 Key Components Highlight

- **ProtectedRoute**: Ensures application security by redirecting unauthenticated users.
- **Hero Section**: Designed to "WOW" users at first glance with vibrant gradients and engaging copy.
- **LessonSidebar**: Navigate course content seamlessly while watching videos.

---

## 📄 License

This project is [UNLICENSED](LICENSE).
