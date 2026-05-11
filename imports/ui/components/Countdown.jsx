import React, { useEffect, useState } from "react";

export const Countdown = ({ hours = 1 }) => {

  
  const targetDate =
    new Date().getTime() + hours * 60 * 60 * 1000;

  const calculateTimeLeft = () => {

    const now = new Date().getTime();

    const difference = targetDate - now;

    if (difference <= 0) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0
      };
    }

    return {

      hours: Math.floor(
        difference / (1000 * 60 * 60)
      ),

      minutes: Math.floor(
        (difference % (1000 * 60 * 60))
        / (1000 * 60)
      ),

      seconds: Math.floor(
        (difference % (1000 * 60))
        / 1000
      )

    };
  };

  const [timeLeft, setTimeLeft] =
    useState(calculateTimeLeft());

  useEffect(() => {

    const interval = setInterval(() => {

      setTimeLeft(calculateTimeLeft());

    }, 1000);

    return () => clearInterval(interval);

  }, []);

  return (

    <p className="timer">

      
      {String(timeLeft.hours).padStart(2, "0")}:
      {String(timeLeft.minutes).padStart(2, "0")}:
      {String(timeLeft.seconds).padStart(2, "0")}

    </p>

  );
};