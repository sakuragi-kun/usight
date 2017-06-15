/* ------------------------------------------------------------------------------
 *
 *  # Dashboard configuration
 *
 *  Demo dashboard configuration. Contains charts and plugin inits
 *
 *  Version: 1.0
 *  Latest update: Aug 1, 2015
 *
 * ---------------------------------------------------------------------------- */

$(function() {
    $('#errMsg').hide();
    var api = localStorage.publicApi;
    $('#login').click(function(ev){
        console.log('login',$('#username').val(),$('#password').val())
        $.post(api+'/login',{username:$('#username').val(),password:$('#password').val()},function(e,r){
            console.log('aa',e)
            console.log('ab',r);
            if (e.status=='success'){
                window.location.replace(api+"/index");
            }
            else{
                $('#errMsg').show();
            }

        });
    })

});
