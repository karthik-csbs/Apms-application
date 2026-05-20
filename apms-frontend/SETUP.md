# Frontend Setup Instructions

## Overview

This frontend setup for the Academic Project Management System (APMS) includes all necessary dependencies, folder structure, and configuration files.

## Installation Steps

### 1. Install Dependencies

Run the following command to install all npm dependencies:

```bash
npm install
```

This will install:
- **UI Framework**: @mui/material, @mui/icons-material
- **Styling**: @emotion/react, @emotion/styled
- **Forms**: react-hook-form, yup
- **Charts**: recharts
- **Date Handling**: date-fns
- **PDF Generation**: jspdf, html2canvas
- **HTTP Client**: axios
- **Routing**: react-router-dom
- **React & DOM**: Latest versions

### 2. Set Up Folder Structure

After running `npm install`, set up the folder structure by running:

```bash
npm run setup
```

This creates all necessary directories:
```
src/
├── api/              # API client and endpoints
├── services/         # Business logic and data services
├── auth/             # Authentication utilities and guards
├── components/       # Reusable React components
├── pages/            # Page-level components
├── layouts/          # Layout wrapper components
├── routes/           # Route configuration
├── context/          # React context providers
├── hooks/            # Custom React hooks
├── utils/            # Utility functions and helpers
├── theme/            # Material UI theme configuration
└── assets/           # Static assets (images, fonts)
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and configure your environment:

```bash
cp .env.example .env
```

Update `.env` with your backend API URL and other settings:
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=APMS
```

## Available Scripts

- `npm run dev` - Start the development server (port 3000)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run setup` - Create folder structure and theme configuration

## Project Structure

### Key Files

- **vite.config.js**: Vite build configuration with optimized settings
- **package.json**: All dependencies and scripts
- **.env.example**: Environment variables template
- **src/theme/theme.js**: Material UI theme configuration with custom colors and typography

### Theme Configuration

The Material UI theme includes:
- **Primary Color**: #1976d2 (Blue)
- **Secondary Color**: #dc004e (Red)
- **Typography**: Roboto font family with predefined scales
- **Components**: Customized button, card, and text field styling

## Next Steps

1. Install dependencies: `npm install`
2. Set up folders: `npm run setup`
3. Create `.env` file from `.env.example`
4. Start development: `npm run dev`

## Technologies Used

- **Frontend Framework**: React 19.2.6
- **Build Tool**: Vite 8.0.12
- **UI Library**: Material-UI 6.0.1
- **Form Handling**: React Hook Form 7.51.4
- **Validation**: Yup 1.3.3
- **Data Visualization**: Recharts 2.10.3
- **HTTP Client**: Axios 1.16.1
- **Routing**: React Router DOM 7.15.1

## Troubleshooting

### npm install fails
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure Node.js 16+ is installed

### Folder structure not created
- Run `npm run setup` manually
- Check file system permissions

### Theme not loading
- Verify `src/theme/theme.js` exists
- Check that Material-UI packages are installed
