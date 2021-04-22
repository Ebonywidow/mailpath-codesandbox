
module.exports = function configJSON(req) {
    return {
        workflowApiVersion: "1.1",
        metaData: {
            icon: "images/MailPath_Icon_Purple.png",
            iconSmall: "images/MailPath_Icon_PurpleSmall.png",
            category: "message"
        },
        type: "REST",
        lang: {
            "en-US": {
                name: "MailPath",
                description: "",
                step1Label: "Configure Activity"
            }
        },
        arguments: {
            execute: {
                inArguments: [
                    {
                        emailAddress: "{{Contact.Attribute.CustomActivity.EmailAddress}}"
                    }
                ],
                outArguments: [],
                url: `https://${req.headers.host}/journeybuilder/execute`,
                verb: "POST",
                body: "",
                header: "",
                format: "json",
                useJwt: true,
                timeout: 10000
            }
        },
        configurationArguments: {
            applicationExtensionKey: "feee0e74-6201-4848-840c-02cfe66e4072",
            save: {
                url: `https://${req.headers.host}/journeybuilder/save`,
                verb: "POST",
                useJwt: true
            },
            publish: {
                url: `https://${req.headers.host}/journeybuilder/publish`,
                verb: "POST",
                useJwt: true
            },
            stop: {
                url: `https://${req.headers.host}/journeybuilder/stop`,
                verb: "POST",
                useJwt: true
            },
            validate: {
                url: `https://${req.headers.host}/journeybuilder/validate`,
                verb: "POST",
                useJwt: true
            }
        },
        wizardSteps: [
            { label: "Products", key: "step1" },
            { label: "Configure", key: "step2" },
            { label: "Queue & Summary", key: "step3" }
        ],
        userInterfaces: {
            configModal: {
                height: 627,
                width: 967,
                fullscreen: false
            }
        },
        schema: {
            arguments: {
                execute: {
                    inArguments: [],
                    outArguments: []
                }
            }
        }
    };
};



