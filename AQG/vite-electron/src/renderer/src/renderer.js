const { ipcRenderer } = require('electron');

document.getElementById('inputType').addEventListener('change', function() {
    const pdfFile = document.getElementById('pdfFile');
    const textInput = document.getElementById('textInput');
    if (this.value === 'pdf') {
        pdfFile.style.display = 'block';
        textInput.style.display = 'none';
    } else {
        pdfFile.style.display = 'none';
        textInput.style.display = 'block';
    }
});

let aiModel = document.getElementById('ai-model')
let selectedModel = document.getElementById('selected-model')

selectedModel.textContent = "Selected Model is " + aiModel.value

aiModel.addEventListener('change', function () {
    selectedModel.textContent = "Selected Model is " + this.value
})

async function python_request(pdfFile,lang) {
    if (pdfFile) {
        const formData = new FormData();
        formData.append('file', pdfFile);
        formData.append("lang",lang);
        let data;
        // try {
            console.log('test0');
            const response = await fetch('http://127.0.0.1:5000/main', {
                method: 'POST',
                body: formData
            });
            console.log('test1');
            console.log(response);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (response) {
                data = await response.json();
                console.log('test2');
                console.log(data);
                // Store the uploaded filename to use it later during generate questions
                // document.getElementById('pdfFile').dataset.filename = data.filename;
            } else {
                alert('Upload failed');
            }
        // } catch (error) {
        //     console.error('Error:', error);
        // }
        return data;
    }
};

let generateBtn = document.getElementById("generateQuestions");

generateBtn.addEventListener("click", async function(event) {
    event.preventDefault();
    console.log('Button clicked, processing PDF...');
    const inputType = document.getElementById('inputType').value;
    const language = document.getElementById('language').value;
    const aiModel = document.getElementById('ai-model').value;
    const prompt = document.getElementById('prompt').value;
    const questionType = document.getElementById('questionType').value;
    const questionLevel = document.getElementById('questionLevel').value;
    const bloomTaxonomy = document.getElementById('bloomTaxonomy').value;
    const numQuestions = document.getElementById('numQuestions').value;
    console.log("Generate Button clicked")
    let inputContent;

    if (inputType === 'pdf') {
        const uploadedFilename = document.getElementById('pdfFile').dataset.filename;
        const uploadedPdfFile = document.getElementById('pdfFile').files[0];
        
        console.log(uploadedPdfFile)
        
        inputContent = await python_request(uploadedPdfFile,language);
        console.log(inputContent);
    } else {
        inputContent = document.getElementById('textInput').value;
        if (!inputContent.trim()) {
            alert('Please enter some text');
            return;
        }
    }

    ipcRenderer.send('generate-questions', {
        inputType,
        inputContent: inputContent,
        language,
        aiModel,
        prompt,
        questionType,
        questionLevel,
        bloomTaxonomy,
        numQuestions
    });
});

document.getElementById('showAllQuestions').addEventListener('click', function() {
    ipcRenderer.send('show-all-questions');
});

document.getElementById('sendApiRequest').addEventListener('click', function() {
    ipcRenderer.send('x');
});

ipcRenderer.on('questions-generated', (event, questions) => {
    document.getElementById('output').innerHTML = `<pre>${JSON.stringify(questions, null, 2)}</pre>`;
});

ipcRenderer.on('all-questions', (event, questions) => {
    document.getElementById('output').innerHTML = `<pre>${JSON.stringify(questions, null, 2)}</pre>`;
});

ipcRenderer.on('api-response', (event, response) => {
    document.getElementById('output').innerHTML = `<pre>${JSON.stringify(response, null, 2)}</pre>`;
});