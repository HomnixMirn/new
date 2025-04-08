import React from "react";

const StarRating = ({ rating, starColor }) => {
  const totalStars = 5;
  const fullStars = Math.floor(rating);
  const partialStar = rating - fullStars;

  const containerStyle = {
    display: "flex",
    gap: "5px",
  };

  const emptyStarStyle = {
    width: "20px",
    height: "20px",
    background:
      "url('/images/hollowPinkStarIcon.svg') no-repeat center/contain",
    filter: starColor === "#FFFFFF" ? "brightness(0) invert(1)" : "none",
  };

  const fullStarStyle = {
    position: "absolute",
    top: "0",
    left: "0",
    width: "20px",
    height: "20px",
    background: "url('/images/pinkStarIcon.svg') no-repeat center/contain",
    filter: starColor === "#FFFFFF" ? "brightness(0) invert(1)" : "none",
  };

  return (
    <div style={containerStyle}>
      {[...Array(totalStars)].map((_, index) => (
        <div
          key={index}
          style={{ position: "relative", width: "24px", height: "24px" }}
        >
          <div style={emptyStarStyle}></div>

          <div
            style={{
              ...fullStarStyle,
              clipPath:
                index < fullStars
                  ? "none"
                  : index === fullStars
                  ? `inset(0 ${100 - partialStar * 100}% 0 0)`
                  : "inset(0 100% 0 0)",
            }}
          ></div>
        </div>
      ))}
    </div>
  );
};

export default StarRating;
