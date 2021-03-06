/**
 * Payment iFrame
 *
 * @copyright  Copyright (c) 2015 PAYMILL GmbH (https://www.paymill.com)
 */

var paymillInitCompliance = function() {
    if (PAYMILL_FASTCHECKOUT_CC) {
        $('#paymillFastCheckoutIframeChange').click(function (event) {
            PAYMILL_FASTCHECKOUT_CC_CHANGED = true;
            embedIframe();
            $('#paymillFastCheckoutTable').remove();
        });
    } else {
        if (isMobileTheme()) {
            cc = $("a[data-selection-id='paymill_cc']");
            ccIsChecked = $('#paymentOption_paymill_cc.active-payment').length > 0;
        } else {
            cc = $('#payment_paymill_cc');
            ccIsChecked = cc.is(':checked');
        }

        if(ccIsChecked) {
            embedIframe();
        } else {
            cc.click(function (event) {
                embedIframe();
            });
        }
    }

    $('#payment').submit(function (event) {
        var cc;

        if (isMobileTheme()) {
            cc = $('#paymentOption_paymill_cc.active-payment').length > 0;
        } else {
            cc = $('#payment_paymill_cc').attr('checked');
        }

        if (cc && PAYMILL_COMPLIANCE) {
            // prevent form submit
            event.preventDefault();

            clearErrors();

            // disable submit-button to prevent multiple clicks
            $('#paymentNextStepBottom').attr("disabled", "disabled");

            if (PAYMILL_FASTCHECKOUT_CC && !PAYMILL_FASTCHECKOUT_CC_CHANGED) {
                fastCheckout();
            } else {
                createToken();
            }
        }

        return true;
    });

    function embedIframe()
    {
        paymill.embedFrame('payment-form-cc', { lang: PAYMILL_LANG_OPTION }, function(error) {
            if (error && PAYMILL_DEBUG === "1") {
                console.log(error.apierror, error.message);
            } else {
                // Frame was loaded successfully and is ready to be used.
            }
        });
    }

    function isMobileTheme()
    {
        return $('.active-payment').length > 0;
    }

    $('#payment_paymill_cc').click(clearErrors);
    $('#payment_paymill_elv').click(clearErrors);
    $('.payment-option').click(clearErrors);

    function clearErrors()
    {
        $(".payment-errors").css("display", "none");
        $(".payment-errors").text("");
    }

    function createToken()
    {
        paymill.createTokenViaFrame({
            amount_int: PAYMILL_AMOUNT,
            currency: PAYMILL_CURRENCY
        }, paymillResponseHandler);
    }

    function fastCheckout()
    {
        $("#paymill_form").append("<input id='paymillFastcheckoutHidden' type='hidden' name='paymillFastcheckout' value='" + true + "'/>");
        result = new Object();
        result.token = 'dummyToken';
        paymillResponseHandler(null, result);
    }

    function paymillResponseHandler(error, result)
    {
        // Handle error or process result.
        if (error) {
            paymillDebug('An API error occured:' + error.apierror);
        } else {
            // Token
            paymillDebug('Received a token: ' + result.token);
            // add token into hidden input field for request to the server
            $("#payment").append("<input type='hidden' name='paymillToken' value='" + result.token + "'/>");
            $("#payment").get(0).submit();
        }
        $("#paymentNextStepBottom").removeAttr("disabled");
    }

    function paymillDebug(message)
    {
        if (PAYMILL_DEBUG === "1") {
            console.log(message);
        }
    }
}

if (window.addEventListener){
    window.addEventListener("load", paymillInitCompliance);
} else if (window.attachEvent){
    window.attachEvent("onload", paymillInitCompliance);
} else window.onload = paymillInitCompliance;
