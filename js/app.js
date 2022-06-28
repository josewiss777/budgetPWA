//Register imports
import { confirmDelete, confirmReset, messageAlert, budgetOut } from './alerts.js';

//Register variables and selectors
const animationE = 'animate__animated animate__tada';
const animationS = 'animate__animated animate__zoomIn';
const form = document.querySelector('#form');
const result = document.querySelector('#result tbody');
const btnReset = document.querySelector('#btnReset');
const btnResetModal = document.querySelector('#btnResetModal');
const editBudgetModal = document.querySelector('#editBudgetModal');
const modal = document.querySelector('.modal');
const openModal = document.querySelector('#openModal');
const btnCloseModal = document.querySelector('.modal__close');
const inputDiv = document.querySelectorAll('.inputDiv');
const editBudget = document.querySelector('.pBudget');
const paragraphRest = document.querySelector('.pRest');
let budgetDB;
let costDB;

//Register events
registerEvents();
function registerEvents() {
  document.addEventListener( 'DOMContentLoaded', () => {
    DBbudget();
    DBcost();
  });
  form.addEventListener( 'submit', clickAddCost );
  btnReset.addEventListener( 'click', confirmReset );
  btnResetModal.addEventListener( 'click', confirmReset );
  editBudget.addEventListener( 'click', clickEditBudget );
  editBudgetModal.addEventListener( 'click', clickEditBudget );
  openModal.addEventListener( 'click', showModal );
  btnCloseModal.addEventListener( 'click', closeModal );
}

//Register functions
function DBbudget() {
  const DBbudget = window.indexedDB.open('budget',1);
  DBbudget.onerror = function( ) {  
    messageAlert('Error en la base de datos', '#b9000071', 'error', animationE);
  }
  DBbudget.onsuccess = function( ) {  
    budgetDB = DBbudget.result; 
    countBudgetDB();
  }
  DBbudget.onupgradeneeded = function(e) {  
    const dbbudget = e.target.result; 
    const objectStore = dbbudget.createObjectStore('budget', { keyPath: 'id', autoIncrement: true});
    objectStore.createIndex('budget', 'budget', { unique: false});
    objectStore.createIndex('rest', 'rest', { unique: false});
    objectStore.createIndex('id', 'id', { unique: true});
  }
}

function DBcost() {
  const DBcost = window.indexedDB.open('cost',1); 
  DBcost.onerror = function( ) {  
    messageAlert('Error en la base de datos', '#b9000071', 'error', animationE);
  }
  DBcost.onsuccess = function( ) {  
    costDB = DBcost.result; 
  }
  DBcost.onupgradeneeded = function(e) {  
    const dbcost = e.target.result; 
    const objectStore = dbcost.createObjectStore('cost', { keyPath: 'id', autoIncrement: true});
    objectStore.createIndex('name', 'name', { unique: false});
    objectStore.createIndex('price', 'price', { unique: false});
    objectStore.createIndex('date', 'date', { unique: false});
    objectStore.createIndex('id', 'id', { unique: true});
  }
}

function countBudgetDB() {
  const objectStore = budgetDB.transaction('budget').objectStore('budget');
  const countDB = objectStore.count();
  countDB.onsuccess = function() {
    if(countDB.result === 0) {
      askBudget();
    } else {
      readBudgetDB();
      readCostDB();
    }
  }
}

function askBudget() {
  Swal.fire({
    title: "Bienvenido",
    input: "number",
    inputLabel: 'Para iniciar ingresa tu presupuesto',
    inputPlaceholder: 'Tu presupuesto aquí',
    footer: '<span class="messageFooter">No uses puntos ni comas</span>',
    allowEscapeKey: false,
    allowOutsideClick: false,
    backdrop: "#808080ea",  
    showCancelButton: false,
    confirmButtonColor: "#0A51E2",
    confirmButtonText: "INGRESAR",
    showClass: {
      popup: 'animate__animated animate__flipInY',
    },
    inputValidator: budgetUser => {
      if ( budgetUser === null || isNaN(budgetUser) || budgetUser <= 0 || budgetUser % 1 !== 0 ) {
        return "Ingresa un presupuesto válido";
      } else {
        return undefined;
      }
    }
  })
  .then(result => {
    if(result.value) {
      const objectBudget = { 
        budget: parseInt(result.value).toLocaleString('en-US'), 
        rest: parseInt(result.value).toLocaleString('en-US'), 
        id: Date.now(), 
      };  
      addBudgetDB(objectBudget);
    }
  });
}

function addBudgetDB(object) {
  const transaction = budgetDB.transaction(['budget'], 'readwrite');           
  const objectStore = transaction.objectStore('budget');
  objectStore.add(object);
  transaction.onerror = function() {
    messageAlert('Error, intenta de nuevo', '#b9000071', 'error', animationE );
  }
  transaction.oncomplete = function() {
    messageAlert('Presupuesto añadido', '#28B463', 'success', animationS );
    readBudgetDB();    
  }   
}

function readBudgetDB() {
  const objectStore = budgetDB.transaction('budget').objectStore('budget'); 
  objectStore.openCursor( ).onsuccess = function(e) { 
    const cursor = e.target.result;
    if(cursor) { 
      const { budget, rest } = cursor.value; 
      document.querySelector('#budget').textContent = `$${budget}`;
      document.querySelector('#budgetModal').textContent = `$${budget}`;
      document.querySelector('#rest').textContent = `$${rest}`;
      document.querySelector('#restModal').textContent = `$${rest}`;
      if( parseInt(rest.replace(/,/g,"")) <= parseInt(budget.replace(/,/g,"")) / 4 ) {
        paragraphRest.classList.add('warning');
        document.querySelector('#pRestModal').classList.add('warning');
      } else {
        paragraphRest.classList.remove('warning');
        document.querySelector('#pRestModal').classList.remove('warning');
      }
      if( parseInt(rest.replace(/,/g,"")) <= parseInt(budget.replace(/,/g,"")) / 10 ) {
        paragraphRest.classList.add('alert');
        document.querySelector('#pRestModal').classList.add('alert');
      } else {
        paragraphRest.classList.remove('alert');
        document.querySelector('#pRestModal').classList.remove('alert');
      }
    }
  }
}

function clickAddCost(e) {
  e.preventDefault(); 
  const name = document.querySelector('#name').value;
  const price = parseInt(document.querySelector('#price').value);
  if ( name === '' || price === '' ) {
    messageAlert('Complete todos los campos', '#b9000071', 'error', animationE );
    return;
  } else if ( price <= 0 || isNaN(price) || price % 1 !== 0 ) {
    messageAlert('Precio no válido', '#b9000071', 'error', animationE );
    return;
  }
  const firstLetter = name.charAt(0).toUpperCase();
  const restLetter = name.substring(1, name.length);
  const newName = firstLetter.concat(restLetter);
  moment.locale('es');
  let date = moment().format('D MMMM'); 
  const objectCost = { 
    name: newName, 
    price: price.toLocaleString('en-US'),
    date,
    id: Date.now(),    
  }; 
  checkBudgetOut(objectCost, price); 
}

function checkBudgetOut(objectCost, price ) {
  const objectStore = budgetDB.transaction('budget').objectStore('budget'); 
  objectStore.openCursor( ).onsuccess = function(e) {  
    const cursor = e.target.result;
    if(cursor) { 
      const { budget, rest } = cursor.value; 
      if( parseInt(rest.replace(/,/g,"")) - price < 0 ) {
        budgetOut();
        return;
      }
      if( parseInt(rest.replace(/,/g,"")) - price <= parseInt(budget.replace(/,/g,"")) / 4 ) {
        paragraphRest.classList.add('warning')
        document.querySelector('#pRestModal').classList.add('warning');
      } else {
        paragraphRest.classList.remove('warning')
        document.querySelector('#pRestModal').classList.remove('warning');
      }
      if( parseInt(rest.replace(/,/g,"")) - price <= parseInt(budget.replace(/,/g,"")) / 10 ) {
        paragraphRest.classList.add('alert')
      } else {
        paragraphRest.classList.remove('alert')
      }
    }
    addCostDB(objectCost);
  }
}

function addCostDB(object) {
  const transaction = costDB.transaction(['cost'], 'readwrite');           
  const objectStore = transaction.objectStore('cost');
  objectStore.add(object);
  transaction.onerror = function() {
    messageAlert('Error, intenta de nuevo', '#b9000071', 'error', animationE );
  }
  transaction.oncomplete = function() {
    messageAlert('Gasto añadido', '#28B463', 'success', animationS );
    readCostDB();    
  }
}

function readCostDB() {
  cleanResultHTML();
  const objectStore = costDB.transaction('cost').objectStore('cost'); 
  const fragment = document.createDocumentFragment(); 
  let totalCost = 0;
  objectStore.openCursor( ).onsuccess = function(e) { 
    const cursor = e.target.result;
    if(cursor) { 
      const { name, price, date, id } = cursor.value; 
      totalCost = totalCost + parseInt(price.replace(/,/g,""));
      const trId = document.createElement('tr');
      trId.dataset.id = id;
      const tdName = document.createElement('td');
      tdName.textContent = name;
      const tdPrice = document.createElement('td');
      tdPrice.textContent = `$${price}`;
      const tdDate = document.createElement('td');
      tdDate.textContent = date;
      const tdBtn = document.createElement('td')
      tdBtn.classList.add('tdBtnClass')
      const btnDelete = document.createElement('button');
      btnDelete.textContent = '✖️';
      btnDelete.classList.add('btnDeleteCost');
      btnDelete.onclick = () => {
        confirmDelete(id);
      }
      tdBtn.appendChild(btnDelete)    
      trId.appendChild(tdName);
      trId.appendChild(tdPrice);
      trId.appendChild(tdDate);
      trId.appendChild(tdBtn);
      fragment.appendChild(trId);
      cursor.continue();
      return;
    }  
    result.appendChild(fragment);
    document.querySelector('#total').textContent = `$${totalCost.toLocaleString('en-US')}`;
    document.querySelector('#totalModal').textContent = `$${totalCost.toLocaleString('en-US')}`;
    updateRest(totalCost); 
    form.reset();
  }
}

function updateRest(totalCost) {
  const objectStore = budgetDB.transaction(['budget'], 'readwrite').objectStore('budget'); 
  objectStore.openCursor( ).onsuccess = function(e) {  
    const cursor = e.target.result;
    if(cursor) {
      const { budget, rest, id } = cursor.value;
      let newRest = (parseInt(budget.replace(/,/g,"")) - totalCost).toLocaleString('en-US');
      const objectBudget = {
        budget,
        rest: newRest,
        id
      } 
      objectStore.put(objectBudget);
    } 
  }
  readBudgetDB();
}

export function deleteCost(id) {
  const transaction = costDB.transaction(['cost'], 'readwrite'); 
  const objectStore = transaction.objectStore('cost'); 
  objectStore.delete(id); 
  transaction.oncomplete = function() {
    messageAlert('Gasto eliminado', '#28B463', 'success', animationS );
    readCostDB();
  }
  transaction.onerror = function() {
    messageAlert('Error, intenta de nuevo', '#b9000071', 'error', animationE );
  }
}

function clickEditBudget() {
  const objectStore = budgetDB.transaction('budget').objectStore('budget'); 
  objectStore.openCursor( ).onsuccess = function(e) {  
    const cursor = e.target.result;
    if(cursor) { 
      const { budget, rest, id } = cursor.value;   
      budgetEdit(budget, rest, id);
    }  
  }
}

function budgetEdit(budget, rest, id) {
  let costTotal = parseInt(budget.replace(/,/g,"")) - parseInt(rest.replace(/,/g,""));  
  Swal.fire({ 
    allowEscapeKey: false,
    allowOutsideClick: false,
    backdrop: "#808080ea",  
    title: '¿Editar presupuesto?',
    text: 'Ingresa tu nuevo presupuesto',
    input: "number",
    inputPlaceholder: `Presupuesto actual $${budget}`,
    showCancelButton: true,
    cancelButtonText: 'CANCELAR',
    cancelButtonColor: '#566573',
    confirmButtonColor: "#0A51E2",
    confirmButtonText: "CONFIRMAR",
    footer: `<span class="messageFooter">Tu nuevo presupuesto debe ser mayor al total gastado de $${costTotal.toLocaleString('en-US')}</span>`,
    showClass: {
      popup: 'animate__animated animate__flipInY',
    },
    inputValidator: budgetUser => {
      if( budgetUser === null || isNaN(budgetUser) || budgetUser <= costTotal || budgetUser % 1 !== 0 ) {
        return 'Presupuesto no válido';
      } else {
        return undefined;
      }
    }
  })
  .then(result => {
    if(result.value) {
      const objectBudget = { 
        budget: parseInt(result.value).toLocaleString('en-US'), 
        rest: parseInt(result.value - costTotal).toLocaleString('en-US'),
        id 
      };  
      const transaction = budgetDB.transaction(['budget'], 'readwrite'); 
      const objectStore = transaction.objectStore('budget');  
      objectStore.put(objectBudget);  
      transaction.oncomplete = function() {
        messageAlert('Presupuesto editado', '#28B463', 'success', animationS );
        readBudgetDB();
      }
      transaction.onerror = function() {
        messageAlert('Error, intenta de nuevo', '#b9000071', 'error', animationE );
      }
    }
  });
}

function cleanResultHTML() {
  while (result.firstChild) {
    result.removeChild(result.firstChild);
  }
}

export function appReset() {
  const transaction = costDB.transaction(['cost'], 'readwrite');
  const objectStore = transaction.objectStore('cost');
  objectStore.clear();
  transaction.onerror = function() {
    messageAlert('Error, intenta de nuevo', '#b9000071', 'error', animationE );
  }
  transaction.oncomplete = function() {    
    readCostDB();
    deletebudgetDB();
  }
}

function deletebudgetDB() {
  const transaction = budgetDB.transaction(['budget'], 'readwrite');
  const objectStore = transaction.objectStore('budget');
  objectStore.clear();
  transaction.onerror = function() {
    messageAlert('Error, intenta de nuevo', '#b9000071', 'error', animationE );
  }
  transaction.oncomplete = function() {    
    countBudgetDB();
  }
}

function showModal(e) {
  e.preventDefault()
  modal.classList.add('modal--show')
  inputDiv.forEach( list => list.classList.add('inputDiv-none') )
}

function closeModal(e) {
  e.preventDefault()
  modal.classList.remove('modal--show')
  inputDiv.forEach( list => list.classList.remove('inputDiv-none') )
}