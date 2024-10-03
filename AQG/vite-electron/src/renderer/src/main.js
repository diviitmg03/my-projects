const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const { Configuration, OpenAIApi } = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Anthropic = require('@anthropic-ai/sdk');
// const fetch = require('node-fetch');
const { MongoClient } = require('mongodb');
const { type } = require('os');
// require('electron-reload')(__dirname, {
//     electron: require(`${__dirname}/node_modules/electron`)
//   }); 

// global.fetch = fetch;

const GEMINI_API_KEY = 'AIzaSyD8M8ddFNpcbCS918bhTk8ZqCgmreIP-Dk';
const ANTHROPIC_API_KEY = 'AIzaSyAtWNEpZbaNOQVcuKlk-xzWJz3sAT7sh08';
const OPENAI_API_KEY = 'AIzaSyAtWNEpZbaNOQVcuKlk-xzWJz3sAT7sh08';

const MONGO_CONNECTION_STRING = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.6";

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('generate-questions', async (event, data) => {
    try {
        // let combinedText = data.inputContent;
        let combinedText = data.inputContent;
        console.log(combinedText)
        const questions = await generateQuestions(
            data.aiModel,
            combinedText,
            data.prompt,
            data.questionType,
            data.questionLevel,
            data.bloomTaxonomy,
            data.language,
            data.numQuestions
        );
        console.log(questions);
        await saveQuestionsToDb(questions, data.questionType, data.bloomTaxonomy);
        event.reply('questions-generated', questions);
    } catch (error) {
        console.error('Error generating questions:', error);
        event.reply('questions-generated', `Error: ${error.message}`);
    }
});

ipcMain.on('show-all-questions', async (event) => {
    try {
        const questions = await getAllQuestions();
        event.reply('all-questions', questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        event.reply('all-questions', `Error: ${error.message}`);
    }
});

ipcMain.on('send-api-request', async (event) => {
    try {
        const questions = await getAllQuestions();
        const responses = await sendInsomniaRequests(questions);
        event.reply('api-response', responses);
    } catch (error) {
        console.error('Error sending API requests:', error);
        event.reply('api-response', `Error: ${error.message}`);
    }
});


ipcMain.on('test', async (event,data) =>{
    console.log(data);
});
// async function extractTextFromPDF(pdfPath) {
//     const response = await fetch(pdfPath);
//     const arrayBuffer = await response.arrayBuffer();
//     const pdfDoc = await PDFDocument.load(arrayBuffer);
//     let text = '';
//     const pages = pdfDoc.getPages();
//     for (const page of pages) {
//         text += await page.getText();
//     }
//     return text;
// }

async function generateQuestions(model, text, prompt, questionType, questionLevel, bloom, language, numQuestions) {
    let aiModel;
    console.log(text);
    switch (model) {
        case 'Gemini':
            aiModel = new GoogleGenerativeAI(GEMINI_API_KEY);
            break;
        case 'Claude':
            aiModel = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
            break;
        case 'OpenAI ChatGPT':
            const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
            aiModel = new OpenAIApi(configuration);
            break;
        default:
            throw new Error('Invalid AI model selected');
    }
    let userPrompt
    
    switch(questionType){
        case "Descriptive":
            userPrompt = `${prompt}\n\nBased on the following text, generate ${numQuestions} detailed descriptive questions of ${questionLevel} Difficulty Level with correct answer only, Also ensure the the questions are ${bloom} based as per Bloom's Taxonomy:\n\n${text}.The questions should be in this ${language}.\n The format of the output should match the following Regex- \*\*Question \d+:\*\* (.*?)\n\*\*Answer:\*\*\s(.*?)(?:\n\n|\n$) \n For mathematical equations only keep them in format example $$f(x) = x^2 + 2x + 1$$`
            break;
        case "MCQ":
            userPrompt = `${prompt}\n\nBased on the following text, generate ${numQuestions} Multiple Choice Question(MCQs) and four options each and Answer of ${questionLevel} Difficulty Level, Also ensure the the questions are ${bloom} based as per Bloom's Taxonomy:\n\n${text}.The questions should be in this ${language}.\n The format of the output should match the following Regex- \*\*Question \d+:\*\* (.*?)\n\*\*Options:\*\*\n'
                        r'a\) (.*?)\n'
                        r'b\) (.*?)\n'
                        r'c\) (.*?)\n'
                        r'd\) (.*?)\n'
                        r'\*\*Answer:\*\* (.*?)\n For mathematical equations only keep them in format example $$f(x) = x^2 + 2x + 1$$`
            break;
        case "Fill in the Blanks":
            userPrompt = `"${prompt}\n\nBased on the following text,Strictly generate ${numQuestions} fill in the blank questions only with correct answer. DO not Generate Descriptive or One word Question.The Question Should have a missing word replaced by blank that is the answer and the Difficulty should ${questionLevel},  Also ensure the the questions are ${bloom} based as per Bloom's Taxonomy:\n\n${text}.The questions should be in this ${language}.\n\n The format of the output should match the following Regex- \*\*Question \d+:\*\* (.*?)\n\*\*Answer:\*\*\s(.*?)(?:\n\n|\n$) \n For mathematical equations only keep them in format example $$f(x) = x^2 + 2x + 1$$"`
            break;
        }
    let response;
    
    switch (model) {
        case 'Gemini':
            const geminiModel = aiModel.getGenerativeModel({ model: "gemini-pro" });
            response = await geminiModel.generateContent(userPrompt);
            return response.response.text();
        case 'Claude':
            response = await aiModel.completions.create({
                model: "claude-2",
                prompt: userPrompt,
                max_tokens_to_sample: 1000
            });
            return response.completion;
        case 'OpenAI ChatGPT':
            response = await aiModel.createCompletion({
                model: "text-davinci-002",
                prompt: userPrompt,
                max_tokens: 1000
            });
            return response.data.choices[0].text;
    }
}

async function saveQuestionsToDb(questions, questionType, bloomTaxonomy) {
    const client = new MongoClient(MONGO_CONNECTION_STRING);
    try {
        await client.connect();
        const db = client.db('questions_db');
        const collection = db.collection('questions5');
        const parsedQuestions = parseQuestions(questions, questionType, bloomTaxonomy);
        console.log(parsedQuestions)
        await collection.insertMany(parsedQuestions);
    } catch (error) {
        console.error('Error saving questions to database:', error);
    } finally {
        await client.close();
    }
}

function parseQuestions(questions, questionType, bloomTaxonomy) {
    const parsedQuestions = [];
    const questionRegex = /\*\*Question \d+:\*\* (.*?)\n/g;
    const answerRegex = /\*\*Answer:\*\* (.*?)(?:\n\n|\n$)/g;
    const optionsRegex = /\*\*Options:\*\*\na\) (.*?)\nb\) (.*?)\nc\) (.*?)\nd\) (.*?)\n/;

    let questionMatch;
    let answerMatch;
    if(questionType==="MCQ"){
        let optionsMatch;
        while ((questionMatch = questionRegex.exec(questions)) !== null && (answerMatch = answerRegex.exec(questions)) !== null && (optionsMatch = optionsRegex.exec(questions)) !==null){

            const question = questionMatch[1].trim();
            const answer = answerMatch[1].trim();
            const option = optionsMatch[1].trim();
            // console.log(optionsMatch[0]);
            const options = optionsMatch[0].trim().split('\n').slice(start=1);
            // console.log(options)
            
            const parsedQuestion = {
                    Question: question,
                    Option: options,
                    Answer: answer,
                    question_type: questionType,
                    "Bloom's Index": getBloomIndex(bloomTaxonomy)
                };
            parsedQuestions.push(parsedQuestion);
        }
        

    }
    else{
        while ((questionMatch = questionRegex.exec(questions)) !== null && (answerMatch = answerRegex.exec(questions)) !== null) {
            const question = questionMatch[1].trim();
            const answer = answerMatch[1].trim();
            
            const parsedQuestion = {
                Question: question,
                Answer: answer,
                question_type: questionType,
                "Bloom's Index": getBloomIndex(bloomTaxonomy)
            };
            
            // if (questionType === 'MCQ') {
            //     // const optionsRegex = /\*\*Options:\*\*\n((?:[a-d]\) .*?\n){4})/;
            //     const optionsRegex = /\*\*Options:\*\*\na\) (.*?)\nb\) (.*?)\nc\) (.*?)\nd\) (.*?)/;
            //     const optionsMatch = questions.match(optionsRegex);
            //     console.log(optionsMatch);
            //     if (optionsMatch) {
            //         const options = optionsMatch[1].trim().split('\n').reduce((acc, option) => {
            //             const [key, value] = option.split(') ');
            //             acc[key] = value.trim();
            //             return acc;
            //         }, {});
            //         parsedQuestion.Options = options;
            //     }
            // }
            
            parsedQuestions.push(parsedQuestion);
        }
    }
    
    
    return parsedQuestions;
}

function getBloomIndex(bloomTaxonomy) {
    const bloomLevels = {
        "Knowledge": 0,
        "Comprehension": 1,
        "Application": 2,
        "Analysis": 3,
        "Synthesis": 4,
        "Evaluation": 5
    };
    return bloomLevels[bloomTaxonomy] || 0;
}

async function getAllQuestions() {
    const client = new MongoClient(MONGO_CONNECTION_STRING);
    try {
        await client.connect();
        const db = client.db('questions_db');
        const collection = db.collection('questions5');
        // return await collection.find({}).toArray();
        const questions = await collection.find({}, { projection: { _id: 0 } }).toArray();
        return questions;
    } catch (error) {
        console.error('Error fetching questions from database:', error);
        return [];
    } finally {
        await client.close();
    }
}

async function sendInsomniaRequests(questions) {
    const url = "https://rio24.azurewebsites.net/Services/ExamSpace/Question/CreateQuestionWithOption";
    const access_token = 'eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZDQkMtSFM1MTIiLCJraWQiOiIwMDk2NzkwNjQ1QTQ1RkJGOEY5MzU4NjI1MEY0M0NFNUI2RkY0MDQ3IiwidHlwIjoiYXQrand0IiwiY3R5IjoiSldUIn0.ct809e35nQpJ8_5PA1pF7DWSBE7D7zvdVz77mAaqBpX78LSkNjZQWDfcR3xH49au8VZ3jxA9kNzTOC-WiNHaftaPnt1PDV8TFQSpmkpJ8nhnfXj3QS-FfzxLuSDET94nD2rB0OzB7_WY5LW5yMrfwKvpX6mbR1gSd_-aPqpyW7lfGQWlaOVSHHdaLiVjkD6Ukjug4DSHjbhSUKPWpow1TBm7ZH2FxckNdyOPom_b7Nvz4wPx88sHkOYftwOHkJK0McV5RXhzxS9iqw77dnXcFjYyecxzcBu1fqPsa2lwaLhqkwxNNhVWah8kMSuI2vnTGBZIl7snj4K4bRwJbI5UyA.kPhPOAGb1fGzGN7YFI7z5A.CDf6nhVF2ra45IqM57qBDwhyNMUJ7WW_d5Kxaip24DnJ3FWdKPwzdrR5EHuK78VqPOTd1RI_uq8NaAq6nlYi46JwzqnqJrzM2OZNf2ZFqMe8OsBCj_W8zoFhnFWfFmbFSBSky2mviTv-rswFLu16oNLzrO92pxeQYjMIo4lkxIzw89VAMXQdoBMHpvN5sBzdJ2hHQI0njdZrdvxbOl59OEcqFcUnOmn_QmYfNXd-zTS_vMR5Vew2VSPRqxEjKRpGZsH7FQbj4Wtp8sIRXTW_deBuvlCA-fl37ut_-g_gPSFRYt1hQZ3b5TFdKtpHLgGljpoEc8cx7lrR5_HiIffhHjOh_UoE81uxhJTzXQ57ZgogjIQ4v_5YfyenBVY6tOuQHK7i3Sw1MjFEuntgI_6MCrCWAsGeSIWeD1IxP2CtwVFsSdIjNLEuMtE_NmaIRBtvLuA8hxG5uH1ARLJdcnTfVOmIjbKW4VrltroyuARZS-yTqrjfBpXzJBtwCC2zc_weMUiGpF-j-UIryApGVN_jN_Yw0WsNCfTcvPrgIPNU0M_qK0zGd71eHBeMMxlZ3PmCxuyCTEouiDqGEs18k2t27OaBdSIGIcOt1czzmqlyRXbBrTM0ORQCSTIFZWWvWiVk1P2GplviJNAUmAA5VhTsC2bxwHzkFX1FVD6lXeOXod8w9KpX_AMWdgZdIMM3-XSbE7uG7sPZZNjEALv_Y020FTliBfIm_HHcdBCFtClTDRT8dfgcNeAwrlXEv7WdaeNjsLuZKYP2lST1ZMcdlBiiZycnFVMiJ5_giidfHquuddaGusazujWzgrdmtE3UPo63cJk-LGgSNwjo7Y52DWVTC9dfgsehj0UaCSM7O1uLghXvgZxVEnhCEGc3_0RdXMCRvvvCWvoTDGokBLDukU3Jj7p9jEzUcjbBlQ0aOzrdAscIRG-E45fzI7fq8OMgSo9EzdfjuIXBjkF3iBKuLlLvoVzPL-mSPYmdrgs6V_Z6bvgiUTAUnpHphpOgYdp6dm8iOnzbP2JW_Ie5WCD-w1Jz2Y4-Ud99KScN_Gn32w9PKXr4d9brBUccKr4fRg6EwlYIe-tsHtRwM62K36mW9RxLmny9KTwAraLnZ6o1a61YDPS0g7Rnc2b1dXhv_HTPZ4rV7ItHoGK7XDm_eWaK0F9l5n7LMishCICJqd3Dv7H5w7l7tnApspx6DsiW1iss3bmJ0AaL3MZFUt1hObh-cY-Z0qQWRb66Wa3hyc-lImfcFmWEdm47CyfhyJWldPG0dyXS0r03gj94KHTh4RlJ3GvrpvYuiucaDjIZNVCJw-sfKosKqolwIzWBi2CPYIFybRmaeljQo7TuYvwlui_UpuKO6FQFuaRUrtijVkFi7NKxBAEp_fFKk3sQX1FjuZSgMwytOXD1IxvoNBlahvdC0O5SQAhipYAgFtqYEAuFVvicvd2IUytI6STksst43S5wBfJG9mxHhcY1usmfmB5Jp5qrBw.f8h9hDZw10ljBL70A3B0meau2aCdDRH0pCpc_8LnIoA'; // Provide your Bearer token here

    const responses = await Promise.all(questions.map(async (question) => {

        let payload;
        // console.log(question);
        if (question.question_type === 'MCQ') {
            const temp = question.Options || [];
            payload = {
                Entity: {
                    QuestionText: question.Question,
                    IsSubjective: false,
                    EQuestionType: 0,  
                    BloomIndex: question["Bloom's Index"],  
                    QuestionCommonDataId: "1",  
                    EDifficultyLevel: 5, 
                    IsActive: 1,
                    QuestionOptions: temp.map((option, index) => ({
                        QuestionOptionText: option.toLowerCase(),
                        IsCorrect: question.Answer.toLowerCase().includes(option.toLowerCase()),
                        SortOrder: index + 1,
                        Notes: "12"
                    }))
                }
            };
        } else {
            payload = {
                Entity: {
                    QuestionText: question.Question,
                    IsSubjective: true,
                    EQuestionType: 0,  
                    BloomIndex: question["Bloom's Index"],  
                    QuestionCommonDataId: "1",  
                    EDifficultyLevel: 5,  
                    IsActive: 1,
                    QuestionOptions: []
                }
            };
        }
        // console.log(JSON.stringify(payload));
        // console.log(typeof JSON.stringify(payload));
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'cookie': 'ARRAffinity=23564d5724d5738e1473c580c4ceefbbbe719a290964305a0fb76422b865e31c; ARRAffinitySameSite=23564d5724d5738e1473c580c4ceefbbbe719a290964305a0fb76422b865e31c',
                    'Content-Type': 'application/json',
                    'User-Agent': 'insomnia/9.2.0',
                    'Authorization': `Bearer ${access_token}`
                },
                body: JSON.stringify(payload)
            });
            // console.log(response);
            // return {}.json();
            const data = await response.text();
            return { data, status: response.status };
        } catch (error) {
            console.error('Error sending API request for question:', question, 'Error:', error);
            return { error: `Error sending API request: ${error.message}` };
        }
    }));

    return responses;
}
