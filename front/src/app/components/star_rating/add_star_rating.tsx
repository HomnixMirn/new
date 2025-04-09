import React from "react";

interface AddStarRatingProps {
  value: number;
  onChange: (value: number | null) => void;
}

const AddStarRating = ({ value, onChange }: AddStarRatingProps) => {
  const totalStars = 5;

  const handleStarClick = (clickedValue: number) => {
    if (typeof onChange !== 'function') {
      console.error('onChange is not a function');
      return;
    }
    
    if (value === clickedValue) {
      onChange(null);
    } else {
      onChange(clickedValue);
    }
  };

  const containerStyle = {
    display: "flex",
    gap: "5px",
  };

  const emptyStarStyle = {
    width: "20px",
    height: "20px",
    background: "url('/images/Icons/hollowPinkStarIcon.svg') no-repeat center/contain",
    cursor: "pointer"
  };

  const fullStarStyle = {
    position: "absolute",
    top: "0",
    left: "0",
    width: "20px",
    height: "20px",
    background: "url('/images/Icons/pinkStarIcon.svg') no-repeat center/contain",
    cursor: "pointer"
  };

  return (
    <div style={containerStyle}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        const fullStars = Math.floor(value || 0);
        const partialStar = (value || 0) - fullStars;

        return (
          <div
            key={index}
            style={{ position: "relative", width: "24px", height: "24px" }}
            onClick={() => handleStarClick(starValue)}
          >
            <div style={emptyStarStyle}></div>
            <div
              style={{
                ...fullStarStyle,
                clipPath:
                  starValue <= fullStars
                    ? "none"
                    : starValue === fullStars + 1
                    ? `inset(0 ${100 - partialStar * 100}% 0 0)`
                    : "inset(0 100% 0 0)",
              }}
            ></div>
          </div>
        );
      })}
    </div>
  );
};

export default AddStarRating;