'use strict';

const burger = document.querySelector('.burger');
const headerNav = document.querySelector('.header__nav');
const copyrightText = document.querySelector('.footer__copyright-text');

if (screen.width < 576) {
  copyrightText.innerHTML = `© 2023 Termiz Davlat Universiteti <br> Axborot Texnologiyalari`;
} else {
  copyrightText.innerHTML = `© 2023 Termiz Davlat Universiteti Axborot Texnologiyalari`;
}

burger.addEventListener('click', function (e) {
  e.preventDefault();
  burger.classList.toggle('active');
  headerNav.classList.toggle('header__nav--active');
}
);