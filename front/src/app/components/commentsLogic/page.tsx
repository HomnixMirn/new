import { useState, useEffect } from "react";
import axi from "@/utils/api";

export const useCommentsLogic = () => {
  const [showComments, setShowComments] = useState(false);
  const [activeTab, setActiveTab] = useState<"offices" | "coverage">("offices");
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState({
    text: "",
    rating: 5,
    officeId: null as number | null,
  });

  useEffect(() => {
    const handleShowComments = (e: CustomEvent) => {
      setActiveTab("comments");
      setShowComments(true);
      setSelectedOfficeId(e.detail);
      fetchComments(e.detail);
    };

    window.addEventListener("showComments", handleShowComments as EventListener);
    
    return () => {
      window.removeEventListener("showComments", handleShowComments as EventListener);
    };
  }, []);

  const handleBackToOffices = () => {
    setActiveTab("offices");
    setShowComments(false);
    setSelectedOfficeId(null);
  };

  const fetchComments = async (officeId: number) => {
    try {
      const response = await axi.get(`/map/get_comments?id=${officeId}`);
      setComments(response.data);
      setNewComment(prev => ({ ...prev, officeId }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.officeId) return;

    try {
      await axi.post("/map/add_comment", {
        id: newComment.officeId,
        text: newComment.text,
        rating: newComment.rating,
      });
      await fetchComments(newComment.officeId);
      setNewComment({
        text: "",
        rating: 5,
        officeId: newComment.officeId,
      });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const createBalloonContent = (office: any) => {
    return `
      <div style="width: 350px; height: 130px; border-radius: 16px; display: flex; flex-direction: column; padding: 16px; box-sizing: border-box; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
        <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px;">${
          office.address
        }</div>
        <div style="display: flex; margin-bottom: 8px;">
          <span style="font-size: 14px; color: #666;">Часы работы:</span>
          <span style="font-size: 14px; margin-left: 8px;">${
            office.working_hours || "9:00 - 18:00"
          }</span>
        </div>
        <div style="display: flex; margin-bottom: 8px;">
          <span style="font-size: 14px; color: #666;">Телефон:</span>
          <span style="font-size: 14px; margin-left: 8px;">${
            office.phone || "+7 (XXX) XXX-XX-XX"
          }</span>
        </div>
        <button onclick="window.dispatchEvent(new CustomEvent('showComments', { detail: ${
          office.id
        } }))" 
          style="margin-top: auto; background: #3fcbff; border: none; padding: 8px 16px; border-radius: 4px; color: white; cursor: pointer; align-self: flex-start;">
          Показать комментарии
        </button>
      </div>
    `;
  };

  return {
    showComments,
    setShowComments,
    activeTab,
    setActiveTab,
    selectedOfficeId,
    comments,
    newComment,
    setNewComment,
    handleBackToOffices,
    handleSubmitComment,
    createBalloonContent,
  };
};