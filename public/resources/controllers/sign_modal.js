var modal = document.getElementById('sign_modal');
var buttn = document.getElementById("sign");
var cls_modal=document.getElementsByClassName("close")[0];

buttn.onclick=function () {
    modal.style.display="block";
}
span.onclick=function(){
    modal.style.display="close";
}
window.onclick=function(event){
    if(event.target==modal){
        modal.style.display="none";
    }
}