// Script para desregistrar Service Workers e limpar cache
// Cole este código no Console do navegador (F12 > Console) e pressione Enter

(async function cleanServiceWorkerAndCache() {
  console.log('🧹 Iniciando limpeza completa...');
  
  // 1. Desregistrar todos os Service Workers
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log(`📋 Encontrados ${registrations.length} Service Workers`);
    
    for (let registration of registrations) {
      await registration.unregister();
      console.log('✅ Service Worker desregistrado:', registration.scope);
    }
  }
  
  // 2. Limpar todos os caches
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    console.log(`📦 Encontrados ${cacheNames.length} caches`);
    
    for (let cacheName of cacheNames) {
      await caches.delete(cacheName);
      console.log('✅ Cache deletado:', cacheName);
    }
  }
  
  // 3. Limpar Local Storage
  localStorage.clear();
  console.log('✅ Local Storage limpo');
  
  // 4. Limpar Session Storage
  sessionStorage.clear();
  console.log('✅ Session Storage limpo');
  
  console.log('🎉 Limpeza completa! Recarregando página em 2 segundos...');
  
  setTimeout(() => {
    location.reload();
  }, 2000);
})();
