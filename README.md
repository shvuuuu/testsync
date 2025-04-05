# TestSync - Test Management System

TestSync is a comprehensive test management platform similar to BrowserStack's test management features. It allows teams to manage projects, create and organize test cases, define shared steps, execute test runs, plan tests, and generate reports.

## Features

- **User Authentication & Authorization**: Role-based access control for administrators, test managers, and testers
- **Project Insights Dashboard**: Overview & analytics with customizable widgets
- **Test Cases Management**: Create, organize, and version test cases
- **Shared Steps & Reusable Components**: Create and reuse common test steps
- **Test Runs & Execution**: Schedule, monitor, and capture test run results
- **Test Plans**: Define and track test plans with execution strategies
- **Reporting & Analytics**: Generate comprehensive reports with export options
- **Modern UI**: Responsive design with a clean, professional interface

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Authentication, Storage, Edge Functions)
- **AI Integration**: GROQ API for AI-assisted test case generation
- **State Management**: React Query for server state, Context API for UI state
- **Charts**: Chart.js with react-chartjs-2

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/testsync.git
   cd testsync
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GROQ_API_KEY=your_groq_api_key
   ```

4. Start the development server
   ```
   npm run dev
   ```

## Deployment

1. Build the application
   ```
   npm run build
   ```

2. Preview the production build locally
   ```
   npm run preview
   ```

3. Deploy to your hosting provider of choice

## License

MIT