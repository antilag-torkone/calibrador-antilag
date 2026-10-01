// Service worker minimo so para o Chrome considerar o app "instalavel"
// (criterio do PWA) e para funcionar offline depois da primeira visita.
// Nao faz cache de nada alem dos arquivos do proprio app - a conexao
// Bluetooth continua sendo feita direto pela pagina, isso aqui nao mexe nisso.
var CACHE_NAME = "antilag-calibrador-v3";
var APP_SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function(ev){
  self.skipWaiting();
  ev.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){ return cache.addAll(APP_SHELL); })
  );
});

self.addEventListener("activate", function(ev){
  ev.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(ev){
  if(ev.request.method !== "GET") return;
  ev.respondWith(
    caches.match(ev.request).then(function(cached){
      var network = fetch(ev.request).then(function(resp){
        if(resp && resp.ok){
          var copy = resp.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(ev.request, copy); });
        }
        return resp;
      }).catch(function(){ return cached; });
      return cached || network;
    })
  );
});
