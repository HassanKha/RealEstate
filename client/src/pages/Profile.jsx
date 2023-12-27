import React, { useEffect, useRef, useState } from "react";

import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useDispatch, useSelector } from "react-redux";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  SignOutStart,
  SignOutFailure,
  SignOutSuccess,
} from "../redux/user/userSlice.js";
import { Link } from "react-router-dom";

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [perfile, setFileper] = useState(0);
  const [fileupload, setfileupload] = useState(false);
  const [formData, setFormData] = useState({});
  const [updatesucc, setupdatesucc] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch();
  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);
  console.log(formData);
  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("upload is " + progress + "% done");
        setFileper(Math.round(progress));
      },
      (error) => {
        setfileupload(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({
            ...formData,
            avatar: downloadURL,
          });
        });
      }
    );
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(data);
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setupdatesucc(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      setupdatesucc(false);
    }
  };

  const handleDeleted = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(data);
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }

      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(SignOutStart());
      const res = await fetch(`/api/auth/signout`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(SignOutFailure(data.message));
        return;
      }
      dispatch(SignOutSuccess(data));
    } catch (error) {
      dispatch(SignOutFailure(error.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };
  console.log(userListings);

  const handleListingDelete = async (id) => {
    //setShowListingsError(false);
    try{
    const res = await fetch(`/api/listing/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (data.success === false) {
    //  setShowListingsError(true);
      return;
    }
    setUserListings((prev)=> prev.filter((listing)=> id !== listing._id));
  } catch (error) {
   // setShowListingsError(true);
  }
}

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7"> Profile</h1>
      <form onSubmit={handleSubmit} className=" gap-4 flex flex-col">
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar}
          className="mt-2 self-center rounded-full h-24 w-24 object-cover cursor-pointer"
        ></img>
        <p className="text-sm self-center">
          {fileupload ? (
            <span className="text-red-700">Error Image Upload</span>
          ) : perfile > 0 && perfile < 100 ? (
            <span className="text-slate-700">{`Uploading ${perfile}%`}</span>
          ) : perfile === 100 ? (
            <span className="text-green-700">Successfully Uploaded!</span>
          ) : (
            ""
          )}
        </p>
        <input
          type="text"
          id="username"
          placeholder="username"
          className="border p-3 rounded-lg"
          defaultValue={currentUser.username}
          onChange={handleChange}
        />
        <input
          type="text"
          id="email"
          placeholder="email"
          className="border p-3 rounded-lg"
          defaultValue={currentUser.email}
          onChange={handleChange}
        />
        <input
          type="password"
          id="password"
          placeholder="password"
          className="border p-3 rounded-lg"
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 upercase hover:opacity-95 disabled:opacity-80 "
        >
          {loading ? "Loading..." : "Update"}
        </button>

        <Link
          className="bg-green-700 cursor-pointer text-white p-3 rounded-lg uppercase text-center hover:opacity-95"
          to={"/create-listing"}
        >
          Create Listing
        </Link>
      </form>
      <div className="flex justify-between mt-5">
        <span onClick={handleDeleted} className="text-red-700 cursor-pointer">
          Delete Account
        </span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">
          Sign Out
        </span>
      </div>
      <p className="text-red-700">{error ? error : ""}</p>
      <p className="text-green-700">
        {updatesucc ? "User is Updated successfully" : ""}
      </p>
      <button onClick={handleShowListings} className="text-green-700 w-full ">
        Show Listings
      </button>
      <p className="text-red-700 mt-5">
        {showListingsError ? "Error Showing Listings" : ""}
      </p>
      {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-center font-semibold mt-7 text-2xl">Your Listings</h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="border gap-4 rounded-lg p-3 flex flex-1 justify-between items-center"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  className=" h-16 w-16 object-contain"
                  src={listing.imagesUrls[0]}
                  alt="listing cover"
                />
              </Link>
              <Link className="flex-1" to={`/listing/${listing._id}`}>
                <p className="hover:underline truncate text-slate-700 font-semibold flex-1 ">
                  {listing.name}
                </p>
              </Link>
              <div className="flex flex-col items-center">
                <button onClick={()=>handleListingDelete(listing._id)} className="uppercase text-red-700">Delete</button>
                <Link to={`/update-listing/${listing._id}`}>
                <button className="uppercase text-green-700">Edit</button>

                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
