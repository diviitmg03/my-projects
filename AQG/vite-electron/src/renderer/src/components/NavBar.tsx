import { Link } from 'react-router-dom'

export default function NavBar(): JSX.Element {
  return (
    <>
      <nav className="bg-gray-800 text-white">
        <div className="flex flex-row space-x-10 px-4 justify-center m-auto text-2xl">
          <Link to="/">Home</Link>
          <Link to="/test">Generate</Link>
          <Link to="/test">Readme</Link>
        </div>
      </nav>
    </>
  )
}
