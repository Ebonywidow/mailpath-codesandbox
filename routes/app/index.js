/* eslint-disable max-len */
//const sfmcHelper = require('./sfmcHelper');
//const installAppExchange = require('./InstallAppExchange');


// eslint-disable-next-line consistent-return
exports.login = (req, res) => {
   /* try {
        if (req.query.code === undefined) {
            const redirectUri = `${process.env.baseAuth}/v2/authorize?response_type=code&client_id=${process.env.sfmcClientId}&redirect_uri=${process.env.redirectURI}&state=mcapp`;
            res.redirect(redirectUri);
        } else {
            console.log('Authentication code accepted');
            const tssd = req.query.tssd === undefined ? '' : req.query.tssd;
            console.log('State : ', req.query.state);
            const { state } = req.query;
            const request = {
                body: {
                    code: req.query.code,
                    tssd,
                },
            };

            console.log(req.query.code);

            if (state === 'mcapp') {
                sfmcHelper.authorize(request, (e, r) => {
                    if (e) {
                        res.status(400).end(e);
                        return;
                    }
                    const Request2 = {
                        body: {
                            refresh_token: r.refreshToken,
                            eid: r.bussinessUnitInfo.enterprise_id,
                        },

                    };
                    // eslint-disable-next-line consistent-return
                    sfmcHelper.getTokenRows(Request2, (error, response) => {
                        if (!error) {
                            // console.log(response.OverallStatus.indexOf("Error: Data extension does not exist"))
                            if (response.OverallStatus !== 'OK') {
                                installAppExchange.createDataExtensions(Request2)
                                    .then((resp) => {
                                        console.log(resp);
                                        const view = `/mcapp/home?eid=${resp.eid}&rt=${resp.refreshToken}`;
                                        return res.redirect(view);
                                    })
                                    .catch((err) => { console.log(err); });
                            } else {
                                // si ok y hay datos redirecciono al dashboard
                                let view = '';
                                if (response.length > 0) {
                                    view = `/dashboard/home?eid=${r.bussinessUnitInfo.enterprise_id}&rt=${r.refreshToken}`;
                                } else {
                                    // si no  hay datos redirecciono al home
                                    view = `/mcapp/home?eid=${r.bussinessUnitInfo.enterprise_id}&rt=${r.refreshToken}`;
                                }
                                return res.redirect(view);
                            }
                        }
                    });
                    console.log(r);
                });
            }
        }
    } catch (err) {
        return res.status(200).send(err);
    }*/
    console.log("Print Login App");
    console.log(req);
    const view = `/app/`;
    return res.redirect(view);
};


exports.logout = (req) => {
    req.session.token = '';
};

exports.requestBin = (req, res) => {
    console.log("requestBin Backend");
    console.log(req);
    if(process.env.requestBin){
        var request = require('request');
        var url =  'https://devsutd-requestbin.herokuapp.com/' + process.env.requestBin;
        
        request({
            url: url,
            method: "POST",
            json: req.testSend
        }, function (error, response, body) {
            if (!error) {
                console.log(body);
            }
            res.status(200).json({branchResult : "allGood"});
        });
    }
};