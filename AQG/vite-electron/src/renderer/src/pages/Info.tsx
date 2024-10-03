// import React from 'react'
import DaisyNav from '@renderer/components/DaisyNavBar'
// import Header from '@renderer/components/Heading'
import Header from '@renderer/components/Heading'
import { useState } from 'react'
import axios from 'axios'





export default function Info(): JSX.Element {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files ? event.target.files[0] : null
      setSelectedFile(file)
    }
  
    const handleSubmit = async () => {
      if (selectedFile) {
        console.log(selectedFile)
        const formData = new FormData()
        formData.append('file', selectedFile)
  
        try {
          const response = await axios.post('http://localhost:5000/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          console.log('File uploaded successfully', response)
        } catch (error) {
          console.error(error)
        }
      }
    }
    return (
      <>
        <DaisyNav />
        <div className="m-4">
          <Header word1="Testing" word2=" Stuff" styles="text-4xl" />
          <div className="border-2 m-4 p-2 rounded-xl">
            <input
              type="file"
              className="file-input file-input-bordered file-input-primary w-full max-w-xs"
              onChange={handleFileChange}
            />
            <button className="btn btn-primary p-2 m-2" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      </>
    )
  }