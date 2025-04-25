import { Link } from "react-router";

function NotFound() {
  return (
    <div className="min-h-screen w-full overflow-auto bg-purple-400">
      <h1 className="mt-20 text-center font-serif text-6xl font-medium text-red-600 text-shadow-black text-shadow-lg">
        404
      </h1>
      <p className="mt-5 w-full text-center text-lg font-medium text-black">
        Page not found
      </p>
      <Link
        to="/"
        className="mx-auto mt-4 block w-fit rounded-sm bg-black px-2 py-1 text-sm font-medium text-white"
      >
        Back to home
      </Link>
    </div>
  );
}

export default NotFound;
