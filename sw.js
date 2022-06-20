const nameCache = 'cp-v1'
const files = [  
    '/',
    '/index.html',
    '/error.html',
    '/img/calculator.svg',
    '/img/error404.svg',
    '/img/menu.svg',
    '/img/trash.svg',
    '/css/normalize.css',
    '/css/style.css',
    '/js/alerts.js',
    '/js/app.js',
    '/js/configsw.js',
];

self.addEventListener('install', e => {  //Se ejecuta una sola vez cuando se instala el SW
    e.waitUntil(  
        caches.open(nameCache)
            .then( cache => {
                cache.addAll(files)  //addAll si es un arreglo de varios archivos y add si es solo un archivo
            } )
    )
})

self.addEventListener('activate', e => {  //Se ejecuta cuando se activa el SW
    e.waitUntil(
        caches.keys()
            .then( keys => {
                return Promise.all(
                    keys.filter( key => key !== nameCache )
                        .map( key => caches.delete(key) ) //Borra las versiones de caché anteriores
                )
            })
    )
})

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request)
            .then( r => {
                return r || fetch(e.request)
                .then( response => {
                    return caches.open(nameCache)
                    .then( cache => {
                        cache.put(e.request, response.clone());
                        return response;
                    });
                });
            })
            .catch( () => caches.match('/error.html'))
    )
});