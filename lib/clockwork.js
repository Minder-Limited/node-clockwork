/*
 * node-clockwork
 *
 * Mediaburst Clockwork API wrapper for Node.js
 *
 * Copyright (c) 2012 Wesley Mason <wes@1stvamp.org>
 * See LICENSE file for rights.
 */

var request = require('request');
var querystring = require('querystring');
var xmlbuilder = require('xmlbuilder');
var xml2js = require('xml2js');
var util = require('util');

var BASE_URLS = {
    'sms': 'https://api.clockworksms.com/xml/send.aspx',
    'balance': 'https://api.clockworksms.com/xml/balance'
}

var ClockworkApi = function (auth) {

    var rootRequest = {};

    if (auth && auth.key) {
        rootRequest.key = auth.key;
    }
    else if (auth && auth.username && auth.password) {
        rootRequest.username = auth.username;
        rootRequest.password = auth.password;
    }
    else {
        throw new Error('You must pass either an API key OR a username and password.');
    }

    this.parser = new xml2js.Parser({ explicitArray: false, normalizeTags: true });

    /**
      * See http://www.mediaburst.co.uk/api/doc/xml/check-credit/
      */
    this.getBalance = function (callback) {
        if (!callback) {
            throw new Error('Please provide a callback.');
        }

        var _this = this;
        var blankPayload = util._extend({}, rootRequest);
        var payload = { Message: blankPayload };

        var xml = xmlbuilder.create(payload, { version: '1.0', encoding: 'UTF-8' }).end();

        // console.log ('PAYLOAD', util.inspect(payload, false, null));

        request({
            'uri': BASE_URLS.balance,
            'method': 'get',
            'body': xml
        },
            function (error, response, body) {
                var credit = null;
                if (error) {
                    callback(error, null);
                }
                else {
                    _this.parser.parseString(body, function (error, data) {
                        if (!error) {
                            credit = {
                                balance: data.balance_resp.balance,
                                accountType: data.balance_resp.accounttype,
                                currency: data.balance_resp.currency
                            };
                        }
                        callback(error, credit);
                    });
                }
            }
        );
    };


    /**
      * See http://www.mediaburst.co.uk/api/doc/xml/send-sms/
      */
    this.sendSms = function (messages, callback) {
        if (!messages) {
            throw new Error('Please provide options for sending the SMS. At the very least to and content.');
        }

        var _this = this;

        var blankPayload = util._extend({}, rootRequest);
        var payload = { Message: blankPayload };

        // GT: Bugfix to wrapper to enable multiple recipients
        // if (messages instanceof Array){
        //     var smsArray = [];
        //     for (var i = 0; i < messages.length; i ++) {
        //         smsArray.push({SMS:messages[i]});
        //     };
        //     payload.Message['#list'] = smsArray;
        // } else {
        payload.Message.SMS = messages; // Should work with arrays (multiple messages) or a single object literal
        // }

        var xml = xmlbuilder.create(payload, { version: '1.0', encoding: 'UTF-8' }).end();

        request({
            'uri': BASE_URLS.sms,
            'method': 'post',
            'body': xml
        },
            function (error, response, body) {
                var resp = null;

                if (error) {
                    callback(util._extend({ success: false }, error), null);
                } else {
                    _this.parser.parseString(body, function (error, data) {
                        if (!error) {
                            var formattedResponses = [];

                            if (data && 'message_resp' in data) {
                                // Check for general error
                                if ('errno' in data.message_resp) {
                                    error = undefined
                                    if ('errdesc' in data.message_resp) {
                                        error = { success: false, errNo: data.message_resp.errno, errDesc: data.message_resp.errdesc };
                                    } else {
                                        error = { success: false, errNo: data.message_resp.errno, errDesc: "Unknown" };
                                    }
                                } else {
                                    // Make sure the responses is an array
                                    var responses = (data.message_resp.sms_resp instanceof Array) ?
                                        data.message_resp.sms_resp : [data.message_resp.sms_resp];

                                    for (var respIdx = 0; respIdx < responses.length; respIdx++) {
                                        var localResp = responses[respIdx];
                                        let success = true
                                        let errorNumber = ''
                                        let errorDescription = ''
                                        if ('errno' in localResp) {
                                            success = false
                                            errorNumber = localResp.errno
                                        }

                                        if ('errdesc' in localResp) {
                                            errorDescription = localResp.errdesc
                                        }

                                        formattedResponses.push({
                                            success: success,
                                            errNo: errorNumber,
                                            errDesc: errorDescription,
                                            id: localResp.messageid || '',
                                            to: localResp.to || ''
                                        });
                                    };

                                    resp = { responses: formattedResponses };
                                }
                            } else {
                                if (data) {
                                    if (body && body.includes("504 Gateway Time-out")) {
                                        error = { success: false, errNo: 97, errDesc: "504 Gateway Timeout" };
                                    } else if (body && body.includes("503 Service Unavailable")) {
                                        error = { success: false, errNo: 97, errDesc: "503 Service Unavailable" };
                                    } else {
                                        error = { success: false, errNo: 98, errDesc: "Malformed response" };
                                    }
                                } else {
                                    error = { success: false, errNo: 99, errDesc: "No data in response" };
                                }
                            }
                        }

                        callback(error, resp);
                    });
                }
            }
        );
    };

    return this;
}

module.exports = function (auth) {
    return ClockworkApi(auth);
};
