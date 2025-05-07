// Formulario de Arquivos
const file_JPG = document.getElementById('file-JPG')
const file_PNG = document.getElementById('file-PNG')
const file_PDF = document.getElementById('file-PDF')
const file_MXL = document.getElementById('file-MXL')
const file_MP3 = document.getElementById('file-MP3')

const file = [
    {input: 'file-JPG', label:'form-JPG', default: 'JPG'},
    {input: 'file-PNG', label:'form-PNG', default: 'PNG'},
    {input: 'file-PDF', label:'form-PDF', default: 'PDF'},
    {input: 'file-MXL', label:'form-MXL', default: 'MXL'},
    {input: 'file-MP3', label:'form-MP3', default: 'MP3'},
]

file.forEach(file => {
    const INPUT = document.getElementById(file.input)
    const LABEL = document.getElementById(file.label)

    if (INPUT && LABEL) {
        INPUT.addEventListener('change', (event) => {

            if (INPUT.files.length > 0) {
                LABEL.innerText = INPUT.files[0].name
                LABEL.classList.add('active')
            } else {
                LABEL.innerText = file.default
                LABEL.classList.remove('active')
            }
        })
    }
})

// NavSide Lateral
function toggle() {
    const aside = document.querySelector("aside");
    aside.classList.toggle("active");
}

addEventListener('click', (event) => {
    const navside = document.getElementById('nav-side')
    const button_menu = document.getElementById('button-menu')
    if (!button_menu.contains(event.target) && !navside.contains(event.target) ) {
        navside.classList.remove('activate');
    }
})



function SL(id) {
    const section = document.getElementById(id)
    section.scrollBy({left:-400, behavior: 'smooth'})
}

function SR(id) {
    const section = document.getElementById(id)
    section.scrollBy({left:400, behavior: 'smooth'})
}
const logo1 = document.getElementsByClassName('logo1')[0]
const logo2 = document.getElementsByClassName('logo2')[0]

logo1.addEventListener('click', loadMusicXML)
logo2.addEventListener('click', loadMusicXML)
