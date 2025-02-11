
// !<!--// @@@@@@@@@@@@@@@@@@@@@
// ?------    تعیر رنگ هدر
// !<!--// @@@@@@@@@@@@@@@@@@@@@

Home.addEventListener("mouseover",()=>{
    Home.style.color="black";

    Home.style.backgroundColor="#F0F8FF";

})
Home.addEventListener("mouseout",()=>{
    Home.style.color="#F0F8FF";

    Home.style.backgroundColor="black";
})

About.addEventListener("mouseover",()=>{
    About.style.color="black";
    About.style.backgroundColor="#F0F8FF";
})
About.addEventListener("mouseout",()=>{
    About.style.color="#F0F8FF";
    About.style.backgroundColor="black";
})

Contact.addEventListener("mouseover",()=>{
    Contact.style.color="black";
    Contact.style.backgroundColor="#F0F8FF";
})

Contact.addEventListener("mouseout",()=>{
    Contact.style.color="#F0F8FF";

    Contact.style.backgroundColor="black";
})

// !

// !<!--// @@@@@@@@@@@@@@@@@@@@@
// ?------  عملیات لود صفحه
// !<!--// @@@@@@@@@@@@@@@@@@@@@


window.addEventListener("load",()=>{
    setTimeout(() => {
        Home.style.color="black";
        Home.style.background = "linear-gradient(135deg, #4B4B4B, #AAAAAA)";
        }, 1000);
    setTimeout(() => {
        About.style.color="black";
        About.style.background = "linear-gradient(135deg, #4B4B4B, #AAAAAA)"; 
       }, 2000);
    setTimeout(()=>{
        Contact.style.color="black";
        Contact.style.background = "linear-gradient(135deg, #4B4B4B, #AAAAAA)"; 
       }, 3000)

})


// !<!--// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ -->
  

// !<!--// @@@@@@@@@@@@@@@@@@@@@
// ?------  اسکرول برایه هدرر
// !<!--// @@@@@@@@@@@@@@@@@@@@@

        
let lastScrollTop = 0;
const header = document.getElementById('header');

window.addEventListener('scroll', function() {
    let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop > lastScrollTop) {
        // Scroll Down
        header.style.transform = "translateY(-100px)";
    } else {
        // Scroll Up
        header.style.transform = "translateY(0)";
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
});




document.body.style.color="#CDCABB";

document.body.style.background="#4E";

