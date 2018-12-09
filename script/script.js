$( document ).ready(function() { 

    $('#update').click(function() {
        location.reload();
    });
   
    function weather(){
        location.reload();
    }

    setInterval(weather, 60*1000);
});