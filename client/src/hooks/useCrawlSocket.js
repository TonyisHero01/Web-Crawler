import { useEffect } from 'react';

export default function useCrawlSocket({ onComplete }) {
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3000/');

    socket.onopen = () => console.log('✅ WebSocket connected');
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'crawl-complete') {
          console.log(`🎯 Crawl complete for record ${data.website_record_id}`);
          onComplete?.(data.website_record_id);
        }
      } catch (e) {
        console.error('❌ WebSocket parse error:', e);
      }
    };
    socket.onerror = (err) => console.error('❌ WebSocket error:', err);
    socket.onclose = () => console.log('🔌 WebSocket closed');

    return () => socket.close();
  }, [onComplete]);
}