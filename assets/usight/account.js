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
    $('#success').hide();
    var api = localStorage.publicApi;
    $('#createAccount').click(function(ev){
        var param = {
            username: $('#user_name').val(),
            password: $('#password').val(),
            firstname: $('#first_name').val(),
            lastname: $('#last_name').val(),
            companyname: $('#company_name').val(),
            companyemail: $('#company_email').val()
        }
        console.log('createAccount',param)

        $.post(api+'/user/account',param,function(e,r){
            console.log('aa',e);
            console.log('ab',r);
            if (e.status=='success'){
                $('#errMsg').hide();
                $('#formAccount').hide();
                $('#success').show();
                $('#company_success').html(param.companyemail)
            }
            else{
                $('#errMsg').show();
                $('#errMsg span').html(e.message);
                console.log(e.message)
            }

        });
    })

});
