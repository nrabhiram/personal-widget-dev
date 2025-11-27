// pages/widget.tsx
import { createRoot } from 'react-dom/client';
import ConnectionWidget from '@/components/ConnectionWidget';

// This page won't render anything - it's just for the build
export default function WidgetPage() {
  return null;
}

// Expose widget to window
if (typeof window !== 'undefined') {
  window.ConnectionsWidget = {
    mount: (query: string) => {
      const element = document.querySelector(query);
      if (!element) {
        console.error(`Element with selector "${query}" not found`);
        return;
      }
      
      const root = createRoot(element);
      root.render(<ConnectionWidget />);
    }
  };
}

declare global {
  interface Window {
    ConnectionsWidget: {
      mount: (elementId: string) => void;
    };
  }
}
