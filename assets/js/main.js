
S('#searchInput')[0].addEventListener('keyup', (ev)=>{
    console.log(ev.target.value);
})


function S(str){return document.querySelectorAll(str);}