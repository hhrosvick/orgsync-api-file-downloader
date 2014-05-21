OrgSync API File Downloader
===========================
This is not an official [OrgSync](http://www.orgsync.com) product.

Downloads all files from submissions in an OrgSync form using Node.js  
Files are put in folders based on the submission ID.

This requires an API key from OrgSync.

##Installation:

Install [Node.js](http://www.nodejs.org)  
Download [run.js](run.js) and [package.json](run.js) to a folder.  
Run 'npm install' in the same folder.  

##Usage:

On the command line:
>node run.js [path to download folder] [form id] [API key]

For example:  
>node run.js "C:\OrgSyncFormDownload" 1234 jhljlksdhfsdafjklh...  

##Note:

This will be updated eventually to use the official(?) [OrgSync API Javascript Client](https://github.com/orgsync/orgsync-api-javascript), when I have some time.
