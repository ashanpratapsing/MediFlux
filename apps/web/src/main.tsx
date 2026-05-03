import ReactDOM from 'react-dom/client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// async function enableMocking() {
//   if (process.env.NODE_ENV !== 'development') {
//     return
//   }
//   
//   // Dynamic import to avoid bundling MSW in production
//   const { initMsw } = await import('@mediflux/msw/src/browser')
//   return initMsw()
// }

// enableMocking().then(() => {
// Register Service Worker for Notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW Registered:', reg.scope))
      .catch(err => console.log('SW Registration failed:', err));
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
)


// })
