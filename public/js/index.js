/* eslint-disable */
import {displayMap} from './mapbox.js';
import { login, logout } from './login.js';
import { signup } from './signup.js';

import { updateSettings } from './updateSettings.js';
import {bookTour} from './stripe.js'

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');


const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const resBtn=document.querySelector(".resBtn");
const navSection=document.querySelector(".nav--user");
const navBtns=document.querySelectorAll(".nav-btn");
const menuBar=document.querySelector(".user-view__menu");
const menuBtn=document.querySelector(".usResBtn");

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
  if (signupForm)
    signupForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const name=document.getElementById('name').value;
      const passwordConfirm=document.getElementById('passwordConfirm').value;

      const password = document.getElementById('password').value;
      signup(name,email, password,passwordConfirm);
    });

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const currentPassword = document.getElementById('password-current').value;
    const updatedPassword = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { currentPassword, updatedPassword, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn)
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);

// responsive code by me
let click=false;
if(resBtn){
  resBtn.addEventListener('click',()=>{
    if(!click){
navSection.style.display="inherit";
click=true;

    }else{
      navSection.style.display="none";
      
      click=false;

    }
  })
}

if(menuBtn){
  menuBtn.addEventListener('click',()=>{
    if(!click){

menuBar.style.left="0";
menuBtn.style.left=`${menuBar.offsetWidth-50}px`;


click=true;

    }else{
      menuBar.style.left="-100%";
      menuBtn.style.left="-50px";
      click=false;

    }
});
}