import React from "react";
import AddStarRating from "@/app/components/star_rating/add_star_rating";
import StarRating from "@/app/components/star_rating/star_rating";

export const CommentsSection = ({
  comments,
  newComment,
  setNewComment,
  handleSubmitComment,
  handleBackToOffices,
}) => (
  <div className="h-full">
    <div className="flex items-center mb-4 justify-between">
      <h2 className="text-xl font-bold">Комментарии</h2>
      <button 
        onClick={handleBackToOffices}
        className="text-black hover:text-[#E6007E] text-2xl mr-2"
      >
        → 
      </button>
    </div>
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Добавить комментарий</h3>
      <form onSubmit={handleSubmitComment}>
        <textarea
          className="w-full p-2 border border-gray-300 rounded mb-2"
          rows={3}
          value={newComment.text}
          onChange={(e) => setNewComment({...newComment, text: e.target.value})}
          placeholder="Ваш комментарий"
        />
        <div className="flex items-center mb-4">
          <span className="mr-2">Оценка:</span>
          <AddStarRating
            value={newComment.rating}
            onChange={(rating) => {
              setNewComment(prev => ({
                ...prev,
                rating: rating || 0
              }));
            }}
          />
        </div>
        <button
          type="submit"
          className="bg-[#3fcbff] text-white px-4 py-2 rounded"
        >
          Отправить
        </button>
      </form>
    </div>
    {comments.length > 0 ? (
      comments.map(comment => (
        <div key={comment.id} className="mb-4 p-3 border-b border-gray-200">
          <div className="flex items-center mb-2">
            <StarRating rating={comment.rating} />
          </div>
          <p className="text-gray-800">{comment.text}</p>
        </div>
      ))
    ) : (
      <p className="text-gray-500">Нет комментариев</p>
    )}
  </div>
);