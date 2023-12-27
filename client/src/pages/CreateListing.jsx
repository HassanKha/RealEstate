import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import React, { useState } from "react";
import { app } from "../firebase";
import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
export default function CreateListing() {
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imagesUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setupLoading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const {currentUser}= useSelector(state=> state.user)
  const navigate = useNavigate();
  const handleImagesSubmit = async (e) => {
    setupLoading(true);
    setImageUploadError(false);
  
    if (files.length > 0 && files.length + formData.imagesUrls.length < 7) {
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        console.log(storeImage(files[i]));
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          console.log(urls);
          setFormData({
            ...formData,
            imagesUrls: formData.imagesUrls.concat(urls),
          });
          setImageUploadError(false);
          setupLoading(false);
        })
        .catch((err) => {
          setImageUploadError("Image upload failed");
          setupLoading(false);
        });
    } else {
      setImageUploadError("You can only upload 6 images per listing");
      setupLoading(false);
    }
  };
  console.log(formData);
  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imagesUrls: formData.imagesUrls.filter((url, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    if (e.target.id === "sale" || e.target.id === "rent") {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }

    if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
        setFormData({
            ...formData,
             [e.target.id]: e.target.checked
          }); 
    }

    if(e.target.type === 'number' || e.target.type === 'text' || e.target.type === 'textarea' ){
        if(e.target.type === 'number' ){
            setFormData({
                ...formData,
                  [e.target.id]: parseInt(e.target.value)
              });

              return
        }
        setFormData({
          ...formData,
            [e.target.id]: e.target.value
        });
    }
  };

  const handleSubmit = async (e) => {
e.preventDefault();

try {
    if(formData.imagesUrls.length < 1) return setError('You must upload at least one image')
    if(formData.regularPrice < formData.discountPrice) return setError('Discount price must be lower than regular price')

    setLoading(true)
    setError(false)
const res = await fetch('/api/listing/create',{
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        ...formData,
        userRef: currentUser._id
    })
})
const data = await res.json();
setLoading(false)

if(data.success === false){
    setError(data.message)
  
}
navigate(`/listing/${data._id}`)
} catch (error) {
    setError(error.message)
    setLoading(false)
}

  }

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create a Listing
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            required
            minLength="10"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            type="text"
            required
            minLength="10"
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            maxLength="62"
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type="text"
            required
            minLength="10"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            maxLength="62"
            onChange={handleChange}
            value={formData.address}
          />
          <div className="flex gap-6 flex-wrap">
            <div className=" flex gap-2">
              <input
                checked={formData.type === "sale"}
                onChange={handleChange}
                type="checkbox"
                id="sale"
                className="w-5"
              />
              <span>Sell</span>
            </div>
            <div className=" flex gap-2">
              <input
                checked={formData.type === "rent"}
                onChange={handleChange}
                type="checkbox"
                id="rent"
                className="w-5"
              />
              <span>Rent</span>
            </div>
            <div className=" flex gap-2">
              <input
                checked={formData.parking}
                onChange={handleChange}
                type="checkbox"
                id="parking"
                className="w-5"
              />
              <span>Parking spot</span>
            </div>
            <div className=" flex gap-2">
              <input
                checked={formData.furnished}
                onChange={handleChange}
                type="checkbox"
                id="furnished"
                className="w-5"
              />
              <span>Furnished</span>
            </div>
            <div className=" flex gap-2">
              <input
                checked={formData.offer}
                onChange={handleChange}
                type="checkbox"
                id="offer"
                className="w-5"
              />
              <span>Offer</span>
            </div>
          </div>

          <div className="flex gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <input
                className="p-3 rounded-lg border border-gray-300"
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                value={formData.bedrooms}
                onChange={handleChange}
              />
              <p>Beds</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                className="p-3 rounded-lg border border-gray-300"
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                value={formData.bathrooms}
                onChange={handleChange}
                required
              />
              <p>Baths</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                className="p-3 rounded-lg border border-gray-300"
                type="number"
                id="regularPrice"
                min="50"
                max="1000000"
                required
                value={formData.regularPrice}
                onChange={handleChange}
              />

              <div className="flex flex-col items-center">
                <p>Regular price</p>
                <span className="text-xs">{"$ / month"}</span>
              </div>
            </div>
{formData.offer && 
      <div className="flex items-center gap-2">
      <input
        className="p-3 rounded-lg border border-gray-300"
        type="number"
        id="discountPrice"
        min="0"
        max="1000000"
        required
        value={formData.discountPrice}
        onChange={handleChange}
      />

      <div className="flex flex-col items-center">
        <p>Discounted price</p>
        <span className="text-xs">{"$ / month"}</span>
      </div>
    </div>}
      
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal ml-2 text-gray-600">
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              onChange={(e) => setFiles(e.target.files)}
              className="p-3 border border-gray-300 w-full rounded"
              type="file"
              id="images"
              multiple
              accept="images/*"
            />
            <button
              type="button"
              onClick={handleImagesSubmit}
              disabled={uploading}
              className="p-3 rounded disabled:opacity-80 uppercase hover:shadow-lg text-green-700 border border-green-700"
            >
              {uploading ? "Uploading" : "Upload"}
            </button>
          </div>
          <p className="text-red-600 text-sm">
            {imageUploadError && imageUploadError}
          </p>
          {formData.imagesUrls.length > 0 &&
            formData.imagesUrls.map((url, index) => (
              <div
                key={url}
                className="flex border items-center p-3 justify-between"
              >
                <img
                  src={url}
                  alt="listing image"
                  className="w-20 h-20 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-3 text-red-700 rounded-lg uppercase hover:opacity-95"
                >
                  Delete
                </button>
              </div>
            ))}
          <button disabled={loading || uploading} className="p-3 hover:opacity-95 disabled:opacity-80 uppercase bg-slate-700 text-white rounded-lg">
           {loading ? 'Creating...' : 'Create Listing'}
          </button>
          {error && <p className="text-res-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}
