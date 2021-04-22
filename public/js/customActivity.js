define([
    'postmonger'
], function (
    Postmonger
) {
    'use strict';

    var connection = new Postmonger.Session();
    var authTokens = {};
    var payload = {};
    var steps = [ 
        { "label": "Products", "key": "step1" },
        { "label": "Configure", "key": "step2","active":false },
        { "label": "Queue & Summary", "key": "step3","active":false }
     ];
    var currentStep = steps[0];
    var inArgument = {};
    var hasInArguments = false;
    var inArguments = {};
    var eventDefinitionKey = "";
    var typingTimer;
    var jsonResponse = {};
    var product = [];
    var journeyName = "";
    var journeySchema = {};         
    var sandyApiUrl = "https://mailpath-sandbox.sandyinc.com";
    $(window).ready(onRender);
    //$(window).ready(LoadCustomer("1"));
    
    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);

    connection.on('clickedNext', onClickedNext);
    connection.on('clickedBack', onClickedBack);
    connection.on('gotoStep', onGotoStep);

    //Gets the Journey DE name
    connection.on('requestedTriggerEventDefinition', function (eventDefinitionModel) {
        var url = "/sfmc/getdename";
        eventDefinitionKey = eventDefinitionModel.id;
        journeyName = eventDefinitionModel.name;
        url+="?eventId=" + eventDefinitionKey + "&fuelToken=" + authTokens.fuel2token; 
        $.get(url, function(data, status){
            if(status == "success"){
                console.log('*** LoadDeData ***');
                console.log(data);
                var deName = data.dataExtensionName;

                $('#de-name').html(deName);
            }
            else{
                console.log("Fail LoadDeData " + status);
            }
        });
    });
    
    connection.on('requestedSchema', function(data) { 
        console.log('*** Schema ***', JSON.stringify(data));
        journeySchema = data;
    });

    function onRender() {
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger('requestEndpoints');
        connection.trigger('requestTokens');
        connection.trigger('requestSchema');

        connection.trigger('ready');
    }

    function initialize(data) {
        console.log("**** CONFIGURATION ****");
        console.log(data);
        
        if (data) {
            payload = data;
        }
        
        LoadCustomer("1");
        
        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        console.log("InArgs=" + JSON.stringify(inArguments));
        console.log(inArguments);

        $.each(inArguments, function (index, inArgument) {
            $.each(inArgument, function (key, val) {
                
              
            });
        });

        Spinner(false);

        connection.trigger('updateButton', {
            button: 'next',
            text: 'next',
            visible: true
        });
    }

    function onGetTokens(tokens) {
        console.log(tokens);
        authTokens = tokens;
        validateFolder();
        connection.trigger('requestTriggerEventDefinition');
    }

    function onGetEndpoints(endpoints) {
        console.log("***** Ednpoints *****");
        console.log(endpoints);
    }

    function onClickedNext () {
        if (currentStep.key === 'step1') {
            if(validateStep1()) {
                connection.trigger('nextStep');
            } else {
                connection.trigger('ready');
            }
        } else if (currentStep.key ==='step2'){
            if(validateStep2()) {
                connection.trigger('nextStep');
                saveStep2();
            } else {
                connection.trigger('ready');
            } 
        } else {
            save();
        }
    }

    function onClickedBack () {
        connection.trigger('prevStep');
    }

    function onGotoStep (step) {
        showStep(step);
        connection.trigger('ready');
    }

    // Navigates to the corresponding step
    function showStep(step, stepIndex) {
        if (stepIndex && !step) {
            step = steps[stepIndex-1];
        }

        currentStep = step;

        $('.step').hide();

        switch(currentStep.key) {
            case 'step1':
                $('#step1').show();
                connection.trigger('updateButton', {
                    button: 'next',
                    text: 'next',
                    enabled: true
                });
                connection.trigger('updateButton', {
                    button: 'back',
                    visible: false
                });
                break;
            case 'step2':
                if(validateStep1()){
                    LoadProductDetail();
                    $('#step2').show();
                    connection.trigger('updateButton', {
                        button: 'back',
                        visible: true
                    });
                    connection.trigger('updateButton', {
                        button: 'next',
                        text: 'next',
                        visible: true
                    });
                }
                break;
            case 'step3':
                if(validateStep2()){
                    loadSummaryData();
                    $('#step3').show();
                    connection.trigger('updateButton', {
                        button: 'back',
                        visible: true
                    });
                    connection.trigger('updateButton', {
                        button: 'next',
                        text: 'done',
                        visible: true
                    });
                }
                break;
        }
    }

    function validateFolder(){
        var url = "/sfmc/validatefolder";
        var body = { 
            token: authTokens.fuel2token,
        };

        $.ajax({
            url: url,
            type: 'POST',
            data: body,
            success: function (data) {
                console.log("Folder created: ", data);
                createStaticDE(authTokens.fuel2token, data[0].toString());
		createStaticQueueDE(authTokens.fuel2token, data[0].toString());
		createStaticSyncDE(authTokens.fuel2token, data[0].toString());
            },
            error: function (e) {
                console.log("Folder creating error: ", e);
            }
        });
    }

    function createStaticDE(oauthToken, folderID){
	    
        var body = { 
            token: oauthToken,
            catID: folderID
        };

        $.ajax({
            url: '/create/staticde/',
            type: 'POST',
            data: body,
            success: function (data) {
                console.log("Static DE Success: ", data);
            },
            error: function (e) {
                console.log("Static DE Error: ", e);
            }
        });
    }
	
    function createStaticQueueDE(oauthToken, folderID){
	    
        var body = { 
            token: oauthToken,
            catID: folderID
        };

        $.ajax({
            url: '/create/staticdequeue/',
            type: 'POST',
            data: body,
            success: function (data) {
                console.log("Static Queue DE Success: ", data);
            },
            error: function (e) {
                console.log("Static Queue DE Error: ", e);
            }
        });
    }
	
    function createStaticSyncDE(oauthToken, folderID){
	    
        var body = { 
            token: oauthToken,
            catID: folderID
        };

        $.ajax({
            url: '/create/staticdesync/',
            type: 'POST',
            data: body,
            success: function (data) {
                console.log("Static Sync DE Success: ", data);
            },
            error: function (e) {
                console.log("Static Sync DE Error: ", e);
            }
        });
     }

    // Validations for Step 1
    function validateStep1(){
            var validStep1 = false;
            $('.slds-notify').css('visibility', 'hidden');

            $('[id^="pieceselector_"]').each(function() {
                if($(this).css('display') == 'block'){
                    validStep1 = true;
                }
            })

            if (validStep1 == false) {
                $('.slds-theme_error').css('visibility', 'visible');
                $('#errorMessage').html('Please select a Product from the list.');
            }

            return validStep1;
    }

    function validateStep2(){
        var validStep2 = true;
        $('.slds-notify').css('visibility', 'hidden');
        var activityName = $('#activityname').val();

        var mappedFields = Number($('#mappedfieldnum').text());
        var totalFields = Number($('#totalfieldnum').text());;

        if(activityName === ""){
            validStep2 = false;
            $('.slds-theme_error').css('visibility', 'visible');
            $('#errorMessage').html('Please enter an activity name');
            $('#activityname').css('border-color', 'red');
        }

        if($('#nameValidator').val() == "notvalid"){
            validStep2 = false;
            $('.slds-theme_error').css('visibility', 'visible');
            $('#errorMessage').html(activityName + ' in use. <br /> Please create a unique Activity Name to continue.');
            $('#activityname').css('border-color', 'red');
            $('#nameValidator').val('valid');
        }

        if(mappedFields !== totalFields){
            validStep2 = false;
            $('.slds-theme_error').css('visibility', 'visible');
            $('#errorMessage').html('All fields must be mapped before proceeding');
            $('#mappedfieldnum').css('color', 'red');
        }

        return validStep2;
    }

    function save() {
            payload['metaData'].isConfigured = true;

            console.log("**** FINAL CONFIG FOR SAVE ****");
            console.log(payload);
            connection.trigger('updateActivity', payload);
    }

    //Saves step 2 for display in step 3
    function saveStep2(){
        var inArgs = [];
        var arg = {};

        arg.summarytitle = $('#activityname').val();

        arg.summaryproductname = $('#selectedproductname').text();
        arg.summaryproducttype = $('#selectedproducttype').text();

        arg.summaryactivityname = $('#activityname').val();
        arg.summarysize = $('#selectedproductsize').text();
        arg.summarycolors = $('#selectedproductcolors').text();
        arg.summarypaper = $('#selectedproductpaper').text();
        arg.summaryfinishing = $('#selectedproductfinishing').text();

        arg.summaryproductid = $('#selectedproductID').text();

        arg.summarymailclass = $("input[name='mailclass']:checked").val();
        
        arg.summaryquantity = $('#quantity').val();
        arg.summaryqueuerule = $("input[name='queuerule']:checked").val();
        arg.summarycadence = $('#cadence').val();

        arg.summarymappedfields = $('#mappedfieldnum').text();
        arg.summarytotalfields = $('#totalfieldnum').text();

        arg.journeyId = journeyName;
        arg.mappedfields = getMappedFieldsForUI();
        arg.mappedFieldsForQueue = getMappedFields();
        arg.contactKey = getContactKeyFromSchema();
        arg.selectedid = $('.slides_selected').data('prodid');
        
        let url = '/sfmc/saveactivity';
        url+="?token="+authTokens.fuel2token; 
        $.ajax({
            url: url,
            type: 'POST',
            data: arg,
            success: function (data) {
                console.log("data saved: ", data);       
            },
            error: function (e) {
                console.log("Error saving: ", e);
            }
        });
        
        inArgs.push(arg);
            
        payload['arguments'].execute.inArguments = inArgs;
    }

    //Load contact key from DE
    function getContactKeyFromSchema() {
        for (let i = 0; journeySchema.schema.length > i; i += 1) {
            if (journeySchema.schema[i].key.includes("LastName")) {
                return "{{" + journeySchema.schema[i].key + "}}";
            }
        }
        return "";
    }

    //Loads data for display in step 3
    function loadSummaryData(){
        inArguments = payload['arguments'].execute.inArguments;
        inArgument = inArguments[0];

        $('#summarytitle').html(inArgument.summarytitle);

        $('#summaryproductname').html(inArgument.summaryproductname);
        $('#summaryproducttype').html(inArgument.summaryproducttype);

        $('#summaryactivityname').html(inArgument.summaryactivityname);
        $('#summarysize').html(inArgument.summarysize);
        $('#summarycolors').html(inArgument.summarycolors);
        $('#summarypaper').html(inArgument.summarypaper);
        $('#summaryfinishing').html(inArgument.summaryfinishing);

        $('#summaryproductid').html(inArgument.summaryproductid);

        $('#summarymailclass').html(inArgument.summarymailclass);

        $('#summaryquantity').html(inArgument.summaryquantity);
        $('#summaryqueuerule').html(inArgument.summaryqueuerule);
        $('#summarycadence').html(inArgument.summarycadence);

        $('#summarymappedfields').html(inArgument.summarymappedfields);
        $('#summarytotalfields').html(inArgument.summarytotalfields);
    }

    //Shows and hides spinner
    function Spinner(show){
        if(show)
        {
            $('.spinner').show();
            $('.step').hide();
        }
        else
        {
            $('.spinner').hide();
            $('#'+currentStep.key).show();
        }
    }
    
    //Loads products in step 1
    function LoadCustomer(customerId){ 
        var customerId = customerId;
        var url = "/sandyalexander/products?customerId=" + customerId;
        Spinner(true);
        $.get(url, function(data, status){
            if(status == "success"){
                console.log('*** LoadProducts ***');
                jsonResponse = data;
                product = jsonResponse.mailProducts;
                LoadProducts();
                var inArguments = payload['arguments'].execute.inArguments;

                if(inArguments.length > 0){
                    $('#pieceselector_' + inArguments[0].selectedid).show();
                }
            }
        });

        Spinner(false);
    }

    function LoadProducts(){
        $('#pieces-container').html("");
        $.each(product, function(index, item) {
            $('#pieces-container').append(`<div id="piece_${item.mailProductId}" class="slds-grid slds-border_bottom" style="border-bottom-color: rgb(224, 229, 238);position:relative;padding:1.2rem 1.2rem 0rem 1.2rem;">
            <div id="pieceselector_${item.mailProductId}" data-productid="${item.mailProductId}" class="selectoractive"></div>
            <div class="slds-col slds-size_7-of-12">
                <div class="slds-tile__detail" onclick="selectPiece('${item.mailProductId}');" style="cursor:pointer; cursor:hand;z-index:9999999;">
                    <dl class="slds-list_horizontal slds-wrap">
                        <dt class="slds-text-body_small slds-item_label slds-text-color_weak slds-truncate" style="color:rgb(56, 56, 154);font-weight:bold;width:23%;text-align:left;">Product Name:</dt>
                        <dd class="slds-text-body_small slds-item_detail slds-truncate" style="color:black;font-weight:bold;width:77%;">${item.displayName}</dd>
                        <dt class="slds-text-body_small slds-item_label slds-text-color_weak slds-truncate" style="color:rgb(56, 56, 154);font-weight:bold;width:23%;text-align:left;">Product Type:</dt>
                        <dd class="slds-text-body_small slds-item_detail slds-truncate" style="color:black;font-weight:bold;width:77%;">${item.mailProductType}</dd>
                        <dt class="slds-text-body_small slds-item_label slds-text-color_weak slds-truncate" style="color:rgb(56, 56, 154);font-weight:bold;width:23%;text-align:left;">Size:</dt>
                        <dd class="slds-text-body_small slds-item_detail slds-truncate" style="color:black;font-weight:bold;width:77%;">${item.size}</dd>
                        <dt class="slds-text-body_small slds-item_label slds-text-color_weak slds-truncate" style="color:rgb(56, 56, 154);font-weight:bold;width:23%;text-align:left;">Colors:</dt>
                        <dd class="slds-text-body_small slds-item_detail slds-truncate" style="color:black;font-weight:bold;width:77%;">${item.colors}</dd>
                        <dt class="slds-text-body_small slds-item_label slds-text-color_weak slds-truncate" style="color:rgb(56, 56, 154);font-weight:bold;width:23%;text-align:left;">Paper:</dt>
                        <dd class="slds-text-body_small slds-item_detail slds-truncate" style="color:black;font-weight:bold;width:77%;">${item.paper}</dd>
                        <dt class="slds-text-body_small slds-item_label slds-text-color_weak slds-truncate" style="color:rgb(56, 56, 154);font-weight:bold;width:23%;text-align:left;">Finishing:</dt>
                        <dd class="slds-text-body_small slds-item_detail slds-truncate" style="color:black;font-weight:bold;width:77%;">${item.finishing}</dd>
                        <dt class="slds-text-body_small slds-item_label slds-text-color_weak slds-truncate" style="color:rgb(56, 56, 154);font-weight:bold;width:23%;text-align:left;">Product ID</dt>
                        <dd class="slds-text-body_small slds-item_detail slds-truncate" style="color:black;font-weight:bold;width:77%;">${item.paceItemTemplateId}</dd>
                    </dl>
                </div> 
                <div class="" style="padding-top:20px;">
                    <button class="slds-button slds-button_brand requestchanges" style="height:23px;background:rgb(74,74,163);border-color:rgb(74,74,163);" data-requestproductid="${item.mailProductId}" data-requestproductname="${item.displayName}">Request Changes</button>
                </div>                                   
            </div>
            <div class="slds-col slds-size_5-of-12">
                <div class="slds-carousel" id="product-carousel-${item.mailProductId}">
                    <div class="slds-carousel__stage" >
                        <div class="slds-carousel__panels slds-box" id="img-carousel-container-${item.mailProductId}" style="transform:translateX(-0%);border:2px solid rgb(224, 229, 238);padding:5px;height:140px;cursor:pointer;">

                        </div>
                        <ul class="slds-carousel__indicators" role="tablist" id="img-carousel-selector-${item.mailProductId}">
                            
                        </ul>
                    </div>
                </div>
            </div>
        </div>`);

        var images = item.images;
        var productId = item.mailProductId;
        $.each(images, function(index, image){
            if(index == "0"){
                $('#img-carousel-container-' + productId).append(`
                    <div id="image-${image.imageSeq}" class="slds-carousel__panel fade slides_${image.mailProductId}" role="tabpanel" aria-hidden="true" aria-labelledby="image-${image.imageSeq}" data-prodid="${image.mailProductId}">
                        <div class="slds-carousel__image">
                            <img src="${sandyApiUrl}${image.thumbnailUrl}" />
                        </div>
                    </div>`);
                $('#img-carousel-selector-'  + productId).append(`
                    <li class="slds-carousel__indicator" role="presentation">
                        <a id="indicator-image-${image.imageSeq}" class="slds-carousel__indicator-action dot_${image.mailProductId} slds-is-active" onclick="currentSlide(${index+1},'${image.mailProductId}')" role="tab" tabindex="-1" aria-selected="false" aria-controls="image-${image.imageSeq}" title="">    
                        </a>
                    </li>`);
            } else {
                $('#img-carousel-container-' + productId).append(`
                <div id="image-${image.imageSeq}" class="slds-carousel__panel fade slides_${image.mailProductId}" role="tabpanel" aria-hidden="true" style="display:none;" aria-labelledby="image-${image.imageSeq}" data-prodid="${image.mailProductId}">
                    <div class="slds-carousel__image">
                        <img src="${sandyApiUrl}${image.thumbnailUrl}" />
                    </div>
                </div>`);
                $('#img-carousel-selector-'  + productId).append(`
                <li class="slds-carousel__indicator" role="presentation">
                    <a id="indicator-image-${image.imageSeq}" class="slds-carousel__indicator-action dot_${image.mailProductId}" onclick="currentSlide(${index+1},'${image.mailProductId}')" role="tab" tabindex="-1" aria-selected="false" aria-controls="image-${image.imageSeq}" title="">    
                    </a>
                </li>`); 
            }
        });
        $('#product-carousel-' + productId).append(`
        <a class="prev" onclick="plusSlides(-1, '${item.mailProductId}')">&#10094;</a>
        <a class="next" onclick="plusSlides(1, '${item.mailProductId}')">&#10095;</a>`);
        });
        $('.slds-carousel__panels').on('click', '.slds-carousel__panel',function () {
            var productId = this.dataset.prodid;
            openCarouselModal(productId);
        });
    }

    //Load product info and mapping for Step 2
    function LoadProductDetail(){ 
        Spinner(true);

        var totalFields = 0;

        var productId = ""

        $('[id^="pieceselector_"]').each(function() {
            if($(this).css('display') == 'block'){
                productId = $(this).data("productid");
            }
        })

       $.each(product, function(index, item) {

            if(productId == item.mailProductId){
                //Set default values for activity configuration
                $("input[name=mailclass][value=" + item.defaultMailClass + "]").prop('checked', true);
                $("#quantity option[value="+ item.defaultQueueQuantity +"]").attr('selected','selected');
                $("input[name=queuerule][value=" + item.defaultQueueRule + "]").prop('checked', true);
                $("#cadence option[value="+ item.defaultQueueCadence +"]").attr('selected','selected');

                //Set selected product details
                $('#selectedproductname').html(item.displayName);
                $('#selectedproducttype').html(item.mailProductType);
                $('#selectedproductsize').html(item.size);
                $('#selectedproductcolors').html(item.colors);
                $('#selectedproductpaper').html(item.paper);
                $('#selectedproductfinishing').html(item.finishing);
                $('#selectedproductID').html(item.paceItemTemplateId);

                var images = item.images;

                $('#selected-img-carousel-container').html("");
                $('#selected-img-carousel-selector').html("");
                $('#selected-product-carousel a').remove();
                $.each(images, function(index, image){
                    if(index == "0"){
                        $('#selected-img-carousel-container').append(`
                            <div id="image-${image.imageSeq}" class="slds-carousel__panel fade slides_selected" role="tabpanel" aria-hidden="true" aria-labelledby="image-${image.imageSeq}" data-prodid="${image.mailProductId}">
                                <div class="slds-carousel__image">
                                    <img src="${sandyApiUrl}${image.thumbnailUrl}" />
                                </div>
                            </div>`);
                        $('#selected-img-carousel-selector').append(`
                            <li class="slds-carousel__indicator" role="presentation">
                                <a id="indicator-image-${image.imageSeq}" class="slds-carousel__indicator-action dot_selected slds-is-active" onclick="currentSlide(${index+1},'selected')" role="tab" tabindex="-1" aria-selected="false" aria-controls="image-${image.imageSeq}" title="">    
                                </a>
                            </li>`);
                    } else {
                        $('#selected-img-carousel-container').append(`
                        <div id="image-${image.imageSeq}" class="slds-carousel__panel fade slides_selected" role="tabpanel" aria-hidden="true" style="display:none;" aria-labelledby="image-${image.imageSeq}" data-prodid="${image.mailProductId}">
                            <div class="slds-carousel__image">
                                <img src="${sandyApiUrl}${image.thumbnailUrl}" />
                            </div>
                        </div>`);
                        $('#selected-img-carousel-selector').append(`
                        <li class="slds-carousel__indicator" role="presentation">
                            <a id="indicator-image-${image.imageSeq}" class="slds-carousel__indicator-action dot_selected" onclick="currentSlide(${index+1},'selected')" role="tab" tabindex="-1" aria-selected="false" aria-controls="image-${image.imageSeq}" title="">    
                            </a>
                        </li>`); 
                    }
                });
                $('#selected-product-carousel').append(`
                <a class="prev" onclick="plusSlides(-1, 'selected')">&#10094;</a>
                <a class="next" onclick="plusSlides(1, 'selected')">&#10095;</a>`);

                var fields = item.fields;

                //Set fields for data mapping
                if ( $('#mapping-container').children().length == 0 ) {
                    $.each(fields, function( index, field ) {         
                        $('#mapping-container').append(`
                        <div class="slds-grid" style="margin-bottom:5px;">
                            <div class="slds-col slds-size_5-of-12" style="padding-left:17px;">
                                <div class="slds-button slds-button_outline-brand" style="color:black;font-size:12px;font-weight:bold;border:2px solid rgb(74,74,163);height:20px;width:160px;border-radius:15px;white-space:nowrap;">${field.displayName}</div>
                            </div>
                            <div class="slds-col slds-size_1-of-12" style="width: 15px;border-bottom: 2px solid rgb(74,74,163);height:12px;"></div>
                            <div class="slds-col slds-size_1-of-12" style="width: 10px;border-bottom: 2px solid rgb(112,207,211);height:12px;"></div>
                            <div class="slds-col slds-size_5-of-12" style="padding-left:0px;padding-right:5px;">
                                <select class="slds-select data-mapping" id="${field.fieldName}" style="color:black;font-size:12px;font-weight:bold;border:2px solid rgb(112,207,211);height:20px;width:160px;border-radius:15px;text-align-last:center; white-space:nowrap;">
                                    <option value=""></option>
                                </select>
                            </div>
                        </div>`);

                        totalFields = totalFields + 1;
                    });
                    $('#totalfieldnum').html(totalFields);
                    getDataExtensionSchema();
                }

                var inArguments = payload['arguments'].execute.inArguments;

                if(inArguments.length > 0 && inArguments[0].summaryproductid == item.paceItemTemplateId){
                    $('#activityname').val(inArguments[0].summaryactivityname);
                    $("input[name=mailclass][value=" + inArguments[0].summarymailclass + "]").prop('checked', true);
                    $("#quantity option[value="+ inArguments[0].summaryquantity +"]").attr('selected','selected');
                    $("input[name=queuerule][value=" + inArguments[0].summaryqueuerule + "]").prop('checked', true);
                    $('#cadence option[value="'+ inArguments[0].summarycadence +'"]').attr('selected','selected');
                    $.each(inArguments[0].mappedfields, function (index, item){
                        $('#' + item.field + ' option[value="'+ item.map +'"]').attr('selected','selected');
                    });
                }

                $('.slds-carousel__panels').on('click', '.slds-carousel__panel',function () {
                    var productId = $('.slds-carousel__panel').data('prodid');
                    openCarouselModal(productId);
                });

                countMappedFields();
                $('.data-mapping').prop("disabled", true); 
            }
        });

        Spinner(false);
    }

    //Product Filtering
    function filterProducts(type){
        $('#pieces-container').html("");
        var type = type;
        $.each(product, function(index, item) {
            if(type == item.mailProductType){
            $('#pieces-container').append(`<div id="piece_${item.mailProductId}" class="slds-grid slds-border_bottom" style="border-bottom-color: rgb(224, 229, 238);position:relative;padding:1.2rem 1.2rem 0rem 1.2rem;">
            <div id="pieceselector_${item.mailProductId}" data-productid="${item.mailProductId}" class="selectoractive"></div>
            <div class="slds-col slds-size_7-of-12">
                <div class="slds-tile__detail" onclick="selectPiece('${item.mailProductId}');" style="cursor:pointer; cursor:hand;z-index:9999999;">
                    <dl class="slds-list_horizontal slds-wrap">
                        <dt class="slds-text-body_small slds-item_label slds-text-color_weak slds-truncate" style="color:rgb(56, 56, 154);font-weight:bold;width:23%;text-align:left;">Product Name:</dt>
                        <dd class="slds-text-body_small slds-item_detail slds-truncate" style="color:black;font-weight:bold;width:77%;">${item.displayName}</dd>
                        <dt class="slds-text-body_small slds-item_label slds-text-color_weak slds-truncate" style="color:rgb(56, 56, 154);font-weight:bold;width:23%;text-align:left;">Product Type:</dt>
                        <dd class="slds-text-body_small slds-item_detail slds-truncate" style="color:black;font-weight:bold;width:77%;">${item.mailProductType}</dd>
                        <dt class="slds-text-body_small slds-item_label slds-text-color_weak slds-truncate" style="color:rgb(56, 56, 154);font-weight:bold;width:23%;text-align:left;">Size:</dt>
                        <dd class="slds-text-body_small slds-item_detail slds-truncate" style="color:black;font-weight:bold;width:77%;">${item.size}</dd>
                        <dt class="slds-text-body_small slds-item_label slds-text-color_weak slds-truncate" style="color:rgb(56, 56, 154);font-weight:bold;width:23%;text-align:left;">Colors:</dt>
                        <dd class="slds-text-body_small slds-item_detail slds-truncate" style="color:black;font-weight:bold;width:77%;">${item.colors}</dd>
                        <dt class="slds-text-body_small slds-item_label slds-text-color_weak slds-truncate" style="color:rgb(56, 56, 154);font-weight:bold;width:23%;text-align:left;">Paper:</dt>
                        <dd class="slds-text-body_small slds-item_detail slds-truncate" style="color:black;font-weight:bold;width:77%;">${item.paper}</dd>
                        <dt class="slds-text-body_small slds-item_label slds-text-color_weak slds-truncate" style="color:rgb(56, 56, 154);font-weight:bold;width:23%;text-align:left;">Finishing:</dt>
                        <dd class="slds-text-body_small slds-item_detail slds-truncate" style="color:black;font-weight:bold;width:77%;">${item.finishing}</dd>
                        <dt class="slds-text-body_small slds-item_label slds-text-color_weak slds-truncate" style="color:rgb(56, 56, 154);font-weight:bold;width:23%;text-align:left;">Product ID</dt>
                        <dd class="slds-text-body_small slds-item_detail slds-truncate" style="color:black;font-weight:bold;width:77%;">${item.paceItemTemplateId}</dd>
                    </dl>
                </div> 
                <div class="" style="padding-top:20px;">
                    <button class="slds-button slds-button_brand requestchanges" style="height:23px;background:rgb(74,74,163);border-color:rgb(74,74,163);" data-requestproductid="${item.mailProductId}" data-requestproductname="${item.displayName}">Request Changes</button>
                </div>                                   
            </div>
            <div class="slds-col slds-size_5-of-12">
                <div class="slds-carousel" id="product-carousel-${item.mailProductId}">
                    <div class="slds-carousel__stage" >
                        <div class="slds-carousel__panels slds-box" id="img-carousel-container-${item.mailProductId}" style="transform:translateX(-0%);border:2px solid rgb(224, 229, 238);padding:5px;height:140px;cursor:pointer;">

                        </div>
                        <ul class="slds-carousel__indicators" role="tablist" id="img-carousel-selector-${item.mailProductId}">
                            
                        </ul>
                    </div>
                </div>
            </div>
        </div>`);

        var images = item.images;
        var productId = item.mailProductId;
        $.each(images, function(index, image){
            if(index == "0"){
                $('#img-carousel-container-' + productId).append(`
                    <div id="image-${image.imageSeq}" class="slds-carousel__panel fade slides_${image.mailProductId}" role="tabpanel" aria-hidden="true" aria-labelledby="image-${image.imageSeq}" data-prodid="${image.mailProductId}">
                        <div class="slds-carousel__image">
                            <img src="${sandyApiUrl}${image.thumbnailUrl}" />
                        </div>
                    </div>`);
                $('#img-carousel-selector-'  + productId).append(`
                    <li class="slds-carousel__indicator" role="presentation">
                        <a id="indicator-image-${image.imageSeq}" class="slds-carousel__indicator-action dot_${image.mailProductId} slds-is-active" onclick="currentSlide(${index+1},'${image.mailProductId}')" role="tab" tabindex="-1" aria-selected="false" aria-controls="image-${image.imageSeq}" title="">    
                        </a>
                    </li>`);
            } else {
                $('#img-carousel-container-' + productId).append(`
                <div id="image-${image.imageSeq}" class="slds-carousel__panel fade slides_${image.mailProductId}" role="tabpanel" aria-hidden="true" style="display:none;" aria-labelledby="image-${image.imageSeq}" data-prodid="${image.mailProductId}">
                    <div class="slds-carousel__image">
                        <img src="${sandyApiUrl}${image.thumbnailUrl}" />
                    </div>
                </div>`);
                $('#img-carousel-selector-'  + productId).append(`
                <li class="slds-carousel__indicator" role="presentation">
                    <a id="indicator-image-${image.imageSeq}" class="slds-carousel__indicator-action dot_${image.mailProductId}" onclick="currentSlide(${index+1},'${image.mailProductId}')" role="tab" tabindex="-1" aria-selected="false" aria-controls="image-${image.imageSeq}" title="">    
                    </a>
                </li>`); 
            }
        });
        $('#product-carousel-' + productId).append(`
        <a class="prev" onclick="plusSlides(-1, '${item.mailProductId}')">&#10094;</a>
        <a class="next" onclick="plusSlides(1, '${item.mailProductId}')">&#10095;</a>`);
        }
        });
        $('.slds-carousel__panels').on('click', '.slds-carousel__panel',function () {
            var productId = $('.slds-carousel__panel').data('prodid');
            openCarouselModal(productId);
        });
    }

    //Loads image modal with current selection
    function openCarouselModal(productId){
        var productId = productId;
        $.each(product, function(index, item) {
            if(productId == item.mailProductId){
                var images = item.images;

                $('#modal-carousel-container').html("");
                $('#modal-carousel-selector').html("");
                $('#modal-carousel a').remove();
                $.each(images, function(index, image){
                    if(index == "0"){
                        $('#modal-carousel-container').append(`
                            <div id="image-${image.imageSeq}" class="slds-carousel__panel fade slides_modal" role="tabpanel" aria-hidden="true" aria-labelledby="image-${image.imageSeq}">
                                <div class="slds-carousel__image">
                                    <img src="${sandyApiUrl}${image.imageUrl}" />
                                </div>
                            </div>`);
                        $('#modal-carousel-selector').append(`
                            <li class="slds-carousel__indicator" role="presentation">
                                <a id="indicator-image-${image.imageSeq}" class="slds-carousel__indicator-action dot_modal slds-is-active" onclick="currentSlide(${index+1},'modal')" role="tab" tabindex="-1" aria-selected="false" aria-controls="image-${image.imageSeq}" title="">    
                                </a>
                            </li>`);
                    } else {
                        $('#modal-carousel-container').append(`
                        <div id="image-${image.imageSeq}" class="slds-carousel__panel fade slides_modal" role="tabpanel" aria-hidden="true" style="display:none;" aria-labelledby="image-${image.imageSeq}">
                            <div class="slds-carousel__image">
                                <img src="${sandyApiUrl}${image.imageUrl}" />
                            </div>
                        </div>`);
                        $('#modal-carousel-selector').append(`
                        <li class="slds-carousel__indicator" role="presentation">
                            <a id="indicator-image-${image.imageSeq}" class="slds-carousel__indicator-action dot_modal" onclick="currentSlide(${index+1},'modal')" role="tab" tabindex="-1" aria-selected="false" aria-controls="image-${image.imageSeq}" title="">    
                            </a>
                        </li>`); 
                    }
                });
                $('#modal-carousel').append(`
                <a class="prev" onclick="plusSlides(-1, 'modal')">&#10094;</a>
                <a class="next" onclick="plusSlides(1, 'modal')">&#10095;</a>`);
            }
        });
        $('.imgmodal').show();
    }

    //Gets DE Schema and appends to data mapping containers 
    function getDataExtensionSchema() {
        var data = journeySchema.schema;
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            let arr = element.key.split('.');
            var value = arr[2];
            $('.data-mapping').append('<option value="'+ element.key +'">'+ value +'</option>');
        }
    }

    //Counts mapped fields
    function countMappedFields(){
        var mappedFields = 0;
        $('.data-mapping').each(function(){
            if($(this).val() !== ""){
                mappedFields = mappedFields + 1;
            }
        });
        $('#mappedfieldnum').css('color', 'rgb(93,207,146)');
        $('#mappedfieldnum').html(mappedFields);
    }

    //Product Type Filter handler
    $('#productTypeSelect').change( function() {
        var selectedType = $("#productTypeSelect option:selected").val();

        if (selectedType == "All"){
            LoadProducts();
        } else {
            filterProducts(selectedType);
        }    
    });
    //Catches changes on data mapping fields and counts them
    $('#mapping-container').change(function(){
        countMappedFields();
    });

    //Handles Request Changes button on step 1
    $('#pieces-container').on('click', '.requestchanges',function () {

        var body = { 
            type: 'changes',
            prodId: $(this).data('requestproductid'),
            prodName: $(this).data('requestproductname')
            };

        $.ajax({
            url: '/sandyalexander/message',
            type: 'POST',
            data: body,
            success: function (data) {
                console.log("DONE: ", data);       
                $('.slds-theme_info').css('visibility','visible');
                $('#infoMessage').html('Your Request to change this product has been sent to the team who will contact you for more details.'); 
            },
            error: function (e) {
                console.log("ERROR: ", e);
            }
        });
        
    });

    //Handles Request New Product button on step 1
    $('#requestnewproduct').on('click', function() {

        var body = { 
            type: 'new'
            };

        $.ajax({
            url: '/sandyalexander/message',
            type: 'POST',
            data: body,
            success: function (data) {
                console.log("DONE: ", data);       
                $('.slds-theme_info').css('visibility','visible');
                $('#infoMessage').html('Your Request to add a product to Mailpath has been sent to the team'); 
            },
            error: function (e) {
                console.log("ERROR: ", e);
            }
        });
    });

    //Handles Edit Mapping button on step 2
    $('#editMapping').on('click', function() {
        if($('.data-mapping').is(":disabled")){
            $('#editMapping').css('background','rgb(75, 202, 129)');
            $('#editMapping').html('Save Mappings');
            $('.data-mapping').prop("disabled", false); 
        } else {
            $('#editMapping').css('background','rgb(74, 74, 163)');
            $('#editMapping').html('Edit'); 
            $('.data-mapping').prop("disabled", true);   
        }
    });

    //Validates activity name  
    $('#activityname').keyup(function(){
        //on keyup, start the countdown
        var activity = $('#activityname').val();
        clearTimeout(typingTimer);
        if ($('#activityname').val()) {
            typingTimer = setTimeout(validateActivityName(activity), 2000);
        }
    });

    function validateActivityName(activityName) {
        var url = "/sfmc/dataextensionrows";
        url+="?token="+authTokens.fuel2token; 
        var activityName = activityName;
        $.get(url, function(data, status){
            if(status == "success"){
                console.log('*** LoadActivityList ***'+data);
                var jsonResponse = data;
                var activities = jsonResponse.Results
                
                /*$.each(activities, function(index, item) {
                    if(item.keys.activityname == activityName && item.values.journeyid != journeyName){
                        $('#nameValidator').val('notvalid');
                    }
                });*/
                $.each(activities, function(index, item) {
                    if(item.Properties[0].Property[0].Value == activityName && item.Properties[0].Property[2].Value != journeyName){
                        $('#nameValidator').val('notvalid');
                    }                    
                });
            }
            else{
                console.log("Fail Activity List" + status);
            }
        });
    }

    //Closes image modal
    $('.modalclose').click(function(){
        $('.imgmodal').hide();
    });

    //Gets mapped fields for inarguments
    function getMappedFieldsForUI(){
        var arr = [];

        $('.data-mapping').prop("disabled", false);

        $('.data-mapping').each(function(index, field) {
           var mappedFields = {
                                "field" : $(this).attr("id"),
                                "map" :   $(this).val()
                              };

             arr.push(mappedFields);                 
        });
        
        $('.data-mapping').prop("disabled", true);

        return arr;
    }

    
    function getMappedFields(){
        var arr = [];

        $('.data-mapping').prop("disabled", false);
        
        $('.data-mapping').each(function(index, field) {
            var newMap = $(this).val().split(".");

            newMap[newMap.length - 1] = `\\"${newMap[newMap.length - 1]}\\"`;

            var mappedFields = {
                "field" : $(this).attr("id"),
                "map" :   newMap.join(".")
            };
            arr.push(mappedFields);                 
    });

        var variablesString = '{';
        var i = null;
        for (i = 0; arr.length > i; i += 1) {
            variablesString+='"'+arr[i].field+'" : "{{'+ arr[i].map +'}}"';
            if(i < arr.length-1)
                variablesString+= ',';
        }
    
        variablesString+= '}';
    
        return variablesString;
    }

});