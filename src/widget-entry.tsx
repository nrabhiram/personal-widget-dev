import React from 'react';
import { createRoot } from 'react-dom/client';
import ConnectionWidget from './components/ConnectionWidget';

// Styles
import './styles/globals.css';

// Expose widget API
(window as any).ConnectionsWidget = {
  mount: (querySelector: string) => {
    const element = document.querySelector(querySelector);
    if (!element) {
      console.error(`Element with selector "${querySelector}" not found`);
      return;
    }
    
    // Create a container div for the widget
    const widgetContainer = document.createElement('div');
    element.appendChild(widgetContainer);
    
    const root = createRoot(widgetContainer);
    root.render(<ConnectionWidget />);
  },
  
  unmount: (querySelector: string) => {
    const element = document.querySelector(querySelector);
    if (element) {
      // Remove all widget containers
      const containers = element.querySelectorAll('div');
      containers.forEach(container => {
        const root = createRoot(container);
        root.unmount();
        container.remove();
      });
    }
  }
};

// Auto-mount if data attribute exists
document.addEventListener('DOMContentLoaded', () => {
  const autoMount = document.querySelector('[data-connections-widget]');
  if (autoMount && autoMount.id) {
    (window as any).ConnectionsWidget.mount(`#${autoMount.id}`);
  }
});
