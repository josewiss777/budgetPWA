//Register import
import { deleteCost, appReset } from './app.js'

//Register functions alerts
export function messageAlert( title, color, icon, animation ) {
    Swal.fire({
    toast: true,
    title: title,
    position: 'top',
    background: '#F5F5F5',
    iconColor: color,
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    icon: icon,
    showClass: {
        popup: animation
    },
    hideClass: {
        popup: 'animate__animated animate__zoomOut'
    }
    })
}

export function confirmReset( ) { 
    Swal.fire({
        title: 'Reiniciar aplicación',
        text: '¿Deseas continuar?',
        confirmButtonText: 'CONTINUAR',
        confirmButtonColor: '#0A51E2',
        showCancelButton: true,
        cancelButtonText: "CANCELAR",
        cancelButtonColor: '#566573',
        footer: '<span class="messageFooter">Esta acción borrará toda la información y no podrás recuperarla</span>',
        icon: 'warning',
        backdrop: "#808080ea",
        allowEscapeKey: false,
        allowOutsideClick: false,
    }) 
    .then((result) => {
        if (result.isConfirmed) {
            appReset();
        } 
    }) 
}

export function confirmDelete(id) { 
    Swal.fire({
        title: '¿Deseas eliminar este gasto?',
        confirmButtonText: 'CONFIRMAR',
        confirmButtonColor: '#0A51E2',
        showCancelButton: true,
        cancelButtonText: "CANCELAR",
        cancelButtonColor: '#566573',
        icon: 'question',
        backdrop: "#808080ea",
        allowEscapeKey: false,
        allowOutsideClick: false,
    }) 
    .then((result) => {
        if (result.isConfirmed) {
            deleteCost(id);
        } 
    })
}

export function budgetOut() {
    Swal.fire({
        text: 'El gasto que deseas añadir supera tu restante actual',
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: "REGRESAR",
        cancelButtonColor: '#05314D',
        icon: 'info',
        backdrop: "#808080ea",
        allowEscapeKey: false,
        allowOutsideClick: false,
        footer: '<span class="messageFooter">Puedes modificar tu presupuesto inicial dando click sobre él</span>'
    }) 
}