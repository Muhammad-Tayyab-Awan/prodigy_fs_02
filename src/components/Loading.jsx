import "./style.css";
function Loading() {
  return (
    <div className="to fixed flex h-screen w-screen flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-700 to-purple-500">
      <img src="vite.svg" alt="icon" className="h-10 animate-pulse" />
      <div className="loader-box relative h-1 w-20 overflow-hidden rounded-full bg-white">
        <div className="loader absolute left-0 h-full w-[30%] rounded-full bg-green-400"></div>
      </div>
    </div>
  );
}

export default Loading;
