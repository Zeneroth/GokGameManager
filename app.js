const express = require('express')
const app = express()
const bodyParser = require('body-parser');
var AWS = require('aws-sdk');
var port = process.env.PORT || 3000;
var instanceID = process.env.instanceID || "i-0c63fea80d960d2d9";
AWS.config.update({ region: 'ap-southeast-1' });
var ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });
app.set('view engine', 'ejs')

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    //res.send('Hello World!')
    var status = "Offline";
    //res.render('index', {serverStatus : status, result:null, error:null});
    var params = {
        InstanceIds: [
            instanceID
        ],
        IncludeAllInstances: true
       };
       ec2.describeInstanceStatus(params, function(err, data) {
           console.log("data :" +  JSON.stringify(data));
           
           if(data.InstanceStatuses.length > 0)
                status = data.InstanceStatuses[0].InstanceState.Name;
         if (err) 
            res.render('index', {serverStatus : status, result:err.message, error:err.stack});
         else    
            res.render('index', {serverStatus : status, result:null, error:null});
        
       });
})

app.post('/start', function (req, res) {
    var params = {
        InstanceIds: [
            instanceID
        ]
    };
    console.log(req.body.Name + " has requested to start server");
    ec2.startInstances(params, function (err, data) {
        if (err) {
            console.log("start error : " + err.message + " stack : " + err.stack );
            res.render('index', 
            { 
                serverStatus: "Unknown",
                result: "Error : " + err.message,
                error: "Stack : " + err.stack 
            });
        }
        else {
            console.log("server successfully started");
            res.render('index', 
            { 
                serverStatus: "Starting",
                result: "Server Start success",
                error: "Requested by : " + req.body.Name
            });
        }
    });

})

app.post('/stop', function (req, res) {
    console.log(req.body.Name + " has requested to stop server");
    var params = {
        InstanceIds: [
            instanceID
        ]
       };
       ec2.stopInstances(params, function(err, data) {
         if (err) {
            console.log("stop error : " + err.message + " stack : " + err.stack );
            res.render('index', 
            { 
                serverStatus: "Unknown",
                result: "Error : " + err.message,
                error: "Stack : " + err.stack 
            });
         } 
         else{
            console.log("server successfully stopped");
            res.render('index', 
            { 
                serverStatus: "Stopping",
                result: "Server Stop success",
                error: "Requested by : " + req.body.Name
            });
         }       
       });

})

app.listen(port, function () {
    console.log('server started')
})