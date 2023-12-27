import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Contact({ listing }) {
  const [landlord, setLandlord] = useState(null);
const [message,setMessage] = useState('');
  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const response = await fetch(`/api/user/${listing.userRef}`);
        const data = await response.json();
        if (data.sucess === false) {
          return;
        }
        setLandlord(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchLandlord();
  }, [listing.userRef]);

const onChange = () => {

}

  return (
    <>
      {landlord && (
        <div className="flex flex-col gap-2">
          <p>
            Contact <span className="font-semibold">{landlord.username}</span>{" "}
            for
            <span className="font-semibold"> {listing.name.toLowerCase()}</span>
          </p>
          <textarea className="w-full  border p-3 rounded-lg" onChange={onChange} name="message" id="message" rows={2}></textarea>
          <Link
          className=  'hover:opacity-95 bg-slate-700 uppercase rounded-lg text-white text-center'
          to={`mailto:${landlord.email}?subject=Regarding ${listing.name}&body=${message}`}
          >Send Message</Link>
        </div>
      )}
    </>
  );
}
