import { useContext, useEffect, useState } from "react";
import { differenceInCalendarDays, parse, format } from "date-fns";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Context/userContext";
import DatePickerRange from "./DatePicker";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CancelBookingsWidget from "./CancelBookingsWidget";
import Input from "react-phone-number-input/input";
import 'react-phone-number-input/style.css';
import emailjs from "@emailjs/browser";

const formattedDate = (date) => {
  return format(parse(date.toString(), "dd/MM/yyyy", new Date()), "dd/MM/yyyy");
};

const INR_TO_USD = 83; // Set current conversion rate from INR to USD

export default function BookingWidget({ place }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingDetails, setBookingDetails] = useState("");
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const serviceId = "homestays";

  useEffect(() => emailjs.init("LO_eOCMgdi9cKdqm0"), []);

  useEffect(() => {
    user && setName(user.name);
    const fetchBookingDetails = async () => {
      const { data } = await axios.get(`http://localhost:5001/booking/${place._id}`);
      setBookingDetails(data);
    };
    if (user) fetchBookingDetails();
  }, [user, place]);

  const numberOfNights = checkIn && checkOut
    ? differenceInCalendarDays(parse(checkOut, "dd/MM/yyyy", new Date()), parse(checkIn, "dd/MM/yyyy", new Date())) + 1
    : 0;

  async function bookThisPlace() {
    if (!user) {
      toast.warning("Login is required for booking");
      sessionStorage.setItem("redirectUrl", `http://localhost:5001/place/${place._id}`);
      navigate("/login");
      return;
    }
    if (user._id === place.owner) {
      return toast.error("You cannot book your own hosted place");
    }
    if (numberOfGuests > place.maxGuests) {
      return toast.error(`Maximum ${place.maxGuests} guests are allowed at a time`);
    }
    if (phone === "") {
      toast.error("Phone number is required for booking");
      return;
    }
    if (!checkIn || !checkOut) {
      toast.error("Sorry!! Place can't be available for the provided dates");
      return;
    }

    const totalPrice = numberOfNights * place.price;
    try {
      const { data } = await axios.post("http://localhost:5001/booking", {
        checkIn: formattedDate(checkIn),
        checkOut: formattedDate(checkOut),
        numberOfGuests,
        name,
        phone,
        place: place._id,
        price: totalPrice,
      });
      await axios.put("http://localhost:5001/user/bookings", {
        bookingId: data._id,
        bookedPlace: place._id,
      });
      await axios.put(`http://localhost:5001/place/${place._id}`, {
        checkIn: formattedDate(checkIn),
        checkOut: formattedDate(checkOut),
      });
      toast.success("Place Booked!!");
      navigate(`/account/bookings/${data._id}`);
      sendMailToVisitor();
      sendMailToHost();
    } catch (err) {
      console.error(err.message);
    }
  }

  const priceInDollars = (place.price / INR_TO_USD).toFixed(2);
  const totalPriceInDollars = ((numberOfNights * place.price) / INR_TO_USD).toFixed(2);

  return (
    <>
      {bookingDetails ? (
        <CancelBookingsWidget
          placeId={place._id}
          bookingDetails={bookingDetails}
          setBookingDetails={setBookingDetails}
          placeTitle={place.title}
          placeOwner={place.owner}
        />
      ) : (
        <div className="bg-white shadow py-4 rounded-2xl flex flex-col justify-center items-center min-w-[280px]">
          <div className="text-2xl text-center">
            Price: ${Number(priceInDollars).toLocaleString("en-US")} per night
          </div>

          <div className="border rounded-md mt-4">
            <div className="flex justify-center py-1">
              <DatePickerRange setCheckIn={setCheckIn} setCheckOut={setCheckOut} disabledDates={place.bookedDates} />
            </div>

            <div className="p-3 border-t flex flex-col gap-1">
              <label>Number of guests:</label>
              <input type="number" value={numberOfGuests} className="py-1 px-2 outline-none border rounded-md border-gray-300" onChange={(ev) => setNumberOfGuests(ev.target.value)} />
            </div>

            {numberOfNights > 0 && (
              <div className="p-3 border-t flex flex-col gap-1">
                <label>Your full name:</label>
                <input type="text" value={name} className="py-1 px-2 outline-none border rounded-md border-gray-300" onChange={(ev) => setName(ev.target.value)} />
                <label>Phone number:</label>
                <Input countries="IN" placeholder="Enter phone number" value={phone} onChange={setPhone} className="px-2 py-1 outline-none border rounded-md border-gray-300" />
              </div>
            )}
          </div>

          <button onClick={bookThisPlace} className="px-4 py-2 bg-pink text-white font-semibold rounded-3xl hover:scale-105 transition-all my-5">
            Book this place
            {numberOfNights > 0 && <span> for ${Number(totalPriceInDollars).toLocaleString("en-US")}</span>}
          </button>
        </div>
      )}
    </>
  );
}
