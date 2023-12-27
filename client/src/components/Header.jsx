import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Link , useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
const handleSubmit = (e) => {
e.preventDefault();
const urlParams = new URLSearchParams(window.location.search);
//console.log(urlParams)
urlParams.set('searchTerm', searchTerm);
//console.log(urlParams)
const searchQuery = urlParams.toString();
//console.log(searchQuery)
navigate(`/search?${searchQuery}`)

}

useEffect(()=> {
  const urlParams = new URLSearchParams(window.location.search);
const searchTermFromUrl = urlParams.get('searchTerm');
console.log(searchTermFromUrl)
if(searchTermFromUrl){
  setSearchTerm(searchTermFromUrl)
}
}, [location.search])
  return (
    <header className="bg-slate-200 shadow-md">
      <div className="p-3 flex mx-auto max-w-6xl justify-between items-center">
        <Link to="/">
          <h1 className="flex flex-wrap font-bold text-sm sm:text-xl">
            <span className="text-slate-500">Sahand</span>
            <span className="text-slate-700">Estate</span>
          </h1>
        </Link>

        <form onSubmit={handleSubmit} className="flex bg-slate-100 p-3 rounded-lg items-center">
          <input
            className="bg-transparent outline-none w-24 sm:w-64"
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}

          ></input>
          <button>
          <FaSearch className="text-slate-600" />
          </button>
          
        </form>
        <ul className="flex gap-4">
          <Link to="/">
            <li className="hidden sm:inline text-slate-700 hover:underline">
              Home
            </li>
          </Link>
          <Link to="/about">
            <li className="hidden sm:inline text-slate-700 hover:underline">
              About
            </li>
          </Link>
          <Link to="/profile">
            {currentUser ? (
              <img
                className="rounded-full h-7 w-7 object-cover"
                src={currentUser.avatar}
                alt="profile"
              />
            ) : (
              <li className=" text-slate-700 hover:underline">Sign In</li>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
}

export default Header;
