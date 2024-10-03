import { Link } from 'react-router-dom'

export default function Button(): JSX.Element {
  return (
    <>
      <Link to="/test" className="text-3xl rounded-xl m-2 p-2">
        Test
      </Link>
      <button className="text-3xl rounded-xl m-2 p-2">Don't click Click</button>
    </>
  )
}
