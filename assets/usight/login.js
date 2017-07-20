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
                if (e.message._source.mail_status==3){
                    localStorage.setItem('usight-tracker', JSON.stringify(e.message._source.tracker));
                    var usr = {
                        username: e.message._source.username,
                        firstname: e.message._source.firstname,
                        lastname: e.message._source.lastname,
                        token: e.message._source.token
                    }
                    localStorage.setItem('usight-user', JSON.stringify(usr));
                    //window.location.replace(api+"/index");
                    window.location.replace("app.usight.id/index");
                }
                else {
                    $('#errMsg').show();
                    $('#errMsg span').html('Please check your email, and confirm your email first');
                }

            }
            else{
                $('#errMsg').show();
                $('#errMsg span').html(e.message);

            }

        });
    })

});
