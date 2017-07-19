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
    $('#userInfo').hide();
    $('#success').hide();
    $('#account-text').hide();
    var api = localStorage.publicApi;
    $('#searchAccount').click(function(ev){
        //$('#errMsg').show();
        /*$('#userInfo').show();
        $('#account-text').show();

        $('#email-text').hide();
        $('#emailInfo').hide();*/
        $.get(api+'/user/account?user='+$('#accountSearch').val(),function(e,r){
            console.log('aa',e);
            console.log('ab',r);
            if (e.status=='success'){
                $('#errMsg').hide();
                //window.location.replace(api+"/index");
                $('#userInfo').show();
                $('#account-text').show();

                $('#email-text').hide();
                $('#emailInfo').hide();
                $('#first_name').val(e.message._source.firstname);
                $('#last_name').val(e.message._source.lastname);
                $('#company_email').val(e.message._source.companyemail);
                $('#company_name').val(e.message._source.companyname);
                $('#user_name').val(e.message._source.username);
                $('#lastlogin').html('Last logged in '+e.message._source.lastlogin+'.');
                $('#company_success').html(e.message._source.companyemail);
            }
            else{
                $('#errMsg').show();
            }

        });

    });
    $('#resetPassword').click(function(ev){
        $('#errMsg').hide();
        $('#userInfo').hide();
        $('#success').show();
        $('#account-text').hide();
        $('#formAccount').hide();
        var param = {
            username: $('#user_name').val(),
            companyemail: $('#company_email').val()
        }

        console.log('resetPassword')



        $.post(api+'/user/reset-password',param,function(e,r){
            console.log('aa',e);
            console.log('ab',r);
            if (e.status=='success'){
                console.log('success')
            }
            else{
                $('#errMsg').show();
            }

        });
    })

});
