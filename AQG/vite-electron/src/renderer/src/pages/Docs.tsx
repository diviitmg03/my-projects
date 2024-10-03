import DaisyNav from '@renderer/components/DaisyNavBar'
import Header from '@renderer/components/Heading'

export default function Docs() : JSX.Element{
  return (
    <>
    <DaisyNav />

      <div className="carousel rounded-box ml-4 left-align  justify-center flex">
  <div className="carousel-item border-2 border-primary m-4 p-2 rounded-xl w-[450px] h-120 flex-col" >
  <Header word1="Do's" styles="text-4xl" />
  <ul className='list-decimal list-inside'>
  <li className='hover:text-teal-600 text-lg '>Ensure that input file is of the require format. (PDF)</li>
  <li className='hover:text-teal-600 text-lg'>Upload PDF files within the specified size limit.</li>
  <li className='hover:text-teal-600 text-lg'>Wait for the extraction process to complete and files with image may take extra time.</li>
  <li className='hover:text-teal-600 text-lg'>The range of PDF splitting must be within the limits of the PDF itself.</li>
  <li className='hover:text-teal-600 text-lg'>Ensure the prompt is meaningful, choice of question number is realistic and select the question type.</li>	
  </ul>
    
  </div>
  <div className="carousel-item border-2 border-primary m-4 p-2 rounded-xl w-[450px] h-96 flex-col">
  <Header word1="Dont's" styles="text-4xl" />
  <ul className='list-decimal list-inside'>
  <li className='hover:text-teal-600 text-lg'>Avoid uploading large and encrypted PDFs.(PDF)</li>
  <li className='hover:text-teal-600 text-lg'>Avoid uploading scanned documents as PDF.</li>
  <li className='hover:text-teal-600 text-lg'>Don’t provide ambiguous and harmful prompts containing sensitive topics.</li>
  <li className='hover:text-teal-600 text-lg'>The maximum number of questions for a session should not exceed more than 20.</li>
  <li className='hover:text-teal-600 text-lg'>Don’t skip any process like wait for the questions to generate and then wait for it to be saved in database</li>	
  </ul>
  </div>

  <div className="carousel-item border-2 border-primary m-4 p-2 rounded-xl w-[450px] h-96 flex-col">
  <Header word1="Useful Prompts" styles="text-4xl" />
  <ul className='list-decimal list-inside'>
    <li className='hover:text-teal-600 text-lg'>Understand the concepts and generate problem questions from an exam point of view. Don’t just give me theory questions; instead, provide proper solvable problems. Create long answer questions, and for questions that require data as input, provide the data in a tabular form.</li>

  </ul>
  </div>

</div>
    </>
  )
}
