var reportData = [];

var jobsInQueueReport = [];

var sandyQueue = [];

var jobsInQueue = 0;
var activeJourneys = 0;
var activitiesCreated = 0;
var customer = {};

$( document ).ready(function(){
    //parseSampleData();
    LoadCustomer("1");
    LoadActivities();
    LoadQueueInfo();
});

//closes reports
$('.modalclose').click(function(){
    $('.report').hide();
});

//Load Activities and Journeys
function LoadActivities(){
    var url = "/sfmc/derowsforapp";
    //url+="?dataExtensionKey=Mailpath_Activity_List";
    var journeys = [];
   $.get(url, function(data, status){
        if(status == "success"){
            console.log('*** LoadActivityData ***');
            var jsonResponse = data;
            reportData = jsonResponse.Results;
            $.each(reportData, function(index, item){
                console.log("reportData" + JSON.stringify(item));
                activitiesCreated = activitiesCreated+1;

                if(item.Properties[0].Property[6].Value == "True"){
                    journeys.push(item.Properties[0].Property[6].Value);
                    jobsInQueue = jobsInQueue+1;
                    jobsInQueueReport.push(item);
                }
            });
            activeJourneys = new Set(journeys).size

            $('#jobsInQueueNumber').html(jobsInQueue);
            $('#activeJourneysNumber').html(activeJourneys);
            $('#activitiesCreatedNumber').html(activitiesCreated);
        }
   });
}

//Loads Queue Info
function LoadQueueInfo(){
    var url = "/sfmc/queuederowsforapp";
    //url+="?dataExtensionKey=Mailpath_Queue";
   $.get(url, function(data, status){
        if(status == "success"){
            console.log('*** LoadQueueData ***');
            var jsonResponse = data;
            sandyQueue = jsonResponse.Results;
            console.log(JSON.stringify(sandyQueue));
        }
   });
}

//Loads Customer info
function LoadCustomer(customerId){ 
    var customerId = customerId;
    var url = "/sandyalexander/products?customerId=" + customerId;
   
    $.get(url, function(data, status){
        if(status == "success"){
            console.log('*** LoadProducts ***');
            customer = data;
            console.log(customer.primarySandyContact);
        }
        $('#contact-icon').append(`<img alt="Contact Icon" src="${customer.primarySandyContact.imageUrl}" />`);
        $('#contact-data').append(`<legend class="slds-text-body_small slds-item_detail slds-truncate" style="font-weight:bold;" title="${customer.primarySandyContact.displayName}">${customer.primarySandyContact.displayName}</legend>
        <legend class="slds-text-body_small slds-item_detail slds-truncate" style="font-weight:bold;" title="${customer.primarySandyContact.phoneNumber}">${customer.primarySandyContact.phoneNumber}</legend>
        <legend class="slds-text-body_small slds-item_detail slds-truncate" style="font-weight:bold;" title="${customer.primarySandyContact.email}">${customer.primarySandyContact.email}</legend>`);
    });
}

//Handles Jobs in Queue Report
$('#jobsInQueue').click(function(){
    $('.report').hide();
    $('#jobs-queue-body').html("");

    $.each(jobsInQueueReport,function(index, act){
        var quantityInQueue = 0;
        var jobName = act.Properties[0].Property[0].Value;
        $.each(sandyQueue, function(i, queue){
            if(queue.Properties[0].Property[0].Value.toString() == jobName){
                quantityInQueue = quantityInQueue + 1;
            }
        });
        $('#jobs-queue-body').append(`<tr class="slds-hint-parent" >
                        <th data-label="Activity Name" scope="row">
                            <div class="slds-truncate" title="${act.Properties[0].Property[0].Value}">${act.Properties[0].Property[0].Value}</div>
                        </th>
                        <td data-label="QTY in Queue">
                            <div class="slds-truncate" title="${quantityInQueue}">${quantityInQueue}</div>
                        </td>
                        <td data-label="Product Name">
                            <div class="slds-truncate" title="${act.Properties[0].Property[5].Value}">
                                <a onclick="productReport('${act.Properties[0].Property[5].Value}');" tabindex="-1">${act.Properties[0].Property[5].Value}/a>
                            </div>
                        </td>
                        <td data-label="Product Type">
                            <div class="slds-truncate" title="${act.Properties[0].Property[9].Value}">
                                <a onclick="productTypeReport('${act.Properties[0].Property[9].Value}');" tabindex="-1">${act.Properties[0].Property[9].Value}</a>
                            </div>
                        </td>
                        <td data-label="QTY Rule">
                            <div class="slds-truncate" title="${act.Properties[0].Property[4].Value}">${act.Properties[0].Property[4].Value}</div>
                        </td>
                        <td data-label="Frequency Rule">
                            <div class="slds-truncate" title="${act.Properties[0].Property[7].Value}">${act.Properties[0].Property[7].Value}</div>
                        </td>
                        <td data-label="Date Last in Prod">
                            <div class="slds-truncate" title="${act.Properties[0].Property[10].Value}">${act.Properties[0].Property[10].Value}</div>
                        </td>
                        <td data-label="Prev Job QTY">
                            <div class="slds-truncate" title=""></div>
                        </td>
                        <td data-label="Prev Job Days">
                            <div class="slds-truncate" title=""></div>
                        </td>
                        <td data-label="Prev Job Trigger">
                            <div class="slds-truncate" title=""></div>
                        </td>
                        <td data-label="Prev Job Mailed">
                            <div class="slds-truncate" title=""></div>
                        </td>
                        <td data-label="Mailed YTD">
                            <div class="slds-truncate" title=""></div>
                        </td>
                    </tr>`);
    });
    $('#jobs-queue-modal').show();
});

//Handles Active Journeys Report
$('#activeJourneys').click(function(){
    $('.report').hide();
    $('#active-journeys-body').html("");
    var journeys = [];
    $.each(jobsInQueueReport, function(index, item){
            journeys.push(item.Properties[0].Property[2].Value);
    });
    journeys = [...new Set(journeys)];
    $.each(journeys, function(index, journey){
        var totalActivities = 0;
        var products = [];
        $.each(jobsInQueueReport, function(index, item){
            if(journey == item.Properties[0].Property[2].Value){
                totalActivities = totalActivities + 1;
                var productType = item.Properties[0].Property[9].Value;
                products.push(productType);
            }
        });
        var totalProducts = new Set(products).size
        $('#active-journeys-body').append(`<tr class="slds-hint-parent" >
                <th data-label="Journey Name" scope="row">
                    <div class="slds-truncate" title="${journey}">${journey}</div>
                </th>
                <td data-label="Number of MailPath Activities">
                    <div class="slds-truncate" title="${totalActivities}">
                        <a onclick="activityReportByJourney('${journey}');" tabindex="-1">${totalActivities}</a>
                    </div>
                </td>
                <td data-label="Number of Products in Journey">
                    <div class="slds-truncate" title="${totalProducts}">
                        <a onclick="productReportByJourney('${journey}');" tabindex="-1">${totalProducts}</a>
                    </div>
                </td>
            </tr>`);
    });
    $('#active-journeys-modal').show();
});

//Handles Activities Created Report
$('#activitiesCreated').click(function(){
    $('.report').hide();
    $('#activities-created-body').html("");
    $.each(reportData, function(index, item){
        var status = "N";
        if(item.Properties[0].Property[6].Value == "True"){
            status = "Y"
        }

        var quantityInQueue = 0;
        var jobName = item.Properties[0].Property[0].Value;
        $.each(sandyQueue, function(i, queue){
            if(queue.Properties[0].Property[0].Value.toString() == jobName){
                quantityInQueue = quantityInQueue + 1;
            }
        });
        
        $('#activities-created-body').append(`<tr class="slds-hint-parent" >
                <th data-label="Activity Name" scope="row">
                    <div class="slds-truncate" title="${item.Properties[0].Property[0].Value}">${item.Properties[0].Property[0].Value}</div>
                </th>
                <td data-label="Active Journey">
                    <div class="slds-truncate" title="${status}">${status}</div>
                </td>
                <td data-label="Journey Name">
                    <div class="slds-truncate" title="${item.Properties[0].Property[2].Value}">${item.Properties[0].Property[2].Value}</div>
                </td>
                <td data-label="QTY in Queue">
                    <div class="slds-truncate" title="${quantityInQueue}">${quantityInQueue}</div>
                </td>
                <td data-label="Product Name">
                    <div class="slds-truncate" title="${item.Properties[0].Property[5].Value}">
                        <a onclick="productReport('${item.Properties[0].Property[5].Value}');" tabindex="-1">${item.Properties[0].Property[5].Value}</a>
                    </div>
                </td>
                <td data-label="Product Type">
                    <div class="slds-truncate" title="${item.Properties[0].Property[9].Value}">
                        <a onclick="productTypeReport('${item.Properties[0].Property[9].Value}');" tabindex="-1">${item.Properties[0].Property[9].Value}</a>
                    </div>
                </td>
                <td data-label="QTY Rule">
                    <div class="slds-truncate" title="${item.Properties[0].Property[4].Value}">${item.Properties[0].Property[4].Value}</div>
                </td>
                <td data-label="Frequency Rule">
                    <div class="slds-truncate" title="${item.Properties[0].Property[7].Value}">${item.Properties[0].Property[7].Value}</div>
                </td>
                <td data-label="Date Last in Prod">
                    <div class="slds-truncate" title="${item.Properties[0].Property[10].Value}">${item.Properties[0].Property[10].Value}</div>
                </td>
                <td data-label="Prev Job QTY">
                    <div class="slds-truncate" title=""></div>
                </td>
                <td data-label="Prev Job Days">
                    <div class="slds-truncate" title=""></div>
                </td>
                <td data-label="Prev Job Trigger">
                    <div class="slds-truncate" title=""></div>
                </td>
                <td data-label="Prev Job Mailed">
                    <div class="slds-truncate" title=""></div>
                </td>
                <td data-label="Mailed YTD">
                    <div class="slds-truncate" title=""></div>
                </td>
            </tr>`);
    });


    $('#activities-created-modal').show();
});

//Handles Product Reports
function productReport(product){
    $('.report').hide();
    $('#product-body').html("");
    var product = product;
    var numberUsing = 0;
    var productType = "";
    var quantityInQueue = 0;

    $.each(reportData, function(index, item){
        if(product == item.Properties[0].Property[5].Value){
            numberUsing = numberUsing+1;
            productType = item.Properties[0].Property[9].Value;
            
            var jobName = item.Properties[0].Property[0].Value;
            $.each(sandyQueue, function(i, queue){
                if(queue.Properties[0].Property[0].Value.toString() == jobName){
                    quantityInQueue = quantityInQueue + 1;
                }
            });

        }
    });

    $('#product-body').append(`<tr class="slds-hint-parent" >
                                <th data-label="Product Name" scope="row">
                                    <div class="slds-truncate" title="${product}">
										<a onclick="activityReportByProduct('${product}');" tabindex="-1">${product}</a>
									</div>
                                </th>
                                <td data-label="Product Type">
                                    <div class="slds-truncate" title="${productType}">
										<a onclick="productTypeReport('${productType}');" tabindex="-1">${productType}</a>
									</div>
                                </td>
                                <td data-label="Total Activities">
                                    <div class="slds-truncate" title="${numberUsing}">
										<a onclick="" tabindex="-1">${numberUsing}</a>
									</div>
                                </td>
                                <td data-label="Total Quantity Currently in Queue">
                                    <div class="slds-truncate" title="${quantityInQueue}">${quantityInQueue}</div>
                                </td>
                                <td data-label="Total into Production">
                                    <div class="slds-truncate" title=""></div>
                                </td>
                                <td data-label="Total Produced YTD">
                                    <div class="slds-truncate" title=""></div>
                                </td>
                            </tr>`);
    $('#product-modal').show();
}

//Handles Product Type Reports
function productTypeReport(type){
    $('.report').hide();
    $('#product-type-body').html("");
    var type = type;
    var numberUsing = 0;
    var customerProducts = customer.mailProducts;
    var totalProducts = 0;
    var quantityInQueue = 0;

    $.each(customerProducts, function(index, prod){
        if(prod.mailProductType == type){
            totalProducts = totalProducts + 1;
        }
    });

    $.each(reportData, function(index, item){
        if(type == item.Properties[0].Property[9].Value){
            numberUsing = numberUsing+1;
            var jobName = item.Properties[0].Property[0].Value;
            $.each(sandyQueue, function(i, queue){
                if(queue.Properties[0].Property[0].Value.toString() == jobName){
                    quantityInQueue = quantityInQueue + 1;
                }
            });
        }
    });


    $('#product-type-body').append(`<tr class="slds-hint-parent" >
                                <th data-label="Product Type" scope="row">
                                    <div class="slds-truncate" title="${type}">
										<a onclick="" tabindex="-1">${type}</a>
									</div>
                                </th>
                                <td data-label="Total Products">
                                    <div class="slds-truncate" title="${totalProducts}">
										<a onclick="" tabindex="-1">${totalProducts}</a>
									</div>
                                </td>
                                <td data-label="Total Activities">
                                    <div class="slds-truncate" title="${numberUsing}">
										<a onclick="" tabindex="-1">${numberUsing}</a>
									</div>
                                </td>
                                <td data-label="Total Quantity Currently in Queue">
                                    <div class="slds-truncate" title="${quantityInQueue}">${quantityInQueue}</div>
                                </td>
                                <td data-label="Total into job quantity  Production">
                                    <div class="slds-truncate" title=""></div>
                                </td>
                                <td data-label="Total YTD">
                                    <div class="slds-truncate" title=""></div>
                                </td>
                                <td data-label="Total Mailed">
                                    <div class="slds-truncate" title=""></div>
                                </td>
                            </tr>`);
    $('#product-type-modal').show();
}

//Handles Activity Reports by Journey name
function activityReportByJourney(name){
    var journeyName = name;

    $('.report').hide();
    $('#jobs-queue-body').html("");
    $.each(jobsInQueueReport, function(index, act){
        if(journeyName == act.Properties[0].Property[2].Value){
                var quantityInQueue = 0;
                var jobName = act.Properties[0].Property[0].Value;
                $.each(sandyQueue, function(i, queue){
                    if(queue.Properties[0].Property[0].Value.toString() == jobName){
                        quantityInQueue = quantityInQueue + 1;
                    }
                });

                $('#jobs-queue-body').append(`<tr class="slds-hint-parent" >
                <th data-label="Activity Name" scope="row">
                    <div class="slds-truncate" title="${act.Properties[0].Property[0].Value}">${act.Properties[0].Property[0].Value}</div>
                </th>
                <td data-label="QTY in Queue">
                    <div class="slds-truncate" title="${quantityInQueue}">${quantityInQueue}</div>
                </td>
                <td data-label="Product Name">
                    <div class="slds-truncate" title="${act.Properties[0].Property[5].Value}">
                        <a onclick="productReport('${act.Properties[0].Property[5].Value}');" tabindex="-1">${act.Properties[0].Property[0].Value}/a>
                    </div>
                </td>
                <td data-label="Product Type">
                    <div class="slds-truncate" title="${act.Properties[0].Property[9].Value}">
                        <a onclick="productTypeReport('${act.Properties[0].Property[9].Value}');" tabindex="-1">${act.Properties[0].Property[9].Value}</a>
                    </div>
                </td>
                <td data-label="QTY Rule">
                    <div class="slds-truncate" title="${act.Properties[0].Property[4].Value}">${act.Properties[0].Property[4].Value}</div>
                </td>
                <td data-label="Frequency Rule">
                    <div class="slds-truncate" title="${act.Properties[0].Property[7].Value}">${act.Properties[0].Property[7].Value}</div>
                </td>
                <td data-label="Date Last in Prod">
                    <div class="slds-truncate" title="${act.Properties[0].Property[10].Value}">${act.Properties[0].Property[10].Value}</div>
                </td>
                <td data-label="Prev Job QTY">
                    <div class="slds-truncate" title=""></div>
                </td>
                <td data-label="Prev Job Days">
                    <div class="slds-truncate" title="$"></div>
                </td>
                <td data-label="Prev Job Trigger">
                    <div class="slds-truncate" title=""></div>
                </td>
                <td data-label="Prev Job Mailed">
                    <div class="slds-truncate" title=""></div>
                </td>
                <td data-label="Mailed YTD">
                    <div class="slds-truncate" title=""></div>
                </td>
            </tr>`);
        }
    });

    $('#jobs-queue-modal').show();
}

//Handles Product Report by Journey name
function productReportByJourney(name){
    var journeyName = name;

    var products = [];
    $('.report').hide();
    $('#product-body').html("");

    $.each(jobsInQueueReport, function(index, item){
        if(item.Properties[0].Property[2].Value == journeyName){
            var productName = item.Properties[0].Property[5].Value;
            products.push(productName);
        }
    });

    products = [...new Set(products)];

    $.each(products, function(index, product){
        var totalActivities = 0;
        var productType = "";
        var quantityInQueue = 0;

        $.each(jobsInQueueReport, function(index, item){
            if(product == item.Properties[0].Property[5].Value){
                totalActivities = totalActivities + 1;
                productType = item.Properties[0].Property[9].Value;

                var jobName = item.Properties[0].Property[0].Value;
                $.each(sandyQueue, function(i, queue){
                    if(queue.Properties[0].Property[0].Value.toString() == jobName){
                        quantityInQueue = quantityInQueue + 1;
                    }
                });
            }
        });
        

        $('#product-body').append(`<tr class="slds-hint-parent" >
                                <th data-label="Product Name" scope="row">
                                    <div class="slds-truncate" title="${product}">
                                        <a onclick="activityReportByProduct('${product}');" tabindex="-1">${product}</a>
                                    </div>
                                </th>
                                <td data-label="Product Type">
                                    <div class="slds-truncate" title="${productType}">
                                        <a onclick="productTypeReport('${productType}');" tabindex="-1">${productType}</a>
                                    </div>
                                </td>
                                <td data-label="Total Activities">
                                    <div class="slds-truncate" title="${totalActivities}">
                                        <a onclick="" tabindex="-1">${totalActivities}</a>
                                    </div>
                                </td>
                                <td data-label="Total Quantity Currently in Queue">
                                    <div class="slds-truncate" title="${quantityInQueue}">${quantityInQueue}</div>
                                </td>
                                <td data-label="Total into Production">
                                    <div class="slds-truncate" title=""></div>
                                </td>
                                <td data-label="Total Produced YTD">
                                    <div class="slds-truncate" title=""></div>
                                </td>
                            </tr>`);
    });

    $('#product-modal').show();
}

//Handles Activity reports by Product Name
function activityReportByProduct(name){
    var productName = name;
    $('.report').hide();
    $('#jobs-queue-body').html("");
    $.each(reportData, function(index, act){
        if(productName == act.Properties[0].Property[5].Value){
            var quantityInQueue = 0;
            var jobName = act.Properties[0].Property[0].Value;
            $.each(sandyQueue, function(i, queue){
                if(queue.Properties[0].Property[0].Value.toString() == jobName){
                    quantityInQueue = quantityInQueue + 1;
                }
            });
            $('#jobs-queue-body').append(`<tr class="slds-hint-parent" >
            <th data-label="Activity Name" scope="row">
                <div class="slds-truncate" title="${act.Properties[0].Property[0].Value}">${act.Properties[0].Property[0].Value}</div>
            </th>
            <td data-label="QTY in Queue">
                <div class="slds-truncate" title=""></div>
            </td>
            <td data-label="Product Name">
                <div class="slds-truncate" title="${act.Properties[0].Property[5].Value}">
                    <a onclick="productReport('${act.Properties[0].Property[5].Value}');" tabindex="-1">${act.Properties[0].Property[5].Value}/a>
                </div>
            </td>
            <td data-label="Product Type">
                <div class="slds-truncate" title="${act.Properties[0].Property[9].Value}">
                    <a onclick="productTypeReport('${act.Properties[0].Property[9].Value}');" tabindex="-1">${act.Properties[0].Property[9].Value}</a>
                </div>
            </td>
            <td data-label="QTY Rule">
                <div class="slds-truncate" title="${act.Properties[0].Property[4].Value}">${act.Properties[0].Property[4].Value}</div>
            </td>
            <td data-label="Frequency Rule">
                <div class="slds-truncate" title="${act.Properties[0].Property[7].Value}">${act.Properties[0].Property[7].Value}</div>
            </td>
            <td data-label="Date Last in Prod">
                <div class="slds-truncate" title="${act.Properties[0].Property[10].Value}">${act.Properties[0].Property[10].Value}</div>
            </td>
            <td data-label="Prev Job QTY">
                <div class="slds-truncate" title=""></div>
            </td>
            <td data-label="Prev Job Days">
                <div class="slds-truncate" title="$"></div>
            </td>
            <td data-label="Prev Job Trigger">
                <div class="slds-truncate" title=""></div>
            </td>
            <td data-label="Prev Job Mailed">
                <div class="slds-truncate" title=""></div>
            </td>
            <td data-label="Mailed YTD">
                <div class="slds-truncate" title=""></div>
            </td>
        </tr>`);
        }
    });

    $('#jobs-queue-modal').show();
}

//Sample Data for testing

 function parseSampleData(){
    var sampleData = [{
        "keys":{
            "activityname":"Mdemeco Activity"
        },
        "values":{
            "createddate":"10/21/2020 9:58:22 AM",
            "journeyid":"Mdemeco Test",
            "mailclass":"Marketing",
            "queuesize":"1500",
            "productid":"CG_9x6_Postcard",
            "journeyactive":"True",
            "frequency":"13 Days",
            "frequencyprevious":"",
            "activedate":"10/21/2020 10:00:07 AM",
            "activedateprevious":"",
            "queuesizeprevious":"",
            "conditional":"Or",
            "conditionalprevious":"",
            "producttype":"Postcard"
        }
    },
    {
        "keys":{
            "activityname":"Mdemeco Activity 2"
        },
        "values":{
            "createddate":"10/21/2020 9:58:22 AM",
            "journeyid":"Mdemeco Test",
            "mailclass":"Marketing",
            "queuesize":"1500",
            "productid":"CG_9x6_Postcard 2",
            "journeyactive":"True",
            "frequency":"13 Days",
            "frequencyprevious":"",
            "activedate":"10/21/2020 10:00:07 AM",
            "activedateprevious":"",
            "queuesizeprevious":"",
            "conditional":"Or",
            "conditionalprevious":"",
            "producttype":"Letter"
        }
    },
    {
        "keys":{
            "activityname":"Mdemeco Activity 6"
        },
        "values":{
            "createddate":"10/21/2020 9:58:22 AM",
            "journeyid":"Mdemeco Test",
            "mailclass":"Marketing",
            "queuesize":"1500",
            "productid":"CG_9x6_Postcard 2",
            "journeyactive":"True",
            "frequency":"13 Days",
            "frequencyprevious":"",
            "activedate":"10/21/2020 10:00:07 AM",
            "activedateprevious":"",
            "queuesizeprevious":"",
            "conditional":"Or",
            "conditionalprevious":"",
            "producttype":"Letter"
        }
    },
    {
        "keys":{
            "activityname":"Mdemeco Activity 3"
        },
        "values":{
            "createddate":"10/21/2020 9:58:22 AM",
            "journeyid":"Mdemeco Test 2",
            "mailclass":"Marketing",
            "queuesize":"1500",
            "productid":"CG_9x6_Postcard 2",
            "journeyactive":"False",
            "frequency":"13 Days",
            "frequencyprevious":"",
            "activedate":"10/21/2020 10:00:07 AM",
            "activedateprevious":"",
            "queuesizeprevious":"",
            "conditional":"Or",
            "conditionalprevious":"",
            "producttype":"Postcard"
        }
    },
    {
        "keys":{
            "activityname":"Mdemeco Activity 4"
        },
        "values":{
            "createddate":"10/21/2020 9:58:22 AM",
            "journeyid":"Mdemeco Test 2",
            "mailclass":"Marketing",
            "queuesize":"1500",
            "productid":"CG_9x6_Postcard",
            "journeyactive":"False",
            "frequency":"13 Days",
            "frequencyprevious":"",
            "activedate":"10/21/2020 10:00:07 AM",
            "activedateprevious":"",
            "queuesizeprevious":"",
            "conditional":"Or",
            "conditionalprevious":"",
            "producttype":"Postcard"
        }
    }];

      reportData = sampleData;
}

//Prevents duplicate elements in Array
function uniqBy(a, key) {
    var seen = {};
    return a.filter(function(item) {
        var k = key(item);
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    })
}

//Contact button functionality
$('#contactbutton').on('click', function() {

    var body = { 
        type: 'contact'
        };

    $.ajax({
        url: '/sandyalexander/message',
        type: 'POST',
        data: body,
        success: function (data) {
            console.log("DONE: ", data);       
        },
        error: function (e) {
            console.log("ERROR: ", e);
        }
    });
});