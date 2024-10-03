import Versions from '../components/Versions'
import DaisyNav from '@renderer/components/DaisyNavBar'
import Header from '@renderer/components/Heading'
function App(): JSX.Element {
  return (
    <>
      <DaisyNav />
      <div className="m-4">
        <Header word1="Welcome to " word2="Automatic Question Generator" styles="text-4xl" />
      </div>
    </>
  )
}

export default App
