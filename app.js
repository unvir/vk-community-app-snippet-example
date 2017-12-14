var app = {
    API_VERSION: '5.69',
    VIEWER_DEVICE_MOBILE: 'mobile',
    ELEMENTS: {
        INSTALL_APP_BUTTON: document.getElementById('btn-show-install-page'),
        SUBMIT_QUESTION_BUTTON: document.getElementById('btn-question-submit'),
        TRY_AGAIN_BUTTON: document.getElementById('btn-try-again'),
        SHARE_BUTTON: document.getElementById('btn-share'),
        HEADER_TITLE: document.getElementById('text-title-header'),
        EXAM_PROGRESS_TITLE: document.getElementById('text-title-exam-progress'),
        RESULT_SCORES: document.getElementById('text-score'),
        RESULT_MAX_SCORES: document.getElementById('text-max-score')
    },
    PAGES: {
        INSTALL: document.getElementById('page-install'),
        EXAM: document.getElementById('page-exam'),
        RESULT: document.getElementById('page-results')
    },

    appId: 0,
    groupId: 0,

    examStatus: {
        self: null,
        questionNumber: 0,
        maxQuestion: 0,
        userScores: 0
    },

    btnSubmitHandlers: {
        nextQuestionEvent: function (event) {
            event.preventDefault();
            app.nextQuestion(app.examStatus.self);
        },
        submitExamEvent: function (event) {
            event.preventDefault();
            app.showResults();
        },
        countScore: function (event) {
            event.preventDefault();

            var answer = document.querySelector('input[type=radio]:checked');
            var rightAnswerId = app.examStatus.self.questions[app.examStatus.questionNumber - 1].rightAnswerId;
            if (answer && answer.item.id === rightAnswerId) {
                app.examStatus.userScores++;
            }
        }
    },

    startExam: function startExam(exam) {
        app.examStatus.maxQuestion = exam.questions.length;
        app.examStatus.questionNumber = 0;
        app.examStatus.self = exam;
        app.examStatus.userScores = 0;

        app.ELEMENTS.HEADER_TITLE.innerHTML = 'Тест: ' + exam.title;
        app.ELEMENTS.SUBMIT_QUESTION_BUTTON.style.display = 'inline-block';
        app.ELEMENTS.SUBMIT_QUESTION_BUTTON.innerHTML = 'Далее';

        app.ELEMENTS.SUBMIT_QUESTION_BUTTON.addEventListener('click', app.btnSubmitHandlers.countScore);
        app.ELEMENTS.SUBMIT_QUESTION_BUTTON.addEventListener('click', app.btnSubmitHandlers.nextQuestionEvent);

        app.nextQuestion(exam);
    },

    nextQuestion: function (exam) {
        app.PAGES.EXAM.innerHTML = '';
        app.PAGES.EXAM.appendChild(
            app.renderQuestion(exam.questions[app.examStatus.questionNumber])
        );
        app.examStatus.questionNumber++;

        if (app.examStatus.questionNumber === app.examStatus.maxQuestion) {
            var btnSubmit = app.ELEMENTS.SUBMIT_QUESTION_BUTTON;
            btnSubmit.innerHTML = 'Отправить';
            btnSubmit.removeEventListener('click', app.btnSubmitHandlers.nextQuestionEvent);
            btnSubmit.addEventListener('click', app.btnSubmitHandlers.submitExamEvent);
        }
        app.updateCounters();
    },

    showResults: function () {
        app.ELEMENTS.RESULT_SCORES.innerHTML = app.examStatus.userScores;
        app.ELEMENTS.RESULT_MAX_SCORES.innerHTML = app.examStatus.maxQuestion;

        app.ELEMENTS.SUBMIT_QUESTION_BUTTON.removeEventListener('click', app.btnSubmitHandlers.submitExamEvent);
        app.ELEMENTS.SUBMIT_QUESTION_BUTTON.removeEventListener('click', app.btnSubmitHandlers.countScore);

        app.show(app.PAGES.RESULT);
    },

    show: function (page) {
        app.hideAll();
        page.style.display = 'block';

        switch (page) {
            case app.PAGES.INSTALL:
                app.ELEMENTS.INSTALL_APP_BUTTON.href = 'https://vk.com/add_community_app.php?aid=' + app.appId;
                break;

            case app.PAGES.EXAM:
                app.startExam(page.item);
                app.ELEMENTS.EXAM_PROGRESS_TITLE.style.display = 'inline-block';
                app.ELEMENTS.SUBMIT_QUESTION_BUTTON.style.display = 'inline-block';
                break;

            case app.PAGES.RESULT:
                app.ELEMENTS.SUBMIT_QUESTION_BUTTON.style.display = 'none';
                app.ELEMENTS.EXAM_PROGRESS_TITLE.style.display = 'none';
                break;
        }
    },

    hideAll: function () {
        for (var page in app.PAGES) {
            app.PAGES[page].style.display = 'none';
        }
    },

    getUrlParameter: function (name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');

        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);

        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    },

    updateCounters: function () {
        app.ELEMENTS.EXAM_PROGRESS_TITLE.innerHTML = 'Вопрос <b>'
            + app.examStatus.questionNumber + '</b> из <b>' + app.examStatus.maxQuestion + '</b>'
    },

    renderQuestion: function (question) {
        var mainContainerElem = document.createElement('div');
        mainContainerElem.classList.add('question');
        mainContainerElem.id = 'question-' + question.id;

        var questionTitleElem = document.createElement('h3');
        questionTitleElem.classList.add('question-title');
        questionTitleElem.innerHTML = question.title;

        var choiceListElem = document.createElement('ul');
        choiceListElem.classList.add('question-choice');

        question.answers.forEach(function (answer) {
            var choiceListItemElem = document.createElement('li');

            var choiceLabelElem = document.createElement('label');
            choiceLabelElem.for = question.id + '_' + answer.id;

            var choiceInputElem = document.createElement('input');
            choiceInputElem.type = 'radio';
            choiceInputElem.id = question.id + '_' + answer.id;
            choiceInputElem.name = 'question-' + question.id;
            choiceInputElem.item = answer;

            var choiceTextNode = document.createTextNode(answer.value);

            choiceLabelElem.appendChild(choiceInputElem);
            choiceLabelElem.appendChild(choiceTextNode);
            choiceListItemElem.appendChild(choiceLabelElem);
            choiceListElem.appendChild(choiceListItemElem);
        });

        mainContainerElem.appendChild(questionTitleElem);
        mainContainerElem.appendChild(choiceListElem);

        return mainContainerElem;
    },

    init: function () {
        app.appId = app.getUrlParameter('api_id');
        app.groupId = app.getUrlParameter('group_id');

        VK.init(null, null, app.API_VERSION);

        sessionStorage.setItem('viewerId', app.getUrlParameter('viewer_id'));
        app.ELEMENTS.TRY_AGAIN_BUTTON.addEventListener('click', function (event) {
            event.preventDefault();
            app.show(app.PAGES.EXAM);
        });

        app.ELEMENTS.SHARE_BUTTON.addEventListener('click', function (event) {
            event.preventDefault();

            var viewerDevice = app.getUrlParameter('viewer_device');
            var RESULT_IMAGES_ID = [
                '456239021',
                '456239022',
                '456239023',
                '456239024'
            ];
            var appLink = 'https://vk.com/app' + app.appId + '_-' + app.groupId;
            var imageRawId = 'photo-' + app.groupId + '_' + RESULT_IMAGES_ID[app.examStatus.userScores];

            if (viewerDevice && viewerDevice === app.VIEWER_DEVICE_MOBILE) {
                VK.callMethod('shareBox',
                    appLink,
                    'https://vk.com/' + imageRawId,
                    'VK community app snippet example');
            } else {
                var requestData = {
                    'owner_id': sessionStorage.getItem('viewerId'),
                    'attachments': imageRawId + ',' + appLink
                };

                VK.api('wall.post', requestData);
            }
        });
        app.PAGES.EXAM.item = memExam;

        if (app.groupId == 0) {
            app.show(app.PAGES.INSTALL);
        } else {
            app.show(app.PAGES.EXAM);
        }
    }
};

window.addEventListener('load', function () {
    app.init();
});

var memExam = {
    title: 'Мемология',
    questions: [
        {
            id: 1,
            title: 'Знаете ли вы, кто придумал мемы?',
            rightAnswerId: 1,
            answers: [
                {
                    id: 1,
                    value: 'Да'
                },
                {
                    id: 2,
                    value: 'Нет'
                }
            ]
        },
        {
            id: 2,
            title: 'Скидывали ли вы мемы своим друзьям ВКонтакте?',
            rightAnswerId: 1,
            answers: [
                {
                    id: 1,
                    value: 'Да'
                },
                {
                    id: 2,
                    value: 'Нет'
                }
            ]
        },
        {
            id: 3,
            title: 'Где купить мемы?',
            rightAnswerId: null,
            answers: [
                {
                    id: 1,
                    value: 'На базаре'
                },
                {
                    id: 2,
                    value: 'В пятерочке'
                },
                {
                    id: 3,
                    value: 'Из дают вместо со стикерами'
                },
                {
                    id: 4,
                    value: 'У Бога мемов'
                }
            ]
        }
    ]
};