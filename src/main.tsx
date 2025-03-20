
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add more detailed logging
console.log("Main component starting initialization");

// Check if root element exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found in the DOM");
} else {
  console.log("Root element found, attempting to render app");
  
  try {
    createRoot(rootElement).render(<App />);
    console.log("App rendered successfully");
  } catch (error) {
    console.error("Error rendering the app:", error);
  }
}
