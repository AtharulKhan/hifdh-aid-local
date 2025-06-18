
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PostHogProvider } from 'posthog-js/react'

const options = {
  api_host: 'https://us.i.posthog.com',
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PostHogProvider 
      apiKey="phc_rxdOieyHY2vUOHaeNVm8UMKzkWyqTewaNbUfejVSMG8"
      options={options}
    >
      <App />
    </PostHogProvider>
  </React.StrictMode>
);
