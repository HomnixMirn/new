import React from "react";

const AddStarRating = ({ value, onChange }) => {
  const totalStars = 5;

  const handleStarClick = (clickedValue) => {
    if (value === clickedValue) {
      onChange(null); // Сбрасываем фильтр при повторном клике
    } else {
      onChange(clickedValue); // Устанавливаем новое значение
    }
  };

  const containerStyle = {
    display: "flex",
    gap: "5px",
  };

  const emptyStarStyle = {
    width: "20px",
    height: "20px",
    background:
      "url('/images/hollowPinkStarIcon.svg') no-repeat center/contain",
  };

  const fullStarStyle = {
    position: "absolute",
    top: "0",
    left: "0",
    width: "20px",
    height: "20px",
    background: "url('/images/pinkStarIcon.svg') no-repeat center/contain",
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
