import { useState } from 'react'
import DaisyNav from '@renderer/components/DaisyNavBar'
import Header from '@renderer/components/Heading'
import axios from 'axios'
import Alert from '@renderer/components/Alert'

export default function Generate(): JSX.Element {
  // Step 2: Create state variables
  const [modelOption, setModelOption] = useState('Gemini')
  const [questionType, setQuestionType] = useState('Descriptive')
  const [inputType, setInputType] = useState('PDF')
  const [textInput, setTextInput] = useState('')
  const [questionLevel, setQuestionLevel] = useState('Easy')
  const [bloomType, setBloomType] = useState('Knowledge')
  const [prompt, setPrompt] = useState('')
  const [pdfLang, setPdfLang] = useState('English')
  const [numberQuestions, setNumberQuestions] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedQuestions, setSelectedQuestions] = useState({})
  const [generateClicked, setGenerateClicked] = useState(false)
  const [responseData, setResponseData] = useState(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [responseAPI,setresponseAPI] = useState(0)

  // Step 3: Define onChange handlers
  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModelOption(e.target.value)
  }

  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value)
  }

  const handleQuestionTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestionType(e.target.value)
  }

  const handleQuestionLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestionLevel(e.target.value)
  }

  const handleInputType = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputType(e.target.value)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPdfFile(e.target.files[0])
    }
  }

  const handleBloomTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBloomType(e.target.value)
  }

  const handleNumberQuestions = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumberQuestions(Number(e.target.value))
  }

  const handlePrompt = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value)
  }

  const handlePdfLang = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPdfLang(e.target.value)
  }

  const handleClick = async () => {
    setIsLoading(true);
    
    setresponseAPI(0);
    const formData = new FormData()
    if (pdfFile) {
      formData.append('file', pdfFile)
    }
    formData.append('textInput', textInput)
    formData.append('model', modelOption)
    formData.append('questionType', questionType)
    formData.append('inputType', inputType)
    formData.append('questionLevel', questionLevel)
    formData.append('bloomType', bloomType)
    formData.append('pdfLang', pdfLang)
    formData.append('numberQuestions', numberQuestions.toString())
    formData.append('prompt', prompt)
    // try {
    //   const response = await axios.post('http://localhost:8000/generate', {
    //     model: modelOption,
    //     questionType: questionType,
    //     inputType: inputType,
    //     bloomType: bloomType,
    //     numberQuestions: numberQuestions,
    //     prompt: prompt
    //   })
    //   console.log(response.data)
    // } catch (error) {
    //   console.error(error)
    // }

    try {
      const response = await axios.post('http://localhost:5000/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log(response.data)
      console.log(response.data['1'])
      setResponseData(response.data)
      console.log(typeof response.data['1'])
    } catch (error) {
      console.error(error)
    } finally {
      setTimeout(() => {
        setIsLoading(false)
      }, 500) //500ms == 0.5s
    }
    setGenerateClicked(true)
  }

  const handleCheckboxChange = (key) => {
    console.log(key)
    setSelectedQuestions((prevSelectedQuestions) => ({
      ...prevSelectedQuestions,
      [key]: !prevSelectedQuestions[key]
    }))
  }

  const sendSelectedKeys = async () => {
    console.log(selectedQuestions)
    const selectedKeys = Object.keys(selectedQuestions).filter((key) => selectedQuestions[key])
    console.log(selectedKeys)
    try {
      const response = await axios.post(
        'http://localhost:5000/store_api',
        { keys: selectedKeys },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      setresponseAPI(response.data);
      console.log('Response:', response.data)
    } catch (error) {
      console.error('Error sending keys:', error)
    }
  }

  const handleStop = () => {
    setIsLoading(false)
  }

  return (
    <>
      <DaisyNav></DaisyNav>
      <div className="m-4">
        <Header word1="Generate" word2=" Questions" styles="text-4xl" />
        <div className="border-2 border-primary m-4 p-2 rounded-xl">
          <div className="left-align justify-items-start items-end flex">
            <Header
              word1="Craft your perfect questions"
              word2=" by selecting all the options below"
              styles="text-xl justify-left"
            ></Header>
          </div>
          <div className="flex flex-col bg-base-100 rounded-xl m-2 space-y-4">
            <div className="options flex  space-x-8 p-4">
              <div className="column1 model-type flex flex-col p-4 space-y-2 flex-grow border-2 border-primary rounded-xl">
                <h1>Select the model</h1>
                <div className="join">
                  <input
                    className="join-item btn"
                    type="radio"
                    name="model-options"
                    value="Gemini"
                    onChange={handleModelChange}
                    aria-label="Gemini"
                  />
                  <input
                    className="join-item btn"
                    type="radio"
                    name="model-options"
                    value="Claude"
                    onChange={handleModelChange}
                    aria-label="Claude"
                  />
                  <input
                    className="join-item btn"
                    type="radio"
                    name="model-options"
                    value="ChatGPT"
                    onChange={handleModelChange}
                    aria-label="ChatGPT"
                  />
                </div>
                <h1>Select input type</h1>
                <div className="join">
                  <input
                    className="join-item btn w-1/3"
                    type="radio"
                    name="input-options"
                    value="Text"
                    onChange={handleInputType}
                    aria-label="Text"
                  />
                  <input
                    className="join-item btn w-1/3"
                    type="radio"
                    name="input-options"
                    value="PDF"
                    onChange={handleInputType}
                    aria-label="PDF"
                  />
                </div>
                {inputType === 'Text' ? (
                  <div className="flex flex-col flex-wrap space-y-2">
                    <h1>Enter your text</h1>
                    <textarea
                      placeholder="Type here"
                      className="textarea textarea-bordered textarea-primary w-full max-w-lg h-32"
                      onChange={handleTextInput}
                    ></textarea>
                  </div>
                ) : (
                  <input
                    type="file"
                    className="file-input file-input-bordered file-input-primary w-full max-w-xs"
                    onChange={handleFileChange}
                  />
                )}
                {inputType == 'PDF' && (
                  <div className="lang-type flex flex-col space-y-2 flex-grow">
                    <h1>Select language of PDF</h1>
                    <div className="join">
                      <input
                        className="join-item btn w-1/3"
                        type="radio"
                        name="lang-options"
                        value="English"
                        onChange={handlePdfLang}
                        aria-label="English"
                      />
                      <input
                        className="join-item btn w-1/3"
                        type="radio"
                        name="lang-options"
                        value="Hindi"
                        onChange={handlePdfLang}
                        aria-label="Hindi"
                      />
                    </div>
                  </div>
                )}
                <div className="flex flex-col space-y-2">
                  <h1>Enter your prompt for generating questions</h1>
                  <textarea
                    placeholder="Type here"
                    className="textarea textarea-bordered textarea-primary w-full max-w-lg h-32"
                    onChange={handlePrompt}
                  ></textarea>
                </div>
              </div>
              <div className="column2 questions-type flex flex-col flex-wrap p-4 space-y-2 flex-grow border-2 rounded-xl border-primary">
                <h1>Select the type of question</h1>
                <div className="join">
                  <input
                    className="join-item btn"
                    type="radio"
                    name="question-options"
                    value="Descriptive"
                    onChange={handleQuestionTypeChange}
                    aria-label="Descriptive"
                  />
                  <input
                    className="join-item btn"
                    type="radio"
                    name="question-options"
                    value="MCQ"
                    onChange={handleQuestionTypeChange}
                    aria-label="MCQ"
                  />
                  <input
                    className="join-item btn"
                    type="radio"
                    name="question-options"
                    value="Fill in the Blanks"
                    onChange={handleQuestionTypeChange}
                    aria-label="Fill in the Blanks"
                  />
                </div>
                <div>
                  <div className="questions-type flex flex-col space-y-2 flex-grow">
                    <h1>Select Level of the Questions</h1>
                    <div className="join">
                      <input
                        className="join-item btn"
                        type="radio"
                        name="question-Level"
                        value="Easy"
                        onChange={handleQuestionLevelChange}
                        aria-label="Easy"
                      />
                      <input
                        className="join-item btn"
                        type="radio"
                        name="question-Level"
                        value="Medium"
                        onChange={handleQuestionLevelChange}
                        aria-label="Medium"
                      />
                      <input
                        className="join-item btn"
                        type="radio"
                        name="question-Level"
                        value="Hard"
                        onChange={handleQuestionLevelChange}
                        aria-label="Hard"
                      />
                    </div>
                  </div>
                </div>
                <div className="bloom-type flex flex-col space-y-2 flex-grow">
                  <h1>Select Bloom's Taxonomy Level</h1>
                  <div className="join bloom-row1">
                    <input
                      className="join-item btn"
                      type="radio"
                      name="bloom-options"
                      value="Knowledge"
                      onChange={handleBloomTypeChange}
                      aria-label="Knowledge"
                    />
                    <input
                      className="join-item btn"
                      type="radio"
                      name="bloom-options"
                      value="Comprehension"
                      onChange={handleBloomTypeChange}
                      aria-label="Comprehension"
                    />
                    <input
                      className="join-item btn"
                      type="radio"
                      name="bloom-options"
                      value="Application"
                      onChange={handleBloomTypeChange}
                      aria-label="Application"
                    />
                  </div>
                  <div className="join bloom-row2">
                    <input
                      className="join-item btn"
                      type="radio"
                      name="bloom-options"
                      value="Analysis"
                      onChange={handleBloomTypeChange}
                      aria-label="Analysis"
                    />
                    <input
                      className="join-item btn"
                      type="radio"
                      name="bloom-options"
                      value="Synthesis"
                      onChange={handleBloomTypeChange}
                      aria-label="Synthesis"
                    />
                    <input
                      className="join-item btn"
                      type="radio"
                      name="bloom-options"
                      value="Evaluation"
                      onChange={handleBloomTypeChange}
                      aria-label="Evaluation"
                    />
                  </div>
                  <div>
                    <h1>Enter the number of questions</h1>
                    <input
                      type="number"
                      placeholder="Type here"
                      name="number-questions"
                      className="input input-bordered input-primary w-full max-w-xs"
                      onChange={handleNumberQuestions}
                    />
                  </div>
                  {generateClicked && (
                    <div className="column3 input-type flex flex-col p-4 space-y-2 flex-grow">
                      <div className="space-y-2">
                        <h1>Store selected questions to API</h1>
                        <button className="btn btn-primary w-1/3" onClick={sendSelectedKeys}>
                          Store
                        </button>
                      </div>
                    </div>
                  )
                  }
                  {generateClicked && responseAPI!=0 && (
                      <Alert response={responseAPI}/>
                  )
                }

                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col flex-grow">
            <button className="btn btn-primary p-2 m-2" onClick={handleClick}>
              Submit
            </button>

            {isLoading && (
              <div className="fixed inset-0 bg-black bg-opacity-85 flex flex-col justify-center items-center space-y-10">
                <span className="loading w-[75px] loading-spinner text-primary"></span>
                <button className="btn btn-error p-2 m-2 w-1/6" onClick={handleStop}>
                  Stop
                </button>
              </div>
            )}
          </div>
        </div>
        {responseData && (
          <div className="m-4 p-2 rounded-xl border-2 border-red-500">
            <div>
              <Header
                word1="Questions and "
                word2=" Answers"
                styles="text-xl justify-left"
              ></Header>
            </div>
            <div className="flex flex-col bg-base-100 rounded-xl m-2 justify-center items-center space-y-4">
              {Object.keys(responseData).map((key) => (
                <div id={key} key={key} className="p-4 border-b border-gray-200 w-full">
                  <div className="question flex flex-row space-x-4" key={key}>
                    <input
                      type="checkbox"
                      key={key}
                      checked={selectedQuestions[key] || false}
                      onChange={() => handleCheckboxChange(key)}
                      className="checkbox checkbox-primary"
                    />
                    <div className="text-lg font-semibold">
                      Question {key}:
                      {responseData[key].Question.replace(/\\textbf{Question}:/g, '')}
                    </div>
                  </div>

                  {responseData[key].question_type === 'MCQ' && (
                    <div className="text-sm mt-2">
                      Options:
                      <ul>
                        {responseData[key].Options.map((option, index) => (
                          <li key={index}>{option.replace(/\\textbf{Option}:/g, '')}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-sm mt-2">
                    Answer: {responseData[key].Answer.replace(/\\textbf{Answer}:/g, '')}
                  </div>
                  <div className="text-sm italic mt-1">Type: {responseData[key].question_type}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
