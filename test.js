var clockwork = require('./lib/clockwork.js')({key: 'c22966502f67c2f9b15c175a59393984fac1e6d0'});
var xmlbuilder = require('xmlbuilder');
var xml2js = require('xml2js');

// var clockwork = require('./lib/clockwork.js')();

console.log('init');

// Try to send a message....

// clockwork.sendSms({To: '447561538149', Content:'Test', From:'MattR'}, function(error, resp) {
// 	console.log('Response:',resp);
// 	console.log('Error:',error);
// });


// Send to multiple recipients....
clockwork.sendSms([{To: '447561538149', Content:'Test something', From:'MattR'},
				   {To: '447561538149', Content:'Spam spam spam', From:'MattR2'}], function(error, resp) {
	console.log('Response:',resp);
	console.log('Error:',error);
});

// console.log('SENDING TO ONE');




clockwork.sendSms({To: '447561538149', Content:'Spam spam spam', From:'MattR'}, function(error, resp) {
	console.log('Response:',resp);
	console.log('Error:',error);
});

// var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Message_Resp><SMS_Resp><To>123</To><MesssgeId>1234</MesssgeId></SMS_Resp></Message_Resp>';

// var parser = new xml2js.Parser({explicitArray:true, normalizeTags:true});

// parser.parseString(xml, function(error, data) {
// 	console.log(data);
// });


// clockwork.sendSms([{To:'447561538149', Content: 'Test1'},{To:'447561538149', Content: 'Test2'}], null);

clockwork.getBalance(function(resp,error) {
	console.log('I have the response',resp,error);
});	

// var xml = '<Message_Resp><ErrNo>17</ErrNo><ErrDesc>Invalid Source IP</ErrDesc></Message_Resp>';

// var parser = new xml2js.Parser({explicitArray:false});
// parser.parseString(xml,function(error, data) {
//  console.log(data);
//  console.log(JSON.stringify(data));
//  });





// // var sms = { Message: 
// //    { SMS: { To: '447561538149', Content: 'Test' },
// //      Key: 'c22966502f67c2f9b15c175a59393984fac1e6d0' } };

// // var xml = xmlbuilder.create(sms,{version: '1.0', encoding: 'UTF-8', standalone: true});
// console.log(xml.end({ pretty: true, indent: '  ', newline: '\n' }));