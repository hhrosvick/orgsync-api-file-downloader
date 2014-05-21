/*

 OrgSync API File Downloader
 *** Not an official OrgSync product ***

 See [https://github.com/hhrosvick/orgsync-api-file-downloader] for details.

 */

var https = require('https');
var fs = require('fs');
var async = require('async');
var deferred = require('deferred');

var apiKey = process.argv[4];
var formId = parseInt(process.argv[3]);
var basePath = process.argv[2];

if(!apiKey || !formId || !basePath) {
    console.log("Usage: node run.js <path to download folder> <form id> <API key>");
    process.exit(1);
}

var OrgSync = {};

OrgSync.options = function(type, id){

    if(typeof id != 'number')
        return null;
    else
    {
        var options = {
            host: 'api.orgsync.com',
            path: '/api/v2/'+type+'/'+id+'?key='+apiKey,
            headers: {
                'Content-type': 'application/json',
                Accept: "*/*"
            }
        };
        return options;
    }
}

OrgSync.get = function(type, id) {
    var result = deferred();
    var options = OrgSync.options(type, id);

    if(!options) result.reject;
    else{
        https.get(options, function(osRes){
            var body = '';
            osRes.setEncoding('utf8');
            osRes.on('data', function(chunk){
                body += chunk;
            });
            osRes.on('end', function(){
                result.resolve(JSON.parse(body));
            })
        }).on('error', function(e){console.log(e); result.reject;});
    }
    return result.promise;
}

function download(url, dest, cb) {
    var file = fs.createWriteStream(dest, {mode: 0777});
    var request = https.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.end();
            cb();
        });
    }).on('error', function(err) {
            fs.unlink(dest);
            if (cb) cb(err.message);
        });
};

if(!fs.existsSync(basePath)) fs.mkdirSync(basePath);

var filename_regex = /[|&;$%@"<>()+,]/g;

OrgSync.get('forms', formId).done(function(body){
    var files_list = [];
    if(body.message) return console.log("Error connecting to OrgSync API: '%s'", body.message);

    var total_submissions = body.submission_ids.length;
    var counter = 1;
    console.log("Downloading Files for %d submissions...", total_submissions);

    async.each(body.submission_ids, function(sub_id, submission_CB){
        OrgSync.get('form_submissions', sub_id).then(function(sub){
            console.log("%d Starting", sub_id);
            try{
                var dir = basePath+'/'+sub_id;
                if(!fs.existsSync(dir)) fs.mkdirSync(dir);
                async.each(sub.files, function(file, file_CB){
                    //console.log("Download %d: %s", sub_id, file.form_element_name);
                    if(file.file_link != null){
                        var type = file.file_name.split('.');
                        type = type[type.length-1].replace(filename_regex, "");
                        var filename = file.form_element_name.replace(filename_regex, "");
                        download(file.file_link, dir+'/'+filename+'.'+type, file_CB);
                    } else {
                        file_CB();
                    }
                }, function(err){
                    if(err) return submission_CB(err);
                    console.log("%d/%d %d Done", counter++, total_submissions, sub_id);
                    submission_CB();
                });
            } catch(e){
                submission_CB(e);
            }
        });
    },function(err){
        if(err) return console.log(err);
        console.log("****Complete****");
        console.log("Files located in %s", basePath);
    });
});
