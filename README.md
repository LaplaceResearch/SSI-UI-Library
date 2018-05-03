# laplace.js

SSI UI Library


### Grid Single

<img src="http://cdn.kurigo.com/laplaceresearch/ssi-ui-library/screenshots/grid-single.png" width="480">

    <script src="//unpkg.com/jquery"></script>
    <script src="//surveyjs.azureedge.net/1.0.18/survey.jquery.js"></script>
    <link href="//surveyjs.azureedge.net/1.0.18/survey.css" type="text/css" rel="stylesheet"/>
    <script src="http://cdn.kurigo.com/laplaceresearch/ssi-ui-library/lib/girdSingle.js"></script>

    <script>
        $('.question_body').gridSingle({
            show_choice_labels: true,
            theme: 'darkrose'
        });
    </script>


### Checkbox

<img src="http://cdn.kurigo.com/laplaceresearch/ssi-ui-library/screenshots/checkbox.png" width="480">

    <link rel="stylesheet" type="text/css" href="//unpkg.com/bootstrap@3.3.7/dist/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="http://cdn.kurigo.com/laplaceresearch/ssi-ui-library/lib/checkbox.css">

    <script src="//unpkg.com/jquery"></script>
    <script src="//unpkg.com/underscore"></script>
    <script src="//unpkg.com/bootstrap@3.3.7/dist/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="http://cdn.kurigo.com/laplaceresearch/ssi-ui-library/lib/checkbox.js"></script>
    <script>
        $('.question_body').checkbox();
    </script>


### Radio

<img src="http://cdn.kurigo.com/laplaceresearch/ssi-ui-library/screenshots/radio.png" width="480">

    <link rel="stylesheet" type="text/css" href="//unpkg.com/bootstrap@3.3.7/dist/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="http://cdn.kurigo.com/laplaceresearch/ssi-ui-library/lib/radio.css">

    <script src="//unpkg.com/jquery"></script>
    <script src="//unpkg.com/underscore"></script>
    <script src="//unpkg.com/bootstrap@3.3.7/dist/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="http://cdn.kurigo.com/laplaceresearch/ssi-ui-library/lib/radio.js"></script>
    <script>
        $('.question_body').radio();
    </script>


### Textarea

<img src="http://cdn.kurigo.com/laplaceresearch/ssi-ui-library/screenshots/textarea.png" width="480">

    <link rel="stylesheet" type="text/css" href="http://cdn.kurigo.com/laplaceresearch/ssi-ui-library/lib/textarea.css">
    <script type="text/javascript" src="http://cdn.kurigo.com/laplaceresearch/ssi-ui-library/lib/textarea.js"></script>


### Input Mask

<img src="http://cdn.kurigo.com/laplaceresearch/ssi-ui-library/screenshots/inputmask.png" width="480">

    <script src="//unpkg.com/jquery"></script>
    <script src="/lib/vendor/jquery.inputmask.js"></script>
    <script src="/lib/vendor/inputmask.date.extensions.js"></script>

    <script>

        // Email Mask
        $("input[name*='email']").inputmask({
            mask: "*{1,20}[.*{1,20}][.*{1,20}][.*{1,20}]@*{1,20}[.*{2,6}][.*{1,2}]",
            greedy: false,
            onBeforePaste: function (pastedValue, opts) {
                pastedValue = pastedValue.toLowerCase();
                return pastedValue.replace("mailto:", "");
            },
            definitions: {
                '*': {
                    validator: "[0-9A-Za-z!#$%&'*+/=?^_`{|}~\-]",
                    casing: "lower"
                }
            }
        });

        // Phone Mask
        $("input[name*='evtel'], input[name*='ceptel']").inputmask({"mask": "0 (999) 999 99 99"});

        // Date Mask
        // Requires inputmask.date.extensions.js
        $("input[name*='tarih']").inputmask({alias: "datetime", inputFormat: "dd/mm/yyyy"});


    </script>