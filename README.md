# laplace.js

SSI UI Library


### Grid Single

    <script src="//unpkg.com/jquery"></script>
    <script src="//surveyjs.azureedge.net/1.0.18/survey.jquery.js"></script>
    <link href="//surveyjs.azureedge.net/1.0.18/survey.css" type="text/css" rel="stylesheet"/>
    <script src="https://cdn.rawgit.com/LaplaceResearch/SSI-UI-Library/41432681/lib/girdSingle.js"></script>

    <script>
        $('.question_body').gridSingle({
            show_choice_labels: true,
            theme: 'darkrose'
        });
    </script>


### Checkbox

    <link rel="stylesheet" type="text/css" href="//unpkg.com/bootstrap@3.3.7/dist/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="//cdn.rawgit.com/LaplaceResearch/SSI-UI-Library/0e0c05b9/lib/checkbox.css">

    <script src="//unpkg.com/jquery"></script>
    <script src="//unpkg.com/underscore"></script>
    <script src="//unpkg.com/bootstrap@3.3.7/dist/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="//cdn.rawgit.com/LaplaceResearch/SSI-UI-Library/0e0c05b9/lib/checkbox.js"></script>
    <script>
        $('.question_body').checkbox();
    </script>