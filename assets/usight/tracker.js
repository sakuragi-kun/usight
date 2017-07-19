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

    var api = localStorage.publicApi;
    var trackerList = []
    mode('list');

    $('#listAddTracker').click(function(ev){
        mode('add')
    })
    $('#saveTracker').click(function(ev){
        if ($('#trackerName').val().length==0 || $('#mainKeyword').val().length==0){
            new PNotify({
                title: 'Uncomplete Data',
                text: 'Tracker name and Keyword cannot be empty',
                icon: 'icon-blocked',
                type: 'error',
                delay: 2000
            });
        }
        else {
            var d = new Date();
            var param = {
                username: JSON.parse(localStorage.getItem('usight-user')).username,
                trackername: $('#trackerName').val(),
                twitter: {
                    mainkeyword: $('#mainKeyword').val(),
                    requiredkeyword: $('#requiredKeyword').val(),
                    excludekeyword: $('#excludeKeyword').val(),
                    lang: $('#lang').find(":selected").text(),
                    twitterid: $('#twitterId').val()
                },
                facebook: {
                    facebookid: $('#facebookId').val()
                },
                created_date: d.getFullYear() +"/"+
                    ("00" + (d.getMonth() + 1)).slice(-2) + "/" +
                    ("00" + d.getDate()).slice(-2) + " " +
                    ("00" + d.getHours()).slice(-2) + ":" +
                    ("00" + d.getMinutes()).slice(-2) + ":" +
                    ("00" + d.getSeconds()).slice(-2)
            }
            console.log(param);
            $.post(api+'/user/tracker',param,function(e,r){
                console.log('aa',e)
                console.log('ab',r);
                if (e.status=='success'){
                    new PNotify({
                        title: 'Create Tracker',
                        text: 'Tracker successfully save',
                        icon: 'icon-checkmark3',
                        type: 'success',
                        delay: 2000
                    });
                    mode('list')
                }
                else{
                    new PNotify({
                        title: 'Create Tracker',
                        text: e.message,
                        icon: 'icon-blocked',
                        type: 'error',
                        delay: 5000
                    });

                }

            });
            //mode('list')
        }


    })
    $('#updateTracker').click(function(ev){
        console.log('update tracker')
        if ($('#trackerName').val().length==0 || $('#mainKeyword').val().length==0){
            new PNotify({
                title: 'Uncomplete Data',
                text: 'Tracker name and Keyword cannot be empty',
                icon: 'icon-blocked',
                type: 'error',
                delay: 2000
            });
        }
        else {
            var d = new Date();
            var param = {
                username: JSON.parse(localStorage.getItem('usight-user')).username,
                trackername: $('#trackerName').val(),
                twitter: {
                    mainkeyword: $('#mainKeyword').val(),
                    requiredkeyword: $('#requiredKeyword').val(),
                    excludekeyword: $('#excludeKeyword').val(),
                    lang: $('#lang').find(":selected").text(),
                    twitterid: $('#twitterId').val()
                },
                facebook: {
                    facebookid: $('#facebookId').val()
                },
                modified_date: d.getFullYear() +"/"+
                    ("00" + (d.getMonth() + 1)).slice(-2) + "/" +
                    ("00" + d.getDate()).slice(-2) + " " +
                    ("00" + d.getHours()).slice(-2) + ":" +
                    ("00" + d.getMinutes()).slice(-2) + ":" +
                    ("00" + d.getSeconds()).slice(-2)
            }
            console.log(param);
            $.post(api+'/user/tracker-edit',param,function(e,r){
                console.log('aa',e)
                console.log('ab',r);
                if (e.status=='success'){
                    new PNotify({
                        title: 'Edit Tracker',
                        text: 'Tracker successfully save',
                        icon: 'icon-checkmark3',
                        type: 'success',
                        delay: 2000
                    });
                    mode('list')
                }
                else{
                    new PNotify({
                        title: 'Edit Tracker',
                        text: e.message,
                        icon: 'icon-blocked',
                        type: 'error',
                        delay: 5000
                    });

                }

            });
            //mode('list')
        }


    })

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
                    window.location.replace(api+"/index");
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
    });


    function mode(type){
        if (type == 'list') {
            $('#addHeader').hide();
            $('#addTrackerForm').hide();
            $('#updateHeader').hide();
            $('#saveTracker').hide();
            $('#updateTracker').hide();

            $('#listAddTracker').show();
            $('#listTracker').show();
            $.get(api+'/user/tracker?username='+JSON.parse(localStorage.getItem('usight-user')).username,function(e,r){
                console.log('aa',e)
                console.log('ab',r);
                var html = []
                trackerList = e.message;
                if (e.status=='success'){
                    for (var i=0;i<e.message.length;i++){
                        html.push('<tr>',
                            '<td>',
                                '<div class="checker border-primary text-primary"><span class="checked"><input type="checkbox" class="styled" checked="checked"></span></div>',
                            '</td>',
                            '<td>'+e.message[i].trackername+'</td>',
                            '<td>'+e.message[i].created_date+'</td>',
                            '<td>'+(e.message[i].modified_date?e.message[i].modified_date:'')+'</td>',
                            '<td class="text-center">',
                                '<ul class="icons-list">',
                                    '<li class="text-primary-600"><a href="javascript:update(\''+e.message[i].trackername+'\',\'update\')"><i class="icon-pencil7"></i></a></li>',
                                    '<li class="text-danger-600"><a href="javascript:update(\''+e.message[i].trackername+'\',\'delete\')"><i class="icon-trash"></i></a></li>',
                                '</ul>',
                            '</td>',
                        '</tr>');
                    }

                    $('#listBody').html(html.join(''))
                }
                else{


                }

            });
        }
        else if(type=='add'){
            $('#addHeader').show();
            $('#updateHeader').hide();
            $('#addTrackerForm').show();
            $('#saveTracker').show();
            $('#updateTracker').hide();

            $('#listAddTracker').hide();
            $('#listTracker').hide();
        }
        else if(type=='update'){
            $('#addHeader').hide();
            $('#updateHeader').show();
            $('#addTrackerForm').show();
            $('#saveTracker').hide();
            $('#updateTracker').show();

            $('#listAddTracker').hide();
            $('#listTracker').hide();

        }
    }
    window.update = function(p,stat) {
        if (stat == 'update'){
            console.log(p);
            mode('update');
            console.log(trackerList)
            for(var i=0;i<trackerList.length;i++){
                if (trackerList[i].trackername == p){
                    console.log('found')
                    $('#trackerName').val(trackerList[i].trackername);
                    $('#mainKeyword').val(trackerList[i].twitter.mainkeyword);
                    $('#requiredKeyword').val(trackerList[i].twitter.requiredkeyword);
                    $('#excludeKeyword').val(trackerList[i].twitter.excludekeyword);
                    $('#twitterId').val(trackerList[i].twitter.twitterid);
                    $('#facebookId').val(trackerList[i].facebook.facebookid);
                    //TODO: selected lang
                }
            }
        }
        else if (stat == 'delete'){
            bootbox.confirm("Are you sure want to remove "+p+" ?", function(result) {
                console.log('delete',result)
                if (result === true){
                    var param = {
                        username: JSON.parse(localStorage.getItem('usight-user')).username,
                        trackername: p
                    }
                    $.post(api+'/user/tracker-rem',param,function(e,r){
                        console.log('aa',e)
                        console.log('ab',r);
                        if (e.status=='success'){
                            new PNotify({
                                title: 'Remove Tracker',
                                text: 'Tracker successfully removed',
                                icon: 'icon-checkmark3',
                                type: 'success',
                                delay: 2000
                            });
                            mode('list')
                        }
                        else{
                            new PNotify({
                                title: 'Remove Tracker',
                                text: e.message,
                                icon: 'icon-blocked',
                                type: 'error',
                                delay: 5000
                            });

                        }

                    });
                }
                //bootbox.alert("Confirm result: " + result)
            });
        }


    }

});
