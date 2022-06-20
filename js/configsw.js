if( 'serviceWorker' in navigator ) {
    navigator.serviceWorker.register('../sw.js')
        .then( register => console.log('SW registrado correctamente...', register) )
        .catch( error => console.log( 'Falló el registro de SW...', error ) )
} else {
    console.log( 'SW no soportado' )
}